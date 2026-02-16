import { useGameStore } from '@/store/gameStore';
import { Heart, Zap, Shield, TrendingUp } from 'lucide-react';

export function MetricsPanel() {
  const { company } = useGameStore();

  if (!company) return null;

  const activeEmployees = company.employees.filter((e) => !e.quitMonth);
  const avgMorale =
    activeEmployees.length > 0
      ? activeEmployees.reduce((sum, e) => sum + e.morale, 0) / activeEmployees.length
      : 0;
  const avgProductivity =
    activeEmployees.length > 0
      ? activeEmployees.reduce((sum, e) => sum + e.productivity, 0) / activeEmployees.length
      : 0;
  const avgLoyalty =
    activeEmployees.length > 0
      ? activeEmployees.reduce((sum, e) => sum + e.loyalty, 0) / activeEmployees.length
      : 0;

  const culture = company.culture;

  const getBarColor = (value: number) => {
    if (value >= 70) return 'bg-terminal-green';
    if (value >= 40) return 'bg-terminal-amber';
    return 'bg-terminal-red';
  };

  return (
    <div className="p-3 space-y-3">
      {/* Employee Metrics */}
      <div className="space-y-2">
        <div className="text-terminal-dark text-xs font-mono mb-2">TEAM METRICS</div>

        {/* Morale */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-terminal-dim flex items-center gap-1">
              <Heart className="w-3 h-3" /> Morale
            </span>
            <span
              className={
                avgMorale >= 70
                  ? 'text-terminal-green'
                  : avgMorale >= 40
                    ? 'text-terminal-amber'
                    : 'text-terminal-red'
              }
            >
              {avgMorale.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 bg-terminal-dark overflow-hidden">
            <div
              className={`h-full ${getBarColor(avgMorale)}`}
              style={{ width: `${avgMorale}%` }}
            />
          </div>
        </div>

        {/* Productivity */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-terminal-dim flex items-center gap-1">
              <Zap className="w-3 h-3" /> Productivity
            </span>
            <span className="text-terminal-cyan">{avgProductivity.toFixed(1)}x</span>
          </div>
          <div className="h-1.5 bg-terminal-dark overflow-hidden">
            <div
              className="h-full bg-terminal-cyan"
              style={{ width: `${Math.min(avgProductivity * 50, 100)}%` }}
            />
          </div>
        </div>

        {/* Loyalty */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-terminal-dim flex items-center gap-1">
              <Shield className="w-3 h-3" /> Loyalty
            </span>
            <span
              className={
                avgLoyalty >= 70
                  ? 'text-terminal-green'
                  : avgLoyalty >= 40
                    ? 'text-terminal-amber'
                    : 'text-terminal-red'
              }
            >
              {avgLoyalty.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 bg-terminal-dark overflow-hidden">
            <div
              className={`h-full ${getBarColor(avgLoyalty)}`}
              style={{ width: `${avgLoyalty}%` }}
            />
          </div>
        </div>
      </div>

      {/* Culture Metrics */}
      <div className="border-t border-terminal-green-dark pt-2">
        <div className="text-terminal-dark text-xs font-mono mb-2">CULTURE</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="border border-terminal-green-dark p-1.5">
            <div className="text-terminal-dark">Speed</div>
            <div className="text-terminal-cyan font-mono">{(culture.speed * 100).toFixed(0)}%</div>
          </div>
          <div className="border border-terminal-green-dark p-1.5">
            <div className="text-terminal-dark">Quality</div>
            <div className="text-terminal-cyan font-mono">
              {(culture.quality * 100).toFixed(0)}%
            </div>
          </div>
          <div className="border border-terminal-green-dark p-1.5">
            <div className="text-terminal-dark">Work/Life</div>
            <div className="text-terminal-cyan font-mono">
              {(culture.workLife * 100).toFixed(0)}%
            </div>
          </div>
          <div className="border border-terminal-green-dark p-1.5">
            <div className="text-terminal-dark">Hierarchy</div>
            <div className="text-terminal-cyan font-mono">
              {(culture.hierarchy * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Reputation */}
      <div className="border-t border-terminal-green-dark pt-2">
        <div className="flex justify-between items-center">
          <span className="text-terminal-dim text-xs flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Reputation
          </span>
          <span
            className={`font-mono font-bold ${company.reputation >= 70 ? 'text-terminal-green' : company.reputation >= 40 ? 'text-terminal-amber' : 'text-terminal-red'}`}
          >
            {company.reputation}/100
          </span>
        </div>
        <div className="h-1.5 bg-terminal-dark overflow-hidden mt-1">
          <div
            className={`h-full ${getBarColor(company.reputation)}`}
            style={{ width: `${company.reputation}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default MetricsPanel;
