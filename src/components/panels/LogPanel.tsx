import { useGameStore } from '@/store/gameStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';

export function LogPanel() {
  const { company, setShowCompanyLog } = useGameStore();

  if (!company) return null;

  // Generate log entries from company history
  const logEntries = company.history
    .slice(-20)
    .reverse()
    .map((snapshot) => {
      const events: string[] = [];

      // Check for employee changes
      const prevSnapshot = company.history.find((h) => h.month === snapshot.month - 1);
      if (prevSnapshot) {
        const empDiff = snapshot.employeeCount - prevSnapshot.employeeCount;
        if (empDiff > 0) events.push(`Hired ${empDiff} employee(s)`);
        if (empDiff < 0) events.push(`${Math.abs(empDiff)} employee(s) quit`);
      }

      // Check for project changes
      const prevProjects = prevSnapshot?.activeProjects || 0;
      const projDiff = snapshot.activeProjects - prevProjects;
      if (projDiff > 0) events.push(`Started ${projDiff} project(s)`);

      // Financial events
      if (snapshot.financials.netCashflow > 10000) {
        events.push(`High profit: +$${snapshot.financials.netCashflow.toLocaleString()}`);
      }
      if (snapshot.financials.netCashflow < -5000) {
        events.push(
          `Warning: Loss of $${Math.abs(snapshot.financials.netCashflow).toLocaleString()}`
        );
      }

      return {
        month: snapshot.month,
        events: events.length > 0 ? events : ['Month completed'],
        cash: snapshot.cash,
      };
    });

  return (
    <div className="h-full flex flex-col">
      {/* Expand Button Header */}
      <div className="flex items-center justify-end px-2 py-1 border-b border-terminal-green-dark/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCompanyLog(true)}
          className="h-6 px-2 text-terminal-dim hover:text-terminal-green hover:bg-terminal-green/10 text-xs font-mono"
        >
          <Maximize2 className="w-3 h-3 mr-1" />
          View Full Log
        </Button>
      </div>

      {/* Log Entries */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {logEntries.map((entry) => (
            <div
              key={entry.month}
              className="text-xs font-mono border-l-2 border-terminal-green-dark pl-2 py-1"
            >
              <div className="text-terminal-dim mb-1">
                [M{entry.month}] ${entry.cash.toLocaleString()}
              </div>
              {entry.events.map((event, idx) => (
                <div key={idx} className="text-terminal-green ml-2">
                  {'>'} {event}
                </div>
              ))}
            </div>
          ))}
          {logEntries.length === 0 && (
            <div className="text-terminal-dark text-xs font-mono text-center py-4">
              No history available
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default LogPanel;
