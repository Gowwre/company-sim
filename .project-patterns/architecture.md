# Architecture Documentation

## High-Level Architecture

### Application Type

**Single-Page Application (SPA)** - Terminal-style company management simulator

- No routing (single view with view switching via state)
- No backend API (local-first architecture)
- Browser-based with PWA capabilities

### Core Architecture Pattern: **ECS-like with Domain Systems**

While not a pure Entity-Component-System, the architecture borrows concepts:

```
┌─────────────────────────────────────────────────────────────┐
│                        React UI Layer                        │
│  (Components: Terminal, Dashboard, EmployeeManagement...)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      State Management                        │
│              Zustand Store (gameStore.ts)                   │
│         - Holds Company state (single source of truth)      │
│         - Provides actions for state mutations              │
│         - Persists to localStorage                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Simulation Engine                         │
│         (Orchestrates domain systems per tick)              │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ EmployeeSystem  │  │  ProjectSystem  │  │ FinancialSystem │
│                 │  │                 │  │                 │
│ - updateMorale  │  │ - processProj   │  │ - calcFinances  │
│ - processTurnov │  │ - calcOutcome   │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   EventSystem   │  │  CultureSystem  │  │    (Utils)      │
│                 │  │                 │  │                 │
│ - generateEvents│  │ - updateCulture │  │                 │
│                 │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## State Management Strategy

### Zustand + Persistence

**Why Zustand?**

- Minimal boilerplate vs Redux
- No providers needed
- Easy TypeScript integration
- Built-in persistence middleware
- React 19 compatible

**State Structure:**

```typescript
interface GameState {
  // Core State
  company: Company | null; // All game data nested here
  isPlaying: boolean; // Game session state

  // UI State
  currentView: ViewType;
  selectedEmployeeId: string | null;
  selectedProjectId: string | null;
  showEventModal: boolean;
  currentEvents: GameEvent[];

  // Actions
  createCompany: (name: string) => void;
  hireEmployee: () => Employee | null;
  // ... more actions
}
```

**Persistence Strategy:**

- Full company state persisted to localStorage
- UI state (currentView, modals) NOT persisted
- Auto-save on every state change
- Manual save/load via commands

---

## Domain-Driven Design

### Bounded Contexts

1. **Employee Context**
   - Hiring, firing, morale, skills
   - Location: `src/engine/employees/`
   - Key class: `EmployeeSystem`

2. **Project Context**
   - Creation, progress, completion
   - Location: `src/engine/projects/`
   - Key class: `ProjectSystem`

3. **Financial Context**
   - Revenue, expenses, cash flow
   - Location: `src/engine/finances/`
   - Key class: `FinancialSystem`

4. **Event Context**
   - Random/triggered events
   - Location: `src/engine/events/`
   - Key class: `EventSystem`

5. **Culture Context**
   - Company culture dynamics
   - Location: `src/engine/culture/`
   - Key class: `CultureSystem`

### Entity Relationships

```
Company
├── employees: Employee[]
├── projects: Project[]
├── events: GameEvent[]
├── history: MonthSnapshot[]
└── culture: Culture

Employee
├── skills: SkillSet
├── projectAssignments: ProjectAssignment[]
└── personality: PersonalityType

Project
├── requiredSkills: SkillSet
└── assignments: EmployeeAssignment[]
```

---

## Simulation Loop

### Monthly Tick Process

```typescript
// SimulationEngine.processMonth()

1. UPDATE MORALE
   └─ EmployeeSystem.updateMorale(company)
      ├─ Salary fairness check
      ├─ Workload balance
      ├─ Culture fit calculation
      └─ Recent project success bonus

2. PROCESS PROJECTS
   └─ ProjectSystem.processProjects(company)
      ├─ Calculate progress based on assigned employees
      ├─ Check for completions
      └─ Apply tech debt

3. CALCULATE FINANCES
   └─ FinancialSystem.calculateMonthlyFinances(company, revenue)
      ├─ Sum payroll expenses
      ├─ Calculate rent/tools
      ├─ Add project revenues
      └─ Return net cashflow

4. PROCESS TURNOVER
   └─ EmployeeSystem.processTurnover(company)
      ├─ Calculate quit probability per employee
      ├─ Random check against probability
      └─ Pay severance, mark as quit

5. GENERATE EVENTS
   └─ EventSystem.generateEvents(company)
      ├─ Check trigger conditions
      └─ Return new events array

