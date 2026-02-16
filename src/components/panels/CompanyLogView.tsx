import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { terminalSound } from '@/utils/terminalSound';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Search,
  Copy,
  X,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  Zap,
  ChevronDown,
  ChevronUp,
  Maximize2,
} from 'lucide-react';

type LogCategory = 'all' | 'financial' | 'personnel' | 'projects' | 'events';
type LogEntryType =
  | 'financial-positive'
  | 'financial-negative'
  | 'financial-neutral'
  | 'personnel'
  | 'project'
  | 'event';

interface LogEntry {
  id: string;
  month: number;
  type: LogEntryType;
  category: LogCategory;
  title: string;
  details?: string[];
  cash: number;
  timestamp: number;
}

interface CompanyLogViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyLogView({ open, onOpenChange }: CompanyLogViewProps) {
  const { company } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LogCategory>('all');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate log entries from company history
  const logEntries = useMemo(() => {
    if (!company) return [];

    const entries: LogEntry[] = [];

    company.history.forEach((snapshot, index) => {
      const prevSnapshot = index > 0 ? company.history[index - 1] : null;

      // Financial events
      if (snapshot.financials.netCashflow > 10000) {
        entries.push({
          id: `financial-positive-${snapshot.month}`,
          month: snapshot.month,
          type: 'financial-positive',
          category: 'financial',
          title: `High profit: +$${snapshot.financials.netCashflow.toLocaleString()}`,
          details: [
            `Revenue: +$${snapshot.financials.revenue.toLocaleString()}`,
            `Expenses: -$${(snapshot.financials.payroll + snapshot.financials.tools + snapshot.financials.rent + snapshot.financials.otherExpenses).toLocaleString()}`,
            `Net: +$${snapshot.financials.netCashflow.toLocaleString()}`,
          ],
          cash: snapshot.cash,
          timestamp: Date.now() - (company.history.length - index) * 1000,
        });
      } else if (snapshot.financials.netCashflow < -5000) {
        entries.push({
          id: `financial-negative-${snapshot.month}`,
          month: snapshot.month,
          type: 'financial-negative',
          category: 'financial',
          title: `Warning: Loss of $${Math.abs(snapshot.financials.netCashflow).toLocaleString()}`,
          details: [
            `Revenue: +$${snapshot.financials.revenue.toLocaleString()}`,
            `Expenses: -$${(snapshot.financials.payroll + snapshot.financials.tools + snapshot.financials.rent + snapshot.financials.otherExpenses).toLocaleString()}`,
            `Net: -$${Math.abs(snapshot.financials.netCashflow).toLocaleString()}`,
          ],
          cash: snapshot.cash,
          timestamp: Date.now() - (company.history.length - index) * 1000,
        });
      }

      // Personnel events
      if (prevSnapshot) {
        const empDiff = snapshot.employeeCount - prevSnapshot.employeeCount;
        if (empDiff > 0) {
          // Find the new employees in this month
          const newEmployees = company.employees.filter(
            (e) => e.hiredMonth === snapshot.month && !e.quitMonth
          );
          newEmployees.forEach((emp) => {
            entries.push({
              id: `hire-${emp.id}`,
              month: snapshot.month,
              type: 'personnel',
              category: 'personnel',
              title: `Hired ${emp.name} (${emp.role})`,
              details: [
                `Role: ${emp.role}`,
                `Personality: ${emp.personality}`,
                `Salary: $${emp.salary.toLocaleString()}/month`,
                `Skills: Tech ${emp.skills.technical}, Sales ${emp.skills.sales}, Design ${emp.skills.design}, Mgmt ${emp.skills.management}`,
              ],
              cash: snapshot.cash,
              timestamp: Date.now() - (company.history.length - index) * 1000,
            });
          });
        }
        if (empDiff < 0) {
          // Find employees who quit this month
          const quitEmployees = company.employees.filter((e) => e.quitMonth === snapshot.month);
          quitEmployees.forEach((emp) => {
            entries.push({
              id: `quit-${emp.id}`,
              month: snapshot.month,
              type: 'personnel',
              category: 'personnel',
              title: `${emp.name} left the company`,
              details: [
                `Role: ${emp.role}`,
                `Tenure: ${emp.quitMonth! - emp.hiredMonth} months`,
                `Final morale: ${emp.morale}%`,
              ],
              cash: snapshot.cash,
              timestamp: Date.now() - (company.history.length - index) * 1000,
            });
          });
        }
      }

      // Project events
      const monthProjects = company.projects.filter(
        (p) => p.startMonth === snapshot.month || p.completedMonth === snapshot.month
      );
      monthProjects.forEach((project) => {
        if (project.startMonth === snapshot.month) {
          entries.push({
            id: `project-start-${project.id}`,
            month: snapshot.month,
            type: 'project',
            category: 'projects',
            title: `Started project: ${project.name}`,
            details: [
              `Type: ${project.type}`,
              `Complexity: ${project.complexity}/10`,
              `Estimated duration: ${project.estimatedMonths} months`,
              `Value: $${project.value.toLocaleString()}`,
            ],
            cash: snapshot.cash,
            timestamp: Date.now() - (company.history.length - index) * 1000,
          });
        }
        if (project.completedMonth === snapshot.month) {
          entries.push({
            id: `project-complete-${project.id}`,
            month: snapshot.month,
            type: 'project',
            category: 'projects',
            title: `Completed project: ${project.name}`,
            details: [
              `Quality: ${project.quality.toFixed(0)}%`,
              `Revenue: +$${project.value.toLocaleString()}`,
              `Tech debt: ${project.techDebt.toFixed(0)}%`,
              `Duration: ${project.completedMonth! - project.startMonth!} months`,
            ],
            cash: snapshot.cash,
            timestamp: Date.now() - (company.history.length - index) * 1000,
          });
        }
      });

      // Game events (random/triggered/milestone)
      const monthEvents = company.events.filter((e) => e.monthOccurred === snapshot.month);
      monthEvents.forEach((event) => {
        entries.push({
          id: `event-${event.id}`,
          month: snapshot.month,
          type: 'event',
          category: 'events',
          title: event.title,
          details: [event.description],
          cash: snapshot.cash,
          timestamp: Date.now() - (company.history.length - index) * 1000,
        });
      });

      // Add default "Month completed" if no other events
      if (entries.filter((e) => e.month === snapshot.month).length === 0) {
        entries.push({
          id: `month-${snapshot.month}`,
          month: snapshot.month,
          type: 'financial-neutral',
          category: 'financial',
          title: 'Month completed',
          details: [
            `Revenue: +$${snapshot.financials.revenue.toLocaleString()}`,
            `Expenses: -$${(snapshot.financials.payroll + snapshot.financials.tools + snapshot.financials.rent + snapshot.financials.otherExpenses).toLocaleString()}`,
            `Net: ${snapshot.financials.netCashflow >= 0 ? '+' : ''}$${snapshot.financials.netCashflow.toLocaleString()}`,
          ],
          cash: snapshot.cash,
          timestamp: Date.now() - (company.history.length - index) * 1000,
        });
      }
    });

    // Sort by month ascending, then by timestamp
    return entries.sort((a, b) => {
      if (a.month !== b.month) return b.month - a.month; // Newest first
      return b.timestamp - a.timestamp;
    });
  }, [company]);

