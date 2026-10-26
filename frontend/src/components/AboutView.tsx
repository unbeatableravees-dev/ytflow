import React from 'react';
import { 
  ShieldCheck, Zap, HardDrive, Cpu, Terminal, 
  Code2, ExternalLink, Sparkles, CheckCircle2, Lock, Flame
} from 'lucide-react';

interface AboutViewProps {
  onExploreChannels: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onExploreChannels }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Corporate Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-card border border-slate-700/80 p-8 sm:p-12 shadow-2xl bg-gradient-to-br from-slate-900/90 via-dark-card to-dark-bg">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Architecture & Engineering Manifesto</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            The Story Behind{' '}
            <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent animate-text-shimmer">
              YTFlow Pro
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            YTFlow was engineered to solve a pervasive problem on the modern internet: the erosion of digital media access by predatory ad networks, malware-infested download buttons, throttled speeds, and corrupted audio tracks. Built for creators, researchers, and audio purists who demand full digital sovereignty and pristine local archives.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onExploreChannels}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-500 via-cyan-400 to-indigo-500 text-dark-bg font-extrabold text-sm shadow-xl shadow-brand-500/25 hover:opacity-95 transition-all"
            >
              Start Archiving Now
            </button>
            <a
              href="https://github.com/unbeatableravees"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-colors"
            >
              <Terminal className="w-4 h-4 text-brand-400" />
              <span>Explore GitHub Repository</span>
            </a>
          </div>
        </div>
      </div>

      {/* The Core Problem & The Motivation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl glass-card border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">The Web's Broken Downloader Ecosystem</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            For years, downloading a simple video or studio audio track meant wading through deceptive popups, aggressive redirect loops, crypto miners, and fake "Start Download" buttons. Worse yet, downloaded files frequently ended up with truncated durations, out-of-sync audio, or compressed 64kbps bitrates.
          </p>
        </div>

        <div className="p-8 rounded-3xl glass-card border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">The YTFlow Zero-Ad Guarantee</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            YTFlow represents an uncompromising philosophy: <strong className="text-white">Absolute Zero Ads</strong>. No tracking scripts, no third-party telemetry, no ad networks, and no redirects. Every byte processed is delivered directly to your device with crystal-clear high fidelity and mathematically exact durations.
          </p>
        </div>
      </div>

      {/* Technical Innovations */}
      <div className="rounded-3xl glass-card border border-slate-800 p-8 sm:p-10 space-y-6">
        <div className="flex items-center space-x-3">
          <Cpu className="w-6 h-6 text-brand-400" />
          <h2 className="text-2xl font-bold text-white">Engineering Architecture</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">Exact Duration Engine</div>
            <h3 className="text-base font-bold text-white">44.1 kHz Studio PCM</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Eliminates the common bug where media players display 47 seconds or 3 hours. Calculates exact sample size matching YouTube's metadata to the second.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Multi-Threaded Queue</div>
            <h3 className="text-base font-bold text-white">Parallel Concurrency</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download entire artist channels with 1 click. Features live throttle controls (1-10 threads), instant pause/resume, and zero browser memory saturation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">Local Archive Engine</div>
            <h3 className="text-base font-bold text-white">Batch ZIP Packaging</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Employs zero-compression STORE packaging for instant ZIP compilation, allowing users to back up 20+ songs directly to disk in milliseconds.
            </p>
          </div>
        </div>
      </div>

      {/* Developer Profile - Ravees Altaf */}
      <div className="rounded-3xl glass-card border border-slate-700/80 p-8 sm:p-10 space-y-6 bg-gradient-to-br from-slate-900 via-dark-card to-slate-950">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-brand-400 uppercase tracking-wider">
              <Code2 className="w-4 h-4" />
              <span>Architect & Lead Developer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Ravees Altaf</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Founder & Software Engineer • Creator of Roohani Alfaz & YTFlow Pro
            </p>
          </div>

          {/* Social Profiles */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://instagram.com/bismil.writzz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 text-pink-400 border border-pink-500/20 font-semibold text-xs transition-all shadow"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Instagram @bismil.writzz</span>
            </a>

            <a
              href="https://github.com/unbeatableravees"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition-all shadow"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>@unbeatableravees</span>
            </a>

            <a
              href="https://github.com/unbeatableravees-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition-all shadow"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>@unbeatableravees-dev</span>
            </a>

            <a
              href="https://github.com/unbeatableravees-dev/ytflow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/20 font-mono text-xs transition-all shadow"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>YTFlow on GitHub</span>
            </a>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          "YTFlow was born out of personal passion for music, Kashmiri poetry, and high-performance engineering. When archiving music releases and creative works, artists deserve tools that respect their media and their listeners' time. YTFlow is maintained as an open, free, and privacy-respecting gift to the global creative community."
        </p>
      </div>

    </div>
  );
};
