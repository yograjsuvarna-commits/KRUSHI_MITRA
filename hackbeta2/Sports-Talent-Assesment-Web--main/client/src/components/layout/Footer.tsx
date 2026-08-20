import React from 'react';
import { Zap, Shield, Cpu, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#061220] py-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#e2f939] text-[#061220] flex items-center justify-center font-black">
            ★
          </div>
          <span className="font-extrabold text-white tracking-tight uppercase">STARQ</span>
          <span className="text-slate-500 font-medium">| AI-Assisted Cricket Talent Assessment & Biomechanics Discovery Platform</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400 font-semibold text-[11px]">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#e2f939]" />
            <span>MediaPipe Pose Biomechanics</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-white" />
            <span>Explainable Talent Model v1.4</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Pro Scouting MVP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
