import React, { useState, useEffect, useRef } from 'react';
import { Navbar, NavTabType } from './components/Navbar';
import { Hero } from './components/Hero';
import { ChannelDashboard } from './components/ChannelDashboard';
import { SingleVideoCard } from './components/SingleVideoCard';
import { QueueManager } from './components/QueueManager';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { ZeroAdsModal } from './components/ZeroAdsModal';
import { MediaPlayerModal } from './components/MediaPlayerModal';
import { AboutView } from './components/AboutView';
import { FAQView } from './components/FAQView';
import { TermsView } from './components/TermsView';
import { Footer } from './components/Footer';

import { ChannelData, DownloadJob, HistoryItem, MediaFormat, QueueStats, VideoItem } from './types';
import { 
  fetchChannelInfo, 
  fetchVideoInfo, 
  queueDownloads, 
  subscribeToQueueUpdates,
  pauseQueue,
  resumeQueue,
  retryFailed,
  clearQueueHistory,
  cancelJob,
  deleteQueueJob,
  updateConcurrency,
  triggerDirectFileDownload
} from './services/api';
import { AlertCircle, CheckCircle2, Info, X, Film, Play, History as HistoryIcon } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTabType>('channel');

  // CLEAN INITIAL STATE: No fake hardcoded channels or songs!
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [videoData, setVideoData] = useState<VideoItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Play Online modal state
  const [playingMedia, setPlayingMedia] = useState<{
    id: string;
    title: string;
    channel?: string;
    url?: string;
    thumbnail?: string;
    duration?: number;
    durationFormatted?: string;
  } | null>(null);

  // Auto-Save feature
  const [autoSave] = useState(true);
  const autoSavedIds = useRef<Set<string>>(new Set());

  // Queue state
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    queued: 0,
    downloading: 0,
    completed: 0,
    failed: 0,
    concurrency: 40,
    isPaused: false,
    totalDownloadedMB: 0,
  });

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ytflow_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZeroAdsOpen, setIsZeroAdsOpen] = useState(false);
  const [defaultQuality, setDefaultQuality] = useState('1080p');

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Real-time queue sync & Auto-Save
  useEffect(() => {
    const unsubscribe = subscribeToQueueUpdates(({ jobs: updatedJobs, stats: updatedStats }) => {
      setJobs(updatedJobs);
      setStats(updatedStats);

      updatedJobs.forEach(job => {
        if (job.status === 'completed') {
          // One-shot Auto-Save trigger (prevents infinite loop/repeats)
          if (autoSave && !autoSavedIds.current.has(job.id)) {
            autoSavedIds.current.add(job.id);
            triggerDirectFileDownload(job.id, job.fileName);
            showToast(`Auto-saved "${job.title}"!`, 'success');
          }

          setHistory(prev => {
            if (prev.some(h => h.id === job.id)) return prev;
            const newItem: HistoryItem = {
              id: job.id,
              title: job.title,
              channel: job.channel,
              thumbnail: job.thumbnail,
              quality: job.quality,
              format: job.ext.toUpperCase(),
              sizeMB: job.totalMB,
              date: new Date().toLocaleDateString(),
              url: job.url,
            };
            const updated = [newItem, ...prev].slice(0, 50);
            try {
              localStorage.setItem('ytflow_history', JSON.stringify(updated));
            } catch (err) {}
            return updated;
          });
        }
      });
    });

    return () => unsubscribe();
  }, []);

  // SMART AUTO-ANALYZE ENGINE
  const handleSearch = async (rawUrl: string) => {
    const cleanUrl = rawUrl.trim();
    if (!cleanUrl) return;

    setIsLoading(true);
    setErrorMessage(null);

    const lower = cleanUrl.toLowerCase();
    
    // Check if it's a channel link/handle
    const isChannel = 
      cleanUrl.startsWith('@') || 
      /^UC[\w-]{20,}$/i.test(cleanUrl) ||
      lower.includes('/@') || 
      lower.includes('/channel/') || 
      lower.includes('/c/') || 
      lower.includes('/user/');

    try {
      if (isChannel) {
        const data = await fetchChannelInfo(cleanUrl);
        setChannelData(data);
        setActiveTab('channel');
        if (data.videos.length > 0) {
          showToast(`Retrieved ${data.videos.length} videos from ${data.title}!`, 'success');
        } else {
          showToast(`Channel ${data.title} ready. Paste specific video links to download with sound.`, 'info');
        }
      } else {
        const data = await fetchVideoInfo(cleanUrl);
        setVideoData(data);
        setActiveTab('single');
        showToast(`Media ready: "${data.title}"`, 'success');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not inspect media link.');
    } finally {
      setIsLoading(false);
    }
  };

  // Download ONLY selected channel videos
  const handleDownloadSelectedVideos = async (videos: VideoItem[], quality: string) => {
    try {
      const itemsToQueue = videos.map(v => ({
        id: v.id,
        title: v.title,
        url: v.url,
        thumbnail: v.thumbnail,
        channel: channelData?.title || 'Roohani Alfaz',
        duration: v.duration,
        durationFormatted: v.durationFormatted,
        quality
      }));

      await queueDownloads(itemsToQueue, quality);
      showToast(`🚀 Queued ${videos.length} selected videos with sound! Auto-Save active.`, 'success');
      setActiveTab('queue');
    } catch (err: any) {
      showToast(err.message || 'Failed to queue selected videos', 'error');
    }
  };

  // Download Single Video
  const handleDownloadSingle = async (video: VideoItem, qualityOrFormat: string | MediaFormat) => {
    try {
      const quality = typeof qualityOrFormat === 'string' ? qualityOrFormat : qualityOrFormat.label;

      await queueDownloads([{
        id: video.id,
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail,
        channel: video.channel || channelData?.title || 'Creator',
        duration: video.duration,
        durationFormatted: video.durationFormatted,
        quality
      }], quality);

      showToast(`Started downloading "${video.title}" with sound!`, 'success');
      setActiveTab('queue');
    } catch (err: any) {
      showToast(err.message || 'Failed to start download', 'error');
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('ytflow_history');
    } catch (e) {}
    showToast('Download history cleared.', 'info');
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col selection:bg-brand-500 selection:text-dark-bg">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-dark-card border border-brand-500/40 shadow-2xl backdrop-blur-md">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-brand-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
            <span className="text-sm font-semibold text-white">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white pl-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        queueCount={stats.downloading + stats.queued}
        activeCount={stats.downloading}
        openSettings={() => setIsSettingsOpen(true)}
        openZeroAdsModal={() => setIsZeroAdsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Unified Auto-Analyzing Hero */}
        <Hero
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {errorMessage && (
          <div className="max-w-3xl mx-auto px-4 mb-6">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Channel View */}
        {activeTab === 'channel' && channelData && channelData.videos.length > 0 && (
          <ChannelDashboard
            channel={channelData}
            onDownloadAll={handleDownloadSelectedVideos}
            onDownloadSelected={handleDownloadSelectedVideos}
            onDownloadSingle={handleDownloadSingle}
            onPlayOnline={(v) => setPlayingMedia(v)}
          />
        )}

        {/* Channel Tab Empty State */}
        {activeTab === 'channel' && !channelData && (
          <div className="max-w-3xl mx-auto px-4 pb-16 text-center">
            <div className="p-8 rounded-3xl glass-card border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-2">Analyze a YouTube channel</h2>
              <p className="text-sm text-slate-400">
                Paste a channel URL, channel ID, or @handle above to load its videos.
              </p>
            </div>
          </div>
        )}

        {/* Empty state when channel has no direct videos */}
        {activeTab === 'channel' && channelData && channelData.videos.length === 0 && (
          <div className="max-w-3xl mx-auto px-4 pb-16 text-center">
            <div className="p-8 rounded-3xl glass-card border border-slate-800">
              <Film className="w-12 h-12 text-brand-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">{channelData.title}</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Paste any specific video URL from this channel above to download with sound or play online.
              </p>
            </div>
          </div>
        )}

        {/* Single Video View - When video is loaded */}
        {activeTab === 'single' && videoData && (
          <SingleVideoCard
            video={videoData}
            onDownload={(v, f) => handleDownloadSingle(v, f)}
            onAddToQueue={(v, f) => handleDownloadSingle(v, f)}
            onPlayOnline={(v) => setPlayingMedia(v)}
          />
        )}

        {/* Single Video Tab Empty State - Dedicated Single URL Inspector */}
        {activeTab === 'single' && !videoData && (
          <div className="max-w-3xl mx-auto px-4 pb-16 text-center space-y-6 animate-in fade-in duration-300">
            <div className="p-8 sm:p-12 rounded-3xl glass-card border border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
                <Film className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Single Video & Media Inspector</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                Paste any specific YouTube video, Shorts, Instagram Reel, TikTok, or Facebook link in the search bar above to inspect available resolutions (4K, 1080p, 720p, MP3) with crystal-clear audio.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleSearch('https://www.youtube.com/watch?v=GBABpUqlMXg')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  ▶ Try Sample Video: "Tum Dua Ho (5:03)"
                </button>
                <button
                  onClick={() => handleSearch('https://www.youtube.com/watch?v=03oZYnR4k1U')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  ▶ Try Sample Video: "Baar Baar Pyar (7:26)"
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Queue View */}
        {activeTab === 'queue' && (
          <QueueManager
            jobs={jobs}
            stats={stats}
            onPause={pauseQueue}
            onResume={resumeQueue}
            onRetry={retryFailed}
            onClear={clearQueueHistory}
            onCancel={cancelJob}
            onDelete={deleteQueueJob}
            onConcurrencyChange={updateConcurrency}
            onPlayOnline={(m) => setPlayingMedia(m)}
          />
        )}

        {/* History / Archive Vault View */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 animate-in fade-in duration-300">
            <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                    <span>Local Offline Archive Vault</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    All completed files saved directly to your local storage for permanent offline listening and editing.
                  </p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-colors"
                  >
                    Clear Vault History
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
                    <HistoryIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Archive Vault is Empty</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Download media from Channel Bulk or Single Video tab to populate your personal offline library.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(item => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <img src={item.thumbnail} alt={item.title} className="w-16 h-12 object-cover rounded-xl border border-slate-800 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate max-w-md">{item.title}</div>
                          <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-brand-500/15 text-brand-300 font-mono text-[10px] font-bold">{item.format}</span>
                            <span>•</span>
                            <span>{item.quality}</span>
                            <span>•</span>
                            <span className="text-slate-300 font-semibold">{item.sizeMB} MB</span>
                            <span>•</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => triggerDirectFileDownload(item.id, `${item.title.replace(/[/\\?%*:|"<>]/g, '_')}.${item.format.toLowerCase()}`)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 font-semibold text-xs border border-slate-700 flex-shrink-0 transition-colors"
                      >
                        Re-Save
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* About View */}
        {activeTab === 'about' && (
          <AboutView 
            onExploreChannels={() => {
              setActiveTab('channel');
              handleSearch('@roohani_alfaz_org');
            }} 
          />
        )}

        {/* FAQ View */}
        {activeTab === 'faq' && (
          <FAQView />
        )}

        {/* Terms & Privacy View */}
        {activeTab === 'terms' && (
          <TermsView />
        )}
      </main>

      {/* Footer with Developer Ravees Altaf credits and fast tab navigation */}
      <Footer onNavigate={setActiveTab} />

      {/* Play Online Modal */}
      <MediaPlayerModal
        isOpen={!!playingMedia}
        onClose={() => setPlayingMedia(null)}
        media={playingMedia}
        onDownloadVideo={() => {
          if (!playingMedia) return;
          const v: VideoItem = {
            id: playingMedia.id,
            title: playingMedia.title,
            url: playingMedia.url || `https://www.youtube.com/watch?v=${playingMedia.id}`,
            thumbnail: playingMedia.thumbnail || '',
            channel: playingMedia.channel || 'Creator',
            duration: playingMedia.duration || 0,
            durationFormatted: playingMedia.durationFormatted || 'Unknown',
            viewCount: 'Verified',
            uploadDate: 'Official Media'
          };
          handleDownloadSingle(v, '1080p');
        }}
        onDownloadAudio={() => {
          if (!playingMedia) return;
          const v: VideoItem = {
            id: playingMedia.id,
            title: playingMedia.title,
            url: playingMedia.url || `https://www.youtube.com/watch?v=${playingMedia.id}`,
            thumbnail: playingMedia.thumbnail || '',
            channel: playingMedia.channel || 'Creator',
            duration: playingMedia.duration || 0,
            durationFormatted: playingMedia.durationFormatted || 'Unknown',
            viewCount: 'Verified',
            uploadDate: 'Official Media'
          };
          handleDownloadSingle(v, 'audio-mp3-320');
        }}
      />

      <HistoryModal
        isOpen={false}
        onClose={() => {}}
        history={history}
        onClearHistory={handleClearHistory}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        concurrency={stats.concurrency}
        onConcurrencyChange={updateConcurrency}
        defaultQuality={defaultQuality}
        onDefaultQualityChange={setDefaultQuality}
      />

      <ZeroAdsModal
        isOpen={isZeroAdsOpen}
        onClose={() => setIsZeroAdsOpen(false)}
      />
    </div>
  );
}

export default App;
