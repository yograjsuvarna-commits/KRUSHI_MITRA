import React, { useState } from 'react';
import {
  Activity,
  Award,
  Users,
  Zap,
  BarChart3,
  Video,
  LogOut,
  ChevronDown,
  Sparkles,
  Layers,
  ArrowUpRight,
  Menu,
  X,
  Home,
  UserCircle
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout, switchDemoUser } = useStore();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDemoSwitch = async (role: string) => {
    await switchDemoUser(role);
    setDemoMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const navigate = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { tab: 'dashboard', label: 'Dashboard', icon: Activity },
    { tab: 'cv-lab', label: 'CV Biomechanics', icon: Video },
    { tab: 'assessment-wizard', label: 'Start Assessment', icon: Sparkles },
    { tab: 'statistics', label: 'Statistics', icon: BarChart3 },
    { tab: 'scout-hub', label: 'Scout Hub', icon: Users },
    { tab: 'compare', label: 'Compare', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#061220]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentTab('landing')}
          >
            <div className="w-9 h-9 rounded-xl bg-[#e2f939] flex items-center justify-center text-[#061220] font-black shadow-sm">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                STAR<span className="text-[#e2f939]">Q</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
            {navItems.map(({ tab, label, icon: Icon }) => (
              <button
                key={tab}
                onClick={() => navigate(tab)}
                aria-current={currentTab === tab ? 'page' : undefined}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentTab === tab
                    ? tab === 'cv-lab'
                      ? 'bg-[#e2f939] text-[#061220] shadow-[0_0_0_1px_rgba(226,249,57,.2)]'
                      : 'bg-white/10 text-white border border-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="md:hidden ml-auto mr-2 p-2 rounded-xl border border-white/10 bg-white/5 text-slate-200"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Right Action Bar / Demo Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher for Hackathon Judges */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0b1b33] border border-white/15 text-slate-200 flex items-center gap-2 hover:border-[#e2f939]/60 transition-all cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-[#e2f939]" />
                <span className="hidden sm:inline text-slate-400">Demo Profile:</span>
                <span className="font-extrabold text-white truncate max-w-[110px]">
                  {user ? user.full_name : 'Rahul (Batter)'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0b1b33] border border-white/15 shadow-2xl py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-3.5 py-1.5 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Judge 1-Click Demo Switcher
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('player')}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-white/5 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-white">🏏 Rahul Sharma (17)</div>
                      <div className="text-[11px] text-[#e2f939]">Aggressive Top-Order Batter (88 Pot)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('fast_bowler')}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-white/5 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-white">⚡ Vikram Rathore (18)</div>
                      <div className="text-[11px] text-[#e2f939]">Express Pace Bowler 141 km/h (91 Pot)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('all_rounder')}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-white/5 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-white">🌀 Ananya Patel (16)</div>
                      <div className="text-[11px] text-[#e2f939]">Leg-Spin All-Rounder (89 Pot)</div>
                    </div>
                  </button>
                  <div className="border-t border-white/10 my-1"></div>
                  <button
                    onClick={() => handleDemoSwitch('scout')}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-white/5 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-white">🔍 Rajesh Dravid (Scout)</div>
                      <div className="text-[11px] text-sky-400">Senior National Scout Dashboard</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#e2f939] text-[#061220] hover:bg-[#d5ee26] transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#061220]/98 backdrop-blur-xl">
          <div className="px-4 py-4 grid grid-cols-2 gap-2">
            <button onClick={() => navigate('landing')} className="mobile-nav-item">
              <Home className="w-4 h-4" /> Home
            </button>
            {navItems.map(({ tab, label, icon: Icon }) => (
              <button
                key={tab}
                onClick={() => navigate(tab)}
                className={`mobile-nav-item ${currentTab === tab ? 'mobile-nav-item-active' : ''}`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
            <button onClick={() => navigate('profile')} className="mobile-nav-item">
              <UserCircle className="w-4 h-4" /> Profile
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
