import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { terminalSound } from '@/utils/terminalSound';
import {
  BookOpen,
  Terminal,
  Users,
  Briefcase,
  DollarSign,
  Zap,
  Search,
  ChevronRight,
  Command,
} from 'lucide-react';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function HelpModal() {
  const { showHelpModal, setShowHelpModal } = useGameStore();
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('help-last-section') || 'getting-started';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  useEffect(() => {
    if (showHelpModal) {
      terminalSound.playBell();
    }
  }, [showHelpModal]);

  useEffect(() => {
    localStorage.setItem('help-last-section', activeSection);
  }, [activeSection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showHelpModal) return;

      if (e.key === 'Escape') {
        terminalSound.playKeystroke();
        setShowHelpModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelpModal, setShowHelpModal]);

  const sections: HelpSection[] = useMemo(
    () => [
      {
        id: 'getting-started',
        title: 'Getting Started',
        icon: <BookOpen className="w-4 h-4" />,
        content: <GettingStartedContent />,
      },
      {
        id: 'commands',
        title: 'Commands',
        icon: <Terminal className="w-4 h-4" />,
        content: <CommandsContent />,
      },
      {
        id: 'employees',
        title: 'Employees',
        icon: <Users className="w-4 h-4" />,
        content: <EmployeesContent />,
      },
      {
        id: 'projects',
        title: 'Projects',
        icon: <Briefcase className="w-4 h-4" />,
        content: <ProjectsContent />,
      },
      {
        id: 'finances',
        title: 'Finances & Strategy',
        icon: <DollarSign className="w-4 h-4" />,
        content: <FinancesContent />,
      },
      {
        id: 'events',
        title: 'Events & Tips',
        icon: <Zap className="w-4 h-4" />,
        content: <EventsContent />,
      },
    ],
    []
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const results = sections
        .filter((section) => {
          const sectionText = section.title.toLowerCase();
          return sectionText.includes(query);
        })
        .map((s) => s.id);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, sections]);

  if (!showHelpModal) return null;

  const activeContent = sections.find((s) => s.id === activeSection)?.content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-terminal/95 p-4">
      <div className="w-full max-w-5xl h-[85vh] border-2 border-terminal-green bg-terminal-dark screen-flicker flex flex-col">
        {/* Header */}
        <div className="border-b border-terminal-green bg-terminal-green/10 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-terminal-green font-mono font-bold text-lg">
              [ COMPANY_SIMULATOR_HELP_V2.0 ]
            </span>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-terminal-dim" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help..."
                className="bg-terminal border border-terminal-green-dark pl-8 pr-3 py-1 text-terminal-dim text-xs font-mono w-48 focus:outline-none focus:border-terminal-green"
              />
            </div>
          </div>
          <button
            onClick={() => {
              terminalSound.playKeystroke();
              setShowHelpModal(false);
            }}
            className="text-terminal-dim hover:text-terminal-red transition-colors font-mono text-sm"
          >
            [CLOSE]
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <nav className="w-56 border-r border-terminal-green-dark bg-terminal-dark/50 p-3 space-y-1 overflow-y-auto">
            {sections.map((section) => {
              const isActive = section.id === activeSection;
              const isSearchMatch = searchResults.includes(section.id);

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    terminalSound.playKeystroke();
                    setActiveSection(section.id);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left font-mono text-xs transition-all ${
                    isActive
                      ? 'bg-terminal-green/20 text-terminal-green border-l-2 border-terminal-green'
                      : 'text-terminal-dim hover:text-terminal-green hover:bg-terminal-green/10'
                  } ${isSearchMatch && searchQuery ? 'ring-1 ring-terminal-amber' : ''}`}
                >
                  {section.icon}
                  <span>{section.title}</span>
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 font-mono">{activeContent}</div>
        </div>

        {/* Footer */}
        <div className="border-t border-terminal-green-dark px-6 py-3 text-terminal-dim text-xs flex justify-between items-center">
          <span>[ESC] Close | Click sidebar to navigate</span>
          <span>Section: {sections.find((s) => s.id === activeSection)?.title}</span>
        </div>
      </div>
    </div>
  );
}

function GettingStartedContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-2xl font-bold mb-6">WELCOME TO COMPANY SIMULATOR</h2>

      <section className="space-y-3">
        <h3 className="text-terminal-amber text-lg font-bold">🎯 OBJECTIVE</h3>
        <p className="text-terminal-dim leading-relaxed">
          Build a successful tech company from scratch. Manage employees, complete projects, handle
          events, and grow your business while maintaining positive cash flow.
        </p>
        <div className="bg-terminal-green/10 border border-terminal-green-dark p-4 rounded">
          <p className="text-terminal-green text-sm">
            <strong>WIN CONDITION:</strong> Survive as long as possible, build a thriving company
          </p>
          <p className="text-terminal-red text-sm mt-2">
            <strong>LOSE CONDITION:</strong> Run out of cash (negative balance)
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-terminal-amber text-lg font-bold">🎮 INTERFACE OVERVIEW</h3>
        <div className="space-y-2 text-terminal-dim">
          <p>
            <strong className="text-terminal-cyan">Header:</strong> Shows live status - Month, Cash,
            Staff, Projects
          </p>
          <p>
            <strong className="text-terminal-cyan">Navigation:</strong> Dashboard, Employees,
            Projects, Finances, Achievements, Settings
          </p>
          <p>
            <strong className="text-terminal-cyan">Main View:</strong> Timeline, employee
            management, project details, etc.
          </p>
          <p>
            <strong className="text-terminal-cyan">Command Bar:</strong> Quick actions and
            terminal-style commands
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-terminal-amber text-lg font-bold">🚀 YOUR FIRST ACTIONS</h3>
        <div className="bg-terminal-dark border-l-4 border-terminal-green p-4 space-y-2">
          <p className="text-terminal-dim">
            <span className="text-terminal-green font-bold">1.</span> Create a project (Dashboard →
            New Project)
          </p>
          <p className="text-terminal-dim">
            <span className="text-terminal-green font-bold">2.</span> Assign yourself to the project
            (50% allocation recommended)
          </p>
          <p className="text-terminal-dim">
            <span className="text-terminal-green font-bold">3.</span> Advance to next month to see
            progress
          </p>
          <p className="text-terminal-dim">
            <span className="text-terminal-green font-bold">4.</span> Once you have cash, hire your
            first employee ($5,000 cost)
          </p>
          <p className="text-terminal-dim">
            <span className="text-terminal-green font-bold">5.</span> Assign employees to projects
            and grow your team!
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-terminal-amber text-lg font-bold">🔄 BASIC GAMEPLAY LOOP</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-terminal-green/5 p-3 border border-terminal-green-dark">
            <p className="text-terminal-green font-bold">Each Month:</p>
            <ul className="text-terminal-dim list-disc list-inside mt-2 space-y-1">
              <li>Payroll deducted</li>
              <li>Projects progress</li>
              <li>Events may trigger</li>
              <li>Random occurrences</li>
            </ul>
          </div>
          <div className="bg-terminal-amber/5 p-3 border border-terminal-amber-dark">
            <p className="text-terminal-amber font-bold">Your Actions:</p>
            <ul className="text-terminal-dim list-disc list-inside mt-2 space-y-1">
              <li>Hire/fire employees</li>
              <li>Create projects</li>
              <li>Assign workers</li>
              <li>Handle events</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function CommandsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-2xl font-bold mb-6">COMMAND REFERENCE</h2>

      <section className="space-y-4">
        <div className="bg-terminal-dark border border-terminal-green-dark p-4">
          <div className="flex items-center gap-2 mb-3">
            <Command className="w-5 h-5 text-terminal-cyan" />
            <h3 className="text-terminal-cyan text-lg font-bold">SYSTEM COMMANDS</h3>
          </div>

          <div className="space-y-3">
            <CommandItem
              name="help"
              description="Display available commands and usage information"
              usage="help [command]"
              example="help hire"
            />
            <CommandItem name="clear" description="Clear the terminal screen" usage="clear" />
            <CommandItem
              name="sound"
              description="Toggle terminal sound effects on/off"
              usage="sound [on|off]"
              example="sound off"
            />
          </div>
        </div>

        <div className="bg-terminal-dark border border-terminal-green-dark p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-terminal-green" />
            <h3 className="text-terminal-green text-lg font-bold">COMPANY COMMANDS</h3>
          </div>

          <div className="space-y-3">
            <CommandItem
              name="status"
              description="Display current company status and key metrics"
              usage="status"
              exampleOutput="Company: TestCorp | Month: 5 | Cash: $95,000 | Staff: 2"
            />

            <CommandItem
              name="finances"
              description="Show detailed financial breakdown"
              usage="finances"
              exampleOutput="Revenue: $0 | Payroll: -$5,800 | Rent: -$2,000 | Net: -$7,800"
            />

            <CommandItem
              name="culture"
              description="Display company culture metrics"
              usage="culture"
            />

            <CommandItem name="history" description="Show company history log" usage="history" />
          </div>
        </div>

        <div className="bg-terminal-dark border border-terminal-green-dark p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-terminal-amber" />
            <h3 className="text-terminal-amber text-lg font-bold">EMPLOYEE COMMANDS</h3>
          </div>

          <div className="space-y-3">
            <CommandItem
              name="staff"
              description="List all employees and their status"
              usage="staff"
              exampleOutput="1. You (Founder) - 50% busy | 2. Kevin Walker (Frontend) - 0% busy"
            />

            <CommandItem
              name="hire"
              description="Begin hiring process for a new employee"
              usage="hire"
              note="Costs $5,000. Opens candidate review dialog."
            />

            <CommandItem
              name="fire"
              description="Remove an employee from the company"
              usage="fire <employee>"
              example="fire Kevin Walker"
              note="Costs 2x monthly salary for severance. Cannot fire founder."
            />

            <CommandItem
              name="assign"
              description="Assign employee to a project"
              usage="assign <employee> to <project> [<allocation>%]"
              example="assign Kevin Walker to Payment Gateway 50%"
              note="Allocation must not exceed 100% total across all projects"
            />

            <CommandItem
              name="unassign"
              description="Remove employee from a project"
              usage="unassign <employee> from <project>"
              example="unassign Kevin Walker from Payment Gateway"
            />
          </div>
        </div>

        <div className="bg-terminal-dark border border-terminal-green-dark p-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-5 h-5 text-terminal-purple" />
            <h3 className="text-terminal-purple text-lg font-bold">PROJECT COMMANDS</h3>
          </div>

          <div className="space-y-3">
            <CommandItem
              name="projects"
              description="List all projects and their status"
              usage="projects"
              exampleOutput="1. Payment Gateway - 23% complete, Due: M6"
            />

            <CommandItem
              name="start"
              description="Create a new project"
              usage="start <type>"
              example="start client"
              note="Types: client (revenue), feature (product), maintenance, rnd"
            />

            <CommandItem
              name="complete"
              description="Mark project as complete (if progress 100%)"
              usage="complete <project>"
            />

            <CommandItem
              name="cancel"
              description="Cancel an active project"
              usage="cancel <project>"
              note="May affect reputation negatively"
            />
          </div>
        </div>

        <div className="bg-terminal-dark border border-terminal-green-dark p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-terminal-red" />
            <h3 className="text-terminal-red text-lg font-bold">EVENT COMMANDS</h3>
          </div>

          <div className="space-y-3">
            <CommandItem
              name="events"
              description="Show active events requiring your attention"
              usage="events"
            />

            <CommandItem
              name="resolve"
              description="Make a choice for an active event"
              usage="resolve <event> <choice>"
              example="resolve viral_success capitalize"
              note="Each event has multiple choices with different outcomes"
            />
          </div>
        </div>

        <div className="bg-terminal-dark border border-terminal-green-dark p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-terminal-cyan" />
            <h3 className="text-terminal-cyan text-lg font-bold">GAME COMMANDS</h3>
          </div>

          <div className="space-y-3">
            <CommandItem
              name="next"
              description="Advance to the next month"
              usage="next"
              note="Processes payroll, project progress, and triggers events"
            />

            <CommandItem
              name="achievements"
              description="Display unlocked achievements"
              usage="achievements"
            />

            <CommandItem name="save" description="Save current game state" usage="save" />

            <CommandItem name="load" description="Load saved game state" usage="load" />

            <CommandItem
              name="reset"
              description="Start a new game (clears all progress)"
              usage="reset"
              note="WARNING: This cannot be undone!"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function CommandItem({
  name,
  description,
  usage,
  example,
  exampleOutput,
  note,
}: {
  name: string;
  description: string;
  usage: string;
  example?: string;
  exampleOutput?: string;
  note?: string;
}) {
  return (
    <div className="border-l-2 border-terminal-dim pl-3">
      <div className="flex items-baseline gap-2">
        <span className="text-terminal-green font-bold">{name}</span>
        <span className="text-terminal-dim text-xs">{usage}</span>
      </div>
      <p className="text-terminal-dim text-sm mt-1">{description}</p>

      {example && (
        <div className="mt-2 text-xs">
          <span className="text-terminal-amber">Example: </span>
          <code className="text-terminal-cyan bg-terminal-dark px-1">{example}</code>
        </div>
      )}

      {exampleOutput && (
        <div className="mt-1 text-xs text-terminal-dark bg-terminal-dark/30 p-1 font-mono">
          → {exampleOutput}
        </div>
      )}

      {note && <p className="text-terminal-amber text-xs mt-1 italic">💡 {note}</p>}
    </div>
  );
}

function EmployeesContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-2xl font-bold mb-6">EMPLOYEE MANAGEMENT</h2>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">💼 HIRING PROCESS</h3>
        <div className="bg-terminal-dark border border-terminal-green-dark p-4 space-y-3">
          <p className="text-terminal-dim">
            <strong className="text-terminal-green">Cost:</strong> $5,000 per hire
          </p>
          <div className="space-y-2 text-terminal-dim text-sm">
            <p>
              1. Click "Hire Employee" button or use{' '}
              <code className="text-terminal-cyan">hire</code> command
            </p>
            <p>2. Review candidate details in the dialog:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Name and Role</li>
              <li>Personality Type (affects behavior)</li>
              <li>Skills (Technical, Sales, Design, Management)</li>
              <li>Monthly Salary</li>
            </ul>
            <p>3. Click "Hire" to confirm or "Reject" to dismiss</p>
          </div>

          <div className="bg-terminal-amber/10 border border-terminal-amber p-3 text-xs">
            <p className="text-terminal-amber">
              ⚠️ Important: You cannot hire if you have less than $5,000 cash
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">👤 EMPLOYEE STATS EXPLAINED</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-terminal-dark border border-terminal-green-dark p-3">
            <h4 className="text-terminal-cyan font-bold mb-2">Skills</h4>
            <ul className="text-terminal-dim text-sm space-y-1">
              <li>
                <strong>Technical:</strong> Coding, engineering
              </li>
              <li>
                <strong>Sales:</strong> Client relations, pitching
              </li>
              <li>
                <strong>Design:</strong> UI/UX, graphics
              </li>
              <li>
                <strong>Management:</strong> Leadership, planning
              </li>
            </ul>
          </div>

          <div className="bg-terminal-dark border border-terminal-green-dark p-3">
            <h4 className="text-terminal-cyan font-bold mb-2">Attributes</h4>
            <ul className="text-terminal-dim text-sm space-y-1">
              <li>
                <strong>Morale:</strong> 0-100%, affects productivity
              </li>
              <li>
                <strong>Loyalty:</strong> Likelihood to quit
              </li>
              <li>
                <strong>Productivity:</strong> Multiplier (0.5x - 2.0x)
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">🎭 PERSONALITY TYPES</h3>

        <div className="space-y-3">
          <PersonalityCard
            name="Leader"
            description="Natural manager who unlocks team bonuses"
            effect="+10% team productivity when assigned with others"
          />

          <PersonalityCard
            name="Innovator"
            description="Creative problem solver"
            effect="+15% quality on R&D projects, may suggest new features"
          />

          <PersonalityCard
            name="Workhorse"
            description="Steady, reliable, never quits"
            effect="High loyalty, consistent output, -5% burnout risk"
          />

          <PersonalityCard
            name="Perfectionist"
            description="Obsessed with quality"
            effect="+20% quality, -10% speed, stressed by tight deadlines"
          />

          <PersonalityCard
            name="Socializer"
            description="Team morale booster"
            effect="+5% morale to all team members, good for client projects"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">🔥 FIRING EMPLOYEES</h3>

        <div className="bg-terminal-red/10 border border-terminal-red p-4">
          <p className="text-terminal-dim mb-2">
            <strong className="text-terminal-red">Severance Cost:</strong> 2x monthly salary
          </p>

          <div className="text-terminal-dim text-sm space-y-2">
            <p>• Click the trash icon on employee card</p>
            <p>• Confirm in the dialog (shows severance cost)</p>
            <p>• Employee immediately removed from all projects</p>
            <p>• Cannot fire if insufficient funds for severance</p>
            <p className="text-terminal-green font-bold mt-2">✓ Founder (You) cannot be fired</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">📋 ASSIGNMENT STRATEGIES</h3>

        <div className="bg-terminal-dark border border-terminal-green-dark p-4 space-y-3">
          <div className="text-terminal-dim text-sm">
            <p className="mb-2">
              <strong className="text-terminal-cyan">Optimal Workload:</strong> 80-100% per employee
            </p>

            <p className="mb-2">
              <strong className="text-terminal-cyan">Skill Matching:</strong> Assign employees with
              skills matching project needs
            </p>

            <div className="bg-terminal-green/5 p-3 mt-2">
              <p className="text-terminal-green font-bold mb-1">Example Assignment:</p>
              <p>Frontend Developer (Tech: 50, Design: 28) → Website Project</p>
              <p className="text-terminal-dim mt-1">
                Allocation: 50% Website + 50% Mobile App = 100% utilized ✓
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PersonalityCard({
  name,
  description,
  effect,
}: {
  name: string;
  description: string;
  effect: string;
}) {
  return (
    <div className="bg-terminal-dark border border-terminal-green-dark p-3">
      <div className="flex justify-between items-start">
        <h4 className="text-terminal-cyan font-bold">{name}</h4>
      </div>
      <p className="text-terminal-dim text-sm mt-1">{description}</p>
      <p className="text-terminal-amber text-xs mt-2">⚡ {effect}</p>
    </div>
  );
}

function ProjectsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-2xl font-bold mb-6">PROJECT MANAGEMENT</h2>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">📁 PROJECT TYPES</h3>

        <div className="grid grid-cols-2 gap-4">
          <ProjectTypeCard
            type="Client Work"
            icon="💼"
            description="Revenue-generating projects for external clients"
            reward="$$$ - Immediate cash payment on completion"
            risk="Medium - Deadlines affect reputation"
          />

          <ProjectTypeCard
            type="Product Feature"
            icon="✨"
            description="Internal development of your product"
            reward="Reputation boost, unlocks new capabilities"
            risk="Low - No deadline pressure"
          />

          <ProjectTypeCard
            type="Maintenance"
            icon="🔧"
            description="Keeping systems running smoothly"
            reward="Prevents negative events, small reputation gain"
            risk="Low - Should not be neglected"
          />

          <ProjectTypeCard
            type="R&D"
            icon="🔬"
            description="Research and development projects"
            reward="Long-term benefits, innovation bonuses"
            risk="High - No immediate payoff, pure investment"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">📊 PROJECT MECHANICS</h3>

        <div className="bg-terminal-dark border border-terminal-green-dark p-4 space-y-4">
          <div>
            <h4 className="text-terminal-cyan font-bold mb-2">Complexity (1-10)</h4>
            <p className="text-terminal-dim text-sm">
              Higher complexity means slower progress and requires more skilled employees. A project
              with complexity 5 takes ~10 months with one average employee at 100% allocation.
            </p>
          </div>

          <div>
            <h4 className="text-terminal-cyan font-bold mb-2">Deadline</h4>
            <p className="text-terminal-dim text-sm">
              Month by which project must be completed. Missing deadlines:
            </p>
            <ul className="text-terminal-dim text-sm list-disc list-inside mt-1">
              <li>Project fails</li>
              <li>Reputation decreases</li>
              <li>No payment received</li>
            </ul>
          </div>

          <div>
            <h4 className="text-terminal-cyan font-bold mb-2">Progress Calculation</h4>
            <div className="bg-terminal-dark/50 p-3 text-xs font-mono space-y-1">
              <p className="text-terminal-green">Base Progress: 10% per month</p>
              <p className="text-terminal-dim">× Skill Match (0.5x - 1.5x)</p>
              <p className="text-terminal-dim">× Average Productivity (0.5x - 2.0x)</p>
              <p className="text-terminal-dim">÷ √Complexity (penalty)</p>
              <p className="text-terminal-amber mt-2 border-t border-terminal-green-dark pt-1">
                = Final Monthly Progress
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">⭐ QUALITY & TECH DEBT</h3>

        <div className="space-y-3">
          <div className="bg-terminal-dark border border-terminal-green-dark p-4">
            <h4 className="text-terminal-cyan font-bold mb-2">Quality System</h4>
            <p className="text-terminal-dim text-sm mb-2">
              Quality affects payment and reputation:
            </p>
            <ul className="text-terminal-dim text-sm space-y-1">
              <li>
                <span className="text-terminal-green">90%+:</span> 120% payment, +5 reputation
              </li>
              <li>
                <span className="text-terminal-green">70-89%:</span> 100% payment, +2 reputation
              </li>
              <li>
                <span className="text-terminal-amber">50-69%:</span> 80% payment, no reputation
                change
              </li>
              <li>
                <span className="text-terminal-red">&lt;50%:</span> 0% payment, -5 reputation
              </li>
            </ul>
          </div>

          <div className="bg-terminal-red/10 border border-terminal-red p-4">
            <h4 className="text-terminal-red font-bold mb-2">Tech Debt ⚠️</h4>
            <p className="text-terminal-dim text-sm">
              Accumulates when skill match is poor (&lt;60%). Each 1% tech debt reduces final
              quality by 0.5%. Avoid by assigning skilled employees!
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">🎯 COMPLETION & PAYMENT</h3>

        <div className="bg-terminal-green/10 border border-terminal-green p-4">
          <p className="text-terminal-dim mb-3">When a project reaches 100% progress:</p>

          <ol className="text-terminal-dim text-sm space-y-2 list-decimal list-inside">
            <li>Status changes to "Completed"</li>
            <li>Payment calculated based on final quality</li>
            <li>Cash added to company balance</li>
            <li>Reputation updated</li>
            <li>Employees freed up for new assignments</li>
          </ol>

          <div className="bg-terminal-dark p-3 mt-3 text-xs font-mono">
            <p className="text-terminal-amber">Example:</p>
            <p className="text-terminal-dim">Project Value: $25,000</p>
            <p className="text-terminal-dim">Final Quality: 85%</p>
            <p className="text-terminal-green">→ Payment: $25,000 (100%) + 2 reputation</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProjectTypeCard({
  type,
  icon,
  description,
  reward,
  risk,
}: {
  type: string;
  icon: string;
  description: string;
  reward: string;
  risk: string;
}) {
  return (
    <div className="bg-terminal-dark border border-terminal-green-dark p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <h4 className="text-terminal-cyan font-bold">{type}</h4>
      </div>
      <p className="text-terminal-dim text-sm mb-2">{description}</p>
      <p className="text-terminal-green text-xs">💰 {reward}</p>
      <p className="text-terminal-amber text-xs">⚠️ {risk}</p>
    </div>
  );
}

function FinancesContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-2xl font-bold mb-6">FINANCES & STRATEGY</h2>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">💵 REVENUE SOURCES</h3>

        <div className="bg-terminal-green/10 border border-terminal-green p-4">
          <h4 className="text-terminal-green font-bold mb-2">Primary Income</h4>
          <p className="text-terminal-dim text-sm">
            <strong>Completed Projects:</strong> Client work pays immediately upon completion.
            Payment amount depends on project value and quality rating.
          </p>

          <div className="bg-terminal-dark p-3 mt-3 text-xs">
            <p className="text-terminal-cyan">Payment Formula:</p>
            <p className="text-terminal-dim mt-1">
              Base Value × Quality Multiplier = Final Payment
            </p>
            <ul className="text-terminal-dim mt-1 space-y-0.5">
              <li>90%+ Quality: 1.2x (120%)</li>
              <li>70-89% Quality: 1.0x (100%)</li>
              <li>50-69% Quality: 0.8x (80%)</li>
              <li>&lt;50% Quality: 0x (0%)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">💸 EXPENSE BREAKDOWN</h3>

        <div className="space-y-3">
          <ExpenseItem
            name="Payroll"
            description="Employee salaries paid monthly"
            example="2 employees × $5,800 avg = $11,600/month"
            tip="Biggest expense - optimize team size"
          />

          <ExpenseItem
            name="Tools & Equipment"
            description="Software licenses, hardware, cloud services"
            example="~$500/month base + $200/employee"
            tip="Scales with team size"
          />

          <ExpenseItem
            name="Office Rent"
            description="Fixed monthly office space cost"
            example="$2,000/month (fixed)"
            tip="Cannot be reduced"
          />

          <ExpenseItem
            name="Hiring Costs"
            description="One-time fee per new hire"
            example="$5,000 per hire"
            tip="Plan hires carefully"
          />

          <ExpenseItem
            name="Severance"
            description="Cost to fire an employee"
            example="2 × monthly salary"
            tip="Can be expensive for senior staff"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">📈 CASH FLOW MANAGEMENT</h3>

        <div className="bg-terminal-dark border border-terminal-green-dark p-4 space-y-4">
          <div>
            <h4 className="text-terminal-cyan font-bold mb-2">Runway Calculation</h4>
            <div className="bg-terminal-dark/50 p-3 text-center">
              <p className="text-terminal-green text-lg font-bold">Cash ÷ Monthly Burn = Runway</p>
            </div>
            <p className="text-terminal-dim text-sm mt-2">
              Example: $95,000 ÷ $15,000/month ={' '}
              <span className="text-terminal-amber">6.3 months runway</span>
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <p className="text-terminal-green">🟢 Safe: 6+ months</p>
              <p className="text-terminal-amber">🟡 Warning: 3-6 months</p>
              <p className="text-terminal-red">🔴 Danger: &lt;3 months</p>
            </div>
          </div>

          <div className="border-t border-terminal-green-dark pt-4">
            <h4 className="text-terminal-cyan font-bold mb-2">Break-Even Analysis</h4>
            <p className="text-terminal-dim text-sm">
              To maintain positive cash flow, complete projects worth more than your monthly burn
              rate.
            </p>
            <div className="bg-terminal-dark/50 p-3 mt-2 text-xs">
              <p className="text-terminal-amber">Example Strategy:</p>
              <p className="text-terminal-dim">Monthly Burn: $15,000</p>
              <p className="text-terminal-dim">Project Value: $25,000</p>
              <p className="text-terminal-dim">Project Duration: 5 months</p>
              <p className="text-terminal-green mt-1">
                → Need 3+ concurrent projects to break even
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">🌟 REPUTATION SYSTEM</h3>

        <div className="bg-terminal-dark border border-terminal-green-dark p-4">
          <p className="text-terminal-dim text-sm mb-3">
            Reputation (0-100) affects event frequency and project opportunities:
          </p>

          <div className="space-y-2">
            <ReputationLevel
              range="0-25"
              label="Unknown"
              effects="Fewer project opportunities, negative events more likely"
              color="text-terminal-red"
            />
            <ReputationLevel
              range="26-50"
              label="Developing"
              effects="Standard gameplay, neutral events"
              color="text-terminal-amber"
            />
            <ReputationLevel
              range="51-75"
              label="Established"
              effects="Better project values, positive events more likely"
              color="text-terminal-green"
            />
            <ReputationLevel
              range="76-100"
              label="Industry Leader"
              effects="High-value projects, premium clients, rare bonuses"
              color="text-terminal-cyan"
            />
          </div>

          <div className="mt-3 text-xs text-terminal-dim">
            <p className="text-terminal-amber">💡 Ways to increase reputation:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Complete projects with high quality</li>
              <li>Meet or beat deadlines</li>
              <li>Make positive event choices</li>
              <li>Unlock achievements</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">⚖️ CULTURE DIMENSIONS</h3>

        <div className="grid grid-cols-2 gap-4">
          <CultureCard
            name="Speed"
            low="Careful, methodical work"
            high="Fast-paced, deadline-driven"
            impact="Affects project progress rate"
          />
          <CultureCard
            name="Quality"
            low="Ship fast, fix later"
            high="Perfectionism, thorough testing"
            impact="Affects final project quality"
          />
          <CultureCard
            name="Work/Life"
            low="Crunch time expected"
            high="Strict boundaries, flexible hours"
            impact="Affects morale and retention"
          />
          <CultureCard
            name="Hierarchy"
            low="Flat structure, autonomy"
            high="Clear chains of command"
            impact="Affects decision-making speed"
          />
        </div>

        <div className="bg-terminal-amber/10 border border-terminal-amber p-3 mt-3">
          <p className="text-terminal-amber text-sm">
            💡 <strong>Balanced Culture:</strong> Keeping all dimensions between 40-60% unlocks the
            "Goldilocks Zone" achievement and provides team bonuses!
          </p>
        </div>
      </section>
    </div>
  );
}

function ExpenseItem({
  name,
  description,
  example,
  tip,
}: {
  name: string;
  description: string;
  example: string;
  tip: string;
}) {
  return (
    <div className="bg-terminal-dark border border-terminal-green-dark p-3">
      <div className="flex justify-between items-start">
        <h4 className="text-terminal-red font-bold">{name}</h4>
      </div>
      <p className="text-terminal-dim text-sm mt-1">{description}</p>
      <div className="bg-terminal-dark/50 p-2 mt-2 text-xs font-mono">
        <span className="text-terminal-cyan">Example: </span>
        <span className="text-terminal-dim">{example}</span>
      </div>
      <p className="text-terminal-amber text-xs mt-2">💡 {tip}</p>
    </div>
  );
}

function ReputationLevel({
  range,
  label,
  effects,
  color,
}: {
  range: string;
  label: string;
  effects: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className={`font-bold ${color} min-w-[60px]`}>{range}</span>
      <div>
        <span className={`font-bold ${color}`}>{label}</span>
        <p className="text-terminal-dim text-xs">{effects}</p>
      </div>
    </div>
  );
}

function CultureCard({
  name,
  low,
  high,
  impact,
}: {
  name: string;
  low: string;
  high: string;
  impact: string;
}) {
  return (
    <div className="bg-terminal-dark border border-terminal-green-dark p-3">
      <h4 className="text-terminal-cyan font-bold mb-2">{name}</h4>
      <div className="space-y-1 text-xs">
        <p>
          <span className="text-terminal-red">Low:</span>{' '}
          <span className="text-terminal-dim">{low}</span>
        </p>
        <p>
          <span className="text-terminal-green">High:</span>{' '}
          <span className="text-terminal-dim">{high}</span>
        </p>{' '}
      </div>
      <p className="text-terminal-amber text-xs mt-2">⚡ {impact}</p>
    </div>
  );
}

function EventsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-2xl font-bold mb-6">EVENTS & TIPS</h2>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">⚡ EVENT SYSTEM</h3>

        <div className="bg-terminal-dark border border-terminal-green-dark p-4 space-y-4">
          <p className="text-terminal-dim">
            Events are random occurrences that require your decision. They can have positive,
            negative, or mixed outcomes depending on your choices.
          </p>

          <div>
            <h4 className="text-terminal-cyan font-bold mb-2">Event Types</h4>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-terminal-green/10 p-2 border border-terminal-green">
                <p className="text-terminal-green font-bold">Positive</p>
                <p className="text-terminal-dim text-xs">
                  Viral success, investment offers, talented applicants
                </p>
              </div>
              <div className="bg-terminal-amber/10 p-2 border border-terminal-amber">
                <p className="text-terminal-amber font-bold">Neutral</p>
                <p className="text-terminal-dim text-xs">
                  Industry changes, client requests, team conflicts
                </p>
              </div>
              <div className="bg-terminal-red/10 p-2 border border-terminal-red">
                <p className="text-terminal-red font-bold">Negative</p>
                <p className="text-terminal-dim text-xs">
                  System failures, unhappy clients, market crashes
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-terminal-cyan font-bold mb-2">How to Respond</h4>

            <ol className="text-terminal-dim text-sm space-y-2 list-decimal list-inside">
              <li>Event modal appears automatically when triggered</li>
              <li>Read the description carefully</li>
              <li>Review each choice and its potential consequences</li>
              <li>Click your decision - consequences apply immediately</li>
              <li>Multiple events may queue up - resolve them one by one</li>
            </ol>
          </div>

          <div className="bg-terminal-dark/50 p-3">
            <p className="text-terminal-amber text-sm">
              💡 Tip: Some choices cost cash but prevent worse outcomes later. Short-term pain for
              long-term gain!
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">🎯 BEGINNER TIPS</h3>

        <div className="space-y-3">
          <TipCard
            icon="💰"
            title="Watch Your Cash"
            content="Don't hire too quickly. Ensure you have 6+ months runway before expanding."
          />
          <TipCard
            icon="👥"
            title="Start Small"
            content="Work on 1-2 projects initially. Overcommitting leads to missed deadlines."
          />
          <TipCard
            icon="⚖️"
            title="Balance Workloads"
            content="Keep employees at 80-100% allocation. Underworked employees cost money without contributing."
          />
          <TipCard
            icon="🎓"
            title="Skill Match Matters"
            content="Assign employees to projects matching their skills. Mismatches create tech debt."
          />
          <TipCard
            icon="😊"
            title="Monitor Morale"
            content="Happy employees are productive. Watch for morale drops and adjust workloads."
          />
          <TipCard
            icon="📅"
            title="Plan for Deadlines"
            content="Calculate if you can complete projects before their due dates. Late = failed project."
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">🚀 ADVANCED STRATEGIES</h3>

        <div className="space-y-3">
          <StrategyCard
            title="The Balanced Portfolio"
            description="Mix project types for stable income:"
            points={[
              '60% Client Work (revenue)',
              '20% Product Features (growth)',
              '10% Maintenance (stability)',
              '10% R&D (future tech)',
            ]}
          />
          <StrategyCard
            title="The Quality Rush"
            description="Focus on high-quality delivery:"
            points={[
              'Assign skilled employees (80+ relevant skill)',
              'Keep morale above 80%',
              "Don't overload workers (max 90% allocation)",
              'Aim for 90%+ quality on client projects',
            ]}
          />
          <StrategyCard
            title="The Growth Explosion"
            description="Aggressive expansion strategy:"
            points={[
              'Hire aggressively when cash allows',
              'Take on multiple concurrent projects',
              'Accept risk of occasional failures',
              'Reinvest all profits into team growth',
            ]}
          />
          <StrategyCard
            title="The Culture Master"
            description="Optimize team performance:"
            points={[
              'Keep culture dimensions balanced (40-60%)',
              'Match personalities to roles',
              'Mix personality types for bonuses',
              'Fire low performers quickly',
            ]}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">⚠️ COMMON MISTAKES</h3>

        <div className="bg-terminal-red/10 border border-terminal-red p-4 space-y-3">
          <MistakeItem
            mistake="Hiring too fast"
            consequence="Payroll drains cash before projects complete"
            fix="Hire only when you have 6+ months runway"
          />
          <MistakeItem
            mistake="Ignoring deadlines"
            consequence="Projects fail, reputation tanks"
            fix="Calculate completion dates before accepting"
          />
          <MistakeItem
            mistake="Wrong skill assignments"
            consequence="Low quality, tech debt accumulates"
            fix="Match employee skills to project needs"
          />
          <MistakeItem
            mistake="Neglecting morale"
            consequence="Employees quit, productivity drops"
            fix="Monitor morale, reduce workloads if needed"
          />
          <MistakeItem
            mistake="Overworking founder"
            consequence="Burnout events, reduced productivity"
            fix="Delegate work, hire early"
          />
          <MistakeItem
            mistake="Taking bad event choices"
            consequence="Cash loss, reputation damage"
            fix="Read carefully, consider long-term impact"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-terminal-amber text-lg font-bold">🏆 ACHIEVEMENT HUNTING</h3>

        <div className="bg-terminal-dark border border-terminal-green-dark p-4">
          <p className="text-terminal-dim text-sm mb-3">
            Unlock achievements for bragging rights and tracking progress:
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-terminal-green font-bold">Early Game:</p>
              <ul className="text-terminal-dim list-disc list-inside space-y-0.5 mt-1">
                <li>First Steps (6 months)</li>
                <li>Growing Team (1st hire)</li>
                <li>First Delivery (1st project)</li>
                <li>In the Black (profit)</li>
              </ul>
            </div>
            <div>
              <p className="text-terminal-cyan font-bold">Mid Game:</p>
              <ul className="text-terminal-dim list-disc list-inside space-y-0.5 mt-1">
                <li>One Year Anniversary</li>
                <li>Small but Mighty (5 staff)</li>
                <li>Goldilocks Zone (balanced culture)</li>
                <li>Perfect Execution (90%+ quality)</li>
              </ul>
            </div>
            <div>
              <p className="text-terminal-purple font-bold">Late Game:</p>
              <ul className="text-terminal-dim list-disc list-inside space-y-0.5 mt-1">
                <li>Established (2 years)</li>
                <li>Double Digits (10 staff)</li>
                <li>Half Million (cash)</li>
                <li>Industry Leader (95 rep)</li>
              </ul>
            </div>
            <div>
              <p className="text-terminal-amber font-bold">Epic:</p>
              <ul className="text-terminal-dim list-disc list-inside space-y-0.5 mt-1">
                <li>Legacy (5 years)</li>
                <li>Unicorn Team (25 staff)</li>
                <li>Millionaire ($1M cash)</li>
                <li>Retention Master (no quitters)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TipCard({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="bg-terminal-dark border border-terminal-green-dark p-3 flex gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <h4 className="text-terminal-cyan font-bold">{title}</h4>
        <p className="text-terminal-dim text-sm">{content}</p>
      </div>
    </div>
  );
}

function StrategyCard({
  title,
  description,
  points,
}: {
  title: string;
  description: string;
  points: string[];
}) {
  return (
    <div className="bg-terminal-dark border border-terminal-green-dark p-4">
      <h4 className="text-terminal-amber font-bold mb-1">{title}</h4>
      <p className="text-terminal-dim text-sm mb-2">{description}</p>
      <ul className="text-terminal-dim text-xs space-y-1 list-disc list-inside">
        {points.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
    </div>
  );
}

function MistakeItem({
  mistake,
  consequence,
  fix,
}: {
  mistake: string;
  consequence: string;
  fix: string;
}) {
  return (
    <div className="border-l-2 border-terminal-red pl-3">
      <p className="text-terminal-red font-bold text-sm">❌ {mistake}</p>
      <p className="text-terminal-dim text-xs">
        <strong>Result:</strong> {consequence}
      </p>
      <p className="text-terminal-green text-xs">
        <strong>Fix:</strong> {fix}
      </p>
    </div>
  );
}

export default HelpModal;
