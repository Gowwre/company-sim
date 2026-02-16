// Core types for Company Simulator

// Employee System
export type PersonalityType = 'rockstar' | 'teamPlayer' | 'wildcard' | 'workhorse' | 'leader';

export interface SkillSet {
  technical: number; // 0-100
  sales: number; // 0-100
  design: number; // 0-100
  management: number; // 0-100
}

export interface ProjectAssignment {
  projectId: string;
  allocation: number; // 0-100 percentage of time
}

export interface EmployeeAssignment {
  employeeId: string;
  allocation: number; // 0-100 percentage of time
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  personality: PersonalityType;
  skills: SkillSet;
  morale: number; // 0-100
  productivity: number; // 0.5-2.0 multiplier
  loyalty: number; // 0-100
  salary: number; // monthly
  hiredMonth: number;
  quitMonth?: number;
  projectAssignments: ProjectAssignment[];
}

// Project System
export type ProjectType = 'clientWork' | 'productFeature' | 'maintenance' | 'rnd';
export type ProjectStatus = 'notStarted' | 'inProgress' | 'completed' | 'failed';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  complexity: number; // 1-10
  requiredSkills: SkillSet;
  estimatedMonths: number;
  deadline?: number; // month number
  value: number; // revenue if completed
  progress: number; // 0-100
  quality: number; // 0-100
  techDebt: number; // 0-100
  status: ProjectStatus;
  assignments: EmployeeAssignment[];
  startMonth?: number;
  completedMonth?: number;
  milestone25Paid?: boolean;
  milestone50Paid?: boolean;
  milestone75Paid?: boolean;
}

// Culture System
export interface Culture {
  speed: number; // 0-1 (move fast -> move carefully)
  quality: number; // 0-1 (ship it -> perfect it)
  workLife: number; // 0-1 (grind -> balance)
  hierarchy: number; // 0-1 (flat -> structured)
}

// Event System
export interface EventChoice {
  id: string;
  label: string;
  description: string;
  consequences: EventConsequences;
}

export interface EventConsequences {
  cash?: number;
  reputation?: number;
  moraleChange?: number;
  employeeEffects?: {
    employeeId: string;
    moraleChange: number;
    loyaltyChange: number;
  }[];
  projectEffects?: {
    projectId: string;
    progressChange: number;
    qualityChange: number;
  }[];
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: 'random' | 'triggered' | 'milestone';
  choices: EventChoice[];
  triggerConditions?: {
    minMonth?: number;
    maxMonth?: number;
    minEmployees?: number;
    minCash?: number;
    minReputation?: number;
    probability: number;
  };
  resolved: boolean;
  monthOccurred?: number;
}

// Financial System
export interface FinancialSnapshot {
  month: number;
  startingCash: number;
  revenue: number;
  payroll: number;
  tools: number;
  rent: number;
  otherExpenses: number;
  netCashflow: number;
  endingCash: number;
}

// Achievement System
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: AchievementRarity;
  unlocked: boolean;
  unlockedAt?: number;
  checkCondition: (company: Company) => boolean;
}

// Leaderboard
export interface LeaderboardEntry {
  id: string;
  companyName: string;
  score: number;
  monthsSurvived: number;
  finalCash: number;
  finalReputation: number;
  employeesHired: number;
  projectsCompleted: number;
  achievementsUnlocked: number;
  date: string;
}

// Main Company State
export interface Company {
  id: string;
  name: string;
  currentMonth: number;
  cash: number;
  reputation: number; // 0-100
  culture: Culture;
  employees: Employee[];
  projects: Project[];
  events: GameEvent[];
  history: MonthSnapshot[];
  unlockedAchievements: string[]; // Array of achievement IDs
}

export interface MonthSnapshot {
  month: number;
  cash: number;
  reputation: number;
  employeeCount: number;
  activeProjects: number;
  completedProjects: number;
  financials: FinancialSnapshot;
  culture: Culture;
}

// Save System
export interface SaveSlot {
  id: string;
  companyName: string;
  month: number;
  cash: number;
  employeeCount: number;
  lastSaved: string;
  data: Company;
}

// Game Configuration
export interface GameConfig {
  startingCash: number;
  baseQuitRate: number; // 2% monthly
  toolCostPerEmployee: number; // $500/month
  baseRent: number; // $2K
  maxRent: number; // $20K
  hiringCost: number; // $5K
  severanceMultiplier: number; // 2 months
}

// UI Types
export type ViewType =
  | 'dashboard'
  | 'employees'
  | 'projects'
  | 'finances'
  | 'achievements'
  | 'settings';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
