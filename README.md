# Company Simulator

A terminal-style React game for managing a software company. Hire employees, manage projects, balance finances, and grow your startup in this retro CRT-themed simulation.

![Terminal Theme](https://img.shields.io/badge/Theme-Terminal%20CRT-green?style=flat-square)
![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)

## Features

- **Employee Management**: Hire, manage, and maintain employee morale
- **Project System**: Take on software projects with varying complexity
- **Financial Simulation**: Balance cash flow, salaries, and revenue
- **Company Culture**: Dynamic culture system affecting productivity
- **Random Events**: Unexpected challenges and opportunities
- **Achievements**: Unlock milestones as you grow
- **Terminal Aesthetic**: Authentic CRT monitor experience with sound effects
- **Persistent State**: Game progress saved automatically

## Tech Stack

| Category  | Technology                 |
| --------- | -------------------------- |
| Framework | React 19 + Vite            |
| Language  | TypeScript 5.9             |
| Styling   | Tailwind CSS 4 + shadcn/ui |
| State     | Zustand (with persistence) |
| Animation | Framer Motion              |
| Charts    | Recharts                   |
| Icons     | Lucide React               |

## Getting Started

### Prerequisites

- Node.js 18+
- bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd kimi

# Install dependencies
bun install

# Start development server
bun run dev
```

The game will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── dashboard/      # Dashboard views
│   ├── employees/      # Employee management
│   └── projects/       # Project views
├── engine/             # Game simulation logic
│   ├── core/           # SimulationEngine.ts
│   ├── employees/      # EmployeeSystem.ts
│   ├── projects/       # ProjectSystem.ts
│   ├── finances/       # FinancialSystem.ts
│   ├── events/         # EventSystem.ts
│   └── culture/        # CultureSystem.ts
├── generators/         # Entity generators
│   ├── EmployeeGenerator.ts
│   └── ProjectGenerator.ts
├── store/              # Zustand state management
│   └── gameStore.ts
├── types/              # TypeScript definitions
├── utils/              # Utility functions
│   ├── commands.ts
│   └── terminalSound.ts
├── data/               # Static data
│   ├── personalities.ts
│   └── achievements.ts
└── hooks/              # Custom React hooks
```

## Available Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run lint`    | Run ESLint               |
| `npm run preview` | Preview production build |

## Game Mechanics

### Core Systems

- **Simulation Engine**: Orchestrates monthly progression
- **Employee System**: Manages hiring, skills, and morale
- **Project System**: Handles project lifecycle and completion
- **Financial System**: Tracks cash flow and profitability
- **Event System**: Generates random events
- **Culture System**: Manages company culture and environment

### Terminal Commands

The game features a command-line interface:

- `help` - Show available commands
- `hire <name>` - Hire a new employee
- `project <name>` - Start a new project
- `advance` - Advance to next month
- `status` - View company status
- And more...

## Design Decisions

- **Named Exports**: All components use named exports (except App.tsx)
- **Local-First**: No backend required, all data stored in browser
- **Type Safety**: Strict TypeScript with no `any` types
- **Path Aliases**: All imports use `@/` for consistency
- **Class-based Engines**: Game logic encapsulated in classes

## Contributing

1. Follow existing code patterns in `.project-patterns/`
2. Use PascalCase for components and classes
3. Use camelCase for utilities and hooks
4. Maintain terminal aesthetic in all UI components