6. CHECK ACHIEVEMENTS
   └─ checkAchievements(company)
      └─ Unlock new achievements

7. CREATE SNAPSHOT
   └─ Record month data to history

8. INCREMENT MONTH
   └─ company.currentMonth++
```

---

## UI Architecture

### View Switching Pattern

No React Router - views switched via Zustand state:

```typescript
// In Terminal.tsx or Navigation
const { currentView, setView } = useGameStore();

const renderView = () => {
  switch (currentView) {
    case 'dashboard': return <Dashboard />;
    case 'employees': return <EmployeeManagement />;
    case 'projects': return <ProjectManagement />;
    // ...
  }
};
```

### Component Hierarchy

```
App
├── Terminal (main layout)
│   ├── Terminal (command interface)
│   │   ├── Status Bar
│   │   ├── Output Area
│   │   └── Input Line
│   ├── GameSetup (initial screen)
│   ├── EventModal (popup events)
│   └── GameOverModal
└── Toaster (notifications)
```

---

## Key Abstractions

### 1. SimulationEngine

**Purpose:** Orchestrate monthly simulation ticks
**Why:** Centralizes game logic flow, makes testing easier
**Pattern:** Facade pattern over domain systems

### 2. \*Generator Classes

**Purpose:** Create randomized entities with constraints
**Classes:** `EmployeeGenerator`, `ProjectGenerator`, `NameGenerator`
**Why:** Separates creation logic from business logic

### 3. \*System Classes

**Purpose:** Encapsulate domain-specific logic
**Pattern:** Domain Service pattern
**Benefits:**

- Testable in isolation
- Clear separation of concerns
- Reusable across UI and commands

### 4. Command System

**Purpose:** Terminal interface logic
**Pattern:** Command pattern
**Components:**

- `Command` interface
- `commands` array (registry)
- Command execution in Terminal component

### 5. Store Actions

**Purpose:** Mutate state with business rules
**Pattern:** Action/Reducer hybrid
**Rules:**

- Validate before mutate
- Return success indicator
- No exceptions

---

## Data Flow

### User Action Flow

```
User Input (Terminal or UI)
    │
    ▼
Store Action (e.g., hireEmployee)
    │
    ▼
Validation (cash check, etc.)
    │
    ▼
State Mutation (via Zustand set)
    │
    ▼
UI Re-render (React + Zustand subscription)
    │
    ▼
Persistence (Zustand persist middleware)
```

### Monthly Simulation Flow

```
User clicks "Next Month"
    │
    ▼
advanceMonth() store action
    │
    ▼
SimulationEngine.processMonth()
    │
    ▼
[Multiple domain systems process]
    │
    ▼
State updates (company object mutated)
    │
    ▼
UI re-renders with new data
    │
    ▼
Events shown in modal (if any)
```

---

## Testing Strategy

### Unit Tests (Recommended)

**Priority 1: Domain Systems**

- `EmployeeSystem.updateMorale()`
- `FinancialSystem.calculateMonthlyFinances()`
- `ProjectSystem.calculateProjectOutcome()`

**Priority 2: Generators**

- `EmployeeGenerator.generateEmployee()`
- `ProjectGenerator.generateProject()`

**Priority 3: Commands**

- Each command handler
- Command parsing

### Integration Tests

- Full simulation tick
- Store action sequences
- UI component interactions

---

## Performance Considerations

### Optimizations in Place

1. **Zustand selectors** - Components only re-render when used state changes
2. **Memoization** - `useCallback` for event handlers in Terminal
3. **Object spreading** - `{ ...company }` for immutable updates
4. **History limiting** - Keep only last 50 events

### Potential Improvements

1. **Virtualization** - For large employee/project lists
2. **Memo** - React.memo for list items
3. **useMemo** - For expensive calculations in render

---

## Security Considerations

### Local-First Benefits

- No server to compromise
- No user data transmitted
- Save data is client-side only

### Potential Issues

- Save data can be manipulated (intended for this game type)
- No multiplayer cheating protection needed

---

## Future Architecture Evolution

### Possible Extensions

1. **Multiplayer (WebSocket)**
   - Add WebSocket layer
   - Server-authoritative simulation
   - Conflict resolution for concurrent actions

2. **Backend API**
   - Move simulation to server
   - Database persistence
   - User accounts

3. **Mod System**
   - Plugin architecture for custom events
   - JSON-based mod definitions
   - Runtime mod loading

4. **Save/Load System**
   - Compression for save data
   - Cloud save sync
   - Multiple save slots UI
