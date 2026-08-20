import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { CVTest } from './pages/CVTest';
import { AssessmentWizard } from './pages/AssessmentWizard';
import { Statistics } from './pages/Statistics';
import { Physical } from './pages/Physical';
import { Report } from './pages/Report';
import { ScoutDashboard } from './pages/coach/ScoutDashboard';
import { Compare } from './pages/Compare';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useStore } from './store/useStore';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [inspectPlayerId, setInspectPlayerId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const { user, fetchCurrentUser } = useStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Keep navigation changes feeling like a real application while preserving
  // the existing page/state architecture.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const labels: Record<string, string> = {
      landing: 'Home', dashboard: 'Athlete Dashboard', 'cv-lab': 'CV Biomechanics Lab',
      'assessment-wizard': 'Assessment', statistics: 'Statistics', physical: 'Physical Metrics',
      report: 'Talent Report', 'scout-hub': 'Scout Hub', compare: 'Compare Athletes',
      profile: 'Profile', login: 'Sign In', register: 'Create Account'
    };
    document.title = `STARQ · ${labels[currentTab] || 'Sports Intelligence'}`;
  }, [currentTab]);

  const handleInspectPlayer = (pid: string) => {
    setInspectPlayerId(pid);
    setCurrentTab('report');
  };

  const handleComparePlayers = (pids: string[]) => {
    setCompareIds(pids);
    setCurrentTab('compare');
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 relative">
        <div className="pointer-events-none fixed inset-x-0 top-16 z-0 h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(226,249,57,0.07),transparent_65%)]" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentTab}
            className="relative z-10 min-h-full"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
        {currentTab === 'landing' && (
          <Landing
            onStartAssessment={() => setCurrentTab('assessment-wizard')}
            onExplore={() => setCurrentTab('scout-hub')}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            onStartCVLab={() => setCurrentTab('cv-lab')}
            onStartAssessmentWizard={() => setCurrentTab('assessment-wizard')}
            onViewReport={() => setCurrentTab('report')}
            onViewStats={() => setCurrentTab('statistics')}
          />
        )}

        {currentTab === 'cv-lab' && (
          <CVTest
            onComplete={() => setCurrentTab('report')}
            onViewReport={() => setCurrentTab('report')}
          />
        )}

        {currentTab === 'assessment-wizard' && (
          <AssessmentWizard onComplete={() => setCurrentTab('report')} />
        )}

        {currentTab === 'statistics' && <Statistics />}

        {currentTab === 'physical' && <Physical />}

        {currentTab === 'report' && (
          <Report
            initialPlayerId={inspectPlayerId}
            onBack={() => setCurrentTab('dashboard')}
            onCompare={() => setCurrentTab('compare')}
          />
        )}

        {currentTab === 'scout-hub' && (
          <ScoutDashboard
            onInspectPlayer={handleInspectPlayer}
            onComparePlayers={handleComparePlayers}
          />
        )}

        {currentTab === 'compare' && (
          <Compare initialPlayerIds={compareIds.length >= 2 ? compareIds : undefined} />
        )}

        {currentTab === 'profile' && <Profile />}

        {currentTab === 'login' && (
          <Login
            onSuccess={() => setCurrentTab('dashboard')}
            onNavigateRegister={() => setCurrentTab('register')}
          />
        )}

        {currentTab === 'register' && (
          <Register
            onSuccess={() => setCurrentTab('dashboard')}
            onNavigateLogin={() => setCurrentTab('login')}
          />
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;
