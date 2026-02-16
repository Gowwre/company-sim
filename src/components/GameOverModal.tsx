import { useGameStore } from '@/store/gameStore';
import { terminalSound } from '@/utils/terminalSound';
import { useEffect } from 'react';
import { SimulationEngine } from '@/engine/core/SimulationEngine';

const simulationEngine = new SimulationEngine();

export function GameOverModal() {
  const { company, resetGame } = useGameStore();

  useEffect(() => {
    terminalSound.playError();
  }, []);

  if (!company) return null;

  const score = simulationEngine.calculateScore(company);
  const monthsSurvived = company.currentMonth;
  const activeEmployees = company.employees.filter((e) => !e.quitMonth).length;
  const totalEmployees = company.employees.length;
  const completedProjects = company.projects.filter((p) => p.status === 'completed').length;
  const finalCash = company.cash;
  const reputation = company.reputation;

  const getScoreRating = (score: number) => {
    if (score >= 50000) return { label: 'LEGENDARY', color: 'text-terminal-amber' };
    if (score >= 25000) return { label: 'EPIC', color: 'text-terminal-cyan' };
    if (score >= 10000) return { label: 'GREAT', color: 'text-terminal-green' };
    if (score >= 5000) return { label: 'GOOD', color: 'text-terminal-green-dim' };
    return { label: 'NOVICE', color: 'text-terminal-gray' };
  };

  const rating = getScoreRating(score);

  const handleRestart = () => {
    terminalSound.playEnter();
    resetGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-terminal/95 p-4 screen-flicker">
      <div className="w-full max-w-2xl border-2 border-terminal-red bg-terminal-dark">
        {/* Header */}
        <div className="border-b border-terminal-red bg-terminal-red/10 px-4 py-6 text-center">
          <div className="text-terminal-red text-4xl font-bold mb-2 glow">☠ BANKRUPTCY ☠</div>
          <div className="text-terminal-dim">{company.name} has run out of funds</div>
        </div>

        {/* Score */}
        <div className="p-6 border-b border-terminal-green-dark">
          <div className="text-center">
            <div className="text-terminal-dim text-sm mb-1">FINAL SCORE</div>
            <div className="text-terminal-white text-5xl font-bold mb-2 glow">
              {score.toLocaleString()}
            </div>
            <div className={`text-xl font-bold ${rating.color}`}>[{rating.label}]</div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatBox label="MONTHS SURVIVED" value={monthsSurvived.toString()} />
            <StatBox label="FINAL CASH" value={`$${finalCash.toLocaleString()}`} />
            <StatBox label="REPUTATION" value={reputation.toString()} />
            <StatBox label="EMPLOYEES" value={`${activeEmployees}/${totalEmployees}`} />
            <StatBox label="PROJECTS DONE" value={completedProjects.toString()} />
            <StatBox label="COMPANY" value={company.name.substring(0, 12)} />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-terminal-green-dark">
          <button
            onClick={handleRestart}
            className="w-full text-terminal-green border border-terminal-green px-6 py-3 hover:bg-terminal-green hover:text-terminal transition-colors font-bold"
          >
            [ START NEW COMPANY ]
          </button>
        </div>
      </div>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="border border-terminal-green-dark p-3 text-center">
      <div className="text-terminal-dim text-xs mb-1">{label}</div>
      <div className="text-terminal-green font-bold">{value}</div>
    </div>
  );
}

export default GameOverModal;
