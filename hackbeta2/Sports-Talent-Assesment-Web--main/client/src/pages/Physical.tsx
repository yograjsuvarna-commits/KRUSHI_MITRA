import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  PlusCircle,
  Calendar
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { ScoreBadge } from '../components/ui/ScoreBadge';
import { useStore } from '../store/useStore';
import api from '../api/client';
import confetti from 'canvas-confetti';

export const Physical: React.FC = () => {
  const { user, currentProfile } = useStore();
  const playerId = user?.playerId || currentProfile?.id || 'p_rahul';

  const [tests, setTests] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [testType, setTestType] = useState('sprint_10m');
  const [rawValue, setRawValue] = useState<number>(1.74);
  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadTests() {
      try {
        const res = await api.get(`/physical/${playerId}`);
        setTests(res.data.tests || []);
      } catch (err) {
        console.error('Physical tests error:', err);
      }
    }
    loadTests();
  }, [playerId]);

  const handleRecordTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/physical/${playerId}`, {
        testType,
        rawValue: Number(rawValue),
        notes: notes || 'Logged during training session'
      });
      const res = await api.get(`/physical/${playerId}`);
      setTests(res.data.tests || []);
      setModalOpen(false);
      setSavedSuccess(true);
      confetti({ particleCount: 60, spread: 50 });
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to log test:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#e2f939]/15 text-[#e2f939] border border-[#e2f939]/30">
              Athletic Assessment
            </span>
            <h1 className="text-2xl font-black uppercase text-white tracking-tight">
              Physical Performance Testing Suite
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized physical tests normalized against age-group athletic benchmarks & percentiles
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#e2f939] text-[#061220] hover:bg-[#d4ed2e] flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Log Physical Test
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-[#e2f939]/15 border border-[#e2f939]/30 text-[#e2f939] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>New test recorded and Talent Potential Score recalibrated!</span>
        </div>
      )}

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((t) => (
          <GlassCard key={t.id} className="p-5 space-y-3 bg-[#0b1b33] border-white/15">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-extrabold uppercase text-[#e2f939]">
                {t.test_type.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3" />
                {new Date(t.tested_at).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-black text-white font-mono">
                  {t.raw_value} <span className="text-sm text-slate-400 font-normal">{t.unit}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold">
                  Percentile: <strong className="text-[#e2f939] font-mono">{t.percentile}th %tile</strong>
                </div>
              </div>
              <ScoreBadge score={t.score} size="sm" showLabel={false} />
            </div>

            <div className="w-full bg-[#061220] h-1.5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-[#e2f939] rounded-full"
                style={{ width: `${t.score}%` }}
              />
            </div>

            {t.notes && (
              <p className="text-[10px] text-slate-400 italic pt-1 border-t border-white/10">
                "{t.notes}"
              </p>
            )}

            {t.is_cv_estimated === 1 && (
              <div className="text-[9px] text-[#e2f939] bg-[#e2f939]/10 px-2 py-0.5 rounded border border-[#e2f939]/30 font-mono font-bold">
                ⚡ CV Optical Calibration ({Math.round(t.cv_confidence * 100)}% Confidence)
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      {/* Log Test Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#061220]/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <GlassCard className="max-w-md w-full p-6 space-y-4 border-white/20 bg-[#0b1b33]">
            <h3 className="text-base font-black uppercase text-white">Log Physical Performance Measurement</h3>

            <form onSubmit={handleRecordTest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-bold uppercase text-[10px]">Test Type</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full p-2.5 rounded-lg glass-input bg-[#061220] text-white"
                >
                  <option value="sprint_10m">10m Sprint (Acceleration) - seconds</option>
                  <option value="sprint_20m">20m Sprint - seconds</option>
                  <option value="sprint_30m">30m Sprint (Top Speed) - seconds</option>
                  <option value="vertical_jump">Vertical Jump (Explosiveness) - cm</option>
                  <option value="standing_broad_jump">Standing Broad Jump (Distance) - meters</option>
                  <option value="shuttle_run">Shuttle Run (Agility) - seconds</option>
                  <option value="reaction_time">Visual Stimulus Reaction Time - ms</option>
                  <option value="single_leg_balance">Single-Leg Balance (Core) - seconds</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold uppercase text-[10px]">Raw Measured Value</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={rawValue}
                  onChange={(e) => setRawValue(Number(e.target.value))}
                  placeholder="e.g. 1.74"
                  className="w-full p-2.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold uppercase text-[10px]">Coach / Tester Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Explosive start with low center of gravity"
                  className="w-full p-2.5 rounded-lg glass-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#061220] hover:bg-[#102444] text-slate-300 cursor-pointer border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-[#e2f939] text-[#061220] hover:bg-[#d4ed2e] cursor-pointer shadow-sm"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
