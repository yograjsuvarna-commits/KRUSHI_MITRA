import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Layers
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { ScoreBadge } from '../../components/ui/ScoreBadge';
import api from '../../api/client';

interface ScoutDashboardProps {
  onInspectPlayer: (playerId: string) => void;
  onComparePlayers: (playerIds: string[]) => void;
}

export const ScoutDashboard: React.FC<ScoutDashboardProps> = ({
  onInspectPlayer,
  onComparePlayers
}) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(['p_rahul', 'p_vikram']);

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [minPotential, setMinPotential] = useState(70);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDiscoveryResults = async () => {
    try {
      setLoading(true);
      const params: any = {
        role: roleFilter,
        ageGroup: ageGroupFilter,
        region: regionFilter,
        minPotential,
        search: searchQuery
      };
      const res = await api.get('/coach/discover', { params });
      setPlayers(res.data.results || []);
    } catch (err) {
      console.error('Failed to discover talent:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveryResults();
  }, [roleFilter, ageGroupFilter, regionFilter, minPotential]);

  const toggleCompare = (pid: string) => {
    if (selectedForCompare.includes(pid)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== pid));
    } else {
      if (selectedForCompare.length < 3) {
        setSelectedForCompare([...selectedForCompare, pid]);
      }
    }
  };

  const toggleWatchlist = async (pid: string) => {
    if (watchlist.includes(pid)) {
      setWatchlist(watchlist.filter((id) => id !== pid));
    } else {
      setWatchlist([...watchlist, pid]);
      try {
        await api.post('/coach/watchlist', { playerId: pid, priorityLevel: 'high' });
      } catch (err) {
        console.error('Watchlist save error:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#e2f939]/15 text-[#e2f939] border border-[#e2f939]/30">
              Scout & Coach Intelligence
            </span>
            <h1 className="text-2xl font-black uppercase text-white tracking-tight">
              Talent Discovery & Ranking
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Data-driven scouting with normalized match analytics, physical test percentiles, and MediaPipe biomechanics
          </p>
        </div>

        {selectedForCompare.length >= 2 && (
          <button
            onClick={() => onComparePlayers(selectedForCompare)}
            className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-[#e2f939] text-[#061220] hover:bg-[#d4ed2e] flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Layers className="w-4 h-4" />
            Compare {selectedForCompare.length} Selected Athletes
          </button>
        )}
      </div>

      {/* Advanced Discovery Search & Filter Card */}
      <GlassCard className="p-6 space-y-4 bg-[#0b1b33] border-white/15">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#e2f939] flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            Discover Emerging High-Potential Talent
          </h3>
          <span className="text-[11px] font-mono text-slate-400 font-bold">
            {players.length} Athletes Found
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Input */}
          <div>
            <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Search Athlete / Club</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDiscoveryResults()}
                placeholder="Name or academy..."
                className="w-full pl-8 pr-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Playing Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 rounded-lg glass-input bg-[#061220] text-white"
            >
              <option value="all">All Roles</option>
              <option value="batter">Batters</option>
              <option value="fast_bowler">Fast Bowlers</option>
              <option value="spin_bowler">Spin Bowlers</option>
              <option value="all_rounder">All-Rounders</option>
              <option value="wicket_keeper">Wicketkeepers</option>
            </select>
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Age Group</label>
            <select
              value={ageGroupFilter}
              onChange={(e) => setAgeGroupFilter(e.target.value)}
              className="w-full p-2 rounded-lg glass-input bg-[#061220] text-white"
            >
              <option value="all">All Ages</option>
              <option value="u16">Under-16 (Youth)</option>
              <option value="u19">Under-19 (Junior)</option>
              <option value="u23">Under-23 (Senior Emerging)</option>
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-bold uppercase text-[10px]">Region / State</label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full p-2 rounded-lg glass-input bg-[#061220] text-white"
            >
              <option value="all">All States</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi / NCR</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
          </div>

          {/* Min Potential Slider */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1 font-bold uppercase text-[10px]">
              <span>Min. Potential</span>
              <span className="font-mono text-[#e2f939] font-black">{minPotential}+</span>
            </div>
            <input
              type="range"
              min="60"
              max="92"
              value={minPotential}
              onChange={(e) => setMinPotential(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </div>
      </GlassCard>

      {/* Talent Leaderboard Table */}
      <GlassCard className="p-0 overflow-hidden bg-[#0b1b33] border-white/15">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            High-Potential Talent Leaderboard
          </h3>
          <span className="text-[10px] text-slate-400">
            Select checkboxes to compare up to 3 athletes head-to-head
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#061220] text-slate-400 uppercase text-[10px] border-b border-white/10 font-mono font-bold">
              <tr>
                <th className="py-3 px-4 w-10 text-center">Compare</th>
                <th className="py-3 px-4">Athlete</th>
                <th className="py-3 px-4">Role & Archetype</th>
                <th className="py-3 px-4">Region / Club</th>
                <th className="py-3 px-4 text-center">Potential</th>
                <th className="py-3 px-4">Key Performance Metrics</th>
                <th className="py-3 px-4 text-center">Trend</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {players.map((p) => {
                const isChecked = selectedForCompare.includes(p.id);
                const isWatchlisted = watchlist.includes(p.id);

                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    {/* Compare Checkbox */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCompare(p.id)}
                        className="rounded bg-[#061220] border-white/20 text-[#e2f939] focus:ring-[#e2f939] cursor-pointer"
                      />
                    </td>

                    {/* Athlete Name & Photo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                          alt={p.full_name}
                          className="w-9 h-9 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <div className="font-bold text-white text-sm hover:text-[#e2f939] cursor-pointer" onClick={() => onInspectPlayer(p.id)}>
                            {p.full_name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Age {p.age} • {p.gender}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Archetype */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">
                        {p.primary_archetype || p.primary_role.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] text-[#e2f939] font-mono font-bold">
                        {p.batting_style?.replace(/_/g, ' ')}
                      </div>
                    </td>

                    {/* Region / Club */}
                    <td className="py-3 px-4">
                      <div className="text-slate-300">{p.location}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {p.academy_club}
                      </div>
                    </td>

                    {/* Talent Potential Badge */}
                    <td className="py-3 px-4 text-center">
                      <ScoreBadge score={p.overall_talent_potential || 85} size="sm" showLabel={false} />
                      <div className="text-[9px] text-slate-400 mt-0.5 uppercase font-bold">
                        {p.talent_tier?.split(' ')[0]}
                      </div>
                    </td>

                    {/* Key Metrics */}
                    <td className="py-3 px-4">
                      {p.primary_role === 'batter' && (
                        <div className="text-slate-300">
                          <span className="font-mono font-bold text-white">{p.batting_average} Avg</span> • <span className="font-mono font-bold text-[#e2f939]">{p.strike_rate} SR</span>
                        </div>
                      )}
                      {(p.primary_role === 'fast_bowler' || p.primary_role === 'spin_bowler') && (
                        <div className="text-slate-300">
                          <span className="font-mono font-bold text-white">{p.wickets} Wkts</span> @ <span className="font-mono">{p.bowling_average} Avg</span>
                          {p.average_speed_kmh > 0 && <span className="text-[10px] text-[#e2f939] font-bold block">{p.average_speed_kmh} km/h avg</span>}
                        </div>
                      )}
                      {p.primary_role === 'all_rounder' && (
                        <div className="text-slate-300">
                          <span className="font-mono font-bold text-[#e2f939]">{p.batting_average} Bat</span> / <span className="font-mono text-white">{p.wickets} Wkts</span>
                        </div>
                      )}
                      {p.primary_role === 'wicket_keeper' && (
                        <div className="text-slate-300">
                          <span className="font-mono font-bold text-[#e2f939]">190ms Glove Reaction</span> • <span className="font-mono text-white">{p.batting_average} Avg</span>
                        </div>
                      )}
                    </td>

                    {/* Trend */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-0.5 text-[#061220] bg-[#e2f939] font-extrabold text-xs px-2 py-0.5 rounded">
                        <TrendingUp className="w-3 h-3" />
                        ↑
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleWatchlist(p.id)}
                          title="Save to Watchlist"
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isWatchlisted
                              ? 'bg-[#e2f939] text-[#061220] border-[#e2f939]'
                              : 'bg-[#061220] text-slate-400 border-white/10 hover:text-white'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" fill={isWatchlisted ? 'currentColor' : 'none'} />
                        </button>

                        <button
                          onClick={() => onInspectPlayer(p.id)}
                          className="px-3 py-1.5 rounded-lg font-black uppercase text-[10px] tracking-wider bg-white text-[#061220] hover:bg-[#e2f939] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          Report
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
