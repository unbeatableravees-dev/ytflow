import React, { useState, useMemo, useEffect } from 'react';
import { 
  Download, CheckSquare, Square, Zap, Search, 
  CheckCircle, Eye, Calendar, Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChannelData, VideoItem } from '../types';
import { MediaImage } from './MediaImage';

interface ChannelDashboardProps {
  channel: ChannelData;
  onDownloadAll: (videos: VideoItem[], quality: string) => void;
  onDownloadSelected: (videos: VideoItem[], quality: string) => void;
  onDownloadSingle: (video: VideoItem, quality: string) => void;
  onPlayOnline: (video: VideoItem) => void;
}

export const ChannelDashboard: React.FC<ChannelDashboardProps> = ({
  channel,
  onDownloadSelected,
  onDownloadSingle,
  onPlayOnline,
}) => {
  // Start with all selected, but user can uncheck and ONLY selected will download!
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(channel.videos.map(v => v.id))
  );
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'duration' | 'title'>('default');
  const [visibleCount, setVisibleCount] = useState(60);

  useEffect(() => {
    setSelectedIds(new Set(channel.videos.map(video => video.id)));
    setVisibleCount(60);
  }, [channel]);

  const filteredVideos = useMemo(() => {
    let result = [...channel.videos];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => v.title.toLowerCase().includes(q));
    }

    if (durationFilter === 'short') {
      result = result.filter(v => v.duration < 300);
    } else if (durationFilter === 'medium') {
      result = result.filter(v => v.duration >= 300 && v.duration <= 900);
    } else if (durationFilter === 'long') {
      result = result.filter(v => v.duration > 900);
    }

    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'duration') {
      result.sort((a, b) => b.duration - a.duration);
    }

    return result;
  }, [channel.videos, searchQuery, durationFilter, sortBy]);

  const isAllSelected = filteredVideos.length > 0 && filteredVideos.every(v => selectedIds.has(v.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const newSet = new Set(selectedIds);
      filteredVideos.forEach(v => newSet.delete(v.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      filteredVideos.forEach(v => newSet.add(v.id));
      setSelectedIds(newSet);
    }
  };

  const toggleVideo = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const bitrateMbps = selectedQuality.includes('audio') ? 0.32
    : selectedQuality === '4K' ? 15
    : selectedQuality === '1080p' ? 5
    : selectedQuality === '720p' ? 2.5
    : 1.2;
  const totalEstimatedMB = channel.videos
    .filter(video => selectedIds.has(video.id))
    .reduce((total, video) => total + ((video.duration || 0) * bitrateMbps) / 8, 0);
  const totalEstimatedGB = (totalEstimatedMB / 1024).toFixed(2);

  // EXACT SELECTION DOWNLOAD: Only downloads videos that the user currently has selected!
  const handleDownloadSelectedOnly = () => {
    const selectedVideos = channel.videos.filter(v => selectedIds.has(v.id));
    if (selectedVideos.length === 0) {
      alert('Please select at least 1 video using the checkboxes to download.');
      return;
    }
    try {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    onDownloadSelected(selectedVideos, selectedQuality);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Channel Header Banner Card */}
      <div className="relative rounded-3xl overflow-hidden glass-card border border-slate-700/60 shadow-2xl mb-8">
        <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-slate-900">
          <MediaImage
            src={channel.banner}
            alt={channel.title}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/40 to-transparent" />
        </div>

        <div className="relative px-6 sm:px-8 pb-8 pt-0 -mt-16 sm:-mt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start sm:items-end space-x-5">
            <MediaImage
              src={channel.avatar}
              alt={channel.title}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-dark-card shadow-2xl object-cover bg-slate-800"
            />
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {channel.title}
                </h2>
                <CheckCircle className="w-5 h-5 text-brand-400 fill-brand-400/20" />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="font-mono text-brand-300 font-semibold">{channel.handle}</span>
                <span>•</span>
                <span>{(channel.subscriberCount || 'Verified').replace(/\s*subscribers/i, '')} Subscribers</span>
                <span>•</span>
                <span className="text-slate-200 font-medium">
                  {channel.videoCount ? `${channel.videoCount} Videos` : `${channel.videos.length} Videos`}
                  {channel.videoCount && channel.videos.length < channel.videoCount && (
                    <span className="text-xs text-brand-400 font-normal ml-1.5 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                      Showing {channel.videos.length} Top Releases
                    </span>
                  )}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl line-clamp-2 pt-1">
                {channel.description}
              </p>
            </div>
          </div>

          {/* DYNAMIC DOWNLOAD BUTTON - DOWNLOADS EXACTLY WHAT IS SELECTED */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative flex items-center bg-dark-bg/90 border border-slate-700 rounded-xl px-3 py-2">
              <span className="text-xs text-slate-400 mr-2 font-medium">Quality:</span>
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="bg-transparent text-sm font-semibold text-brand-300 focus:outline-none cursor-pointer pr-4"
              >
                <option value="1080p" className="bg-dark-card text-white">1080p Full HD (with Sound)</option>
                <option value="720p" className="bg-dark-card text-white">720p HD (with Sound)</option>
                <option value="4K" className="bg-dark-card text-white">4K Ultra HD (with Sound)</option>
                <option value="480p" className="bg-dark-card text-white">480p SD</option>
                <option value="audio-mp3-320" className="bg-dark-card text-white">MP3 Audio Only (320kbps)</option>
              </select>
            </div>

            <button
              onClick={handleDownloadSelectedOnly}
              disabled={selectedIds.size === 0}
              className="relative group flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 via-cyan-400 to-indigo-500 text-dark-bg font-extrabold text-base shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              title={`Download only the ${selectedIds.size} selected videos`}
            >
              <Zap className="w-5 h-5 text-dark-bg fill-dark-bg animate-pulse" />
              <span>
                {selectedIds.size === channel.videos.length
                  ? `Download All (${channel.videos.length} Videos)`
                  : selectedIds.size > 0
                  ? `Download Selected (${selectedIds.size} Videos)`
                  : 'Select Videos to Download'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-dark-card border border-slate-800 shadow-lg mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-brand-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
          </button>

          <div className="h-6 w-px bg-slate-700 hidden sm:block" />

          <div className="text-xs text-slate-300">
            <span className="font-bold text-brand-400">{selectedIds.size}</span> of {channel.videos.length} selected
            <span className="text-slate-500 mx-2">•</span>
            <span className="text-slate-400">Estimated size: </span>
            <span className="font-mono font-semibold text-slate-200">
              {Number(totalEstimatedGB) > 1 ? `${totalEstimatedGB} GB` : `${totalEstimatedMB} MB`}
            </span>
          </div>

          {selectedIds.size > 0 && (
            <button
              onClick={handleDownloadSelectedOnly}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold hover:bg-indigo-500/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Selected ({selectedIds.size})</span>
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in channel..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setDurationFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                durationFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDurationFilter('short')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                durationFilter === 'short' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              &lt; 5m
            </button>
            <button
              onClick={() => setDurationFilter('medium')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                durationFilter === 'medium' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              5-15m
            </button>
            <button
              onClick={() => setDurationFilter('long')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                durationFilter === 'long' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              &gt; 15m
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="default">Sort: Default</option>
            <option value="duration">Sort: Longest</option>
            <option value="title">Sort: Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredVideos.slice(0, visibleCount).map((video) => {
          const isSelected = selectedIds.has(video.id);

          return (
            <div
              key={video.id}
              className={`group relative rounded-2xl overflow-hidden glass-card border transition-all duration-200 hover:-translate-y-1 ${
                isSelected
                  ? 'border-brand-500/60 shadow-lg shadow-brand-500/10 bg-slate-900/90'
                  : 'border-slate-800/80 hover:border-slate-700 bg-dark-card/80 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Thumbnail Container */}
              <div 
                className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer"
                onClick={() => toggleVideo(video.id)}
              >
                <MediaImage
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-2.5 left-2.5 z-10">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    isSelected ? 'bg-brand-500 text-dark-bg shadow-md' : 'bg-black/60 text-transparent border border-white/40'
                  }`}>
                    {isSelected && <CheckSquare className="w-4 h-4 fill-current stroke-current" />}
                  </div>
                </div>

                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-mono font-bold text-white">
                  {video.durationFormatted}
                </div>

                {/* Hover Play Icon Overlay */}
                <div 
                  onClick={(e) => { e.stopPropagation(); onPlayOnline(video); }}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="Play Online"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-500/90 text-dark-bg flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 
                    onClick={() => toggleVideo(video.id)}
                    className="text-sm font-semibold text-slate-100 line-clamp-2 mb-2 group-hover:text-brand-300 transition-colors cursor-pointer"
                    title={video.title}
                  >
                    {video.title}
                  </h3>

                  <div className="flex items-center space-x-3 text-xs text-slate-400 mb-4">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>{video.viewCount}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{video.uploadDate}</span>
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons with PLAY ONLINE and INDIVIDUAL DOWNLOAD */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onPlayOnline(video)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-brand-500/15 hover:bg-brand-500 text-brand-300 hover:text-dark-bg font-bold text-xs transition-colors"
                    title="Play Online Now"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play</span>
                  </button>

                  <button
                    onClick={() => toggleVideo(video.id)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        : 'bg-slate-800/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>

                  <button
                    onClick={() => onDownloadSingle(video, selectedQuality)}
                    className="p-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-dark-bg transition-colors"
                    title={`Download only this video with sound (${selectedQuality})`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {filteredVideos.length > visibleCount && (
        <div className="flex flex-col items-center gap-2 mt-8">
          <p className="text-xs text-slate-400">
            Showing {Math.min(visibleCount, filteredVideos.length)} of {filteredVideos.length} videos
          </p>
          <button
            onClick={() => setVisibleCount(count => Math.min(count + 60, filteredVideos.length))}
            className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Load more videos
          </button>
        </div>
      )}
    </div>
  );
};
