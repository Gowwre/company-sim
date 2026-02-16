import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company, Employee, Project, GameEvent, ViewType } from '@/types';
import { SimulationEngine } from '@/engine/core/SimulationEngine';
import { EmployeeGenerator } from '@/generators/EmployeeGenerator';
import { ProjectGenerator } from '@/generators/ProjectGenerator';

interface GameState {
  // Game state
  company: Company | null;
  isPlaying: boolean;
  currentView: ViewType;
  selectedEmployeeId: string | null;
  selectedProjectId: string | null;
  showEventModal: boolean;
  showHelpModal: boolean;
  showCompanyLog: boolean;
  currentEvents: GameEvent[];
  pendingHire: Employee | null;

  // Actions
  createCompany: (name: string) => void;
  hireEmployee: () => Employee | null;
  confirmHire: () => Employee | null;
  rejectHire: () => void;
  fireEmployee: (employeeId: string) => boolean;
  assignEmployeeToProject: (employeeId: string, projectId: string, allocation: number) => boolean;
  unassignEmployeeFromProject: (employeeId: string, projectId: string) => boolean;
  advanceMonth: () => void;
  resolveEvent: (eventId: string, choiceId: string) => void;
  createProject: (type: Project['type']) => Project | null;
  setView: (view: ViewType) => void;
  selectEmployee: (id: string | null) => void;
  selectProject: (id: string | null) => void;
  resetGame: () => void;
  toggleHelpModal: () => void;
  setShowHelpModal: (show: boolean) => void;
  toggleCompanyLog: () => void;
  setShowCompanyLog: (show: boolean) => void;
}

const createInitialCompany = (name: string): Company => ({
  id: crypto.randomUUID(),
  name,
  currentMonth: 1,
  cash: 150000,
  reputation: 50,
  culture: {
    speed: 0.5,
    quality: 0.5,
    workLife: 0.5,
    hierarchy: 0.5,
  },
  employees: [],
  projects: [],
  events: [],
  history: [],
  unlockedAchievements: [],
});

