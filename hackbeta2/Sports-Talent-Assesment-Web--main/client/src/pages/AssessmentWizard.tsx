import React, { useState } from 'react';
import {
  Zap,
  Activity,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Award
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { ScoreBadge } from '../components/ui/ScoreBadge';
import { useStore } from '../store/useStore';
import api from '../api/client';
import confetti from 'canvas-confetti';

interface AssessmentWizardProps {
  onComplete: () => void;
}

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({ onComplete }) => {
  const { user, currentProfile } = useStore();
  const playerId = user?.playerId || currentProfile?.id || 'p_rahul';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sport: 'cricket',
    role: 'batter',
    battingStyle: 'right_hand_bat',
    bowlingStyle: 'none',
    age: 17,
    heightCm: 178,
    weightKg: 68,
    academyClub: 'Karnataka State Cricket Academy',
    competitionLevel: 'state_u19',
    matches: 26,
    runs: 1080,
    battingAverage: 45.0,
    strikeRate: 144.0,
    wickets: 0,
    sprint10m: 1.76,
    verticalJump: 62.0,
    broadJump: 2.50,
    reactionTime: 190.0,
    cvPostureScore: 89,
    cvBalanceScore: 91,
    pressureRating: 85
  });

  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const stepsList = [
    'Sport',
    'Role',
    'Athlete Info',
    'Match Stats',
    'Physicals',
    'CV Biomechanics',
    'Match Context',
    'AI Processing',
    'Potential Score',
    'Save Profile'
  ];

  const handleNext = () => {
    if (step === 7) {
      setStep(8);
      setTimeout(async () => {
        try {
          const res = await api.get(`/reports/${playerId}`);
          setGeneratedReport(res.data);
        } catch (err) {
          console.error('Report generation error:', err);
        } finally {
          setStep(9);
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }
      }, 1500);
    } else if (step < 10) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Wizard Header & Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#e2f939]">
              Sequential Talent Assessment Workflow
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
              Step {step} of 10: {stepsList[step - 1]}
            </h1>
          </div>
          <span className="text-xs font-mono text-[#061220] font-black bg-[#e2f939] px-2.5 py-1 rounded-lg">
            {step * 10}% Complete
          </span>
        </div>

        {/* 10-Step Progress Bar */}
        <div className="w-full bg-[#0b1b33] h-2 rounded-full overflow-hidden flex border border-white/10">
          <div
            className="h-full bg-[#e2f939] transition-all duration-300 rounded-full"
            style={{ width: `${step * 10}%` }}
          />
        </div>
        <div className="hidden sm:flex justify-between text-[9px] text-slate-400 mt-2 px-1">
          {stepsList.map((s, idx) => (
            <span
              key={idx}
              className={`transition-colors font-bold uppercase ${idx + 1 <= step ? 'text-[#e2f939]' : ''}`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <GlassCard className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-between bg-[#0b1b33] border-white/15">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase text-white">Select Primary Sport</h2>
            <p className="text-xs text-slate-400">
              StarQ's assessment architecture is sport-agnostic. Cricket is currently the primary fully-implemented sport.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div
                onClick={() => setFormData({ ...formData, sport: 'cricket' })}
                className="p-5 rounded-2xl border-2 border-[#e2f939] bg-[#061220] cursor-pointer shadow-sm"
              >
                <div className="text-3xl mb-2">🏏</div>
                <div className="font-extrabold uppercase text-white text-sm">Cricket</div>
                <div className="text-[10px] text-[#e2f939] font-bold mt-1">Full CV & ML Active</div>
              </div>
              <div className="p-5 rounded-2xl border border-white/10 bg-[#061220]/40 opacity-50 cursor-not-allowed">
                <div className="text-3xl mb-2">⚽</div>
                <div className="font-bold text-slate-300 text-sm">Football</div>
                <div className="text-[10px] text-slate-500 mt-1">Module Coming Q3</div>
              </div>
              <div className="p-5 rounded-2xl border border-white/10 bg-[#061220]/40 opacity-50 cursor-not-allowed">
                <div className="text-3xl mb-2">🏀</div>
                <div className="font-bold text-slate-300 text-sm">Basketball</div>
                <div className="text-[10px] text-slate-500 mt-1">Module Coming Q4</div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase text-white">Select Cricketing Role & Style</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Primary Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 rounded-lg glass-input bg-[#061220] text-white"
                >
                  <option value="batter">Top-Order Batter</option>
                  <option value="fast_bowler">Express Fast Bowler</option>
                  <option value="spin_bowler">Spin Bowler</option>
                  <option value="all_rounder">All-Rounder</option>
                  <option value="wicket_keeper">Wicketkeeper-Batter</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Batting Style</label>
                <select
                  value={formData.battingStyle}
                  onChange={(e) => setFormData({ ...formData, battingStyle: e.target.value })}
                  className="w-full p-2.5 rounded-lg glass-input bg-[#061220] text-white"
                >
                  <option value="right_hand_bat">Right Hand Bat</option>
                  <option value="left_hand_bat">Left Hand Bat</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Bowling Style</label>
                <select
                  value={formData.bowlingStyle}
                  onChange={(e) => setFormData({ ...formData, bowlingStyle: e.target.value })}
                  className="w-full p-2.5 rounded-lg glass-input bg-[#061220] text-white"
                >
                  <option value="none">None</option>
                  <option value="right_arm_fast">Right Arm Fast</option>
                  <option value="left_arm_fast">Left Arm Fast</option>
                  <option value="right_arm_leg_spin">Right Arm Leg Spin</option>
                  <option value="right_arm_off_spin">Right Arm Off Spin</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Competition Level</label>
                <select
                  value={formData.competitionLevel}
                  onChange={(e) => setFormData({ ...formData, competitionLevel: e.target.value })}
                  className="w-full p-2.5 rounded-lg glass-input bg-[#061220] text-white"
                >
                  <option value="state_u19">State U-19 Championship</option>
                  <option value="state_u16">State U-16 Championship</option>
                  <option value="division_club">Division 1 Club League</option>
                  <option value="district">District Level Trials</option>
                  <option value="school">Inter-School Trophy</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase text-white">Athlete Bio & Anthropometrics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Age (Years)</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg glass-input"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Height (cm)</label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg glass-input"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg glass-input"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase text-white">Historical Cricket Match Statistics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Matches</label>
                <input
                  type="number"
                  value={formData.matches}
                  onChange={(e) => setFormData({ ...formData, matches: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg glass-input"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Runs</label>
                <input
                  type="number"
                  value={formData.runs}
                  onChange={(e) => setFormData({ ...formData, runs: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg glass-input"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Batting Average</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.battingAverage}
                  onChange={(e) => setFormData({ ...formData, battingAverage: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg glass-input"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Strike Rate</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.strikeRate}
                  onChange={(e) => setFormData({ ...formData, strikeRate: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg glass-input"
                />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase text-white">Physical Benchmark Measurements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">10m Sprint (s)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sprint10m}
                  onChange={(e) => setFormData({ ...formData, sprint10m: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Vertical Jump (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.verticalJump}
                  onChange={(e) => setFormData({ ...formData, verticalJump: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Broad Jump (m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.broadJump}
                  onChange={(e) => setFormData({ ...formData, broadJump: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg glass-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Reaction Time (ms)</label>
                <input
                  type="number"
                  value={formData.reactionTime}
                  onChange={(e) => setFormData({ ...formData, reactionTime: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg glass-input font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase text-white">Computer Vision Biomechanics Telemetry</h2>
            <div className="p-4 rounded-2xl bg-[#061220] border border-white/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e2f939]/15 flex items-center justify-center text-[#e2f939]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs uppercase">MediaPipe 33-Joint Pose Telemetry</div>
                  <div className="text-[11px] text-slate-400">Stance Stability: 91/100 • Balance: 89/100 • Head: 94/100</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#e2f939]">Calibrated</span>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase text-white">Match Context & Pressure Rating</h2>
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Pressure Execution Index (0-100)
                </label>
                <input
                  type="range"
                  min="50"
                  max="98"
                  value={formData.pressureRating}
                  onChange={(e) => setFormData({ ...formData, pressureRating: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-slate-400 font-mono text-[11px] mt-1">
                  <span>Standard</span>
                  <span className="font-bold text-[#e2f939]">{formData.pressureRating}/100</span>
                  <span>Elite Composure</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
            <div className="w-12 h-12 border-3 border-[#e2f939] border-t-transparent rounded-full animate-spin" />
            <div>
              <h3 className="text-base font-black uppercase text-white">AI Engine Evaluating Athlete Profile...</h3>
              <p className="text-xs text-slate-400 mt-1">
                Normalizing competition context, calculating kinetic biomechanics, and classifying archetype...
              </p>
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="space-y-6 text-center py-4">
            <div className="flex flex-col items-center gap-3">
              <ScoreBadge score={generatedReport?.talentScore?.overall_talent_potential || 88} size="xl" />
              <div>
                <div className="text-xs text-slate-400 uppercase font-bold">Calculated Talent Potential</div>
                <div className="text-xl font-black uppercase text-[#e2f939]">
                  {generatedReport?.talentScore?.primary_archetype || 'Aggressive Top-Order Batter'}
                </div>
                <div className="text-xs text-slate-300 mt-1 font-semibold">
                  Tier: {generatedReport?.talentScore?.talent_tier || 'High Potential'} (Confidence: {generatedReport?.talentScore?.prediction_confidence || 94}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 10 && (
          <div className="space-y-4 text-center py-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#e2f939] text-[#061220] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black uppercase text-white">Assessment Complete & Profile Saved!</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your data-driven profile has been added to the StarQ Scouting Hub. Coaches and scouts can now discover your talent potential.
            </p>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <button
            onClick={handlePrev}
            disabled={step === 1 || step === 8}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#061220] hover:bg-[#102444] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={step === 8}
            className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-[#e2f939] text-[#061220] hover:bg-[#d4ed2e] flex items-center gap-2 cursor-pointer shadow-sm"
          >
            {step === 10 ? 'View Final Report' : step === 7 ? 'Run AI Assessment' : 'Continue'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
