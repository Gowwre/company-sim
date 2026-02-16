import { useGameStore } from '@/store/gameStore';
import { useMemo, useState } from 'react';
import { TimelineEvent } from './TimelineEvent';
import { TimelineTooltip } from './TimelineTooltip';
import { achievements } from '@/data/achievements';

interface TimelineEvent {
  id: string;
  month: number;
  type: 'employee' | 'project' | 'finance' | 'culture' | 'event' | 'achievement' | 'milestone';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  details?: Record<string, string | number>;
}

export function TimelineView() {
  const { company } = useGameStore();
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!company) return null;

  // Transform company data into timeline events
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Process each month's snapshot
    company.history.forEach((snapshot, index) => {
      const prevSnapshot = index > 0 ? company.history[index - 1] : null;

      // Employee changes
      if (prevSnapshot) {
        const empDiff = snapshot.employeeCount - prevSnapshot.employeeCount;
        if (empDiff > 0) {
          events.push({
            id: `hire-${snapshot.month}`,
            month: snapshot.month,
            type: 'employee',
            title: 'New Hires',
            description: `${empDiff} employee(s) joined the company`,
            impact: 'positive',
            details: { 'Team Size': snapshot.employeeCount },
          });
        }
        if (empDiff < 0) {
          events.push({
            id: `quit-${snapshot.month}`,
            month: snapshot.month,
            type: 'employee',
            title: 'Employee Departures',
            description: `${Math.abs(empDiff)} employee(s) left the company`,
            impact: 'negative',
            details: { Remaining: snapshot.employeeCount },
          });
        }
      }

      // Project changes
      if (prevSnapshot) {
        const projDiff = snapshot.activeProjects - prevSnapshot.activeProjects;
        if (projDiff > 0) {
          events.push({
            id: `proj-start-${snapshot.month}`,
            month: snapshot.month,
            type: 'project',
            title: 'Project Started',
            description: `${projDiff} new project(s) initiated`,
            impact: 'neutral',
            details: { 'Active Projects': snapshot.activeProjects },
          });
        }
        const completedDiff = snapshot.completedProjects - prevSnapshot.completedProjects;
        if (completedDiff > 0) {
          events.push({
            id: `proj-complete-${snapshot.month}`,
            month: snapshot.month,
            type: 'project',
            title: 'Project Completed',
            description: `${completedDiff} project(s) finished`,
            impact: 'positive',
            details: { 'Total Completed': snapshot.completedProjects },
          });
        }
      }

      // Financial milestones
      if (snapshot.cash >= 100000 && (!prevSnapshot || prevSnapshot.cash < 100000)) {
        events.push({
          id: `milestone-100k-${snapshot.month}`,
          month: snapshot.month,
          type: 'milestone',
          title: '$100K Milestone',
          description: 'Company cash reserves reached $100,000',
          impact: 'positive',
          details: { Cash: `$${snapshot.cash.toLocaleString()}` },
        });
      }
      if (snapshot.cash >= 500000 && (!prevSnapshot || prevSnapshot.cash < 500000)) {
        events.push({
          id: `milestone-500k-${snapshot.month}`,
          month: snapshot.month,
          type: 'milestone',
          title: '$500K Milestone',
          description: 'Company cash reserves reached $500,000',
          impact: 'positive',
          details: { Cash: `$${snapshot.cash.toLocaleString()}` },
        });
      }

      // Financial performance
      const netFlow = snapshot.financials.netCashflow;
      if (netFlow > 20000) {
        events.push({
          id: `profit-${snapshot.month}`,
          month: snapshot.month,
          type: 'finance',
          title: 'High Profit Month',
          description: `Exceptional profit: +$${netFlow.toLocaleString()}`,
          impact: 'positive',
          details: {
            Revenue: `$${snapshot.financials.revenue.toLocaleString()}`,
            'Net Flow': `+$${netFlow.toLocaleString()}`,
          },
        });
      }
      if (netFlow < -10000) {
        events.push({
          id: `loss-${snapshot.month}`,
          month: snapshot.month,
          type: 'finance',
          title: 'High Loss Month',
          description: `Significant loss: -$${Math.abs(netFlow).toLocaleString()}`,
          impact: 'negative',
          details: {
            Expenses: `$${(snapshot.financials.payroll + snapshot.financials.tools + snapshot.financials.rent).toLocaleString()}`,
            'Net Flow': `-$${Math.abs(netFlow).toLocaleString()}`,
          },
        });
      }
    });

    // Add resolved events
    company.events
      .filter((e) => e.resolved)
      .forEach((event) => {
        events.push({
          id: `event-${event.id}`,
          month: event.monthOccurred || 1,
          type: 'event',
          title: event.title,
          description: event.description.substring(0, 100) + '...',
          impact: 'neutral',
          details: { Type: event.type },
        });
      });

    // Add unlocked achievements
    company.unlockedAchievements.forEach((achievementId, index) => {
      // Estimate month based on index (simplified)
      const estimatedMonth = Math.min(index + 1, company.currentMonth);
      const achievement = achievements.find((a) => a.id === achievementId);
      const achievementName = achievement?.name || achievementId;
      const achievementDesc = achievement?.description || '';

      events.push({
        id: `achievement-${achievementId}`,
        month: estimatedMonth,
        type: 'achievement',
        title: achievementName,
        description: achievementDesc,
        impact: 'positive',
        details: achievement ? { Rarity: achievement.rarity } : { ID: achievementId },
      });
    });

    // Sort by month
    return events.sort((a, b) => a.month - b.month);
  }, [company]);

  // Group events by month
  const eventsByMonth = useMemo(() => {
    const grouped: Record<number, TimelineEvent[]> = {};
    timelineEvents.forEach((event) => {
      if (!grouped[event.month]) {
        grouped[event.month] = [];
      }
      grouped[event.month].push(event);
    });
    return grouped;
  }, [timelineEvents]);

  // Get all months to display
  const months = useMemo(() => {
    const maxMonth = company.currentMonth;
    return Array.from({ length: maxMonth }, (_, i) => i + 1);
  }, [company.currentMonth]);

  const handleEventHover = (event: TimelineEvent, e: React.MouseEvent) => {
    setHoveredEvent(event);
    setTooltipPos({ x: e.clientX, y: e.clientY - 100 });
  };

  const handleEventLeave = () => {
    setHoveredEvent(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-terminal-green font-mono text-lg font-bold tracking-wider">
          COMPANY TIMELINE
        </h2>
        <div className="text-terminal-dim text-xs font-mono">
          MONTH 1 → {company.currentMonth} | {timelineEvents.length} EVENTS
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="min-w-max p-4">
          {/* Month Labels Row */}
          <div className="flex mb-4">
            {months.map((month) => (
              <div
                key={month}
                className={`
                  w-16 flex-shrink-0 text-center font-mono text-xs border-b-2 pb-2
                  ${
                    month === company.currentMonth
                      ? 'border-terminal-green text-terminal-green font-bold'
                      : 'border-terminal-green-dark text-terminal-dark'
                  }
                `}
              >
                M{month}
              </div>
            ))}
          </div>

          {/* Timeline Track */}
          <div className="relative">
            {/* Base Line */}
            <div className="absolute top-3 left-0 right-0 h-0.5 bg-terminal-green-dark" />

            {/* Event Markers */}
            <div className="flex">
              {months.map((month) => {
                const monthEvents = eventsByMonth[month] || [];
                const hasEvents = monthEvents.length > 0;

                return (
                  <div key={month} className="w-16 flex-shrink-0 flex flex-col items-center">
                    {/* Month Indicator */}
                    <div
                      className={`
                        w-3 h-3 rounded-full border-2 z-10 mb-2
                        ${
                          month === company.currentMonth
                            ? 'bg-terminal-green border-terminal-green animate-pulse'
                            : hasEvents
                              ? 'bg-terminal-dark border-terminal-dim'
                              : 'bg-terminal-dark border-terminal-green-dark'
                        }
                      `}
                    />

                    {/* Events Stack */}
                    <div className="flex flex-col gap-1 mt-1">
                      {monthEvents.slice(0, 3).map((event, idx) => (
                        <TimelineEvent
                          key={event.id}
                          event={event}
                          onHover={handleEventHover}
                          onLeave={handleEventLeave}
                          index={idx}
                        />
                      ))}
                      {monthEvents.length > 3 && (
                        <div className="text-terminal-dark text-xs font-mono text-center">
                          +{monthEvents.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Row */}
          <div className="flex mt-8 pt-4 border-t border-terminal-green-dark">
            {months.map((month) => {
              const snapshot = company.history.find((h) => h.month === month);
              return (
                <div key={month} className="w-16 flex-shrink-0 text-center">
                  {snapshot && (
                    <div className="space-y-1">
                      <div
                        className={`
                        text-xs font-mono
                        ${snapshot.cash >= 0 ? 'text-terminal-green' : 'text-terminal-red'}
                      `}
                      >
                        ${(snapshot.cash / 1000).toFixed(1)}K
                      </div>
                      <div className="text-terminal-dark text-xs font-mono">
                        {snapshot.employeeCount}👤
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredEvent && <TimelineTooltip event={hoveredEvent} position={tooltipPos} />}
    </div>
  );
}

export default TimelineView;