const simulationEngine = new SimulationEngine();
const employeeGenerator = new EmployeeGenerator();
const projectGenerator = new ProjectGenerator();

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      company: null,
      isPlaying: false,
      currentView: 'dashboard',
      selectedEmployeeId: null,
      selectedProjectId: null,
      showEventModal: false,
      showHelpModal: false,
      showCompanyLog: false,
      currentEvents: [],
      pendingHire: null,

      // Actions
      toggleHelpModal: () => set((state) => ({ showHelpModal: !state.showHelpModal })),
      setShowHelpModal: (show: boolean) => set({ showHelpModal: show }),
      toggleCompanyLog: () => set((state) => ({ showCompanyLog: !state.showCompanyLog })),
      setShowCompanyLog: (show: boolean) => set({ showCompanyLog: show }),
      createCompany: (name: string) => {
        // Reset name generator to avoid cross-game pollution
        employeeGenerator.reset();

        const company = createInitialCompany(name);

        // Create founder employee with explicit properties
        const founder: Employee = {
          id: crypto.randomUUID(),
          name: 'You',
          role: 'Founder & CEO',
          personality: 'leader',
          skills: {
            technical: 85,
            sales: 75,
            design: 70,
            management: 90,
          },
          morale: 100,
          productivity: 1.0,
          loyalty: 100,
          salary: 0,
          hiredMonth: 1,
          projectAssignments: [],
        };

        company.employees.push(founder);

        set({ company, isPlaying: true, currentView: 'dashboard' });
      },

      hireEmployee: () => {
        const { company } = get();
        if (!company) return null;

        // Check if can afford hiring cost
        if (company.cash < 2000) {
          return null;
        }

        // Generate candidate for preview (don't hire yet)
        const newEmployee = employeeGenerator.generateEmployee(company.currentMonth);

        set({ pendingHire: newEmployee });
        return newEmployee;
      },

      confirmHire: () => {
        const { company, pendingHire } = get();
        if (!company || !pendingHire) return null;

        // Deduct hiring cost
        company.cash -= 2000;
        company.employees.push(pendingHire);

        set({ company: { ...company }, pendingHire: null });
        return pendingHire;
      },

      rejectHire: () => {
        set({ pendingHire: null });
      },

      fireEmployee: (employeeId: string) => {
        const { company } = get();
        if (!company) return false;

        const employee = company.employees.find((e) => e.id === employeeId);
        if (!employee || employee.quitMonth) return false;

        // Prevent firing the founder
        if (employee.role === 'Founder & CEO') {
          return false;
        }

        // Pay severance
        const severance = employee.salary * 2;
        if (company.cash < severance) {
          return false;
        }

        company.cash -= severance;
        employee.quitMonth = company.currentMonth;

        // Remove from all projects
        employee.projectAssignments = [];

        set({ company: { ...company } });
        return true;
      },

      assignEmployeeToProject: (employeeId: string, projectId: string, allocation: number) => {
        const { company } = get();
        if (!company) return false;

        const employee = company.employees.find((e) => e.id === employeeId);
        const project = company.projects.find((p) => p.id === projectId);

        if (!employee || !project || employee.quitMonth) return false;

        // Check total allocation doesn't exceed 100%
        const currentAllocation = employee.projectAssignments.reduce(
          (sum, a) => sum + (a.projectId === projectId ? 0 : a.allocation),
          0
        );

        if (currentAllocation + allocation > 100) {
          return false;
        }

        // Update employee assignments
        const existingAssignment = employee.projectAssignments.find(
          (a) => a.projectId === projectId
        );

        if (existingAssignment) {
          existingAssignment.allocation = allocation;
        } else {
          employee.projectAssignments.push({ projectId, allocation });
        }

        // Update project assignments
        const existingProjectAssignment = project.assignments.find(
          (a) => a.employeeId === employeeId
        );

        if (existingProjectAssignment) {
          existingProjectAssignment.allocation = allocation;
        } else {
          project.assignments.push({ employeeId, allocation });
        }

        // Auto-start project when first employee is assigned
        if (project.status === 'notStarted') {
          project.status = 'inProgress';
        }

        set({ company: { ...company } });
        return true;
      },

      unassignEmployeeFromProject: (employeeId: string, projectId: string) => {
        const { company } = get();
        if (!company) return false;

        const employee = company.employees.find((e) => e.id === employeeId);
        const project = company.projects.find((p) => p.id === projectId);

        if (!employee || !project) return false;

        // Remove from employee
        employee.projectAssignments = employee.projectAssignments.filter(
          (a) => a.projectId !== projectId
        );

        // Remove from project
        project.assignments = project.assignments.filter((a) => a.employeeId !== employeeId);

        set({ company: { ...company } });
        return true;
      },

      advanceMonth: () => {
        const { company } = get();
        if (!company) return;

        const result = simulationEngine.processMonth(company);

        if (result.events.length > 0) {
          set({
            company: { ...company },
            currentEvents: result.events,
            showEventModal: true,
          });
        } else {
          set({ company: { ...company } });
        }
      },

      resolveEvent: (eventId: string, choiceId: string) => {
        const { company, currentEvents } = get();
        if (!company) return;

        const event = currentEvents.find((e) => e.id === eventId);
        const choice = event?.choices.find((c) => c.id === choiceId);

        if (!event || !choice) return;

        // Apply consequences
        if (choice.consequences.cash) {
          company.cash += choice.consequences.cash;
        }
        if (choice.consequences.reputation) {
          company.reputation = Math.max(
            0,
            Math.min(100, company.reputation + choice.consequences.reputation)
          );
        }
        if (choice.consequences.moraleChange) {
          company.employees.forEach((e) => {
            if (!e.quitMonth) {
              e.morale = Math.max(0, Math.min(100, e.morale + choice.consequences.moraleChange!));
            }
          });
        }

        event.resolved = true;
        event.monthOccurred = company.currentMonth;
        company.events.push(event);

        // Limit events history to prevent memory bloat (keep last 50)
        if (company.events.length > 50) {
          company.events = company.events.slice(-50);
        }

        const remainingEvents = currentEvents.filter((e) => e.id !== eventId);

        set({
          company: { ...company },
          currentEvents: remainingEvents,
          showEventModal: remainingEvents.length > 0,
        });
      },

      createProject: (type: Project['type']) => {
        const { company } = get();
        if (!company) return null;

        const project = projectGenerator.generateProject(type, company.currentMonth);
        company.projects.push(project);

        set({ company: { ...company } });
        return project;
      },

      setView: (view: ViewType) => {
        set({ currentView: view, selectedEmployeeId: null, selectedProjectId: null });
      },

      selectEmployee: (id: string | null) => {
        set({ selectedEmployeeId: id });
      },

      selectProject: (id: string | null) => {
        set({ selectedProjectId: id });
      },

      resetGame: () => {
        employeeGenerator.reset();
        set({
          company: null,
          isPlaying: false,
          currentView: 'dashboard',
          selectedEmployeeId: null,
          selectedProjectId: null,
          showEventModal: false,
          showCompanyLog: false,
          currentEvents: [],
          pendingHire: null,
        });
      },
    }),
    {
      name: 'company-simulator-game',
      partialize: (state) => ({ company: state.company, isPlaying: state.isPlaying }),
    }
  )
);
