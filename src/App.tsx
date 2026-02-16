import { useGameStore } from '@/store/gameStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { GameSetup } from '@/components/GameSetup';
import { EventModal } from '@/components/events/EventModal';
import { GameOverModal } from '@/components/GameOverModal';
import { HelpModal } from '@/components/help/HelpModal';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { EmployeeManagement } from '@/components/employees/EmployeeManagement';
import { ProjectManagement } from '@/components/projects/ProjectManagement';
import { SettingsView } from '@/components/settings/SettingsView';
import { AchievementsView } from '@/components/achievements/AchievementsView';
import { TimelineView } from '@/components/timeline/TimelineView';
import { Toaster } from 'react-hot-toast';

function App() {
  const { company, isPlaying, showEventModal, showHelpModal, currentView } = useGameStore();

  if (!isPlaying || !company) {
    return (
      <>
        <GameSetup />
        <Toaster position="top-center" />
      </>
    );
  }

  // Render the appropriate view based on currentView
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <TimelineView />;
      case 'employees':
        return <EmployeeManagement />;
      case 'projects':
        return <ProjectManagement />;
      case 'finances':
        return <Dashboard />;
      case 'achievements':
        return <AchievementsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TimelineView />;
    }
  };

  return (
    <>
      <AppLayout>{renderView()}</AppLayout>

      {showEventModal && <EventModal />}
      {showHelpModal && <HelpModal />}
      {company.cash < 0 && <GameOverModal />}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0d1117',
            color: '#00ff41',
            border: '1px solid #008f11',
            fontFamily: "'JetBrains Mono', monospace",
          },
        }}
      />
    </>
  );
}

export default App;
