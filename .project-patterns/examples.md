# Code Examples & Style Guide

## 1. Component Structure

### Standard Component (Dashboard.tsx pattern)

```typescript
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export function Dashboard() {
  const { company, advanceMonth } = useGameStore();

  if (!company) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">{company.name}</h1>
        <Button onClick={advanceMonth} size="lg">
          Next Month
        </Button>
      </div>
    </div>
  );
}
```

### Component with Sub-components

```typescript
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'green' | 'blue' | 'purple';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-500/10 text-green-500',
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-4">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-zinc-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

---

## 2. Store Pattern

### Zustand Store with Persistence

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company, Employee } from '@/types';

interface GameState {
  company: Company | null;
  isPlaying: boolean;

  createCompany: (name: string) => void;
  hireEmployee: () => Employee | null;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      company: null,
      isPlaying: false,

      createCompany: (name: string) => {
        const company = createInitialCompany(name);
        set({ company, isPlaying: true });
      },

      hireEmployee: () => {
        const { company } = get();
        if (!company || company.cash < 5000) return null;

        const newEmployee = employeeGenerator.generateEmployee(company.currentMonth);
        company.cash -= 5000;
        company.employees.push(newEmployee);

        set({ company: { ...company } });
        return newEmployee;
      },

      resetGame: () => {
        set({
          company: null,
          isPlaying: false,
        });
      },
    }),
    {
      name: 'company-simulator-game',
      partialize: (state) => ({ company: state.company, isPlaying: state.isPlaying }),
    }
  )
);
```

---

## 3. Engine/Class Pattern

### Main Engine

```typescript
import type { Company, MonthSnapshot, GameEvent } from '@/types';

export interface SimulationResult {
  success: boolean;
  events: GameEvent[];
  snapshot: MonthSnapshot;
  messages: string[];
}

export class SimulationEngine {
  private employeeSystem: EmployeeSystem;
  private projectSystem: ProjectSystem;

  constructor() {
    this.employeeSystem = new EmployeeSystem();
    this.projectSystem = new ProjectSystem();
  }

  processMonth(company: Company): SimulationResult {
    const messages: string[] = [];

    // 1. Update systems
    this.employeeSystem.updateMorale(company);
    const projectUpdates = this.projectSystem.processProjects(company);
    messages.push(...projectUpdates.messages);

    // 2. Calculate finances
    const financials = this.financialSystem.calculateMonthlyFinances(company, revenue);
    company.cash += financials.netCashflow;

    // 3. Create snapshot
    const snapshot: MonthSnapshot = {
      month: company.currentMonth,
      cash: company.cash,
      // ...
    };

    company.history.push(snapshot);
    company.currentMonth++;

    return {
      success: company.cash >= 0,
      events: [],
      snapshot,
      messages,
    };
  }
}
```

### Domain System

```typescript
export class EmployeeSystem {
  private readonly BASE_QUIT_RATE = 0.02;

  updateMorale(company: Company): void {
    for (const employee of company.employees) {
      if (employee.quitMonth) continue;

      let moraleChange = 0;

      // Business logic
      const workload = employee.projectAssignments.reduce((sum, a) => sum + a.allocation, 0);
      if (workload > 100) {
        moraleChange -= 15;
      }

      employee.morale = Math.max(0, Math.min(100, employee.morale + moraleChange));
    }
  }

  private calculateAverageSalary(company: Company): number {
    const activeEmployees = company.employees.filter((e) => !e.quitMonth);
    if (activeEmployees.length === 0) return 0;
    return activeEmployees.reduce((sum, e) => sum + e.salary, 0) / activeEmployees.length;
  }
}
```

---

## 4. Type Definitions

### Main Types File

```typescript
// src/types/index.ts

export type PersonalityType = 'rockstar' | 'teamPlayer' | 'wildcard' | 'workhorse' | 'leader';

export interface SkillSet {
  technical: number;
  sales: number;
  design: number;
  management: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  personality: PersonalityType;
  skills: SkillSet;
  morale: number;
  productivity: number;
  loyalty: number;
  salary: number;
  hiredMonth: number;
  quitMonth?: number;
  projectAssignments: ProjectAssignment[];
}

export interface Company {
  id: string;
  name: string;
  currentMonth: number;
  cash: number;
  reputation: number;
  culture: Culture;
  employees: Employee[];
  projects: Project[];
  events: GameEvent[];
  history: MonthSnapshot[];
  unlockedAchievements: string[];
}
```

---

## 5. Utility Functions

### cn() Utility (from shadcn)

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Terminal Command Pattern

```typescript
export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  args?: CommandArg[];
  handler: (args: string[], context: CommandContext) => CommandResult;
}

export const commands: Command[] = [
  {
    name: 'help',
    aliases: ['?', 'h'],
    description: 'Display available commands',
    usage: 'help [command]',
    handler: (args): CommandResult => {
      if (args.length > 0) {
        // Show specific command help
        return { success: true, output: '...' };
      }
      // Show all commands
      return { success: true, output: '...' };
    },
  },
];
```

---

## 6. UI Component (shadcn style)

### Button Component

```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-10 rounded-md px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

---

## 7. Static Data

### Data File Pattern

```typescript
// src/data/personalities.ts
import type { PersonalityType } from '@/types';

export interface PersonalityData {
  name: string;
  description: string;
  skillModifiers: {
    technical: number;
    sales: number;
    design: number;
    management: number;
  };
  baseSalaryMultiplier: number;
  specialTraits: string[];
}

export const personalities: Record<PersonalityType, PersonalityData> = {
  rockstar: {
    name: 'Rockstar',
    description: 'Exceptionally skilled but difficult to manage',
    skillModifiers: { technical: 15, sales: 5, design: 10, management: -10 },
    baseSalaryMultiplier: 1.5,
    specialTraits: ['High skill ceiling', 'Expensive', 'Prone to leaving'],
  },
  // ... more personalities
};

export function getPersonalityDescription(type: PersonalityType): string {
  return personalities[type].description;
}
```

---

## 8. Generator Pattern

### Entity Generator

```typescript
// src/generators/EmployeeGenerator.ts
export class EmployeeGenerator {
  private usedNames: Set<string> = new Set();

  reset(): void {
    this.usedNames.clear();
  }

  generateEmployee(month: number): Employee {
    const personality = this.selectPersonality();
    const role = this.selectRole();

    return {
      id: crypto.randomUUID(),
      name: this.generateUniqueName(),
      role,
      personality,
      skills: this.generateSkills(personality),
      morale: 70 + Math.floor(Math.random() * 20),
      productivity: 1.0,
      loyalty: 50 + Math.floor(Math.random() * 30),
      salary: this.calculateSalary(role, personality),
      hiredMonth: month,
      projectAssignments: [],
    };
  }

  private generateUniqueName(): string {
    // Implementation
  }
}
```
