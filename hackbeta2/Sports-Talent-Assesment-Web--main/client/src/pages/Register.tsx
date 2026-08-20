import React, { useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useStore } from '../store/useStore';
import api from '../api/client';

interface RegisterProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSuccess, onNavigateLogin }) => {
  const { setAuth } = useStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'player',
    age: 17,
    gender: 'Male',
    location: 'Bengaluru, Karnataka',
    primaryRole: 'batter',
    battingStyle: 'right_hand_bat',
    bowlingStyle: 'none'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      setAuth(res.data.user, res.data.token);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <GlassCard className="p-8 bg-[#0b1b33] border-white/15">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#e2f939] text-[#061220] flex items-center justify-center font-black mb-3 shadow-sm">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-black uppercase text-white tracking-tight">Create Athlete Account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Build your digital cricketer profile and discover your talent potential score
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Rahul Sharma"
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Account Type
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs bg-[#061220] text-white"
              >
                <option value="player">Player / Athlete</option>
                <option value="scout">Coach / Talent Scout</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="athlete@example.com"
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>
          </div>

          {formData.role === 'player' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="35"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs bg-[#061220] text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Primary Role
                  </label>
                  <select
                    value={formData.primaryRole}
                    onChange={(e) => setFormData({ ...formData, primaryRole: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs bg-[#061220] text-white"
                  >
                    <option value="batter">Batter</option>
                    <option value="fast_bowler">Fast Bowler</option>
                    <option value="spin_bowler">Spin Bowler</option>
                    <option value="all_rounder">All-Rounder</option>
                    <option value="wicket_keeper">Wicketkeeper</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Batting Style
                  </label>
                  <select
                    value={formData.battingStyle}
                    onChange={(e) => setFormData({ ...formData, battingStyle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs bg-[#061220] text-white"
                  >
                    <option value="right_hand_bat">Right Hand Bat</option>
                    <option value="left_hand_bat">Left Hand Bat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Bowling Style
                  </label>
                  <select
                    value={formData.bowlingStyle}
                    onChange={(e) => setFormData({ ...formData, bowlingStyle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs bg-[#061220] text-white"
                  >
                    <option value="none">None / Non-Bowler</option>
                    <option value="right_arm_fast">Right Arm Fast</option>
                    <option value="left_arm_fast">Left Arm Fast</option>
                    <option value="right_arm_leg_spin">Right Arm Leg Spin</option>
                    <option value="right_arm_off_spin">Right Arm Off Spin</option>
                    <option value="left_arm_orthodox">Left Arm Orthodox</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Location (City, State)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Bengaluru, Karnataka"
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-[#e2f939] text-[#061220] hover:bg-[#d4ed2e] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
          >
            {loading ? 'Creating Profile...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-[#e2f939] font-bold hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
