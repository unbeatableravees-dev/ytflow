import { ChannelData, DownloadJob, QueueStats, VideoItem } from '../types';

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();
const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = (configuredApiBase || '/api').replace(/\/+$/, '');

async function requestJson<T>(endpoint: string, init?: RequestInit): Promise<T> {
  if (!configuredApiBase && !isLocalHost) {
    throw new Error('Channel analysis and downloads are unavailable: this Firebase site has no backend API configured. Deploy the backend, set VITE_API_BASE_URL to its /api URL, then rebuild and redeploy the frontend.');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, init);
  } catch (error) {
    const deploymentHint = !isLocalHost
      ? ' Set VITE_API_BASE_URL to your deployed backend API URL.'
      : ' Make sure the backend is running on port 5000.';
    throw new Error(`Could not reach the YTFlow backend.${deploymentHint}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      throw new Error(`The YTFlow backend is unavailable (HTTP ${response.status}). Check that the backend service is deployed and that VITE_API_BASE_URL points to its /api endpoint.`);
    }
    throw new Error(`The YTFlow backend returned an invalid response (${response.status}). Expected JSON from ${API_BASE}.`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `YTFlow backend request failed (${response.status}).`);
  }
  return data as T;
}

export async function fetchVideoInfo(url: string): Promise<VideoItem> {
  const result = await requestJson<{ data: VideoItem }>('/video/info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return result.data;
}

export async function fetchChannelInfo(url: string): Promise<ChannelData> {
  const result = await requestJson<{ data: ChannelData }>('/channel/info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return result.data;
}

export async function queueDownloads(
  items: Array<{
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    channel?: string;
    duration?: number;
    durationFormatted?: string;
    description?: string;
    quality?: string;
  }>,
  quality = '1080p'
): Promise<{ success: boolean; queuedCount: number; jobs: DownloadJob[] }> {
  return requestJson('/download/queue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, quality }),
  });
}

export async function fetchQueueStatus(): Promise<{ jobs: DownloadJob[]; stats: QueueStats }> {
  return requestJson('/download/status');
}

export async function updateConcurrency(concurrency: number): Promise<void> {
  await requestJson('/download/concurrency', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concurrency }),
  });
}

export async function pauseQueue(): Promise<void> {
  await requestJson('/download/pause', { method: 'POST' });
}

export async function resumeQueue(): Promise<void> {
  await requestJson('/download/resume', { method: 'POST' });
}

export async function retryFailed(): Promise<void> {
  await requestJson('/download/retry', { method: 'POST' });
}

export async function clearQueueHistory(): Promise<void> {
  await requestJson('/download/clear', { method: 'POST' });
}

export async function resetQueue(): Promise<void> {
  await requestJson('/download/reset', { method: 'POST' });
}

export async function cancelJob(id: string): Promise<void> {
  await requestJson(`/download/cancel/${encodeURIComponent(id)}`, { method: 'POST' });
}

export async function deleteQueueJob(id: string): Promise<void> {
  await requestJson(`/download/delete/${encodeURIComponent(id)}`, { method: 'POST' });
}

export function triggerVideoPackageDownload(jobId: string, title: string) {
  const link = document.createElement('a');
  const safeTitle = title.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 80) || 'video';
  link.href = `${API_BASE}/download/package/${encodeURIComponent(jobId)}`;
  link.download = `YTFlow_${safeTitle}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function triggerDirectFileDownload(jobId: string, fileName: string) {
  const link = document.createElement('a');
  link.href = `${API_BASE}/download/file/${encodeURIComponent(jobId)}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function getFileDownloadUrl(id: string): string {
  return `${API_BASE}/download/file/${encodeURIComponent(id)}`;
}

export function getMediaStreamUrl(id: string): string {
  return `${API_BASE}/media/stream/${encodeURIComponent(id)}`;
}

export function downloadBatchZipArchive() {
  const link = document.createElement('a');
  link.href = `${API_BASE}/download/batch-zip`;
  link.download = `YTFlow_Batch_${Date.now()}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function subscribeToQueueUpdates(
  onUpdate: (data: { jobs: DownloadJob[]; stats: QueueStats }) => void
): () => void {
  let active = true;
  requestJson<{ jobs: DownloadJob[]; stats: QueueStats }>('/download/status')
    .then(data => { if (active) onUpdate(data); })
    .catch(error => console.error('Could not load download queue:', error));

  const eventSource = new EventSource(`${API_BASE}/download/stream`);
  eventSource.onmessage = event => {
    try {
      onUpdate(JSON.parse(event.data));
    } catch (error) {
      console.error('Could not read a queue update:', error);
    }
  };
  eventSource.onerror = () => {
    console.error('Lost connection to the YTFlow download queue.');
  };

  return () => {
    active = false;
    eventSource.close();
  };
}
