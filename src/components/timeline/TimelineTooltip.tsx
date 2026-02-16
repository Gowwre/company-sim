interface TimelineTooltipProps {
  event: {
    id: string;
    month: number;
    type: string;
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    details?: Record<string, string | number>;
  };
  position: { x: number; y: number };
}

const typeLabels: Record<string, string> = {
  employee: 'EMPLOYEE',
  project: 'PROJECT',
  finance: 'FINANCE',
  culture: 'CULTURE',
  event: 'EVENT',
  achievement: 'ACHIEVEMENT',
  milestone: 'MILESTONE',
};

const impactLabels: Record<string, { label: string; color: string }> = {
  positive: { label: 'POSITIVE', color: 'text-terminal-green' },
  negative: { label: 'NEGATIVE', color: 'text-terminal-red' },
  neutral: { label: 'NEUTRAL', color: 'text-terminal-amber' },
};

export function TimelineTooltip({ event, position }: TimelineTooltipProps) {
  const impact = impactLabels[event.impact];

  return (
    <div
      className="fixed z-50 bg-terminal border border-terminal-green p-3 shadow-lg max-w-xs pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-terminal-green-dark">
        <span className="text-terminal-dim text-xs font-mono">
          {typeLabels[event.type] || event.type.toUpperCase()}
        </span>
        <span className={`text-xs font-mono ${impact.color}`}>{impact.label}</span>
      </div>

      {/* Title */}
      <h3 className="text-terminal-green font-mono font-bold text-sm mb-1">{event.title}</h3>

      {/* Month */}
      <div className="text-terminal-dark text-xs font-mono mb-2">Month {event.month}</div>

      {/* Description */}
      <p className="text-terminal-dim text-xs mb-3 leading-relaxed">{event.description}</p>

      {/* Details */}
      {event.details && Object.keys(event.details).length > 0 && (
        <div className="border-t border-terminal-green-dark pt-2 space-y-1">
          {Object.entries(event.details).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-terminal-dark">{key}:</span>
              <span className="text-terminal-cyan font-mono">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TimelineTooltip;
