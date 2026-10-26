import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import archiver from 'archiver';
import { YTDLP_BIN, YTDLP_NETWORK_ARGS } from './ytDlpConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

export const FFMPEG_PATH = path.join(__dirname, 'bin', 'ffmpeg.exe');

function getMediaExtension(quality) {
  const value = String(quality || '').toLowerCase();
  if (value.includes('audio-m4a') || /\bm4a\b/.test(value)) return 'm4a';
  if (value.includes('audio-mp3') || /\bmp3\b/.test(value)) return 'mp3';
  return 'mp4';
}

function getQualityHeight(quality) {
  const value = String(quality || '').toLowerCase();
  if (value.includes('4k') || value.includes('2160')) return 2160;
  const match = value.match(/(?:^|\D)(1080|720|480|360)(?:p|\D|$)/);
  return match ? Number(match[1]) : 1080;
}

function formatDuration(duration, formatted) {
  if (typeof formatted === 'string' && /^\d+(?::\d{1,2}){1,2}$/.test(formatted)) {
    return formatted.split(':').map(Number).reduce((seconds, part) => seconds * 60 + part, 0);
  }
  return Number.isFinite(Number(duration)) && Number(duration) > 0 ? Number(duration) : 0;
}

function formatDurationDisplay(duration) {
  const seconds = Math.max(0, Math.floor(Number(duration) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    : `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function estimateSizeMB(duration, quality, ext) {
  const height = getQualityHeight(quality);
  const bitrateMbps = ext === 'mp3' ? 0.32 : ext === 'm4a' ? 0.16
    : height >= 2160 ? 15 : height >= 1080 ? 5 : height >= 720 ? 2.5 : 1.2;
  return Number(((duration * bitrateMbps) / 8).toFixed(1));
}

function sizeToBytes(value, unit) {
  const powers = { b: 1, kb: 1000, mb: 1000000, gb: 1000000000, kib: 1024, mib: 1048576, gib: 1073741824 };
  return Number(value) * (powers[String(unit || 'b').toLowerCase()] || 1);
}

function getDownloadedBytes(jobId) {
  let total = 0;
  const files = fs.readdirSync(DOWNLOADS_DIR).filter(name => name.startsWith(`${jobId}_`));
  for (const name of files) {
    try {
      total += fs.statSync(path.join(DOWNLOADS_DIR, name)).size;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return total;
}

class DownloadManager {
  constructor() {
    this.jobs = new Map();
    this.concurrency = 20;
    this.activeWorkers = 0;
    this.subscribers = new Set();
    this.isPaused = false;
  }

  setConcurrency(limit) {
    this.concurrency = Math.max(6, Math.min(20, Number(limit) || 20));
    this.processNext();
  }

  pauseAll() {
    this.isPaused = true;
    for (const job of this.jobs.values()) {
      if (job.status === 'downloading') {
        job.status = 'paused';
        if (job.process) {
          const process = job.process;
          job.process = null;
          process.kill();
        }
        this.releaseWorker(job);
      }
    }
    this.broadcastUpdate();
  }

  resumeAll() {
    this.isPaused = false;
    for (const job of this.jobs.values()) {
      if (job.status === 'paused') job.status = 'queued';
    }
    this.processNext();
    this.broadcastUpdate();
  }

  retryFailed() {
    for (const job of this.jobs.values()) {
      if (job.status === 'failed' || job.status === 'cancelled') {
        job.status = 'queued';
        job.progress = 0;
        job.error = null;
      }
    }
    this.processNext();
    this.broadcastUpdate();
  }

  clearHistory() {
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
        this.jobs.delete(id);
      }
    }
    this.broadcastUpdate();
  }

  queueDownloads(items, defaultQuality = '1080p') {
    const createdJobs = [];

    for (const item of items) {
      const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      const quality = item.quality || defaultQuality;
      const ext = getMediaExtension(quality);
      const cleanTitle = (item.title || 'video').replace(/[/\\?%*:|"<>]/g, '_').substring(0, 80);
      const durationSec = formatDuration(item.duration, item.durationFormatted);
      const approxSize = estimateSizeMB(durationSec, quality, ext);

      const job = {
        id: jobId,
        videoId: item.id,
        title: item.title,
        channel: item.channel || item.uploader || 'Creator',
        thumbnail: item.thumbnail,
        duration: durationSec,
        durationFormatted: item.durationFormatted || `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`,
        url: item.url,
        quality,
        ext,
        status: 'queued',
        progress: 0,
        speed: '0 MB/s',
        downloadedMB: 0,
        totalMB: approxSize,
        eta: '--',
        createdAt: new Date().toISOString(),
        completedAt: null,
        error: null,
        fileName: `${cleanTitle}.${ext}`,
        filePath: path.join(DOWNLOADS_DIR, `${jobId}_${cleanTitle}.${ext}`),
        workerActive: false
      };

      this.jobs.set(jobId, job);
      createdJobs.push(job);
    }

    this.processNext();
    this.broadcastUpdate();
    return createdJobs;
  }

  processNext() {
    if (this.isPaused) return;

    while (this.activeWorkers < this.concurrency) {
      let nextJob = null;
      for (const job of this.jobs.values()) {
        if (job.status === 'queued') {
          nextJob = job;
          break;
        }
      }

      if (!nextJob) break;
      this.startJob(nextJob);
    }
  }

  async startJob(job) {
    if (!job.url) {
      job.status = 'failed';
      job.error = 'A valid video URL is required.';
      this.broadcastUpdate();
      return;
    }
    job.status = 'downloading';
    job.startedAt = new Date().toISOString();
    job.workerActive = true;
    this.activeWorkers++;
    this.broadcastUpdate();

    this.runYtDlpDownload(job);
  }

  releaseWorker(job) {
    if (job.workerActive) {
      job.workerActive = false;
      this.activeWorkers = Math.max(0, this.activeWorkers - 1);
    }
  }

  runYtDlpDownload(job, retryingForbidden = false) {
    const outputTemplate = path.join(DOWNLOADS_DIR, `${job.id}_%(id)s.%(ext)s`);
    const args = [
      ...YTDLP_NETWORK_ARGS,
      '--no-playlist',
      '--newline',
      '--no-warnings',
      '--concurrent-fragments', retryingForbidden ? '1' : '4',
      '--socket-timeout', '20',
      '--output', outputTemplate,
      '--print', 'after_move:filepath',
      '--print', 'after_move:duration=%(duration)s'
    ];

    if (fs.existsSync(FFMPEG_PATH)) {
      args.push('--ffmpeg-location', FFMPEG_PATH);
    }

    if (job.ext === 'mp3') {
      args.push('-x', '--audio-format', 'mp3', job.url);
    } else if (job.ext === 'm4a') {
      args.push('-f', 'ba[ext=m4a]', job.url);
    } else {
      const height = getQualityHeight(job.quality);
      args.push(
        '-f', `bv[height<=${height}]+ba/b[height<=${height}]`,
        '-S', 'vcodec:h264,res,fps',
        '--merge-output-format', 'mp4',
        '--recode-video', 'mp4',
        job.url
      );
    }

    const proc = spawn(YTDLP_BIN, args);
    job.process = proc;
    let stdoutBuffer = '';
    let stderrBuffer = '';
    let stderrOutput = '';
    let reportedPath = null;
    let actualDuration = null;

    const consumeLine = (line, isStdout) => {
      const text = line.trim();
      if (!text) return;
      const durationMatch = isStdout && text.match(/^duration=(\d+(?:\.\d+)?)$/);
      if (durationMatch) {
        actualDuration = Number(durationMatch[1]);
        return;
      }
      if (isStdout && path.isAbsolute(text)) reportedPath = text;

      const progress = text.match(/\[download\]\s+(\d+(?:\.\d+)?)%\s+of\s+~?([\d.]+)\s*(B|KiB|MiB|GiB|KB|MB|GB)?(?:\s+at\s+(\S+))?(?:\s+ETA\s+(\S+))?/i);
      if (!progress) return;

      job.progress = Math.min(99, Math.round(Number(progress[1])));
      job.speed = progress[4] || job.speed;
      job.eta = progress[5] || job.eta;
      const totalBytes = sizeToBytes(progress[2], progress[3]);
      if (totalBytes > 0) {
        job.totalMB = Number((totalBytes / 1000000).toFixed(1));
      }
      job.downloadedMB = Number((getDownloadedBytes(job.id) / 1000000).toFixed(1));
      this.broadcastUpdate();
    };

    proc.stdout.on('data', chunk => {
      if (job.process !== proc || job.status !== 'downloading') return;
      stdoutBuffer += chunk.toString();
      const lines = stdoutBuffer.split(/\r?\n/);
      stdoutBuffer = lines.pop() || '';
      lines.forEach(line => consumeLine(line, true));
    });
    proc.stderr.on('data', chunk => {
      if (job.process !== proc || job.status !== 'downloading') return;
      const text = chunk.toString();
      stderrOutput = (stderrOutput + text).slice(-10000);
      stderrBuffer += text;
      const lines = stderrBuffer.split(/\r?\n/);
      stderrBuffer = lines.pop() || '';
      lines.forEach(line => consumeLine(line, false));
    });

    proc.on('close', code => {
      if (job.process !== proc) return;
      if (stdoutBuffer) consumeLine(stdoutBuffer, true);
      if (stderrBuffer) consumeLine(stderrBuffer, false);
      job.process = null;

      if (job.status !== 'downloading') {
        this.releaseWorker(job);
        this.broadcastUpdate();
        this.processNext();
        return;
      }

      if (
        code !== 0 &&
        !retryingForbidden &&
        /\b(?:HTTP Error 403|HTTP 403|403 Forbidden)\b/i.test(stderrOutput)
      ) {
        job.speed = 'Retrying after HTTP 403';
        job.error = 'Access was temporarily denied. Retrying with a fresh media URL and fewer parallel fragments.';
        console.warn(`Retrying "${job.title}" after HTTP 403 with one fragment at a time.`);
        this.broadcastUpdate();
        this.runYtDlpDownload(job, true);
        return;
      }

      try {
        if (code !== 0) {
          throw new Error((stderrOutput || 'yt-dlp could not download this video.').trim().slice(-1500));
        }

        const candidates = [
          reportedPath,
          ...fs.readdirSync(DOWNLOADS_DIR)
            .filter(name => name.startsWith(`${job.id}_`) && !name.endsWith('.part'))
            .map(name => path.join(DOWNLOADS_DIR, name))
        ].filter(Boolean);
        const downloadedPath = candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).size > 0);
        if (!downloadedPath) {
          throw new Error('yt-dlp finished without producing a media file.');
        }
        if (path.extname(downloadedPath).toLowerCase() !== `.${job.ext}`) {
          throw new Error(`Expected a .${job.ext} file but yt-dlp produced ${path.extname(downloadedPath) || 'an unknown format'}.`);
        }

        if (path.resolve(downloadedPath) !== path.resolve(job.filePath)) {
          if (fs.existsSync(job.filePath)) fs.unlinkSync(job.filePath);
          fs.renameSync(downloadedPath, job.filePath);
        }

        const actualSizeMB = Number((fs.statSync(job.filePath).size / 1000000).toFixed(1));
        job.status = 'completed';
        job.progress = 100;
        job.downloadedMB = actualSizeMB;
        job.totalMB = actualSizeMB;
        if (actualDuration !== null) {
          job.duration = actualDuration;
          job.durationFormatted = formatDurationDisplay(actualDuration);
        }
        job.speed = 'Done';
        job.eta = '0s';
        job.completedAt = new Date().toISOString();
        job.error = null;
      } catch (error) {
        job.status = 'failed';
        job.error = error.message;
        job.speed = 'Failed';
        console.error(`Download failed for "${job.title}": ${job.error}`);
      }

      this.releaseWorker(job);
      this.broadcastUpdate();
      this.processNext();
    });

    proc.on('error', error => {
      if (job.process !== proc) return;
      job.process = null;
      if (job.status === 'downloading') {
        job.status = 'failed';
        job.error = `Could not start yt-dlp: ${error.message}`;
        job.speed = 'Failed';
      }
      this.releaseWorker(job);
      this.broadcastUpdate();
      this.processNext();
    });
  }

  cancelJob(jobId) {
    const job = this.jobs.get(jobId);
    if (job) {
      if (job.process) {
        try { job.process.kill(); } catch (e) {}
      }
      job.status = 'cancelled';
      job.speed = '0 MB/s';
      this.broadcastUpdate();
      this.processNext();
    }
  }

  deleteJob(jobId) {
    const job = this.jobs.get(jobId);
    if (job) {
      const wasDownloading = job.status === 'downloading';
      if (wasDownloading) job.status = 'cancelled';
      if (job.process) {
        try { job.process.kill(); } catch (e) {}
      }
      this.releaseWorker(job);
      this.jobs.delete(jobId);
      this.broadcastUpdate();
      this.processNext();
    }
  }

  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  getAllJobs() {
    return Array.from(this.jobs.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getStats() {
    const all = Array.from(this.jobs.values());
    const queued = all.filter(j => j.status === 'queued').length;
    const downloading = all.filter(j => j.status === 'downloading').length;
    const completed = all.filter(j => j.status === 'completed').length;
    const failed = all.filter(j => j.status === 'failed').length;
    const totalDownloadedMB = all
      .filter(j => j.status === 'completed')
      .reduce((acc, j) => acc + (j.totalMB || 0), 0);

    return {
      total: all.length,
      queued,
      downloading,
      completed,
      failed,
      concurrency: this.concurrency,
      isPaused: this.isPaused,
      totalDownloadedMB: Number(totalDownloadedMB.toFixed(1))
    };
  }

  async createBatchZip(res) {
    const allJobs = Array.from(this.jobs.values()).filter(job => job.status === 'completed');
    if (allJobs.length === 0) {
      return res.status(400).send('No completed videos in queue to export yet.');
    }

    for (const job of allJobs) {
      if (!fs.existsSync(job.filePath)) {
        throw new Error(`Completed file is missing for "${job.title}".`);
      }
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="YTFlow_Batch_${Date.now()}.zip"`);

    const archive = archiver('zip', { zlib: { level: 4 } });

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      if (!res.headersSent) {
        res.status(500).send('Archive error');
      }
    });

    archive.pipe(res);

    for (const job of allJobs) {
      if (job.filePath && fs.existsSync(job.filePath)) {
        archive.file(job.filePath, { name: job.fileName });
      }
    }

    await archive.finalize();
  }

  addSubscriber(res) {
    this.subscribers.add(res);
    res.on('close', () => {
      this.subscribers.delete(res);
    });
  }

  broadcastUpdate() {
    if (this.subscribers.size === 0) return;
    const data = JSON.stringify({
      jobs: this.getAllJobs(),
      stats: this.getStats()
    });

    for (const res of this.subscribers) {
      try {
        res.write(`data: ${data}\n\n`);
      } catch (err) {
        this.subscribers.delete(res);
      }
    }
  }
}

export const downloadManager = new DownloadManager();
