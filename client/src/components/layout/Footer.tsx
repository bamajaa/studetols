import { Heart, PlayCircle, ExternalLink } from 'lucide-react';

export default function Footer() {
  const trailerUrl = "https://drive.google.com/file/d/1GuPWh5FtRr6iYmngoVO8kzC_mHN5U8Ke/view?usp=drive_link";

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-10 pb-10 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <img src="/logo.jpg" alt="STUDETOLS" className="w-9 h-9 rounded-lg shadow-sm object-cover" />
            <span className="font-bold text-lg tracking-wide">STUDETOLS</span>
          </div>
          <p className="text-slate-400 text-sm max-w-md">
            Your personal productivity control center. Platform alat belajar, produktivitas, dan bisnis terintegrasi penuh.
          </p>

          {/* Tombol Tonton Trailer */}
          <div className="mt-5">
            <a
              href={trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/40 border border-indigo-400/20 transition-all hover:scale-105 active:scale-95 group"
            >
              <PlayCircle size={16} className="text-indigo-200 group-hover:text-white transition-colors" />
              <span>Tonton Trailer STUDETOLS</span>
              <ExternalLink size={12} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>&copy; 2026 STUDETOLS. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a 
              href={trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <PlayCircle size={13} />
              <span>Trailer Video</span>
            </a>
            <span>•</span>
            <p>Dibuat oleh <span className="text-slate-300 font-semibold">Ihsan Hafidz Assidiq</span></p>
          </div>
          <p className="flex items-center gap-1">Built with <Heart size={12} className="text-red-400 fill-red-400" /> using React, TypeScript & MySQL</p>
        </div>
      </div>
    </footer>
  );
}
