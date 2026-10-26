import React, { useEffect, useState } from 'react';
import { 
  Download, Pause, Play, RotateCcw, Trash2, FolderArchive, 
  Sliders, FileCheck 
} from 'lucide-react';
import { DownloadJob, QueueStats } from '../types';
import { triggerDirectFileDownload, downloadBatchZipArchive } from '../services/api';
import { MediaImage } from './MediaImage';

function formatElapsedTime(startedAt: string | undefined, now: number) {
  if (!startedAt) return '0:00';
  const elapsedSeconds = Math.max(0, Math.floor((now - Date.parse(startedAt)) / 1000));
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`;
}

interface QueueManagerProps {
  jobs: DownloadJob[];
  stats: QueueStats;
  onPause: () => void;
  onResume: () => void;
  onRetry: () => void;
  onClear: () => void;
  onCancel: (id: string) => void;
  onDelete?: (id: string) => void;
  onConcurrencyChange: (value: number) => void;
  onPlayOnline?: (media: { id: string; title: string; channel?: string; url?: string; thumbnail?: string }) => void;
}

export const QueueManager: React.FC<QueueManagerProps> = ({
  jobs,
  stats,
  onPause,
  onResume,
  onRetry,
  onClear,
  onCancel,
  onDelete,
  onConcurrencyChange,
  onPlayOnline,
}) => {
  const [clockNow, setClockNow] = useState(() => Date.now());
  const hasActiveDownloads = jobs.some(job => job.status === 'downloading');
  const hasCompleted = jobs.some(j => j.status === 'completed');
  const hasFailed = jobs.some(j => j.status === 'failed' || j.status === 'cancelled');
  const hasHistory = jobs.some(j => j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled');

  useEffect(() => {
    if (!hasActiveDownloads) return undefined;
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [hasActiveDownloads]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Top Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-dark-card border border-slate-800 shadow">
          <div className="text-xs text-slate-400 font-medium mb-1">Active Workers</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-brand-400 font-mono">{stats.downloading}</span>
            <span className="text-xs text-slate-500 font-mono">/ {stats.concurrency} max</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-card border border-slate-800 shadow">
          <div className="text-xs text-slate-400 font-medium mb-1">Queued Tasks</div>
          <div className="text-2xl font-black text-amber-400 font-mono">{stats.queued}</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-card border border-slate-800 shadow">
          <div className="text-xs text-slate-400 font-medium mb-1">Completed</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{stats.completed}</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-card border border-slate-800 shadow">
          <div className="text-xs text-slate-400 font-medium mb-1">Total Transferred</div>
          <div className="text-2xl font-black text-indigo-400 font-mono">
            {stats.totalDownloadedMB > 1024 
              ? `${(stats.totalDownloadedMB / 1024).toFixed(2)} GB` 
              : `${stats.totalDownloadedMB} MB`}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-dark-card border border-slate-800 shadow-lg mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Pause/Resume, Retry, Clear */}
        <div className="flex flex-wrap items-center gap-2">
          {stats.isPaused ? (
            <button
              onClick={onResume}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-dark-bg font-bold text-xs hover:bg-emerald-400 transition-colors shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Queue</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              disabled={stats.downloading === 0 && stats.queued === 0}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 disabled:opacity-50 transition-colors border border-slate-700"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Queue</span>
            </button>
          )}

          {hasFailed && (
            <button
              onClick={onRetry}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/15 text-amber-300 font-semibold text-xs border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Failed</span>
            </button>
          )}

          {hasHistory && (
            <button
              onClick={onClear}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 font-medium text-xs transition-colors"
              title="Remove completed, failed, and cancelled items from this queue. Active downloads are kept."
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Queue History</span>
            </button>
          )}
        </div>

        {/* Right: Concurrency Setting & 1-Click Batch ZIP */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Videos at once:</span>
            <select
              value={stats.concurrency}
              onChange={(e) => onConcurrencyChange(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-brand-300 focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 15 }, (_, index) => index + 6).map(count => (
                <option key={count} value={count} className="bg-dark-card text-white">
                  {count} videos
                </option>
              ))}
            </select>
          </div>

          {/* 1-Click Batch ZIP Archive Download (Works on Local & Firebase!) */}
          {hasCompleted && (
            <button
              onClick={downloadBatchZipArchive}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
              title="Download entire batch in 1 single ZIP archive"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Download Batch as ZIP</span>
            </button>
          )}
        </div>
      </div>

      {/* Task Queue List */}
      {jobs.length === 0 ? (
        <div className="p-12 rounded-3xl bg-dark-card/60 border border-slate-800 text-center">
          <Download className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300 mb-1">Queue is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Select a channel or video above and click &quot;Download All&quot; or &quot;Queue&quot; to begin high-speed processing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const isDownloading = job.status === 'downloading';
            const isCompleted = job.status === 'completed';
            const isFailed = job.status === 'failed' || job.status === 'cancelled';

            return (
              <div
                key={job.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDownloading
                    ? 'bg-slate-900/90 border-brand-500/50 shadow-lg shadow-brand-500/5'
                    : isCompleted
                    ? 'bg-dark-card/70 border-emerald-500/30'
                    : 'bg-dark-card/50 border-slate-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Thumbnail & Meta */}
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="relative w-20 h-12 sm:w-24 sm:h-14 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                      <MediaImage
                        src={job.thumbnail}
                        alt={job.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono font-bold text-white">
                        {job.durationFormatted}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-100 truncate" title={job.title}>
                        {job.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                          {job.quality} • {job.ext.toUpperCase()} (Sound Active)
                        </span>
                        <span>•</span>
                        <span className="text-slate-400 font-mono">
                          {job.downloadedMB.toFixed(1)} / {isCompleted ? '' : '~'}{job.totalMB.toFixed(1)} MB
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions with PLAY ONLINE and SAVE FILE */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {isDownloading && (
                      <div className="text-right font-mono text-xs hidden sm:block pr-2">
                        <div className="text-brand-400 font-bold">{job.speed}</div>
                        <div className="text-slate-400 text-[10px]">Elapsed: {formatElapsedTime(job.startedAt, clockNow)}</div>
                        <div className="text-slate-500 text-[10px]">ETA: {job.eta}</div>
                      </div>
                    )}

                    {onPlayOnline && (
                      <button
                        onClick={() => onPlayOnline({ id: job.id, title: job.title, channel: job.channel, url: job.url, thumbnail: job.thumbnail })}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500 text-brand-300 hover:text-dark-bg text-xs font-bold transition-colors"
                        title="Play in browser"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play</span>
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => triggerDirectFileDownload(job.id, job.fileName)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-brand-500 text-dark-bg font-extrabold text-xs hover:bg-brand-400 transition-colors shadow"
                        title="Save file to computer"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Save File</span>
                      </button>
                    )}

                    <button
                      onClick={() => (onDelete ? onDelete(job.id) : onCancel(job.id))}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete from Queue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        isCompleted
                          ? 'bg-emerald-400'
                          : isFailed
                          ? 'bg-rose-500'
                          : 'bg-gradient-to-r from-brand-500 to-cyan-300'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  {isDownloading && (
                    <div className="flex flex-wrap justify-between items-center gap-x-3 text-[10px] text-slate-400 mt-1 font-mono">
                      <span>
                        Downloading with sound at {job.speed}... · Elapsed {formatElapsedTime(job.startedAt, clockNow)} · ETA {job.eta}
                      </span>
                      <span className="font-bold text-brand-300">{job.progress}%</span>
                    </div>
                  )}
                  {isFailed && job.error && (
                    <p className="mt-2 text-xs text-rose-300 break-words">{job.error}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
