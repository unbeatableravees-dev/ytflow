import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Zap, Download, Layers } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'Privacy & Security',
    question: 'Why is YTFlow guaranteed 100% Zero Ads?',
    answer: 'Unlike commercial video downloaders that monetize via predatory banner ads, intrusive redirects, and deceptive download prompts, YTFlow was developed as a clean, corporate-grade utility by Ravees Altaf. It has zero ad scripts, zero tracking cookies, and zero commercial bloatware.'
  },
  {
    category: 'Channel Bulk Archiving',
    question: 'How does 1-Click Channel Bulk Archiving work?',
    answer: 'Paste any channel handle (such as @roohani_alfaz_org or @aafaqsingerofficial5683) or URL. YTFlow automatically scans the channel videos, formats, and high-resolution thumbnails. You can filter by duration, sort by title/length, select individual tracks or all tracks, and queue them for instant parallel processing.'
  },
  {
    category: 'Audio & Video Quality',
    question: 'Why do downloaded files match the exact YouTube duration without bugs?',
    answer: 'Traditional download scripts pad arbitrary null bytes, causing Windows Media Player and VLC to report distorted timelines (such as 47 seconds or 3 hours for a 5-minute song). YTFlow uses standard 44.1 kHz stereo PCM byte-rate mathematics (176.4 KB/s) that aligns byte size with playback time to the exact millisecond.'
  },
  {
    category: 'Formats',
    question: 'Can I download full MP4 Video and standalone MP3 Studio Audio?',
    answer: 'Yes! YTFlow gives you complete control. In the Channel Dashboard, Single Video view, or Player Modal, you can choose between 1080p Full HD MP4 (with audio merged), 720p HD, 4K Ultra HD, or MP3 Audio Only (320kbps Studio Master).'
  },
  {
    category: 'Multi-Platform',
    question: 'Which social platforms are supported by YTFlow?',
    answer: 'YTFlow supports YouTube (Videos, Shorts, Channels), Instagram (Reels & Posts), TikTok (No Watermark), Facebook (Reels & Videos), Snapchat (Spotlights), Telegram media, and TeraBox cloud links.'
  },
  {
    category: 'Performance',
    question: 'How does the Queue Concurrency control work?',
    answer: 'In the Queue Manager tab, you can adjust the live worker concurrency from 1 to 10 threads. This allows you to match your device’s network bandwidth and CPU power. You can also Pause, Resume, Retry failed jobs, or delete individual jobs with a single click.'
  },
  {
    category: 'Batch Export',
    question: 'How does "Download Batch as ZIP" work?',
    answer: 'When you queue multiple videos or an entire channel, clicking "Download Batch as ZIP" bundles all completed files into a single, organized .zip archive directly inside your browser memory using non-blocking STORE compression, preventing browser crashes.'
  },
  {
    category: 'Privacy',
    question: 'Is any of my download history or URLs stored on an external server?',
    answer: 'No. YTFlow operates under strict zero-telemetry principles. All download queues, history, and preferences are stored exclusively on your device’s local browser storage (LocalStorage). Nothing is transmitted to third-party databases.'
  },
  {
    category: 'Offline Archive',
    question: 'How can I build my own personal offline archive with YTFlow?',
    answer: 'You can use the Archive Vault (History tab) to keep track of your downloaded videos. All files are saved locally to your device with original metadata, artist names, and high-fidelity sound, ensuring you can play your collection offline anytime.'
  },
  {
    category: 'Developer',
    question: 'Who developed YTFlow and how can I collaborate or connect?',
    answer: 'YTFlow was designed and developed by Ravees Altaf. You can connect directly via Instagram @bismil.writzz or explore open-source contributions on GitHub @unbeatableravees and @unbeatableravees-dev.'
  }
];

export const FAQView: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider uppercase">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base & Technical FAQ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Frequently Asked Questions</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Everything you need to know about YTFlow Pro, our zero-ad architecture, audio merging engine, and local archiving tools.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3 pt-4">
        {FAQ_DATA.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div 
              key={idx}
              className={`rounded-2xl transition-all duration-200 border overflow-hidden ${
                isOpen 
                  ? 'bg-slate-900/90 border-brand-500/50 shadow-lg shadow-brand-500/5' 
                  : 'bg-dark-card/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-5 flex items-center justify-between text-left space-x-4 focus:outline-none"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-brand-400 uppercase">
                    {item.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {item.question}
                  </h3>
                </div>

                <div className={`p-1.5 rounded-lg bg-slate-800/80 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? 'rotate-180 text-brand-400 bg-brand-500/20' : ''
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 mt-1">
                  <p className="pt-3">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Need Help Footer */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 text-center space-y-2">
        <h3 className="text-sm font-bold text-white">Have a specific feature request or question?</h3>
        <p className="text-xs text-slate-400">
          Reach out to developer Ravees Altaf on Instagram <a href="https://instagram.com/bismil.writzz" target="_blank" rel="noopener noreferrer" className="text-brand-400 underline font-semibold">@bismil.writzz</a>
        </p>
      </div>

    </div>
  );
};
