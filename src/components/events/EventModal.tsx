import { useGameStore } from '@/store/gameStore';
import { terminalSound } from '@/utils/terminalSound';
import { useEffect, useState } from 'react';
import type { GameEvent } from '@/types';

export function EventModal() {
  const { currentEvents, resolveEvent } = useGameStore();
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  useEffect(() => {
    setCurrentEventIndex(0);
    terminalSound.playBell();
  }, [currentEvents]);

  if (currentEvents.length === 0) return null;

  const event = currentEvents[currentEventIndex];

  const handleChoice = (choiceId: string) => {
    terminalSound.playEnter();
    resolveEvent(event.id, choiceId);
  };

  const getEventTypeLabel = (type: GameEvent['type']) => {
    switch (type) {
      case 'random':
        return '⚠ RANDOM EVENT';
      case 'milestone':
        return '★ MILESTONE';
      case 'triggered':
        return '▶ TRIGGERED';
      default:
        return '● EVENT';
    }
  };

  const getConsequenceText = (choice: (typeof event.choices)[0]) => {
    const parts: string[] = [];
    if (choice.consequences.cash !== undefined) {
      parts.push(
        `CASH: ${choice.consequences.cash >= 0 ? '+' : ''}${choice.consequences.cash.toLocaleString()}`
      );
    }
    if (choice.consequences.reputation !== undefined) {
      parts.push(
        `REP: ${choice.consequences.reputation >= 0 ? '+' : ''}${choice.consequences.reputation}`
      );
    }
    if (choice.consequences.moraleChange !== undefined) {
      parts.push(
        `MORALE: ${choice.consequences.moraleChange >= 0 ? '+' : ''}${choice.consequences.moraleChange}`
      );
    }
    return parts.join(' | ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-terminal/90 p-4">
      <div className="w-full max-w-2xl border-2 border-terminal-amber bg-terminal-dark screen-flicker">
        {/* Header */}
        <div className="border-b border-terminal-amber bg-terminal-amber/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-terminal-amber font-bold">{getEventTypeLabel(event.type)}</span>
            <span className="text-terminal-dim text-sm">
              Event {currentEventIndex + 1} of {currentEvents.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-terminal-white text-lg font-bold mb-2">{event.title}</div>

          <div className="text-terminal-green mb-6">{event.description}</div>

          <div className="text-terminal-dim text-sm mb-3">SELECT A RESPONSE:</div>

          <div className="space-y-2">
            {event.choices.map((choice, index) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                className="w-full text-left border border-terminal-green-dark hover:border-terminal-green hover:bg-terminal-green/5 p-3 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-terminal-amber font-bold">[{index + 1}]</span>
                  <div className="flex-1">
                    <div className="text-terminal-white font-semibold group-hover:text-terminal-green">
                      {choice.label}
                    </div>
                    <div className="text-terminal-dim text-sm mt-1">{choice.description}</div>

                    {getConsequenceText(choice) && (
                      <div className="text-terminal-cyan text-xs mt-2">
                        {getConsequenceText(choice)}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-terminal-green-dark px-4 py-2 text-terminal-dim text-xs">
          Click a choice or press the corresponding number key
        </div>
      </div>
    </div>
  );
}

export default EventModal;
