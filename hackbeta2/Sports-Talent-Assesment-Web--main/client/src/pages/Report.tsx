import React, { useEffect, useState } from 'react';
import {
  Award,
  Zap,
  Activity,
  CheckCircle2,
  Printer,
  Sparkles,
  Cpu,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { ScoreBadge } from '../components/ui/ScoreBadge';
import { TalentRadarChart } from '../components/charts/TalentRadarChart';
import { useStore } from '../store/useStore';
import api from '../api/client';
import { TalentReportResponse } from '../types';

interface ReportProps {
  onBack?: () => void;
  onCompare?: () => void;
  initialPlayerId?: string | null;
}

export const Report: React.FC<ReportProps> = ({ onBack, onCompare, initialPlayerId }) => {
  const { user, currentProfile } = useStore();
  const playerId = initialPlayerId || user?.playerId || currentProfile?.id || 'p_rahul';

  const [reportData, setReportData] = useState<TalentReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const res = await api.get(`/reports/${playerId}`);
        setReportData(res.data);
      } catch (err) {
        console.error('Report error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [playerId]);

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#e2f939] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Generating Talent Assessment Report...</p>
        </div>
      </div>
    );
  }

  const p = reportData.player;
  const ts = reportData.talentScore;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      {/* Report Action Header */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0b1b33] hover:bg-[#102444] text-slate-300 border border-white/10 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          {onCompare && (
            <button
              onClick={onCompare}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white/5 text-slate-200 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-4 h-4 text-[#e2f939]" />
              Compare
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#e2f939] text-[#061220] hover:bg-[#d4ed2e] flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Main Athlete Report Sheet */}
      <GlassCard className="p-8 sm:p-10 space-y-8 bg-[#0b1b33] border-white/15 print:border-none print:shadow-none">
        {/* Report Top Branding & Athlete Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#e2f939] flex items-center justify-center text-[#061220] font-black text-xs">
                ★
              </div>
              <span className="font-mono font-black tracking-widest text-xs uppercase text-[#e2f939]">
                STARQ ATHLETE ASSESSMENT REPORT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">{p.full_name}</h1>
            <p className="text-xs text-slate-400">
              Age {p.age} • {p.gender} • {p.primary_role.toUpperCase().replace('_', ' ')} • {p.batting_style?.replace(/_/g, ' ')} • {p.bowling_style?.replace(/_/g, ' ')}
            </p>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
              Evaluation Date: {new Date(reportData.generatedAt).toLocaleDateString()}
            </div>
            <div className="text-xs text-slate-300 font-bold mt-0.5">
              {p.academy_club || 'State Cricket Academy'}
            </div>
            <div className="text-[10px] text-[#e2f939] font-mono font-bold uppercase">
              {p.competition_level.toUpperCase().replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* Overall Potential Hero Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#061220] p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-center">
            <ScoreBadge score={ts.overall_talent_potential} size="xl" />
          </div>

          <div className="space-y-1 text-center md:text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overall Potential Tier
            </div>
            <div className="text-2xl font-black uppercase text-white">
              {ts.talent_tier}
            </div>
            <div className="text-xs text-[#e2f939] flex items-center justify-center md:justify-start gap-1 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Confidence: {ts.prediction_confidence}%
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 space-y-1 text-center md:text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-[#e2f939]">
              Calculated Archetype
            </div>
            <div className="text-lg font-black uppercase text-white">
              {ts.primary_archetype}
            </div>
            <div className="text-xs text-slate-400">
              Similarity Match: <strong className="text-[#e2f939] font-mono">{ts.archetype_similarity_pct}%</strong>
            </div>
          </div>
        </div>

        {/* 5 Core Pillars Grid */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
            Multi-Modal Dimension Scores
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {[
              { label: 'Match Performance', val: ts.current_performance_score, color: 'text-white' },
              { label: 'Athletic Potential', val: ts.athletic_potential_score, color: 'text-[#e2f939]' },
              { label: 'Technical Biomechanics', val: ts.technical_skill_score, color: 'text-sky-400' },
              { label: 'Consistency Rating', val: ts.consistency_score, color: 'text-amber-400' },
              { label: 'Development Trajectory', val: ts.development_trajectory_score, color: 'text-purple-400' },
            ].map((d, i) => (
              <div key={i} className="bg-[#061220] p-3 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 mb-1 uppercase font-bold">{d.label}</div>
                <div className={`text-2xl font-black font-mono ${d.color}`}>{d.val}</div>
                <div className="text-[10px] text-slate-500 font-mono">/ 100</div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart & Explainable AI Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#e2f939]" />
              Talent Assessment Radar
            </h3>
            <TalentRadarChart
              data={reportData.radarDimensions}
              playerName={p.full_name}
              height={260}
            />
          </div>

          <div className="space-y-4">
            {/* Why this player ranked highly */}
            <div className="bg-[#061220] p-4 rounded-xl border border-white/10 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#e2f939] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Why this athlete ranked highly (Explainable AI)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {ts.explainability_factors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#e2f939] shrink-0 mt-0.5" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Strengths */}
            <div className="bg-[#061220] p-4 rounded-xl border border-white/10 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e2f939]" />
                Key Identified Strengths
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {ts.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#e2f939] font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Development Areas & AI Recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              Primary Development Areas
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {ts.development_areas.map((dev, i) => (
                <li key={i} className="flex items-start gap-2 bg-[#061220] p-2.5 rounded-lg border border-white/10">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{dev}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#e2f939] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              AI Coaching Recommendations & Drills
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {ts.ai_recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 bg-[#061220] p-2.5 rounded-lg border border-white/10">
                  <Zap className="w-3.5 h-3.5 text-[#e2f939] shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="pt-6 border-t border-white/10 text-[10px] text-slate-500 flex items-center justify-between">
          <span>StarQ AI Talent Assessment Platform • Decision Support & Development Analytics</span>
          <span className="font-mono">Confidence Level: {ts.prediction_confidence}% • Based on {ts.sample_size_matches || 28} matches + CV Telemetry</span>
        </div>
      </GlassCard>
    </div>
  );
};
