import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Project, Employee, ProjectType } from '@/types';

export function ProjectManagement() {
  const { company, createProject, assignEmployeeToProject, unassignEmployeeFromProject } =
    useGameStore();

  const [selectedType, setSelectedType] = useState<ProjectType>('clientWork');

  if (!company) return null;

  const activeProjects = company.projects.filter(
    (p) => p.status === 'inProgress' || p.status === 'notStarted'
  );
  const completedProjects = company.projects.filter((p) => p.status === 'completed');
  const failedProjects = company.projects.filter((p) => p.status === 'failed');

  const handleCreateProject = () => {
    const project = createProject(selectedType);
    if (project) {
      toast.success(`Created project: ${project.name}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-terminal-amber">Projects</h1>
          <p className="text-terminal-dim mt-1 font-mono">
            {activeProjects.length} active, {completedProjects.length} completed
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-terminal-amber text-terminal-bg hover:bg-terminal-amber/90 font-mono font-bold border-0">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>

          <DialogContent
            className="bg-terminal-dark border-2 border-terminal-green text-terminal-green font-mono p-0 overflow-hidden max-w-md"
            aria-describedby="create-project-description"
          >
            {/* Hidden title for accessibility */}
            <DialogTitle className="sr-only">Create New Project</DialogTitle>
            <DialogDescription id="create-project-description" className="sr-only">
              Select the type of project you want to create
            </DialogDescription>

            {/* Terminal Header */}
            <div className="bg-terminal-green/10 border-b border-terminal-green px-4 py-3 flex justify-between items-center">
              <span className="font-bold text-terminal-green text-sm">[ CREATE_NEW_PROJECT ]</span>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-terminal-dim text-sm">
                Select the type of project you want to create
              </p>

              <div className="space-y-2">
                <label className="text-xs text-terminal-dark uppercase tracking-wider">
                  Project Type
                </label>
                <Select
                  value={selectedType}
                  onValueChange={(v) => setSelectedType(v as ProjectType)}
                >
                  <SelectTrigger className="bg-terminal-dark border-terminal-green-dark text-terminal-green focus:border-terminal-green font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-terminal-dark border-terminal-green-dark">
                    <SelectItem
                      value="clientWork"
                      className="font-mono text-terminal-green focus:bg-terminal-green/10"
                    >
                      Client Work (Revenue)
                    </SelectItem>
                    <SelectItem
                      value="productFeature"
                      className="font-mono text-terminal-green focus:bg-terminal-green/10"
                    >
                      Product Feature (Value)
                    </SelectItem>
                    <SelectItem
                      value="maintenance"
                      className="font-mono text-terminal-green focus:bg-terminal-green/10"
                    >
                      Maintenance (Reduce Debt)
                    </SelectItem>
                    <SelectItem
                      value="rnd"
                      className="font-mono text-terminal-green focus:bg-terminal-green/10"
                    >
                      R&D (Skill Growth)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreateProject}
                className="w-full bg-terminal-green text-terminal-bg hover:bg-terminal-green/80 font-mono font-bold border-0"
              >
                [ CREATE_PROJECT ]
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Projects */}
      <div className="grid gap-4">
        <AnimatePresence>
          {activeProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              employees={company.employees.filter((e) => !e.quitMonth)}
              onAssign={assignEmployeeToProject}
              onUnassign={unassignEmployeeFromProject}
            />
          ))}
        </AnimatePresence>
      </div>

      {activeProjects.length === 0 && (
        <Card className="border-terminal-green-dark bg-terminal-dark/50">
          <CardContent className="p-8 text-center">
            <Play className="w-12 h-12 text-terminal-dark mx-auto mb-4" />
            <p className="text-terminal-dim font-mono">
              No active projects. Create one to get started!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-terminal-dim mb-4 font-mono">
            [ COMPLETED_PROJECTS ]
          </h2>
          <div className="grid gap-4">
            {completedProjects
              .slice(-5)
              .reverse()
              .map((project) => (
                <Card
                  key={project.id}
                  className="border-terminal-green-dark bg-terminal-dark/30 opacity-70"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-terminal-green" />
                        <div>
                          <h3 className="font-medium text-terminal-white">{project.name}</h3>
                          <p className="text-sm text-terminal-dark font-mono">
                            Completed Month {project.completedMonth} • Quality:{' '}
                            {project.quality.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-terminal-green text-terminal-green font-mono"
                      >
                        ${project.value.toLocaleString()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Failed Projects */}
      {failedProjects.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-terminal-dim mb-4 font-mono">
            [ FAILED_PROJECTS ]
          </h2>
          <div className="grid gap-4">
            {failedProjects.map((project) => (
              <Card
                key={project.id}
                className="border-terminal-green-dark bg-terminal-dark/30 opacity-50"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-terminal-red" />
                    <div>
                      <h3 className="font-medium text-terminal-dim">{project.name}</h3>
                      <p className="text-sm text-terminal-dark font-mono">
                        Failed in month {company.currentMonth}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  employees: Employee[];
  onAssign: (employeeId: string, projectId: string, allocation: number) => boolean;
  onUnassign: (employeeId: string, projectId: string) => boolean;
}

function ProjectCard({ project, employees, onAssign, onUnassign }: ProjectCardProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [allocation, setAllocation] = useState(50);

  const assignedEmployees = employees.filter((e) =>
    e.projectAssignments.some((a) => a.projectId === project.id)
  );

  const handleAssign = () => {
    if (selectedEmployee) {
      const success = onAssign(selectedEmployee, project.id, allocation);
      if (success) {
        toast.success('Employee assigned');
        setShowAssignDialog(false);
        setSelectedEmployee('');
      } else {
        toast.error('Employee is already at maximum capacity');
      }
    }
  };

  const getTypeColor = (type: ProjectType) => {
    switch (type) {
      case 'clientWork':
        return 'bg-terminal-cyan/10 text-terminal-cyan border-terminal-cyan/30';
      case 'productFeature':
        return 'bg-terminal-amber/10 text-terminal-amber border-terminal-amber/30';
      case 'maintenance':
        return 'bg-terminal-dark border-terminal-green-dark text-terminal-dim';
      case 'rnd':
        return 'bg-terminal-purple/10 text-terminal-purple border-terminal-purple/30';
      default:
        return 'bg-terminal-dark border-terminal-green-dark text-terminal-dim';
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="border-terminal-green-dark bg-terminal-dark/50 hover:border-terminal-green/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-terminal-white">{project.name}</h3>
                  <Badge
                    variant="outline"
                    className={`${getTypeColor(project.type)} font-mono text-xs`}
                  >
                    {project.type === 'clientWork'
                      ? 'Client'
                      : project.type === 'productFeature'
                        ? 'Feature'
                        : project.type === 'maintenance'
                          ? 'Maintenance'
                          : 'R&D'}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-terminal-dim font-mono">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-terminal-dark" />
                    Complexity: {project.complexity}/10
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-terminal-dark" />$
                    {project.value.toLocaleString()}
                  </span>
                  {project.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-terminal-dark" />
                      Due: M{project.deadline}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-terminal-white font-mono">
                    {project.progress.toFixed(0)}%
                  </div>
                  <div className="text-sm text-terminal-dim font-mono">
                    Quality: {project.quality.toFixed(0)}%
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAssignDialog(true)}
                  className="border-terminal-green-dark text-terminal-green hover:bg-terminal-green/10 hover:border-terminal-green font-mono text-xs"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Assign
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <Progress value={project.progress} className="h-2 bg-terminal-dark" />
            </div>

            {/* Assigned Employees */}
            {assignedEmployees.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {assignedEmployees.map((employee) => {
                  const assignment = employee.projectAssignments.find(
                    (a) => a.projectId === project.id
                  );
                  return (
                    <Badge
                      key={employee.id}
                      variant="secondary"
                      className="bg-terminal-dark border-terminal-green-dark text-terminal-dim cursor-pointer hover:bg-terminal-red/20 hover:border-terminal-red hover:text-terminal-red transition-colors font-mono text-xs"
                      onClick={() => {
                        onUnassign(employee.id, project.id);
                        toast.success(`${employee.name} unassigned`);
                      }}
                      title="Click to unassign"
                    >
                      {employee.name} ({assignment?.allocation}%)
                    </Badge>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent
          className="bg-terminal-dark border-2 border-terminal-green text-terminal-green font-mono p-0 overflow-hidden max-w-md"
          aria-describedby="assign-employee-description"
        >
          {/* Hidden title for accessibility */}
          <DialogTitle className="sr-only">Assign Employee</DialogTitle>
          <DialogDescription id="assign-employee-description" className="sr-only">
            Assign an employee to {project.name}
          </DialogDescription>

          {/* Terminal Header */}
          <div className="bg-terminal-green/10 border-b border-terminal-green px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-terminal-green text-sm">[ ASSIGN_EMPLOYEE ]</span>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-terminal-dim text-sm">Assign an employee to {project.name}</p>

            <div className="space-y-2">
              <label className="text-xs text-terminal-dark uppercase tracking-wider">
                Employee
              </label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="bg-terminal-dark border-terminal-green-dark text-terminal-green focus:border-terminal-green font-mono">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent className="bg-terminal-dark border-terminal-green-dark">
                  {employees
                    .filter((e) => !e.quitMonth && !assignedEmployees.find((ae) => ae.id === e.id))
                    .map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id}
                        className="font-mono text-terminal-green focus:bg-terminal-green/10"
                      >
                        {employee.name} - {employee.role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-terminal-dark uppercase tracking-wider">
                Time Allocation: {allocation}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={allocation}
                onChange={(e) => setAllocation(parseInt(e.target.value))}
                className="w-full accent-terminal-green"
              />
            </div>

            <Button
              onClick={handleAssign}
              disabled={!selectedEmployee}
              className="w-full bg-terminal-green text-terminal-bg hover:bg-terminal-green/80 font-mono font-bold border-0 disabled:opacity-50"
            >
              [ ASSIGN_TO_PROJECT ]
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
