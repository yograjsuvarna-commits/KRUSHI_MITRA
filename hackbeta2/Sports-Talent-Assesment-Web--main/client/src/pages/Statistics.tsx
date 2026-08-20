import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  UploadCloud,
  CheckCircle2,
  Save
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useStore } from '../store/useStore';
import api from '../api/client';

export const Statistics: React.FC = () => {
  const { user, currentProfile } = useStore();
  const playerId = user?.playerId || currentProfile?.id || 'p_rahul';

  const [activeTab, setActiveTab] = useState<'batting' | 'bowling' | 'fielding'>('batting');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [battingForm, setBattingForm] = useState({
    matches: 28,
    innings: 26,
    runs: 1140,
    ballsFaced: 775,
    highestScore: 112,
    fours: 118,
    sixes: 34,
    fifties: 7,
    hundreds: 3,
    notOuts: 2,
    dotBallPercentage: 36.2,
    boundaryPercentage: 21.8,
    powerplayStrikeRate: 156.4,
    middleOversStrikeRate: 132.8,
    deathOversStrikeRate: 172.5,
    avgVsPace: 52.4,
    avgVsSpin: 39.8,
    chaseAverage: 51.2,
    pressureIndex: 86.5
  });

  const [bowlingForm, setBowlingForm] = useState({
    matches: 24,
    innings: 24,
    overs: 92.4,
    maidens: 8,
    runsConceded: 580,
    wickets: 46,
    bestBowlingWickets: 5,
    bestBowlingRuns: 18,
    dotBallPercentage: 62.4,
    fourWicketHauls: 3,
    fiveWicketHauls: 2,
    averageSpeedKmh: 134.8,
    maxSpeedKmh: 141.2,
    yorkerPercentage: 24.5,
    bouncerPercentage: 18.0,
    powerplayEconomy: 5.4,
    deathOversEconomy: 7.8
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get(`/statistics/${playerId}`);
        if (res.data.batting) {
          setBattingForm((prev) => ({ ...prev, ...res.data.batting }));
        }
        if (res.data.bowling) {
          setBowlingForm((prev) => ({ ...prev, ...res.data.bowling }));
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    }
    loadStats();
  }, [playerId]);

  const handleSaveBatting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/statistics/${playerId}/batting`, battingForm);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save batting error:', err);
    }
  };

  const handleSaveBowling = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/statistics/${playerId}/bowling`, bowlingForm);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save bowling error:', err);
    }
  };

  const handleMockCsvImport = async (type: string) => {
    try {
      await api.post(`/statistics/${playerId}/mock-csv-import`, { csvType: type });
      const res = await api.get(`/statistics/${playerId}`);
      if (type === 'batting' && res.data.batting) setBattingForm(res.data.batting);
      if (type === 'bowling' && res.data.bowling) setBowlingForm(res.data.bowling);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('CSV import error:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#e2f939]" />
            Cricket Match Statistics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical batting, bowling, and fielding performance with contextual match-phase splits
          </p>
        </div>

        {/* Quick CSV Import Mock Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMockCsvImport('batting')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0b1b33] hover:bg-[#102444] text-slate-200 border border-white/10 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <UploadCloud className="w-4 h-4 text-[#e2f939]" />
            Import Batting CSV
          </button>
          <button
            onClick={() => handleMockCsvImport('bowling')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0b1b33] hover:bg-[#102444] text-slate-200 border border-white/10 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <UploadCloud className="w-4 h-4 text-sky-400" />
            Import Bowling CSV
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-[#e2f939]/15 border border-[#e2f939]/30 text-[#e2f939] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Statistics updated successfully! ML Talent Model recalculation complete.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('batting')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'batting'
              ? 'bg-[#e2f939] text-[#061220]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏏 Batting Metrics
        </button>
        <button
          onClick={() => setActiveTab('bowling')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'bowling'
              ? 'bg-[#e2f939] text-[#061220]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⚡ Bowling Metrics
        </button>
      </div>

      {/* Batting Form */}
      {activeTab === 'batting' && (
        <form onSubmit={handleSaveBatting} className="space-y-6">
          <GlassCard className="p-6 space-y-4 bg-[#0b1b33] border-white/15">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#e2f939]">
              Primary Batting Career Totals
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Matches</label>
                <input
                  type="number"
                  value={battingForm.matches}
                  onChange={(e) => setBattingForm({ ...battingForm, matches: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Innings</label>
                <input
                  type="number"
                  value={battingForm.innings}
                  onChange={(e) => setBattingForm({ ...battingForm, innings: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Total Runs</label>
                <input
                  type="number"
                  value={battingForm.runs}
                  onChange={(e) => setBattingForm({ ...battingForm, runs: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Balls Faced</label>
                <input
                  type="number"
                  value={battingForm.ballsFaced}
                  onChange={(e) => setBattingForm({ ...battingForm, ballsFaced: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Fours (4s)</label>
                <input
                  type="number"
                  value={battingForm.fours}
                  onChange={(e) => setBattingForm({ ...battingForm, fours: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Sixes (6s)</label>
                <input
                  type="number"
                  value={battingForm.sixes}
                  onChange={(e) => setBattingForm({ ...battingForm, sixes: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">50s / 100s</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={battingForm.fifties}
                    placeholder="50s"
                    onChange={(e) => setBattingForm({ ...battingForm, fifties: Number(e.target.value) })}
                    className="w-1/2 px-2 py-2 rounded-lg glass-input font-mono"
                  />
                  <input
                    type="number"
                    value={battingForm.hundreds}
                    placeholder="100s"
                    onChange={(e) => setBattingForm({ ...battingForm, hundreds: Number(e.target.value) })}
                    className="w-1/2 px-2 py-2 rounded-lg glass-input font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Dot Ball %</label>
                <input
                  type="number"
                  step="0.1"
                  value={battingForm.dotBallPercentage}
                  onChange={(e) => setBattingForm({ ...battingForm, dotBallPercentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
            </div>
          </GlassCard>

          {/* Phase-by-Phase Splits */}
          <GlassCard className="p-6 space-y-4 bg-[#0b1b33] border-white/15">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Phase-by-Phase & Contextual Splits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Powerplay SR (Overs 1-6)</label>
                <input
                  type="number"
                  step="0.1"
                  value={battingForm.powerplayStrikeRate}
                  onChange={(e) => setBattingForm({ ...battingForm, powerplayStrikeRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Middle Overs SR (Overs 7-15)</label>
                <input
                  type="number"
                  step="0.1"
                  value={battingForm.middleOversStrikeRate}
                  onChange={(e) => setBattingForm({ ...battingForm, middleOversStrikeRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Death Overs SR (Overs 16-20)</label>
                <input
                  type="number"
                  step="0.1"
                  value={battingForm.deathOversStrikeRate}
                  onChange={(e) => setBattingForm({ ...battingForm, deathOversStrikeRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Average vs Pace</label>
                <input
                  type="number"
                  step="0.1"
                  value={battingForm.avgVsPace}
                  onChange={(e) => setBattingForm({ ...battingForm, avgVsPace: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Average vs Spin</label>
                <input
                  type="number"
                  step="0.1"
                  value={battingForm.avgVsSpin}
                  onChange={(e) => setBattingForm({ ...battingForm, avgVsSpin: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Pressure Index (0-100)</label>
                <input
                  type="number"
                  step="0.1"
                  value={battingForm.pressureIndex}
                  onChange={(e) => setBattingForm({ ...battingForm, pressureIndex: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
            </div>
          </GlassCard>

          <button
            type="submit"
            className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-[#e2f939] text-[#061220] hover:bg-[#d4ed2e] flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Batting Statistics
          </button>
        </form>
      )}

      {/* Bowling Form */}
      {activeTab === 'bowling' && (
        <form onSubmit={handleSaveBowling} className="space-y-6">
          <GlassCard className="p-6 space-y-4 bg-[#0b1b33] border-white/15">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#e2f939]">
              Primary Bowling Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Matches</label>
                <input
                  type="number"
                  value={bowlingForm.matches}
                  onChange={(e) => setBowlingForm({ ...bowlingForm, matches: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Overs Bowled</label>
                <input
                  type="number"
                  step="0.1"
                  value={bowlingForm.overs}
                  onChange={(e) => setBowlingForm({ ...bowlingForm, overs: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Wickets</label>
                <input
                  type="number"
                  value={bowlingForm.wickets}
                  onChange={(e) => setBowlingForm({ ...bowlingForm, wickets: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Runs Conceded</label>
                <input
                  type="number"
                  value={bowlingForm.runsConceded}
                  onChange={(e) => setBowlingForm({ ...bowlingForm, runsConceded: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Average Speed (km/h)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bowlingForm.averageSpeedKmh}
                  onChange={(e) => setBowlingForm({ ...bowlingForm, averageSpeedKmh: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Max Speed (km/h)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bowlingForm.maxSpeedKmh}
                  onChange={(e) => setBowlingForm({ ...bowlingForm, maxSpeedKmh: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Yorker %</label>
                <input
                  type="number"
                  step="0.1"
                  value={bowlingForm.yorkerPercentage}
                  onChange={(e) => setBowlingForm({ ...bowlingForm, yorkerPercentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Powerplay Economy</label>
                <input
                  type="number"
                  step="0.1"
                  value={bowlingForm.powerplayEconomy}
                  onChange={(e) => setBowlingForm({ ...bowlingForm, powerplayEconomy: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
            </div>
          </GlassCard>

          <button
            type="submit"
            className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-[#e2f939] text-[#061220] hover:bg-[#d4ed2e] flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Bowling Statistics
          </button>
        </form>
      )}
    </div>
  );
};
