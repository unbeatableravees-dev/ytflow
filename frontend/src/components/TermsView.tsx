import React from 'react';
import { ShieldCheck, Scale, FileText, Lock } from 'lucide-react';

export const TermsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase">
          <Scale className="w-3.5 h-3.5" />
          <span>Legal Framework & Ethics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Terms of Service & Privacy Policy</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Our commitment to personal archiving rights, fair use, zero data surveillance, and ethical software.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Section 1 */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-brand-400 font-bold text-base">
            <FileText className="w-5 h-5" />
            <span>1. Personal & Non-Commercial Archival Purpose</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            YTFlow is developed strictly as a personal media archiving tool designed to facilitate offline playback, research, education, and digital preservation. Users are responsible for ensuring that their use of downloaded materials complies with applicable copyright laws, creative commons licenses, and fair use doctrines in their respective jurisdictions.
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-base">
            <Lock className="w-5 h-5" />
            <span>2. Strict Zero-Data Collection & Privacy Guarantee</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            YTFlow operates under a strict Zero-Telemetry Architecture. We do not store your IP address, track the URLs you inspect, record your download history on remote servers, or deploy marketing cookies. All processing state and download archives remain solely within your local device’s browser storage.
          </p>
        </div>

        {/* Section 3 */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-base">
            <ShieldCheck className="w-5 h-5" />
            <span>3. Zero Commercial Monetization / No Third-Party Ads</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            YTFlow does not host advertisements, banner networks, sponsored redirects, or bundled bloatware. The project is created and maintained by developer Ravees Altaf as a high-performance open media utility for the global creative community.
          </p>
        </div>

        {/* Section 4 */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-base">
            <Scale className="w-5 h-5" />
            <span>4. Disclaimer of Third-Party Platform Affiliation</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            YouTube, Instagram, TikTok, Facebook, Snapchat, Telegram, and TeraBox are registered trademarks of their respective copyright holders. YTFlow is an independent open-source tool and is not officially affiliated with, endorsed by, or sponsored by any of these entities.
          </p>
        </div>

      </div>

      <div className="text-center text-xs text-slate-500 pt-4">
        Last updated: October 2026 • Maintained by Ravees Altaf (@bismil.writzz)
      </div>

    </div>
  );
};
