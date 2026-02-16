import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Plus,
  Trash2,
  UserCircle,
  TrendingUp,
  AlertCircle,
  Briefcase,
  DollarSign,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { personalities } from '@/data/personalities';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Employee } from '@/types';

export function EmployeeManagement() {
  const {
    company,
    hireEmployee,
    confirmHire,
    rejectHire,
    fireEmployee,
    selectedEmployeeId,
    selectEmployee,
    pendingHire,
  } = useGameStore();

  const [fireDialogOpen, setFireDialogOpen] = useState(false);
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [employeeToFire, setEmployeeToFire] = useState<Employee | null>(null);

  if (!company) return null;

  const activeEmployees = company.employees.filter((e) => !e.quitMonth);
  const formerEmployees = company.employees.filter((e) => e.quitMonth);

  // Check for pending hire from command bar
  useEffect(() => {
    if (pendingHire) {
      setHireDialogOpen(true);
    }
  }, [pendingHire]);

  const handleHire = () => {
    const newEmployee = hireEmployee();
    if (newEmployee) {
      setHireDialogOpen(true);
    } else {
      toast.error('Not enough cash to hire (need $5,000)');
    }
  };

  const confirmHireAction = () => {
    const employee = confirmHire();
    if (employee) {
      toast.success(`Hired ${employee.name} as ${employee.role}`);
      setHireDialogOpen(false);
    }
  };

  const rejectHireAction = () => {
    rejectHire();
    setHireDialogOpen(false);
    toast('Candidate rejected');
  };

  const handleFireClick = (employee: Employee) => {
    setEmployeeToFire(employee);
    setFireDialogOpen(true);
  };

  const confirmFire = () => {
    if (employeeToFire) {
      const success = fireEmployee(employeeToFire.id);
      if (success) {
        toast.success(`${employeeToFire.name} has been let go`);
      } else {
        toast.error('Cannot fire employee - insufficient funds for severance');
      }
      setFireDialogOpen(false);
      setEmployeeToFire(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-terminal-green">Employees</h1>
          <p className="text-terminal-dim mt-1 font-mono">
            {activeEmployees.length} active, {formerEmployees.length} former
          </p>
        </div>

        <Button
          onClick={handleHire}
          disabled={company.cash < 5000}
          className="bg-terminal-green text-terminal-bg hover:bg-terminal-green/90 font-mono font-bold border-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Hire Employee ($5,000)
        </Button>
      </div>

      {/* Active Employees */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {activeEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              isSelected={selectedEmployeeId === employee.id}
              onSelect={() =>
                selectEmployee(selectedEmployeeId === employee.id ? null : employee.id)
              }
              onFire={() => handleFireClick(employee)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Former Employees */}
      {formerEmployees.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-terminal-dim mb-4 font-mono">
            [ FORMER EMPLOYEES ]
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {formerEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                isSelected={false}
                onSelect={() => {}}
                onFire={() => {}}
                isFormer
              />
            ))}
          </div>
        </div>
      )}

      {/* Fire Confirmation Dialog */}
      <Dialog open={fireDialogOpen} onOpenChange={setFireDialogOpen}>
        <DialogContent
          className="bg-terminal-dark border-2 border-terminal-green text-terminal-green font-mono p-0 overflow-hidden max-w-md"
          aria-describedby="fire-description"
        >
          {/* Hidden title for accessibility */}
          <DialogTitle className="sr-only">Fire Employee</DialogTitle>
          <DialogDescription id="fire-description" className="sr-only">
            This will cost severance pay. This action cannot be undone.
          </DialogDescription>

          {/* Terminal Header */}
          <div className="bg-terminal-green/10 border-b border-terminal-green px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-terminal-green text-sm">[ FIRE_EMPLOYEE_CONFIRM ]</span>
            <button
              onClick={() => setFireDialogOpen(false)}
              className="text-terminal-dim hover:text-terminal-red transition-colors text-sm"
            >
              [X]
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="text-terminal-dim text-sm">
              <p className="mb-2">This action will cost:</p>
              <p className="text-terminal-amber text-lg font-bold">
                ${((employeeToFire?.salary || 0) * 2).toLocaleString()} severance
              </p>
            </div>

            <div className="bg-terminal-red/10 border border-terminal-red/30 p-3 text-xs text-terminal-red">
              ⚠ Warning: This action cannot be undone. Employee will be immediately removed from all
              projects.
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-terminal-green-dark px-4 py-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setFireDialogOpen(false)}
              className="border-terminal-green-dark text-terminal-dim hover:bg-terminal-green/10 hover:text-terminal-green font-mono text-xs"
            >
              [ CANCEL ]
            </Button>
            <Button
              onClick={confirmFire}
              className="bg-terminal-red text-terminal-bg hover:bg-terminal-red/80 font-mono font-bold text-xs border-0"
            >
              <Trash2 className="w-3 h-3 mr-2" />[ CONFIRM FIRE ]
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hire Confirmation Dialog */}
      <Dialog open={hireDialogOpen} onOpenChange={setHireDialogOpen}>
        <DialogContent
          className="bg-terminal-dark border-2 border-terminal-green text-terminal-green font-mono p-0 overflow-hidden max-w-md"
          aria-describedby="hire-description"
        >
          {/* Hidden title for accessibility */}
          <DialogTitle className="sr-only">Review Candidate</DialogTitle>
          <DialogDescription id="hire-description" className="sr-only">
            Review this candidate before hiring. Cost: $5,000
          </DialogDescription>

          {/* Terminal Header */}
          <div className="bg-terminal-green/10 border-b border-terminal-green px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-terminal-green text-sm">[ REVIEW_CANDIDATE ]</span>
            <button
              onClick={() => setHireDialogOpen(false)}
              className="text-terminal-dim hover:text-terminal-red transition-colors text-sm"
            >
              [X]
            </button>
          </div>

          {pendingHire && (
            <div className="p-6 space-y-4">
              {/* Candidate Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-terminal-cyan/20 border-2 border-terminal-cyan flex items-center justify-center">
                  <UserCircle className="w-7 h-7 text-terminal-cyan" />
                </div>
                <div>
                  <h3 className="font-bold text-terminal-white text-lg">{pendingHire.name}</h3>
                  <p className="text-sm text-terminal-dim">{pendingHire.role}</p>
                </div>
              </div>

              {/* Personality */}
              <Badge
                variant="outline"
                className="border-terminal-amber text-terminal-amber font-mono text-xs bg-terminal-amber/10"
              >
                {personalities[pendingHire.personality].name}
              </Badge>

              {/* Skills */}
              <div className="border border-terminal-green-dark p-3 space-y-2">
                <div className="text-xs text-terminal-dark mb-2">SKILLS</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-terminal-dim">Tech:</span>
                    <span className="text-terminal-cyan">{pendingHire.skills.technical}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-dim">Sales:</span>
                    <span className="text-terminal-cyan">{pendingHire.skills.sales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-dim">Design:</span>
                    <span className="text-terminal-cyan">{pendingHire.skills.design}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-dim">Mgmt:</span>
                    <span className="text-terminal-cyan">{pendingHire.skills.management}</span>
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div className="flex justify-between items-center border-t border-terminal-green-dark pt-3">
                <span className="text-terminal-dim text-sm">Monthly Salary</span>
                <span className="text-terminal-white font-bold font-mono">
                  ${pendingHire.salary.toLocaleString()}/mo
                </span>
              </div>

              {/* Hiring Cost */}
              <div className="bg-terminal-green/10 border border-terminal-green p-3 text-center">
                <span className="text-terminal-dark text-xs block mb-1">HIRING COST</span>
                <span className="text-terminal-green font-bold text-lg font-mono">$5,000</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-terminal-green-dark px-4 py-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={rejectHireAction}
              className="border-terminal-red text-terminal-red hover:bg-terminal-red/10 font-mono text-xs"
            >
              [ REJECT ]
            </Button>
            <Button
              onClick={confirmHireAction}
              className="bg-terminal-green text-terminal-bg hover:bg-terminal-green/80 font-mono font-bold text-xs border-0"
            >
              <Plus className="w-3 h-3 mr-2" />[ HIRE ($5K) ]
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface EmployeeCardProps {
  employee: Employee;
  isSelected: boolean;
  onSelect: () => void;
  onFire: () => void;
  isFormer?: boolean;
}

function EmployeeCard({ employee, isSelected, onSelect, onFire, isFormer }: EmployeeCardProps) {
  const personality = personalities[employee.personality];
  const workload = employee.projectAssignments.reduce((sum, a) => sum + a.allocation, 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card
        className={`border-terminal-green-dark bg-terminal-dark/50 cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-terminal-cyan border-terminal-cyan' : ''
        } ${isFormer ? 'grayscale opacity-50' : ''}`}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-terminal-cyan/20 border-2 border-terminal-cyan flex items-center justify-center">
                <UserCircle className="w-7 h-7 text-terminal-cyan" />
              </div>
              <div>
                <h3 className="font-semibold text-terminal-white">{employee.name}</h3>
                <p className="text-sm text-terminal-dim">{employee.role}</p>
              </div>
            </div>

            {!isFormer && employee.role !== 'Founder & CEO' && (
              <Button
                variant="ghost"
                size="icon"
                className="text-terminal-dark hover:text-terminal-red"
                onClick={(e) => {
                  e.stopPropagation();
                  onFire();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {/* Personality Badge */}
            <Badge
              variant="outline"
              className="border-terminal-amber text-terminal-amber bg-terminal-amber/10 font-mono text-xs"
              title={personality.description}
            >
              {personality.name}
            </Badge>

            {/* Stats */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-terminal-dim">Morale</span>
                <span
                  className={`font-medium font-mono ${
                    employee.morale >= 70
                      ? 'text-terminal-green'
                      : employee.morale >= 40
                        ? 'text-terminal-amber'
                        : 'text-terminal-red'
                  }`}
                >
                  {employee.morale.toFixed(0)}%
                </span>
              </div>
              <Progress value={employee.morale} className="h-1.5" />

              <div className="flex justify-between text-sm">
                <span className="text-terminal-dim">Productivity</span>
                <span className="text-terminal-cyan font-mono">
                  {employee.productivity.toFixed(1)}x
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-terminal-dim">Loyalty</span>
                <span className="text-terminal-dim font-mono">{employee.loyalty.toFixed(0)}%</span>
              </div>
            </div>

            {/* Skills */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-terminal-dark" />
                <span className="text-terminal-dim">Tech: {employee.skills.technical}</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-terminal-dark" />
                <span className="text-terminal-dim">Sales: {employee.skills.sales}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-terminal-dark" />
                <span className="text-terminal-dim">Design: {employee.skills.design}</span>
              </div>
              <div className="flex items-center gap-1">
                <UserCircle className="w-3 h-3 text-terminal-dark" />
                <span className="text-terminal-dim">Mgmt: {employee.skills.management}</span>
              </div>
            </div>

            {/* Workload & Salary */}
            <div className="flex justify-between items-center pt-2 border-t border-terminal-green-dark">
              <div className="flex items-center gap-1 text-sm">
                <AlertCircle
                  className={`w-4 h-4 ${
                    workload > 100
                      ? 'text-terminal-red'
                      : workload > 80
                        ? 'text-terminal-amber'
                        : 'text-terminal-green'
                  }`}
                />
                <span className="text-terminal-dim">{workload}% busy</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-terminal-dim font-mono">
                <DollarSign className="w-4 h-4" />
                <span>{employee.salary.toLocaleString()}/mo</span>
              </div>
            </div>

            {isFormer && employee.quitMonth && (
              <p className="text-xs text-terminal-red text-center font-mono">
                [ Quit in month {employee.quitMonth} ]
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
