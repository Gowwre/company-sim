# Project Patterns & Conventions

## Project Overview

**Company Simulator** - A terminal-style React game for managing a software company

- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **State**: Zustand with persistence
- **Animation**: Framer Motion

---

## File Naming Conventions

### Components

- **PascalCase** for component files: `GameSetup.tsx`, `EmployeeManagement.tsx`
- **kebab-case** for UI component files: `button.tsx`, `card.tsx` (shadcn/ui convention)
- Feature folders use **PascalCase**: `Dashboard/`, `EmployeeManagement/`, `GameSetup/`

### Non-Component Files

- **PascalCase** for classes/generators: `SimulationEngine.ts`, `EmployeeGenerator.ts`
- **camelCase** for utilities/hooks: `gameStore.ts`, `commands.ts`
- **kebab-case** NOT used (except shadcn/ui components)

---

## Export Patterns

### Named Exports (Preferred)

```typescript
// Components
export function Dashboard() { ... }
export { Button, buttonVariants }

// Classes
export class SimulationEngine { ... }

// Types
export interface Employee { ... }
export type ViewType = 'dashboard' | 'employees' | ...
```

### Default Exports (Minimal)

- Only `App.tsx` uses default export
- Only page/view components in subfolders may use default

---

## Component Structure

### Standard Pattern

```typescript
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  // Props interface defined inline or imported
}

export function ComponentName({ prop1, prop2 }: Props) {
  // Component logic

  return (
    // JSX
  );
}
```

### Sub-components

- Define in same file if tightly coupled
- Use `interface` for props (not `type`)
- Prefix private components with function keyword, not exported

---

## State Management (Zustand)

### Store Pattern

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  // State
  company: Company | null;

  // Actions
  createCompany: (name: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      // Actions using set() and get()
    }),
    {
      name: 'storage-key',
      partialize: (state) => ({ ... }),
    }
  )
);
```

### Store Access

```typescript
// In components - use selector for performance
const { company, hireEmployee } = useGameStore();
const company = useGameStore((state) => state.company);

// Outside components (commands, utilities)
const { company } = useGameStore.getState();
useGameStore.setState({ ... });
```

---

## TypeScript Conventions

### Types vs Interfaces

- **Interfaces** for object shapes: `interface Employee { ... }`
- **Type aliases** for unions: `type ViewType = 'a' | 'b'`
- Both exported from `@/types/index.ts`

### Path Aliases

```typescript
// Always use @/ alias
import { useGameStore } from '@/store/gameStore';
import type { Employee } from '@/types';
import { Button } from '@/components/ui/button';
```

### Strictness

- Strict TypeScript enabled
- Explicit return types on complex functions
- No `any` types (use `unknown` if needed)

---

## Styling Patterns

### Tailwind Usage

- Utility-first approach
- Custom terminal colors in `index.css`
- Theme tokens for shadcn: `--color-primary`, etc.

### Custom Classes (Terminal Theme)

```css
/* Terminal colors */
.text-terminal-green { color: #00ff41; }
.text-terminal-dim { color: #00cc33; }
.text-terminal-red { color: #ff3333; }
.bg-terminal { background-color: #0d1117; }

/* Effects */
.crt-container /* CRT monitor effect */
.screen-flicker /* Flicker animation */
.glow /* Text glow */
```

### shadcn/ui Components

- Located in `src/components/ui/`
- Use `cn()` utility from `@/lib/utils`
- Override styles via className

---

## Data Fetching & Side Effects

### No External API Calls

- All data is local/generative
- Generators in `src/generators/`
- Static data in `src/data/`

### Effects Pattern

```typescript
useEffect(() => {
  // Side effect logic
  const timer = setTimeout(() => { ... });

  return () => clearTimeout(timer);
}, [dependencies]);
```

---

## Architecture Patterns

### Engine Pattern

```typescript
// src/engine/core/SimulationEngine.ts
export class SimulationEngine {
  private employeeSystem: EmployeeSystem;

  processMonth(company: Company): SimulationResult {
    // Orchestrate subsystems
  }
}
```

### Generator Pattern

```typescript
// src/generators/EmployeeGenerator.ts
export class EmployeeGenerator {
  generateEmployee(month: number): Employee {
    // Create new entity with randomization
  }
}
```

### System Pattern

```typescript
// src/engine/employees/EmployeeSystem.ts
export class EmployeeSystem {
  updateMorale(company: Company): void {
    // Domain-specific logic
  }
}
```

---

## Error Handling

### Store Actions

- Return `boolean` for success/failure
- Check conditions before mutating
- No exceptions thrown

```typescript
hireEmployee: () => {
  if (company.cash < 5000) return null;
  // ... proceed
};
```

### UI Feedback

- Use `react-hot-toast` for notifications
- Toast on success/error actions

---

## Animation Patterns

### Framer Motion

```typescript
import { motion, AnimatePresence } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3 }}
>
```

### Page Transitions

- Wrap lists in `<AnimatePresence>`
- Use `layout` prop for list animations

---

## Project Structure Philosophy

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components (kebab-case)
│   ├── dashboard/      # Feature views (PascalCase)
│   ├── employees/
│   ├── projects/
│   └── *.tsx           # Root-level components
├── engine/             # Game simulation logic
│   ├── core/           # Main engine orchestrator
│   ├── employees/      # Employee domain logic
│   ├── projects/       # Project domain logic
│   └── ...
├── generators/         # Entity generators (PascalCase)
├── data/               # Static data/config
├── store/              # Zustand stores
├── types/              # TypeScript definitions
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── lib/                # Shared utilities (cn, etc.)
└── assets/             # Static assets
```

---

## Key Decisions

1. **No Default Exports** - Except App.tsx and极少数 cases
2. **Named Exports for Everything** - Easier refactoring, tree-shaking
3. **Zustand for State** - Simple, no boilerplate, persistence built-in
4. **Class-based Engine** - Encapsulation of game logic
5. **Terminal Aesthetic** - Retro CRT styling throughout
6. **Local-First** - No backend, everything in browser
7. **Sound Effects** - Terminal audio feedback via `terminalSound`

---

## Never Do

- Don't use `export default` for new components
- Don't create new utility functions if similar exist in `lib/` or `utils/`
- Don't use `any` types
- Don't skip type annotations on function parameters
- Don't use relative imports (`../../`) - always use `@/`
- Don't add new dependencies without checking existing ones