  // Filter entries based on category and search
  const filteredEntries = useMemo(() => {
    let filtered = logEntries;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((entry) => entry.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          entry.details?.some((d) => d.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [logEntries, selectedCategory, searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = prev < filteredEntries.length - 1 ? prev + 1 : prev;
          return newIndex;
        });
        terminalSound.playKeystroke();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : prev;
          return newIndex;
        });
        terminalSound.playKeystroke();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredEntries.length) {
          const entry = filteredEntries[selectedIndex];
          toggleExpanded(entry.id);
          terminalSound.playEnter();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredEntries, selectedIndex, onOpenChange]);

  // Focus search input on open
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Reset selected index when filters change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery, selectedCategory]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const copyToClipboard = useCallback(() => {
    const text = filteredEntries
      .map((entry) => {
        let line = `[M${entry.month}] ${entry.title}`;
        if (entry.details && entry.details.length > 0) {
          line += '\n  ' + entry.details.join('\n  ');
        }
        return line;
      })
      .join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      terminalSound.playBell();
    });
  }, [filteredEntries]);

  const getEntryIcon = (type: LogEntryType) => {
    switch (type) {
      case 'financial-positive':
        return <TrendingUp className="w-4 h-4 text-terminal-green" />;
      case 'financial-negative':
        return <TrendingDown className="w-4 h-4 text-terminal-red" />;
      case 'financial-neutral':
        return <TrendingUp className="w-4 h-4 text-terminal-dim" />;
      case 'personnel':
        return <Users className="w-4 h-4 text-terminal-cyan" />;
      case 'project':
        return <Briefcase className="w-4 h-4 text-terminal-amber" />;
      case 'event':
        return <Zap className="w-4 h-4 text-terminal-white" />;
      default:
        return null;
    }
  };

  const getEntryColor = (type: LogEntryType) => {
    switch (type) {
      case 'financial-positive':
        return 'text-terminal-green';
      case 'financial-negative':
        return 'text-terminal-red';
      case 'financial-neutral':
        return 'text-terminal-dim';
      case 'personnel':
        return 'text-terminal-cyan';
      case 'project':
        return 'text-terminal-amber';
      case 'event':
        return 'text-terminal-white';
      default:
        return 'text-terminal-green';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl bg-terminal border-l border-terminal-green-dark p-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-3 border-b border-terminal-green-dark bg-terminal-dark shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-terminal-green font-mono font-bold flex items-center gap-2">
              <Maximize2 className="w-4 h-4" />
              COMPANY LOG
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="text-terminal-dim hover:text-terminal-green hover:bg-terminal-green/10"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-terminal-dim hover:text-terminal-red hover:bg-terminal-red/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-dim" />
            <Input
              ref={inputRef}
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-terminal border-terminal-green-dark text-terminal-green placeholder:text-terminal-dim/50 font-mono text-sm focus-visible:ring-terminal-green/30"
            />
          </div>

          {/* Category Tabs */}
          <Tabs
            value={selectedCategory}
            onValueChange={(v) => setSelectedCategory(v as LogCategory)}
            className="mt-3"
          >
            <TabsList className="bg-terminal-green/5 border border-terminal-green-dark w-full justify-start">
              <TabsTrigger
                value="all"
                className="text-terminal-dim data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green font-mono text-xs"
              >
                All ({logEntries.length})
              </TabsTrigger>
              <TabsTrigger
                value="financial"
                className="text-terminal-dim data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green font-mono text-xs"
              >
                Financial
              </TabsTrigger>
              <TabsTrigger
                value="personnel"
                className="text-terminal-dim data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green font-mono text-xs"
              >
                Personnel
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="text-terminal-dim data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green font-mono text-xs"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="text-terminal-dim data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green font-mono text-xs"
              >
                Events
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </SheetHeader>

        {/* Log Entries */}
        <ScrollArea className="flex-1" ref={listRef}>
          <div className="p-2 space-y-1">
            {filteredEntries.length === 0 ? (
              <div className="text-terminal-dim text-center py-8 font-mono text-sm">
                {searchQuery ? 'No events match your search' : 'No events in this category'}
              </div>
            ) : (
              filteredEntries.map((entry, index) => {
                const isExpanded = expandedEntries.has(entry.id);
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={entry.id}
                    className={`
                      border-l-2 pl-3 py-2 cursor-pointer transition-colors
                      ${isSelected ? 'bg-terminal-green/10' : 'hover:bg-terminal-green/5'}
                      ${entry.type === 'financial-negative' ? 'border-terminal-red' : 'border-terminal-green-dark'}
                    `}
                    onClick={() => {
                      setSelectedIndex(index);
                      toggleExpanded(entry.id);
                      terminalSound.playKeystroke();
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {getEntryIcon(entry.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-terminal-dim text-xs font-mono shrink-0">
                              [M{entry.month}]
                            </span>
                            <span
                              className={`font-mono text-sm truncate ${getEntryColor(entry.type)}`}
                            >
                              {entry.title}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-terminal-dim text-xs font-mono">
                          ${entry.cash.toLocaleString()}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3 text-terminal-dim" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-terminal-dim" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && entry.details && entry.details.length > 0 && (
                      <div className="mt-2 ml-6 space-y-1">
                        {entry.details.map((detail, idx) => (
                          <div key={idx} className="text-terminal-dim text-xs font-mono">
                            └─ {detail}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-terminal-green-dark bg-terminal-dark shrink-0">
          <div className="flex items-center justify-between text-terminal-dim text-xs font-mono">
            <span>
              {filteredEntries.length} event
              {filteredEntries.length !== 1 ? 's' : ''}
            </span>
            <span>Use ↑↓ to navigate, Enter to expand, ESC to close</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default CompanyLogView;
