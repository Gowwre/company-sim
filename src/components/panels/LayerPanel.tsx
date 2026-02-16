import { useState } from 'react';
import {
  Users,
  FolderKanban,
  DollarSign,
  Heart,
  Award,
  AlertCircle,
  Target,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface Layer {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const layers: Layer[] = [
  {
    id: 'employees',
    label: 'EMPLOYEES',
    icon: Users,
    color: 'text-terminal-cyan',
    description: 'Hires, quits, and team growth',
  },
  {
    id: 'projects',
    label: 'PROJECTS',
    icon: FolderKanban,
    color: 'text-terminal-amber',
    description: 'Project start, completion, and milestones',
  },
  {
    id: 'finances',
    label: 'FINANCES',
    icon: DollarSign,
    color: 'text-terminal-green',
    description: 'Cash flow, revenue, and expenses',
  },
  {
    id: 'culture',
    label: 'CULTURE',
    icon: Heart,
    color: 'text-terminal-red',
    description: 'Culture metrics and morale changes',
  },
  {
    id: 'events',
    label: 'EVENTS',
    icon: AlertCircle,
    color: 'text-terminal-white',
    description: 'Random events and milestones',
  },
  {
    id: 'achievements',
    label: 'ACHIEVEMENTS',
    icon: Award,
    color: 'text-terminal-amber',
    description: 'Unlocked achievements and awards',
  },
  {
    id: 'milestones',
    label: 'MILESTONES',
    icon: Target,
    color: 'text-terminal-cyan',
    description: 'Company milestones and goals',
  },
];

export function LayerPanel() {
  const [activeLayers, setActiveLayers] = useState<Set<string>>(
    new Set(['employees', 'projects', 'events'])
  );
  const [expanded, setExpanded] = useState(true);

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
      } else {
        newSet.add(layerId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-3">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full mb-3 text-terminal-green font-mono text-xs font-bold tracking-wider"
      >
        <span>LAYERS</span>
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="space-y-1">
          {layers.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayers.has(layer.id);

            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`
                  w-full flex items-center gap-2 px-2 py-1.5 text-xs font-mono
                  border transition-all duration-150
                  ${
                    isActive
                      ? `border-terminal-green bg-terminal-green/10 ${layer.color}`
                      : 'border-terminal-green-dark text-terminal-dark hover:border-terminal-dim hover:text-terminal-dim'
                  }
                `}
                title={layer.description}
              >
                <span
                  className={`
                  w-4 h-4 flex items-center justify-center border
                  ${isActive ? 'border-current' : 'border-terminal-green-dark'}
                `}
                >
                  {isActive && '✓'}
                </span>
                <Icon className="w-3.5 h-3.5" />
                <span className="flex-1 text-left">{layer.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-terminal-green-dark">
        <div className="text-terminal-dark text-xs font-mono mb-2">LEGEND</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terminal-red" />
            <span className="text-terminal-dark text-xs">Critical Event</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terminal-amber" />
            <span className="text-terminal-dark text-xs">Important</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terminal-green" />
            <span className="text-terminal-dark text-xs">Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terminal-cyan" />
            <span className="text-terminal-dark text-xs">Information</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LayerPanel;
