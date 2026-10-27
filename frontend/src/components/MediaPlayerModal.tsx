import React from 'react';
import { X, Play, Download, Volume2, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { getMediaStreamUrl, triggerVideoPackageDownload } from '../services/api';

interface MediaPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: {
    id: string;
    title: string;
    channel?: string;
    url?: string;
    thumbnail?: string;
    duration?: number;
    durationFormatted?: string;
  } | null;
  onDownloadVideo?: () => void;
  onDownloadAudio?: () => void;
}

export const MediaPlayerModal: React.FC<MediaPlayerModalProps> = ({
  isOpen,
  onClose,
  media,
  onDownloadVideo,
  onDownloadAudio,
}) => {
  if (!isOpen || !media) return null;

  // Check if it's a real YouTube video ID
  const ytMatch = media.url?.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  const ytVideoId = ytMatch ? ytMatch[1] : null;

  const streamSrc = getMediaStreamUrl(media.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-dark-card border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Player Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-3 min-w-0 pr-4">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 flex-shrink-0">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate" title={media.title}>
                {media.title}
              </h3>
              <p className="text-xs text-slate-400">
                {media.channel || 'Media Stream'} • High Audio Fidelity (Sound Active)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Audio Player Viewport */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {ytVideoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&rel=0`}
              title={media.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <video
              src={streamSrc}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            >
              Your browser does not support HTML5 video playback.
            </video>
          )}
        </div>

        {/* Player Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-dark-bg/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Ads • Clean Stream with Sound</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Download Video (MP4) */}
            <button
              onClick={() => {
                if (onDownloadVideo) {
                  onDownloadVideo();
                } else {
                  triggerVideoPackageDownload(media.id, media.title);
                }
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 via-cyan-400 to-indigo-500 text-dark-bg font-extrabold text-xs shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all"
              title="Download the video and its YouTube description in a ZIP file"
            >
              <Download className="w-4 h-4" />
              <span>Video + Description (ZIP)</span>
            </button>

            {/* Download Audio (MP3 320k) */}
            <button
              onClick={() => {
                if (onDownloadAudio) {
                  onDownloadAudio();
                } else {
                  triggerVideoPackageDownload(media.id, media.title);
                }
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 transition-all"
              title="Download audio and its YouTube description in a ZIP file"
            >
              <Volume2 className="w-4 h-4" />
              <span>Audio + Description (ZIP)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
