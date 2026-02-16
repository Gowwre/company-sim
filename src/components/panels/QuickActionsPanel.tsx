import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, FolderPlus, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function QuickActionsPanel() {
  const { company, hireEmployee, advanceMonth, setView } = useGameStore();

  if (!company) return null;

  const handleHire = () => {
    if (company.cash < 5000) {
      toast.error('Insufficient funds (need $5,000)');
      return;
    }
    const newEmployee = hireEmployee();
    if (newEmployee) {
      toast.success(`Hiring candidate: ${newEmployee.name}`);
      setView('employees');
    }
  };

  const handleNewProject = () => {
    setView('projects');
    toast('Select project type to create', { icon: '💼' });
  };

  const handleNextMonth = () => {
    advanceMonth();
    toast.success(`Advanced to Month ${company.currentMonth + 1}`);
  };

  return (
    <div className="p-3 space-y-2">
      {/* Next Month - Primary Action */}
      <Button
        onClick={handleNextMonth}
        className="w-full bg-terminal-green text-terminal-bg hover:bg-terminal-green/90 font-mono font-bold text-xs h-10"
      >
        <ArrowRight className="w-4 h-4 mr-2" />
        NEXT MONTH
      </Button>

      <div className="border-t border-terminal-green-dark pt-2 space-y-2">
        {/* Hire */}
        <Button
          onClick={handleHire}
          disabled={company.cash < 5000}
          variant="outline"
          className="w-full border-terminal-green text-terminal-green hover:bg-terminal-green/10 font-mono text-xs h-8 disabled:opacity-50"
        >
          <UserPlus className="w-3.5 h-3.5 mr-2" />
          HIRE ($5K)
        </Button>

        {/* Fire - Navigate to employees */}
        <Button
          onClick={() => setView('employees')}
          variant="outline"
          className="w-full border-terminal-red text-terminal-red hover:bg-terminal-red/10 font-mono text-xs h-8"
        >
          <UserMinus className="w-3.5 h-3.5 mr-2" />
          MANAGE STAFF
        </Button>

        {/* New Project */}
        <Button
          onClick={handleNewProject}
          variant="outline"
          className="w-full border-terminal-amber text-terminal-amber hover:bg-terminal-amber/10 font-mono text-xs h-8"
        >
          <FolderPlus className="w-3.5 h-3.5 mr-2" />
          NEW PROJECT
        </Button>
      </div>

      {/* Status Summary */}
      <div className="border-t border-terminal-green-dark pt-2 mt-2">
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="text-center border border-terminal-green-dark p-1.5">
            <div className="text-terminal-dark">CASH</div>
            <div
              className={`font-bold ${company.cash >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}
            >
              ${(company.cash / 1000).toFixed(1)}K
            </div>
          </div>
          <div className="text-center border border-terminal-green-dark p-1.5">
            <div className="text-terminal-dark">RUNWAY</div>
            <div className="text-terminal-cyan font-bold">
              {company.cash > 0 ? Math.floor(company.cash / 10000) : 0} mo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickActionsPanel;
