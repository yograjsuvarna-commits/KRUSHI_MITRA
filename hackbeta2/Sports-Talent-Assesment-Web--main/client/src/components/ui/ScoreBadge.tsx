import React from 'react';

interface ScoreBadgeProps {
  score: number;
  tier?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  tier,
  size = 'md',
  showLabel = true,
}) => {
  const getColors = (s: number) => {
    if (s >= 88) return { text: 'text-[#e2f939]', ring: 'border-[#e2f939]', bg: 'bg-[#e2f939]/10', label: 'Elite Potential' };
    if (s >= 80) return { text: 'text-white', ring: 'border-white/80', bg: 'bg-white/10', label: 'High Potential' };
    if (s >= 72) return { text: 'text-sky-400', ring: 'border-sky-400', bg: 'bg-sky-500/10', label: 'Advanced' };
    if (s >= 60) return { text: 'text-amber-400', ring: 'border-amber-400', bg: 'bg-amber-500/10', label: 'Developing' };
    return { text: 'text-slate-400', ring: 'border-slate-500', bg: 'bg-slate-500/10', label: 'Emerging' };
  };

  const colors = getColors(score);
  const displayTier = tier || colors.label;

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm border-2',
    md: 'w-14 h-14 text-lg border-2',
    lg: 'w-20 h-20 text-2xl border-2',
    xl: 'w-28 h-28 text-4xl border-3',
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`rounded-full flex items-center justify-center font-black font-mono ${colors.text} ${colors.ring} ${colors.bg} ${sizeClasses[size]}`}
      >
        {Math.round(score)}
      </div>
      {showLabel && (
        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} border-current/30`}>
          {displayTier}
        </span>
      )}
    </div>
  );
};
