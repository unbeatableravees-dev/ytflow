import React from 'react';
import { Settings, X, Sliders, ShieldCheck, Moon, Sun, HardDrive, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  concurrency: number;
  onConcurrencyChange: (val: number) => void;
  defaultQuality: string;
  onDefaultQualityChange: (val: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  concurrency,
  onConcurrencyChange,
  defaultQuality,
  onDefaultQualityChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-dark-card border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">YTFlow Settings</h3>
              <p className="text-xs text-slate-400">Preferences & queue concurrency limits</p>
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
        <div className="p-6 space-y-6">
          {/* Concurrency Setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200">Videos Downloaded at Once</label>
              <span className="text-xs font-mono font-bold text-brand-400 px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                {concurrency} videos
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Controls how many videos download simultaneously during bulk channel jobs (6–20).
            </p>
            <input
              type="range"
              min="6"
              max="20"
              step="1"
              value={concurrency}
              onChange={(e) => onConcurrencyChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>6 (Minimum)</span>
              <span>18</span>
              <span>20 (Maximum)</span>
            </div>
          </div>

          {/* Default Quality Preset */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Default Download Quality</label>
            <p className="text-xs text-slate-400">Applied automatically when starting bulk channel processing.</p>
            <select
              value={defaultQuality}
              onChange={(e) => onDefaultQualityChange(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="1080p">1080p Full HD (Recommended)</option>
              <option value="720p">720p HD</option>
              <option value="4K">4K Ultra HD</option>
              <option value="480p">480p SD</option>
              <option value="audio-mp3-320">MP3 Audio Only (320kbps High Quality)</option>
            </select>
          </div>

          {/* Zero Ads Trust Guarantee */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-emerald-300">Zero Ads Guarantee Active</div>
              <div className="text-slate-300">
                YTFlow contains zero banner ads, zero pop-ups, zero redirect links, and zero third-party telemetry.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-500 text-dark-bg font-bold text-xs hover:bg-brand-400 transition-colors shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
