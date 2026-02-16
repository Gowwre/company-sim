import { useGameStore } from '@/store/gameStore';
import { Activity, DollarSign, Users, Trophy, Settings, LayoutDashboard } from 'lucide-react';

const views = [
  { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'employees', label: 'EMPLOYEES', icon: Users },
  { id: 'projects', label: 'PROJECTS', icon: Activity },
  { id: 'finances', label: 'FINANCES', icon: DollarSign },
  { id: 'achievements', label: 'ACHIEVEMENTS', icon: Trophy },
  { id: 'settings', label: 'SETTINGS', icon: Settings },
] as const;

export function ViewTabs() {
  const { currentView, setView } = useGameStore();

  return (
    <nav className="flex-none border-b border-terminal-green-dark bg-terminal-dark">
      <div className="flex">
        {views.map((view) => {
          const Icon = view.icon;
          const isActive = currentView === view.id;

          return (
            <button
              key={view.id}
              onClick={() => setView(view.id)}
              className={`
                flex items-center gap-2 px-6 py-2 text-xs font-mono border-r border-terminal-green-dark
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-terminal-green text-terminal-bg font-bold'
                    : 'text-terminal-dim hover:text-terminal-green hover:bg-terminal-green/10'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{view.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default ViewTabs;
