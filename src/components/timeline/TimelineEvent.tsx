import type { MouseEvent } from 'react';

interface TimelineEventData {
  id: string;
  month: number;
  type: 'employee' | 'project' | 'finance' | 'culture' | 'event' | 'achievement' | 'milestone';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  details?: Record<string, string | number>;
}

interface TimelineEventProps {
  event: TimelineEventData;
  onHover: (event: TimelineEventData, e: MouseEvent) => void;
  onLeave: () => void;
  index: number;
}

const typeIcons: Record<TimelineEventData['type'], string> = {
  employee: '👤',
  project: '📁',
  finance: '💰',
  culture: '❤️',
  event: '⚡',
  achievement: '🏆',
  milestone: '🎯',
};

const impactColors: Record<TimelineEventData['impact'], string> = {
  positive: 'border-terminal-green text-terminal-green',
  negative: 'border-terminal-red text-terminal-red',
  neutral: 'border-terminal-amber text-terminal-amber',
};

export function TimelineEvent({ event, onHover, onLeave, index }: TimelineEventProps) {
  return (
    <div
      className={`
        w-8 h-8 flex items-center justify-center text-xs cursor-pointer
        border bg-terminal transition-all duration-200 hover:scale-110
        ${impactColors[event.impact]}
      `}
      style={{
        marginTop: index * 4,
      }}
      onMouseEnter={(e) => onHover(event, e)}
      onMouseLeave={onLeave}
      title={event.title}
    >
      {typeIcons[event.type]}
    </div>
  );
}

export default TimelineEvent;
