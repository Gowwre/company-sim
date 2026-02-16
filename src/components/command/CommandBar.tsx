import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { toast } from 'react-hot-toast';
import { ChevronRight, Terminal } from 'lucide-react';

type ActionType = 'hire' | 'fire' | 'assign' | 'create' | 'advance';

interface CommandOption {
  value: string;
  label: string;
}

const actions: { type: ActionType; label: string; requiresTarget: boolean }[] = [
  { type: 'hire', label: 'HIRE', requiresTarget: false },
  { type: 'fire', label: 'FIRE', requiresTarget: true },
  { type: 'assign', label: 'ASSIGN', requiresTarget: true },
  { type: 'create', label: 'CREATE', requiresTarget: false },
  { type: 'advance', label: 'ADVANCE', requiresTarget: false },
];

export function CommandBar() {
  const { company, hireEmployee, fireEmployee, advanceMonth, setView } = useGameStore();
  const [selectedAction, setSelectedAction] = useState<ActionType>('advance');
  const [selectedTarget, setSelectedTarget] = useState('');

  if (!company) return null;

  const getTargetsForAction = (action: ActionType): CommandOption[] => {
    switch (action) {
      case 'fire':
        return company.employees
          .filter((e) => !e.quitMonth && e.name !== 'You')
          .map((e) => ({ value: e.id, label: e.name }));
      case 'assign':
        return company.employees
          .filter((e) => !e.quitMonth)
          .map((e) => ({ value: e.id, label: e.name }));
      case 'create':
        return [
          { value: 'clientWork', label: 'Client Project' },
          { value: 'productFeature', label: 'Feature' },
          { value: 'maintenance', label: 'Maintenance' },
          { value: 'rnd', label: 'R&D' },
        ];
      default:
        return [];
    }
  };

  const handleExecute = () => {
    switch (selectedAction) {
      case 'hire':
        if (company.cash < 5000) {
          toast.error('Insufficient funds (need $5,000)');
          return;
        }
        const newEmployee = hireEmployee();
        if (newEmployee) {
          toast.success(`Reviewing candidate: ${newEmployee.name}`);
          setView('employees');
        }
        break;

      case 'fire':
        if (selectedTarget) {
          const success = fireEmployee(selectedTarget);
          if (success) {
            toast.success('Employee terminated');
          } else {
            toast.error('Cannot fire - insufficient severance funds');
          }
        } else {
          toast.error('Select an employee to fire');
        }
        break;

      case 'assign':
        setView('projects');
        toast('Select a project to assign employee');
        break;

      case 'create':
        setView('projects');
        if (selectedTarget) {
          toast(`Ready to create ${selectedTarget} project`);
        } else {
          toast('Select project type');
        }
        break;

      case 'advance':
        advanceMonth();
        toast.success(`Advanced to Month ${company.currentMonth + 1}`);
        break;
    }

    // Reset selections
    setSelectedTarget('');
  };

  const currentAction = actions.find((a) => a.type === selectedAction);
  const targets = getTargetsForAction(selectedAction);
  const showTarget = currentAction?.requiresTarget || selectedAction === 'create';

  return (
    <div className="flex-none h-14 border-t border-terminal-green-dark bg-terminal-dark flex items-center px-4 gap-3">
      {/* Terminal Icon */}
      <div className="flex items-center gap-2 text-terminal-green">
        <Terminal className="w-4 h-4" />
        <span className="text-xs font-mono font-bold">CMD</span>
      </div>

      <div className="h-6 w-px bg-terminal-green-dark" />

      {/* Action Selector */}
      <select
        value={selectedAction}
        onChange={(e) => {
          setSelectedAction(e.target.value as ActionType);
          setSelectedTarget('');
        }}
        className="bg-terminal text-terminal-green border border-terminal-green px-3 py-1 text-xs font-mono focus:outline-none focus:border-terminal-green"
      >
        {actions.map((action) => (
          <option key={action.type} value={action.type} className="bg-terminal">
            {action.label}
          </option>
        ))}
      </select>

      {/* Target Selector (if needed) */}
      {showTarget && (
        <>
          <ChevronRight className="w-4 h-4 text-terminal-dim" />
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="bg-terminal text-terminal-cyan border border-terminal-green-dark px-3 py-1 text-xs font-mono focus:outline-none focus:border-terminal-cyan min-w-[120px]"
          >
            <option value="" className="bg-terminal">
              Select...
            </option>
            {targets.map((target) => (
              <option key={target.value} value={target.value} className="bg-terminal">
                {target.label}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        className="ml-auto px-4 py-1.5 bg-terminal-green text-terminal-bg font-mono text-xs font-bold hover:bg-terminal-green/90 transition-colors border border-terminal-green"
      >
        [ EXECUTE ]
      </button>
    </div>
  );
}

export default CommandBar;
