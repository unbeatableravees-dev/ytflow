import React from 'react';
import { ShieldCheck, X, Check, Lock, EyeOff, Zap } from 'lucide-react';

interface ZeroAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZeroAdsModal: React.FC<ZeroAdsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-dark-card border border-emerald-500/30 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-emerald-500/5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">YTFlow Zero-Ads Charter</h3>
              <p className="text-xs text-emerald-400 font-medium">Pure Media • Distraction Free</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-white mb-0.5">Zero Popups or Redirects</div>
              <p className="text-slate-400">You will never encounter deceptive &quot;fake download buttons&quot; or unwanted browser popups.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-white mb-0.5">Zero Ad-Script Injection</div>
              <p className="text-slate-400">No third-party ad networks, tracking beacons, or telemetry scripts slow down your machine.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-white mb-0.5">High Speed Direct Pipeline</div>
              <p className="text-slate-400">Media streams directly via high-performance background queues without intermediate ad gates.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 text-dark-bg font-bold text-xs hover:bg-emerald-400 transition-colors shadow"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
