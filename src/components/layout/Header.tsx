import { useGameStore } from '@/store/gameStore';
import { useFullscreen } from '@/hooks/useFullscreen';
import { terminalSound } from '@/utils/terminalSound';
import { HelpCircle, Maximize2, Minimize2 } from 'lucide-react';

export function Header() {
  const { company, toggleHelpModal } = useGameStore();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  if (!company) return null;

  const activeEmployees = company.employees.filter((e) => !e.quitMonth).length;
  const activeProjects = company.projects.filter(
    (p) => p.status === 'inProgress' || p.status === 'notStarted'
  ).length;

  return (
    <header className="flex-none h-12 border-b border-terminal-green-dark bg-terminal-dark flex items-center justify-between px-4">
      {/* Left: Logo & Brand */}
      <div className="flex items-center gap-4">
        <button className="text-terminal-green hover:text-terminal-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-terminal-green font-mono font-bold tracking-wider">COMPANY OS</span>
          <span className="text-terminal-dark text-xs">v2.0</span>
        </div>
      </div>

      {/* Center: Live Status & Key Metrics */}
      <div className="flex items-center gap-6">
        {/* Live Indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
          <span className="text-terminal-green text-xs font-mono">LIVE</span>
        </div>

        {/* Current Month */}
        <div className="flex items-center gap-2 px-4 py-1 border border-terminal-green-dark">
          <span className="text-terminal-dim text-xs">MONTH</span>
          <span className="text-terminal-green font-mono font-bold">{company.currentMonth}</span>
        </div>

        {/* Cash */}
        <div className="flex items-center gap-2">
          <span className="text-terminal-dim text-xs">CASH</span>
          <span
            className={`font-mono font-bold ${company.cash >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}
          >
            ${company.cash.toLocaleString()}
          </span>
        </div>

        {/* Staff Count */}
        <div className="flex items-center gap-2">
          <span className="text-terminal-dim text-xs">STAFF</span>
          <span className="text-terminal-cyan font-mono font-bold">{activeEmployees}</span>
        </div>

        {/* Active Projects */}
        <div className="flex items-center gap-2">
          <span className="text-terminal-dim text-xs">PROJECTS</span>
          <span className="text-terminal-amber font-mono font-bold">{activeProjects}</span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            terminalSound.playBell();
            toggleHelpModal();
          }}
          className="text-terminal-dim hover:text-terminal-green transition-colors"
          title="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            terminalSound.playKeystroke();
            toggleFullscreen();
          }}
          className="text-terminal-dim hover:text-terminal-green transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}

export default Header;
