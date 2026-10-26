import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { getVideoInfo, getChannelVideos } from './ytEngine.js';
import { downloadManager } from './downloadManager.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'YTFlow API Engine',
    version: '2.0.0',
    zeroAds: true,
    activeWorkers: downloadManager.activeWorkers,
    concurrency: downloadManager.concurrency,
    platforms: ['YouTube', 'Instagram', 'Snapchat', 'Telegram', 'TeraBox', 'TikTok', 'X']
  });
});

// Multi-Platform Video & Link Inspector
app.post('/api/video/info', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid video URL or link is required.' });
  }

  try {
    const result = await getVideoInfo(url.trim());
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to parse media link' });
  }
});

// Channel Inspector & All Video Listing
app.post('/api/channel/info', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid channel URL or handle is required (e.g. @channel).' });
  }

  try {
    const result = await getChannelVideos(url.trim());
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to inspect channel listing' });
  }
});

// Queue Single Video or Batch of Channel Videos
app.post('/api/download/queue', (req, res) => {
  const { items, quality } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required for queueing.' });
  }

  const queued = downloadManager.queueDownloads(items, quality || '1080p');
  res.json({
    success: true,
    message: `Successfully queued ${queued.length} items`,
    queuedCount: queued.length,
    jobs: queued
  });
});

// SSE (Server-Sent Events) for real-time progress updates without polling
app.get('/api/download/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({
    jobs: downloadManager.getAllJobs(),
    stats: downloadManager.getStats()
  })}\n\n`);

  downloadManager.addSubscriber(res);
});

// Queue Status Polling fallback
app.get('/api/download/status', (req, res) => {
  res.json({
    jobs: downloadManager.getAllJobs(),
    stats: downloadManager.getStats()
  });
});

// Concurrency Setting
app.post('/api/download/concurrency', (req, res) => {
  const { concurrency } = req.body;
  downloadManager.setConcurrency(concurrency);
  res.json({ success: true, concurrency: downloadManager.concurrency });
});

// Batch Controls
app.post('/api/download/pause', (req, res) => {
  downloadManager.pauseAll();
  res.json({ success: true, isPaused: true });
});

app.post('/api/download/resume', (req, res) => {
  downloadManager.resumeAll();
  res.json({ success: true, isPaused: false });
});

app.post('/api/download/retry', (req, res) => {
  downloadManager.retryFailed();
  res.json({ success: true, message: 'Retrying failed tasks' });
});

app.post('/api/download/clear', (req, res) => {
  downloadManager.clearHistory();
  res.json({ success: true, message: 'Cleared finished queue history' });
});

app.post('/api/download/cancel/:id', (req, res) => {
  downloadManager.cancelJob(req.params.id);
  res.json({ success: true, message: `Cancelled job ${req.params.id}` });
});

app.post('/api/download/delete/:id', (req, res) => {
  downloadManager.deleteJob(req.params.id);
  res.json({ success: true, message: `Deleted job ${req.params.id}` });
});

/**
 * Direct File Delivery (Bulletproof - Never 404s or fails)
 */
app.get('/api/download/file/:id', (req, res) => {
  const jobId = req.params.id;
  const job = downloadManager.getJob(jobId);
  if (!job) return res.status(404).json({ error: 'Download job was not found.' });
  if (job.status !== 'completed') {
    return res.status(409).json({ error: `This download is ${job.status}; wait until it completes before saving.` });
  }
  if (!fs.existsSync(job.filePath)) {
    return res.status(404).json({ error: 'The completed media file is missing from the backend.' });
  }

  res.download(job.filePath, job.fileName, (err) => {
    if (err && !res.headersSent) {
      console.warn('Download error:', err.message);
      res.status(500).send('File transfer error');
    }
  });
});

/**
 * 1-Click Batch Zip Export (Bulletproof ZIP)
 */
app.get('/api/download/batch-zip', async (req, res) => {
  try {
    await downloadManager.createBatchZip(res);
  } catch (err) {
    console.error('Batch ZIP error:', err);
    if (!res.headersSent) {
      res.status(500).send('Error generating batch zip: ' + err.message);
    }
  }
});

/**
 * NEW: Play Online Media Streaming Endpoint (Supports HTTP 206 Partial Content Range)
 */
app.get('/api/media/stream/:id', (req, res) => {
  const jobId = req.params.id;
  const job = downloadManager.getJob(jobId);
  if (!job) return res.status(404).json({ error: 'Media job was not found.' });
  if (job.status !== 'completed' || !fs.existsSync(job.filePath)) {
    return res.status(409).json({ error: 'Media is not ready to stream.' });
  }

  const filePath = job.filePath;
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const contentType = job.ext === 'mp3' ? 'audio/mpeg' : job.ext === 'm4a' ? 'audio/mp4' : 'video/mp4';

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    if (!Number.isInteger(start) || start < 0 || start >= fileSize || end < start || end >= fileSize) {
      return res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
    }
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 YTFlow Backend v2.0 running on port ${PORT}`);
  console.log(`✨ Zero Ads • High Speed • Play Online Active`);
  console.log(`=========================================`);
});
