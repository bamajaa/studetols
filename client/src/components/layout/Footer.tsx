import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-10 pb-10 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-400 text-white flex items-center justify-center font-bold text-sm">ST</div>
            <span className="font-bold text-lg tracking-wide">STUDETOLS</span>
          </div>
          <p className="text-slate-400 text-sm">Your personal productivity control center.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>&copy; 2026 STUDETOLS. All rights reserved.</p>
          <p>Dibuat oleh <span className="text-slate-300 font-semibold">Ihsan Hafidz Assidiq</span></p>
          <p className="flex items-center gap-1">Built with <Heart size={12} className="text-red-400 fill-red-400" /> using React, TypeScript & MySQL</p>
        </div>
      </div>
    </footer>
  );
}
