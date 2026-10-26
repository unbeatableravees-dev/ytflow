export interface MediaFormat {
  id: string;
  resolution: string;
  label: string;
  ext: string;
  fps: number;
  approxSizeMB: number;
  vcodec: string;
  hasAudio: boolean;
  isAudioOnly?: boolean;
  recommended?: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  duration: number;
  durationFormatted: string;
  thumbnail: string;
  viewCount: string;
  uploadDate: string;
  channel?: string;
  description?: string;
  formats?: MediaFormat[];
}

export interface ChannelData {
  title: string;
  handle: string;
  avatar: string;
  banner: string;
  subscriberCount: string;
  videoCount: number;
  description: string;
  videos: VideoItem[];
}

export interface DownloadJob {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration?: number;
  durationFormatted: string;
  url: string;
  quality: string;
  ext: string;
  status: 'queued' | 'downloading' | 'completed' | 'failed' | 'paused' | 'cancelled';
  progress: number;
  speed: string;
  downloadedMB: number;
  totalMB: number;
  eta: string;
  createdAt: string;
  startedAt?: string;
  completedAt: string | null;
  error?: string | null;
  fileName: string;
}

export interface QueueStats {
  total: number;
  queued: number;
  downloading: number;
  completed: number;
  failed: number;
  concurrency: number;
  isPaused: boolean;
  totalDownloadedMB: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  quality: string;
  format: string;
  sizeMB: number;
  date: string;
  url: string;
}
