import React, { useState, useEffect } from 'react';
import {
  Layers,
  Activity,
  ArrowRightLeft
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { ScoreBadge } from '../components/ui/ScoreBadge';
import { TalentRadarChart } from '../components/charts/TalentRadarChart';
import api from '../api/client';

interface CompareProps {
  initialPlayerIds?: string[];
}

export const Compare: React.FC<CompareProps> = ({ initialPlayerIds }) => {
  const [player1Id, setPlayer1Id] = useState(initialPlayerIds?.[0] || 'p_rahul');
  const [player2Id, setPlayer2Id] = useState(initialPlayerIds?.[1] || 'p_vikram');
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    async function loadAllPlayers() {
      try {
        const res = await api.get('/players');
        setAllPlayers(res.data.players || []);
      } catch (err) {
        console.error('Failed to load players:', err);
      }
    }
    loadAllPlayers();
  }, []);

  useEffect(() => {
    async function runComparison() {
      try {
        const res = await api.post('/coach/compare', {
          playerIds: [player1Id, player2Id]
        });
        setComparisonData(res.data.players || []);
      } catch (err) {
        console.error('Comparison failed:', err);
      }
    }
    if (player1Id && player2Id) {
      runComparison();
    }
  }, [player1Id, player2Id]);

  const p1 = comparisonData[0];
  const p2 = comparisonData[1];

  const mergedRadarData = [
    {
      subject: 'Match Performance',
      score: p1?.talentScore?.current_performance_score || 78,
      compareScore: p2?.talentScore?.current_performance_score || 89
    },
    {
      subject: 'Athletic Potential',
      score: p1?.talentScore?.athletic_potential_score || 91,
      compareScore: p2?.talentScore?.athletic_potential_score || 95
    },
    {
      subject: 'Technical Biomechanics',
      score: p1?.talentScore?.technical_skill_score || 85,
      compareScore: p2?.talentScore?.technical_skill_score || 91
    },
    {
      subject: 'Consistency Rating',
      score: p1?.talentScore?.consistency_score || 82,
      compareScore: p2?.talentScore?.consistency_score || 84
    },
    {
      subject: 'Development Trajectory',
      score: p1?.talentScore?.development_trajectory_score || 94,
      compareScore: p2?.talentScore?.development_trajectory_score || 96
    },
    {
      subject: 'Pressure Handling',
      score: p1?.batting ? (p1.batting.pressure_index || 80) : 80,
      compareScore: p2?.batting ? (p2.batting.pressure_index || 80) : 85
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#e2f939]/15 text-[#e2f939] border border-[#e2f939]/30">
            Head-to-Head Athlete Scouting
          </span>
          <h1 className="text-2xl font-black uppercase text-white tracking-tight">
            Multi-Player Talent Comparison
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Compare multi-dimensional potential scores, biomechanics metrics, and development curves side-by-side
        </p>
      </div>

      {/* Selectors Bar */}
      <GlassCard className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0b1b33] border-white/15">
        {/* Player 1 Selector */}
        <div>
          <label className="block text-xs font-extrabold uppercase text-[#e2f939] mb-1">Athlete A (Volt Yellow)</label>
          <select
            value={player1Id}
            onChange={(e) => setPlayer1Id(e.target.value)}
            className="w-full p-2.5 rounded-lg glass-input bg-[#061220] text-white text-xs font-bold"
          >
            {allPlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name} ({p.primary_role.replace('_', ' ')}) - {p.overall_talent_potential || 85} Potential
              </option>
            ))}
          </select>
        </div>

        {/* Player 2 Selector */}
        <div>
          <label className="block text-xs font-extrabold uppercase text-sky-400 mb-1">Athlete B (Sky Blue)</label>
          <select
            value={player2Id}
            onChange={(e) => setPlayer2Id(e.target.value)}
            className="w-full p-2.5 rounded-lg glass-input bg-[#061220] text-white text-xs font-bold"
          >
            {allPlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name} ({p.primary_role.replace('_', ' ')}) - {p.overall_talent_potential || 85} Potential
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Main Dual Radar Overlay & Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Overlay (Left 6 Columns) */}
        <GlassCard className="lg:col-span-6 p-6 flex flex-col justify-between bg-[#0b1b33] border-white/15">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#e2f939]" />
              Overlaid Talent Radar
            </h3>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="text-[#e2f939]">● {p1?.player?.full_name || 'Athlete A'}</span>
              <span className="text-sky-400">● {p2?.player?.full_name || 'Athlete B'}</span>
            </div>
          </div>

          <TalentRadarChart
            data={mergedRadarData}
            playerName={p1?.player?.full_name || 'Athlete A'}
            comparePlayerName={p2?.player?.full_name || 'Athlete B'}
            height={320}
          />
        </GlassCard>

        {/* Head-to-Head Metric Summary Cards (Right 6 Columns) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Athlete A Card */}
            <GlassCard className="p-4 bg-[#0b1b33] border-white/15 text-center space-y-2">
              <ScoreBadge score={p1?.talentScore?.overall_talent_potential || 88} size="lg" showLabel={false} />
              <div>
                <h4 className="font-extrabold text-white text-sm uppercase">{p1?.player?.full_name}</h4>
                <div className="text-[10px] text-[#e2f939] font-bold">{p1?.talentScore?.primary_archetype}</div>
                <div className="text-[10px] text-slate-400">{p1?.player?.location}</div>
              </div>
            </GlassCard>

            {/* Athlete B Card */}
            <GlassCard className="p-4 bg-[#0b1b33] border-white/15 text-center space-y-2">
              <ScoreBadge score={p2?.talentScore?.overall_talent_potential || 91} size="lg" showLabel={false} />
              <div>
                <h4 className="font-extrabold text-white text-sm uppercase">{p2?.player?.full_name}</h4>
                <div className="text-[10px] text-sky-400 font-bold">{p2?.talentScore?.primary_archetype}</div>
                <div className="text-[10px] text-slate-400">{p2?.player?.location}</div>
              </div>
            </GlassCard>
          </div>

          {/* Metric Comparison Table */}
          <GlassCard className="p-4 bg-[#0b1b33] border-white/15">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
              Dimensional Delta Breakdown
            </h4>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Overall Talent Potential', val1: p1?.talentScore?.overall_talent_potential, val2: p2?.talentScore?.overall_talent_potential },
                { label: 'Match Performance Score', val1: p1?.talentScore?.current_performance_score, val2: p2?.talentScore?.current_performance_score },
                { label: 'Athletic Potential Score', val1: p1?.talentScore?.athletic_potential_score, val2: p2?.talentScore?.athletic_potential_score },
                { label: 'Technical Biomechanics', val1: p1?.talentScore?.technical_skill_score, val2: p2?.talentScore?.technical_skill_score },
                { label: 'Consistency Rating', val1: p1?.talentScore?.consistency_score, val2: p2?.talentScore?.consistency_score },
                { label: 'Development Trajectory', val1: p1?.talentScore?.development_trajectory_score, val2: p2?.talentScore?.development_trajectory_score },
              ].map((row, i) => {
                const diff = (row.val1 || 0) - (row.val2 || 0);

                return (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400 font-medium">{row.label}</span>
                    <div className="flex items-center gap-4 font-mono font-bold">
                      <span className="text-[#e2f939]">{row.val1 || '-'}</span>
                      <span className="text-slate-600">vs</span>
                      <span className="text-sky-400">{row.val2 || '-'}</span>
                      <span className={`text-[10px] w-10 text-right ${diff > 0 ? 'text-[#e2f939]' : diff < 0 ? 'text-sky-400' : 'text-slate-500'}`}>
                        {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '='}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
