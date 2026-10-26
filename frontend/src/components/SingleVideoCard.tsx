import React, { useState } from 'react';
import { 
  Download, Film, Music, Check, Play 
} from 'lucide-react';
import { MediaFormat, VideoItem } from '../types';
import { MediaImage } from './MediaImage';

interface SingleVideoCardProps {
  video: VideoItem;
  onDownload: (video: VideoItem, format: MediaFormat) => void;
  onAddToQueue: (video: VideoItem, format: MediaFormat) => void;
  onPlayOnline?: (video: VideoItem) => void;
}

export const SingleVideoCard: React.FC<SingleVideoCardProps> = ({
  video,
  onDownload,
  onAddToQueue,
  onPlayOnline,
}) => {
  const formats = video.formats || [];
  const [selectedFormatId, setSelectedFormatId] = useState<string>(
    formats.find(f => f.recommended)?.id || formats[0]?.id || '1080p'
  );
  const [mediaTab, setMediaTab] = useState<'video' | 'audio'>('video');

  const selectedFormat = formats.find(f => f.id === selectedFormatId) || formats[0];

  const filteredFormats = formats.filter(f => 
    mediaTab === 'video' ? !f.isAudioOnly : f.isAudioOnly
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="rounded-3xl glass-card border border-slate-700/80 shadow-2xl overflow-hidden p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: Thumbnail Preview & Quick Stats */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl bg-slate-900 border border-slate-800 group">
              <MediaImage
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-xs font-mono font-bold text-white">
                {video.durationFormatted}
              </div>

              {/* Play online overlay */}
              {onPlayOnline && (
                <div 
                  onClick={() => onPlayOnline(video)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  title="Play Online"
                >
                  <div className="w-14 h-14 rounded-full bg-brand-500 text-dark-bg flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-current ml-0.5" />
                  </div>
                </div>
              )}

              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-500/90 text-dark-bg font-extrabold text-[11px] shadow">
                READY
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Channel / Source:</span>
                <span className="font-semibold text-slate-200">{video.channel || 'Media Source'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Duration:</span>
                <span className="font-mono text-slate-200">{video.durationFormatted}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Views:</span>
                <span className="font-semibold text-slate-200">{video.viewCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Audio Track:</span>
                <span className="font-semibold text-emerald-400">Merged (Sound Active)</span>
              </div>
            </div>
          </div>

          {/* Right: Format Selector & Actions */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                {video.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
                {video.description || 'High-fidelity media processing with zero advertisements and sound active.'}
              </p>
            </div>

            {/* Media Type Tabs */}
            <div className="flex items-center space-x-2 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit">
              <button
                onClick={() => setMediaTab('video')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  mediaTab === 'video'
                    ? 'bg-brand-500 text-dark-bg shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Video + Sound</span>
              </button>
              <button
                onClick={() => setMediaTab('audio')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  mediaTab === 'audio'
                    ? 'bg-brand-500 text-dark-bg shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Audio Only (MP3)</span>
              </button>
            </div>

            {/* Formats Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Quality & Resolution
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {filteredFormats.map((fmt) => {
                  const isSelected = selectedFormatId === fmt.id;

                  return (
                    <div
                      key={fmt.id}
                      onClick={() => setSelectedFormatId(fmt.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/10 shadow-md shadow-brand-500/10'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white">{fmt.label}</span>
                          {fmt.recommended && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                              Best
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {fmt.ext.toUpperCase()} • Codec: {fmt.vcodec}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-brand-400">
                          ~{fmt.approxSizeMB} MB
                        </div>
                        {isSelected && (
                          <div className="text-brand-400 text-xs flex justify-end pt-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons with PLAY ONLINE */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
              {onPlayOnline && (
                <button
                  onClick={() => onPlayOnline(video)}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-brand-500/20 hover:bg-brand-500 text-brand-300 hover:text-dark-bg font-extrabold text-sm border border-brand-500/40 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Online</span>
                </button>
              )}

              <button
                onClick={() => onDownload(video, selectedFormat)}
                className="w-full sm:flex-1 flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 via-cyan-400 to-indigo-500 text-dark-bg font-extrabold text-sm shadow-xl shadow-brand-500/30 hover:opacity-95 transition-all transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download with Sound</span>
              </button>

              <button
                onClick={() => onAddToQueue(video, selectedFormat)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700/80 transition-colors"
              >
                Add to Queue
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
