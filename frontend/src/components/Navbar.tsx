import React from 'react';
import { Play, Sparkles, ShieldCheck, Download, History, Settings, Layers, Film, HelpCircle, FileText, Info } from 'lucide-react';

export type NavTabType = 'channel' | 'single' | 'queue' | 'history' | 'about' | 'faq' | 'terms';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  queueCount: number;
  activeCount: number;
  openSettings: () => void;
  openZeroAdsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  queueCount,
  activeCount,
  openSettings,
  openZeroAdsModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-dark-bg/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('channel')}
          className="flex items-center space-x-2.5 cursor-pointer group flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 via-brand-400 to-indigo-500 p-0.5 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all duration-300">
            <div className="w-full h-full bg-dark-bg rounded-[10px] flex items-center justify-center">
              <Play className="w-4 h-4 text-brand-400 fill-brand-400 transform translate-x-0.5 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
                YTFlow
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                PRO
              </span>
            </div>
            <p className="text-[9px] text-slate-400 tracking-wider uppercase font-semibold hidden sm:block">
              Fast • Clean • Zero Ads
            </p>
          </div>
        </div>

        {/* Navigation Tabs with Distinct Identities */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('channel')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'channel'
                ? 'bg-gradient-to-r from-brand-500/20 to-cyan-500/20 text-brand-300 border border-brand-500/40 shadow-sm shadow-brand-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4 text-brand-400" />
            <span>Channel Bulk</span>
            <span className="hidden md:inline-flex text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Flagship
            </span>
          </button>

          <button
            onClick={() => setActiveTab('single')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'single'
                ? 'bg-gradient-to-r from-brand-500/20 to-cyan-500/20 text-brand-300 border border-brand-500/40 shadow-sm shadow-brand-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Film className="w-4 h-4 text-cyan-400" />
            <span>Single Video</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'queue'
                ? 'bg-gradient-to-r from-brand-500/20 to-cyan-500/20 text-brand-300 border border-brand-500/40 shadow-sm shadow-brand-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Download className={`w-4 h-4 ${activeCount > 0 ? 'text-brand-400 animate-bounce' : 'text-slate-400'}`} />
            <span>Queue</span>
            {queueCount > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold rounded-full bg-brand-500 text-dark-bg font-mono shadow">
                {queueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-brand-500/20 to-cyan-500/20 text-brand-300 border border-brand-500/40 shadow-sm shadow-brand-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Local Archive Vault"
          >
            <History className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Archive Vault</span>
          </button>

          {/* About Tab */}
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'about'
                ? 'bg-gradient-to-r from-brand-500/20 to-cyan-500/20 text-brand-300 border border-brand-500/40 shadow-sm shadow-brand-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="About YTFlow Pro Architecture & Story"
          >
            <Info className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">About</span>
          </button>

          {/* FAQ Tab */}
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'faq'
                ? 'bg-gradient-to-r from-brand-500/20 to-cyan-500/20 text-brand-300 border border-brand-500/40 shadow-sm shadow-brand-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="FAQ & Knowledge Base"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">FAQ</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Zero Ads Badge Pill */}
          <button
            onClick={openZeroAdsModal}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            title="100% Ad-Free Experience Guaranteed"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">0 Ads</span>
          </button>

          {/* Settings */}
          <button
            onClick={openSettings}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
