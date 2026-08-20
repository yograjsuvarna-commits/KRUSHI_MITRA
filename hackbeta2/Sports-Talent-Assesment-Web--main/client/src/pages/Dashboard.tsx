import React, { useEffect, useState } from 'react';
import {
  Zap,
  Activity,
  Award,
  TrendingUp,
  Video,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { ScoreBadge } from '../components/ui/ScoreBadge';
import { TalentRadarChart } from '../components/charts/TalentRadarChart';
import { TrajectoryChart } from '../components/charts/TrajectoryChart';
import { useStore } from '../store/useStore';
import api from '../api/client';
import { TalentReportResponse } from '../types';

interface DashboardProps {
  onStartCVLab: () => void;
  onStartAssessmentWizard: () => void;
  onViewReport: () => void;
  onViewStats: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartCVLab,
  onStartAssessmentWizard,
  onViewReport,
  onViewStats
}) => {
  const { user, currentProfile } = useStore();
  const [reportData, setReportData] = useState<TalentReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const playerId = user?.playerId || currentProfile?.id || 'p_rahul';

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const res = await api.get(`/reports/${playerId}`);
        setReportData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [playerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#e2f939] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading athlete profile & AI models...</p>
        </div>
      </div>
    );
  }

  const p = reportData?.player || currentProfile;
  const ts = reportData?.talentScore;
  const latestCv = reportData?.cvAssessments?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Welcome, {p?.full_name?.split(' ')[0] || user?.full_name || 'Athlete'} 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#e2f939]/15 text-[#e2f939] border border-[#e2f939]/30">
              {p?.primary_role?.replace('_', ' ') || 'Batter'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {p?.academy_club || 'Karnataka State Cricket Academy'} • {p?.location || 'India'} • Age {p?.age || 17} • {p?.competition_level?.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onStartCVLab}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#e2f939] text-[#061220] hover:bg-[#d4ed2e] shadow-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <Video className="w-4 h-4" />
            Live CV Biomechanics
          </button>
          <button
            onClick={onViewReport}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0b1b33] text-white hover:bg-[#102444] border border-white/15 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Award className="w-4 h-4 text-[#e2f939]" />
            Talent Report
          </button>
        </div>
      </div>

      {/* Hero Score Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Potential Hero Card */}
        <GlassCard className="p-6 flex flex-col justify-between relative bg-[#0b1b33] border-white/15">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#e2f939] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Talent Potential Score
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/10">
              Model {ts?.model_version || 'v1.4'}
            </span>
          </div>

          <div className="my-6 flex items-center justify-center gap-6">
            <ScoreBadge score={ts?.overall_talent_potential || 88} size="xl" showLabel={false} />
            <div className="space-y-1 text-left">
              <div className="text-xs text-slate-400 uppercase font-bold">Tier Classification</div>
              <div className="text-2xl font-black uppercase text-white">
                {ts?.talent_tier || 'High Potential'}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#e2f939] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Confidence: {ts?.prediction_confidence || 88}%
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Archetype: </span>
              <span className="font-extrabold text-white">{ts?.primary_archetype || 'Aggressive Top-Order Batter'}</span>
            </div>
            <span className="text-[10px] text-[#e2f939] font-mono font-bold">
              {ts?.archetype_similarity_pct || 88}% Match
            </span>
          </div>
        </GlassCard>

        {/* 5 Core Pillar Score Breakdown */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Match Performance', score: ts?.current_performance_score || 78, desc: 'Phase scoring & context normalized', color: 'text-white' },
            { label: 'Athletic Potential', score: ts?.athletic_potential_score || 91, desc: 'Speed, jump power & reaction', color: 'text-[#e2f939]' },
            { label: 'Technical Biomechanics', score: ts?.technical_skill_score || 85, desc: 'Computer vision posture & torque', color: 'text-sky-400' },
            { label: 'Consistency Rating', score: ts?.consistency_score || 82, desc: 'Dot-ball % & pressure stability', color: 'text-amber-400' },
            { label: 'Development Trajectory', score: ts?.development_trajectory_score || 94, desc: 'Growth delta & age headroom', color: 'text-purple-400' },
            { label: 'Scouting Demand', score: 86, desc: 'Match with talent criteria', color: 'text-[#e2f939]' },
          ].map((item, idx) => (
            <GlassCard key={idx} className="p-4 flex flex-col justify-between bg-[#0b1b33] border-white/10 hover:border-white/20 transition-all">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-300 leading-tight uppercase">{item.label}</span>
                  <span className={`text-lg font-black font-mono ${item.color}`}>{item.score}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">{item.desc}</p>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mt-3 border border-white/5">
                <div
                  className="h-full bg-[#e2f939] rounded-full"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Dual Visuals (Radar + Trajectory) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6-Dimension Radar Chart */}
        <GlassCard className="p-6 bg-[#0b1b33] border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#e2f939]" />
                6-Dimension Talent Radar
              </h3>
              <p className="text-xs text-slate-400">Benchmarked against peer group standards</p>
            </div>
          </div>
          <TalentRadarChart
            data={reportData?.radarDimensions || []}
            playerName={p?.full_name || 'Rahul'}
            height={280}
          />
        </GlassCard>

        {/* Historical Progress Trajectory */}
        <GlassCard className="p-6 bg-[#0b1b33] border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#e2f939]" />
                Development Trajectory Curve
              </h3>
              <p className="text-xs text-slate-400">Progress across evaluation cycles (T1 Baseline → Current)</p>
            </div>
            <span className="text-[10px] font-bold text-[#061220] bg-[#e2f939] px-2 py-0.5 rounded font-mono">
              Steep Growth ↑
            </span>
          </div>
          <TrajectoryChart
            history={reportData?.progressHistory || []}
            height={280}
          />
        </GlassCard>
      </div>

      {/* Latest CV Assessment + Actionable Drills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest CV Test Details */}
        <GlassCard className="p-6 lg:col-span-2 bg-[#0b1b33] border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#e2f939]">
                Latest Computer Vision Test
              </span>
              <h3 className="text-base font-extrabold uppercase text-white">
                {latestCv?.assessment_name === 'batting_mechanics' ? '🏏 Batting Mechanics & Stance Analysis' : '⚡ Fast Bowling Kinetic Chain'}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-black text-[#e2f939]">
                Score: {latestCv?.posture_stability_score || 88}/100
              </span>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                <Calendar className="w-3 h-3" />
                {latestCv ? new Date(latestCv.created_at).toLocaleDateString() : 'Recent'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
            <div className="bg-[#061220] p-2.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Stance Stability</div>
              <div className="font-mono font-bold text-white text-base">{latestCv?.posture_stability_score || 91}/100</div>
            </div>
            <div className="bg-[#061220] p-2.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Head Stability</div>
              <div className="font-mono font-bold text-white text-base">{latestCv?.head_stability_score || 94}/100</div>
            </div>
            <div className="bg-[#061220] p-2.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Hip-Shoulder Sep</div>
              <div className="font-mono font-bold text-[#e2f939] text-base">{latestCv?.hip_shoulder_separation_deg || 31}°</div>
            </div>
            <div className="bg-[#061220] p-2.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Movement Eff.</div>
              <div className="font-mono font-bold text-white text-base">{latestCv?.movement_efficiency_score || 88}/100</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Biomechanical AI Observations:
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e2f939] shrink-0 mt-0.5" />
                <span>Head position stays still over the ball during downswing initiation.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e2f939] shrink-0 mt-0.5" />
                <span>Base stance width provides optimal center of gravity without overstriding.</span>
              </li>
            </ul>
          </div>
        </GlassCard>

        {/* Recommended Next Test CTA */}
        <GlassCard className="p-6 flex flex-col justify-between bg-[#0b1b33] border-white/15">
          <div>
            <div className="flex items-center gap-2 text-[#e2f939] text-xs font-extrabold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4 fill-current" />
              Recommended Test
            </div>
            <h4 className="text-base font-extrabold uppercase text-white mb-1">
              Optical Ball Speed & Release Tracking
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Test your release velocity and optical displacement trajectory using camera tracking.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={onStartCVLab}
              className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-[#e2f939] text-[#061220] hover:bg-[#d4ed2e] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Video className="w-4 h-4" />
              Start Camera Test
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
