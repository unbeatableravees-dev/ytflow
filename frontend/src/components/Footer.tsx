import React from 'react';
import { Play, ShieldCheck, Heart, ExternalLink, Code2 } from 'lucide-react';
import { NavTabType } from './Navbar';

interface FooterProps {
  onNavigate?: (tab: NavTabType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-dark-bg/95 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Row: Brand & Developer Showcase */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
          
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 via-cyan-400 to-indigo-500 p-0.5 shadow-lg shadow-brand-500/20">
              <div className="w-full h-full bg-dark-bg rounded-[10px] flex items-center justify-center">
                <Play className="w-4 h-4 text-brand-400 fill-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-white text-base tracking-tight">YTFlow</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Zero Ads
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Universal Multi-Platform Media & 1-Click Channel Downloader
              </p>
            </div>
          </div>

          {/* Developer Credits - Ravees Altaf */}
          <div className="flex flex-wrap items-center gap-3 bg-dark-card/90 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-inner">
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold text-xs pr-1">
              <Code2 className="w-4 h-4 text-brand-400" />
              <span>Developed with ❤️ by</span>
              <span className="text-white font-extrabold bg-gradient-to-r from-brand-400 to-cyan-300 bg-clip-text text-transparent">
                Ravees Altaf
              </span>
            </div>

            <div className="h-4 w-px bg-slate-700 hidden sm:block" />

            {/* Instagram Link */}
            <a
              href="https://instagram.com/bismil.writzz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 text-pink-400 hover:text-pink-300 border border-pink-500/20 transition-all font-medium text-xs group"
            >
              <span>@bismil.writzz</span>
            </a>

            {/* GitHub 1 */}
            <a
              href="https://github.com/unbeatableravees"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all font-mono text-xs"
            >
              <span>@unbeatableravees</span>
            </a>

            {/* GitHub 2 */}
            <a
              href="https://github.com/unbeatableravees-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all font-mono text-xs"
            >
              <span>@unbeatableravees-dev</span>
            </a>
          </div>
        </div>

        {/* Middle Row: Quick Navigation Links */}
        {onNavigate && (
          <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-800/40 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-slate-300">
              <button onClick={() => onNavigate('channel')} className="hover:text-brand-400 transition-colors">Channel Bulk</button>
              <button onClick={() => onNavigate('single')} className="hover:text-brand-400 transition-colors">Single Video</button>
              <button onClick={() => onNavigate('queue')} className="hover:text-brand-400 transition-colors">Queue Manager</button>
              <button onClick={() => onNavigate('history')} className="hover:text-brand-400 transition-colors">Archive Vault</button>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-400">
              <button onClick={() => onNavigate('about')} className="hover:text-brand-400 transition-colors font-medium">About YTFlow</button>
              <button onClick={() => onNavigate('faq')} className="hover:text-brand-400 transition-colors font-medium">FAQ & Help</button>
              <button onClick={() => onNavigate('terms')} className="hover:text-brand-400 transition-colors font-medium">Terms & Privacy</button>
            </div>
          </div>
        )}

        {/* Bottom Row: Supported Platforms & Legal */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="font-semibold text-slate-400">Supported Platforms:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">YouTube</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">Instagram</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">Snapchat</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">Telegram</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">TeraBox</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">TikTok & Twitter/X</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Full Audio & Video Merging Active</span>
            </span>
            <span>•</span>
            <span>© 2026 YTFlow</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
