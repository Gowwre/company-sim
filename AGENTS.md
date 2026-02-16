# AGENTS.md - Company Simulator

## Project Context

| Project       | Company Simulator               |
| ------------- | ------------------------------- |
| **Type**      | React SPA (Terminal-style game) |
| **Framework** | React 19 + Vite + TypeScript    |
| **Styling**   | Tailwind CSS 4 + shadcn/ui      |
| **State**     | Zustand with persistence        |

### Root Directories

- `./.project-patterns/` - Codebase conventions and patterns
- `./.framework-docs/` - Framework reference docs
- `./src/` - Source code

---

## CRITICAL: Priority Hierarchy

When implementing features, follow this **strict priority order**:

### 1. EXISTING PATTERNS (Highest Priority)

- Check `.project-patterns/patterns.md` for conventions
- Read `.project-patterns/examples.md` for code style
- Examine 2-3 similar existing files in target directory
- Match naming, structure, and abstraction level exactly

### 2. FRAMEWORK DOCS (Second Priority)

- Use `./.framework-docs/` only for APIs not present in existing code
- Consult React 19 patterns when extending beyond current codebase

### 3. TRAINING DATA (Last Resort)

- Only when neither existing patterns nor framework docs apply

---

## BEFORE Implementing

### Required Steps

1. ✅ Read `.project-patterns/patterns.md`
2. ✅ Read `.project-patterns/examples.md`
3. ✅ List files in target directory (`ls src/components/target/`)
4. ✅ Read 2-3 similar existing files
5. ✅ Match exact naming conventions found

### Check These Patterns

- **Exports**: Named exports only (except App.tsx)
- **Naming**: PascalCase for components/classes, camelCase for utilities
- **State**: Zustand store pattern
- **Components**: Function declarations with interfaces
- **Types**: Interfaces for objects, types for unions
- **Paths**: Always use `@/` aliases

---

## NEVER Do

- ❌ Introduce new dependencies without checking package.json
- ❌ Use default exports (unless existing code uses them)
- ❌ Create new utility functions if similar ones exist in `lib/` or `utils/`
- ❌ Change naming conventions (e.g., PascalCase → camelCase)
- ❌ Use `any` types
- ❌ Use relative imports (`../../`) - always use `@/`
- ❌ Skip reading existing patterns before coding

---

## Project-Specific Patterns

### Component Pattern

```typescript
// Named export, PascalCase file
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';

interface Props {
  // Props interface
}

export function ComponentName({ prop1, prop2 }: Props) {
  // Logic here

  return (
    // JSX
  );
}
```

### Store Pattern

```typescript
// Zustand with persistence
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // State and actions
    }),
    {
      name: 'storage-key',
      partialize: (state) => ({ ... }),
    }
  )
);
```

### Engine Pattern

```typescript
// Class-based domain logic
export class DomainSystem {
  process(company: Company): Result {
    // Business logic
  }
}
```

### Type Pattern

```typescript
// Interface for objects
export interface Employee {
  id: string;
  name: string;
}

// Type for unions
export type ViewType = 'dashboard' | 'employees' | 'projects';
```

---

## Directory Structure

```
src/
├── components/
│   ├── ui/              # shadcn components (kebab-case files)
│   ├── dashboard/       # Feature views (PascalCase folders)
│   ├── employees/
│   ├── projects/
│   └── *.tsx           # Root components (PascalCase)
├── engine/
│   ├── core/           # SimulationEngine.ts
│   ├── employees/      # EmployeeSystem.ts
│   ├── projects/       # ProjectSystem.ts
│   ├── finances/       # FinancialSystem.ts
│   ├── events/         # EventSystem.ts
│   └── culture/        # CultureSystem.ts
├── generators/         # EmployeeGenerator.ts, ProjectGenerator.ts
├── data/              # personalities.ts, achievements.ts
├── store/             # gameStore.ts
├── types/             # index.ts, terminal.ts
├── utils/             # commands.ts, terminalSound.ts
├── hooks/             # Custom React hooks
├── lib/               # utils.ts (cn function)
└── assets/            # Static assets
```

---

## Key Conventions Summary

| Aspect             | Convention                                                 |
| ------------------ | ---------------------------------------------------------- |
| **File naming**    | PascalCase for components/classes, camelCase for utilities |
| **Exports**        | Named exports (except App.tsx)                             |
| **Components**     | Function declarations, not arrow functions                 |
| **Props**          | Interface defined inline or imported                       |
| **State**          | Zustand with selectors                                     |
| **Imports**        | `@/` aliases only                                          |
| **Types**          | Interfaces for objects, types for unions                   |
| **Styling**        | Tailwind classes + custom terminal classes                 |
| **Error handling** | Return booleans, not exceptions                            |

---

## Framework Docs Index

| Topic                 | File                                  |
| --------------------- | ------------------------------------- |
| React 19 + TypeScript | `.framework-docs/react-typescript.md` |

---

## Quick Reference

### Terminal Theme Classes

```css
.text-terminal-green    /* #00ff41 */
.text-terminal-dim      /* #00cc33 */
.text-terminal-red      /* #ff3333 */
.bg-terminal            /* #0d1117 */
.crt-container         /* CRT effect */
.screen-flicker        /* Flicker animation */
.glow                  /* Text glow */
```

### Common Imports

```typescript
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
```

### Store Access

```typescript
// In components
const { company, hireEmployee } = useGameStore();

// Outside components
const { company } = useGameStore.getState();
useGameStore.setState({ ... });
```

---

## When in Rome...

**Follow existing code exactly.**

This codebase has established patterns for:

- Component structure
- State management
- Domain logic organization
- Styling approach
- File naming

**Don't introduce new patterns.** Match what exists.

---

## Questions?

1. Check `.project-patterns/patterns.md`
2. Check `.project-patterns/examples.md`
3. Read similar existing files
4. Refer to `.framework-docs/react-typescript.md`
