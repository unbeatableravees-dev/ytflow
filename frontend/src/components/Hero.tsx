import React, { useState } from 'react';
import { Search, Clipboard, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface HeroProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
}

export const Hero: React.FC<HeroProps> = ({ 
  onSearch, 
  isLoading,
}) => {
  const [url, setUrl] = useState('');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        onSearch(text.trim());
      }
    } catch (e) {
      // clipboard access fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    onSearch(url.trim());
  };

  return (
    <section className="relative pt-16 pb-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[320px] bg-gradient-to-tr from-brand-500/10 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Pill Badge */}
      <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 shadow-inner mb-6 backdrop-blur-md">
        <Sparkles className="w-4 h-4 text-brand-400" />
        <span className="text-xs font-semibold text-slate-300">
          Universal Multi-Platform Downloader • Fast • Zero Ads
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
        Your Videos. Your Quality.{' '}
        <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
          Your Control.
        </span>
      </h1>

      {/* Supporting Text */}
      <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 font-normal">
        Paste any video or channel URL. YTFlow automatically inspects the real media and downloads with crystal-clear sound.
      </p>

      {/* Single Smart Input Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-6">
        <div className="relative flex items-center p-2 rounded-2xl bg-dark-card/90 border border-slate-700/80 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30 shadow-2xl transition-all">
          <div className="pl-3 pr-2 text-slate-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube channel or video link here..."
            className="w-full py-3 bg-transparent text-white text-sm sm:text-base placeholder-slate-500 focus:outline-none"
          />

          <div className="flex items-center space-x-2 pr-1">
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 transition-colors"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paste</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-500 via-cyan-400 to-indigo-500 text-dark-bg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25 transition-all transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Download / Inspect</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
