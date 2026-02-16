import type { Command, CommandResult } from '@/types/terminal';
import { useGameStore } from '@/store/gameStore';
import { terminalSound } from '@/utils/terminalSound';
import { personalities } from '@/data/personalities';
import { achievements } from '@/data/achievements';
import type { Project } from '@/types';

// Helper to format currency
const formatMoney = (amount: number): string => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
};

// Helper to format errors with examples and tips
interface ErrorContext {
  command: string;
  usage: string;
  examples?: string[];
  tips?: string[];
}

const formatError = (error: string, context: ErrorContext): string => {
  let output = `ERROR: ${error}\n\n`;
  output += `USAGE: ${context.usage}`;

  if (context.examples && context.examples.length > 0) {
    output += '\n\nEXAMPLES:';
    context.examples.forEach((ex) => {
      output += `\n  ${ex}`;
    });
  }

  if (context.tips && context.tips.length > 0) {
    output += '\n\nTIPS:';
    context.tips.forEach((tip) => {
      output += `\n  • ${tip}`;
    });
  }

  return output;
};

// Helper to create box border
const createBox = (title: string, content: string[]): string => {
  const width = Math.max(title.length + 4, ...content.map((line) => line.length)) + 4;
  const top = `╔${'═'.repeat(width - 2)}╗`;
  const titleLine = `║ ${title.padEnd(width - 4)} ║`;
  const separator = `╠${'═'.repeat(width - 2)}╣`;
  const bottom = `╚${'═'.repeat(width - 2)}╝`;

  const contentLines = content.map((line) => `║ ${line.padEnd(width - 4)} ║`);

  return [top, titleLine, separator, ...contentLines, bottom].join('\n');
};

// ASCII Art Logo
const getLogo = (): string => {
  return `
 ██████╗ ██████╗ ███╗   ███╗██████╗  █████╗ ███╗   ██╗██╗   ██╗
██╔════╝██╔═══██╗████╗ ████║██╔══██╗██╔══██╗████╗  ██║╚██╗ ██╔╝
██║     ██║   ██║██╔████╔██║██████╔╝███████║██╔██╗ ██║ ╚████╔╝ 
██║     ██║   ██║██║╚██╔╝██║██╔══██╗██╔══██║██║╚██╗██║  ╚██╔╝  
╚██████╗╚██████╔╝██║ ╚═╝ ██║██████╔╝██║  ██║██║ ╚████║   ██║   
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   
          ███████╗██╗███╗   ███╗██╗   ██╗██╗      █████╗ ████████╗ ██████╗ ██████╗ 
          ██╔════╝██║████╗ ████║██║   ██║██║     ██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗
          ███████╗██║██╔████╔██║██║   ██║██║     ███████║   ██║   ██║   ██║██████╔╝
          ╚════██║██║██║╚██╔╝██║██║   ██║██║     ██╔══██║   ██║   ██║   ██║██╔══██╗
          ███████║██║██║ ╚═╝ ██║╚██████╔╝███████╗██║  ██║   ██║   ╚██████╔╝██║  ██║
          ╚══════╝╚═╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
`;
};

// Command Registry
export const commands: Command[] = [
  // System Commands
  {
    name: 'help',
    aliases: ['?', 'h'],
    description: 'Display available commands',
    usage: 'help [command]',
    handler: (args): CommandResult => {
      const categories: Record<string, string[]> = {
        system: ['help', 'clear', 'exit', 'sound'],
        company: ['status', 'finances', 'culture', 'history'],
        employees: ['staff', 'hire', 'fire', 'assign', 'unassign'],
        projects: ['projects', 'start', 'complete', 'cancel'],
        events: ['events', 'resolve'],
        game: ['next', 'save', 'load', 'reset'],
      };

      const categoryDescriptions: Record<string, string> = {
        system: 'System commands for terminal control',
        company: 'View and manage company information',
        employees: 'Hire, fire, and assign employees',
        projects: 'Create and manage projects',
        events: 'Handle random events',
        game: 'Game flow and save management',
      };

      // Check if filtering by category first
      if (args.length > 0) {
        const categoryFilter = args[0].toLowerCase();
        if (categories[categoryFilter]) {
          const cmds = categories[categoryFilter];
          const commandList = cmds.map((c) => {
            const cmd = commands.find((cmd) => cmd.name === c);
            return `  ${c.padEnd(12)} ${cmd?.description || ''}`;
          });

          const output = createBox(`${categoryFilter.toUpperCase()} COMMANDS`, [
            categoryDescriptions[categoryFilter],
            '',
            ...commandList,
            '',
            'Type "help [command]" for detailed help on any command.',
          ]);

          return { success: true, output };
        }

        // If not a category, check if it's a command
        const cmd = commands.find((c) => c.name === args[0] || c.aliases?.includes(args[0]));
        if (cmd) {
          return {
            success: true,
            output: createBox(`HELP: ${cmd.name.toUpperCase()}`, [
              `Description: ${cmd.description}`,
              `Usage: ${cmd.usage}`,
              ...(cmd.args?.map(
                (arg) =>
                  `  ${arg.name}${arg.required ? '' : '?'} - ${arg.description}${arg.choices ? ` [${arg.choices.join('|')}]` : ''}`
              ) || []),
              ...(cmd.aliases ? [`Aliases: ${cmd.aliases.join(', ')}`] : []),
            ]),
          };
        }

        return { success: false, output: '', error: `Unknown command or category: ${args[0]}` };
      }

      // Show all categories overview
      let output = getLogo() + '\n\n';
      output += createBox('COMPANY SIMULATOR TERMINAL v2.0', [
        'Welcome to the Company Simulator command-line interface.',
        '',
        'Type "help [category]" for command groups',
        'Type "help [command]" for detailed information.',
        '',
        'Use TAB for command completion, UP/DOWN for history.',
      ]);
      output += '\n\n';

      const categoryList = Object.keys(categories).map((category) => {
        return `  ${category.padEnd(12)} ${categoryDescriptions[category]}`;
      });

      output += createBox('COMMAND CATEGORIES', categoryList);

      return { success: true, output };
    },
  },

  {
    name: 'clear',
    aliases: ['cls'],
    description: 'Clear the terminal screen',
    usage: 'clear',
    handler: (): CommandResult => {
      const { company } = useGameStore.getState();

      let output = '';
      if (company) {
        const activeProjects = company.projects.filter((p) => p.status === 'inProgress').length;
        const activeEmployees = company.employees.filter((e) => !e.quitMonth).length;

        output = createBox(`${company.name.toUpperCase()} - Month ${company.currentMonth}`, [
          `Cash: ${formatMoney(company.cash)}  |  Employees: ${activeEmployees}`,
          `Projects: ${activeProjects} active`,
          '',
          'Type "help" for commands, "status" for full report.',
        ]);
      }

      return {
        success: true,
        output,
        clear: true,
      };
    },
  },

  {
    name: 'exit',
    aliases: ['quit', 'q'],
    description: 'Exit to main menu',
    usage: 'exit',
    handler: (): CommandResult => {
      const store = useGameStore.getState();
      store.resetGame();
      return {
        success: true,
        output: 'Shutting down terminal... Goodbye!',
      };
    },
  },

  {
    name: 'sound',
    description: 'Toggle terminal sound effects',
    usage: 'sound [on|off|volume 0-1]',
    handler: (args): CommandResult => {
      if (args.length === 0) {
        const status = (terminalSound as any).enabled ? 'ON 🔊' : 'OFF 🔇';
        const volume = Math.round(((terminalSound as any).volume || 0.5) * 100);
        return {
          success: true,
          output: `Sound effects: ${status}\nVolume: ${volume}%`,
        };
      }

      if (args[0] === 'on') {
        const wasEnabled = (terminalSound as any).enabled;
        terminalSound.setEnabled(true);
        const msg = wasEnabled ? 'Sound effects already enabled. 🔊' : 'Sound effects enabled. 🔊';
        return { success: true, output: msg, sound: 'success' };
      }
      if (args[0] === 'off') {
        const wasEnabled = (terminalSound as any).enabled;
        terminalSound.setEnabled(false);
        const msg = wasEnabled
          ? 'Sound effects disabled. 🔇'
          : 'Sound effects already disabled. 🔇';
        return { success: true, output: msg };
      }
      if (args[0] === 'volume' && args[1]) {
        const vol = parseFloat(args[1]);
        if (!isNaN(vol) && vol >= 0 && vol <= 1) {
          terminalSound.setVolume(vol);
          const status = (terminalSound as any).enabled ? 'ON' : 'OFF';
          return {
            success: true,
            output: `Volume set to ${(vol * 100).toFixed(0)}%\nSound effects: ${status}`,
            sound: 'success',
          };
        }
        return {
          success: false,
          output: '',
          error: formatError('Invalid volume level', {
            command: 'sound',
            usage: 'sound volume [0-1]',
            examples: ['sound volume 0.5', 'sound volume 1.0', 'sound volume 0'],
            tips: ['Volume must be between 0 (mute) and 1 (max)'],
          }),
        };
      }

      return {
        success: false,
        output: '',
        error: formatError('Invalid option', {
          command: 'sound',
          usage: 'sound [on|off|volume 0-1]',
          examples: ['sound', 'sound on', 'sound off', 'sound volume 0.5'],
          tips: ['Toggle with "on" or "off"', 'Adjust volume with "volume [0-1]"'],
        }),
      };
    },
  },

  // Company Commands
  {
    name: 'status',
    aliases: ['s', 'info'],
    description: 'Display company overview',
    usage: 'status',
    handler: (): CommandResult => {
      const { company } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      const activeProjects = company.projects.filter((p) => p.status === 'inProgress').length;
      const completedProjects = company.projects.filter((p) => p.status === 'completed').length;
      const activeEmployees = company.employees.filter((e) => !e.quitMonth).length;

      const output = createBox(`COMPANY: ${company.name.toUpperCase()}`, [
        `Month:        ${company.currentMonth}`,
        `Cash:         ${formatMoney(company.cash)}`,
        `Reputation:   ${company.reputation}/100`,
        '',
        `Employees:    ${activeEmployees} active`,
        `Projects:     ${activeProjects} in progress, ${completedProjects} completed`,
        '',
        `Culture Profile:`,
        `  Speed:      ${(company.culture.speed * 100).toFixed(0)}%`,
        `  Quality:    ${(company.culture.quality * 100).toFixed(0)}%`,
        `  Work-Life:  ${(company.culture.workLife * 100).toFixed(0)}%`,
        `  Hierarchy:  ${(company.culture.hierarchy * 100).toFixed(0)}%`,
      ]);

      return { success: true, output };
    },
  },

  {
    name: 'finances',
    aliases: ['f', 'money'],
    description: 'Display financial details',
    usage: 'finances',
    handler: (): CommandResult => {
      const { company } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      // Calculate monthly expenses
      const payroll = company.employees
        .filter((e) => !e.quitMonth)
        .reduce((sum, e) => sum + e.salary, 0);
      const rent = 5000;
      const tools = 2000;
      const totalExpenses = payroll + rent + tools;

      const output = createBox('FINANCIAL REPORT', [
        `Current Cash: ${formatMoney(company.cash)}`,
        '',
        'MONTHLY EXPENSES:',
        `  Payroll:    ${formatMoney(payroll)}`,
        `  Rent:       ${formatMoney(rent)}`,
        `  Tools:      ${formatMoney(tools)}`,
        `  ─────────────────`,
        `  Total:      ${formatMoney(totalExpenses)}`,
        '',
        `Monthly Burn: ${formatMoney(totalExpenses)}`,
        `Runway:       ${totalExpenses > 0 ? Math.floor(company.cash / totalExpenses) : '∞'} months`,
      ]);

      return { success: true, output };
    },
  },

  {
    name: 'culture',
    description: 'Display and manage company culture',
    usage: 'culture [adjust [trait] [value]]',
    handler: (args): CommandResult => {
      const { company } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      if (args.length >= 3 && args[0] === 'adjust') {
        const trait = args[1];
        const value = parseFloat(args[2]);

        if (!['speed', 'quality', 'workLife', 'hierarchy'].includes(trait)) {
          return {
            success: false,
            output: '',
            error: 'Invalid trait. Use: speed, quality, workLife, hierarchy',
          };
        }
        if (isNaN(value) || value < 0 || value > 1) {
          return { success: false, output: '', error: 'Value must be between 0 and 1' };
        }

        company.culture[trait as keyof typeof company.culture] = value;
        useGameStore.setState({ company: { ...company } });
        return {
          success: true,
          output: `${trait} adjusted to ${(value * 100).toFixed(0)}%`,
          sound: 'success',
        };
      }

      const traits = [
        ['Speed', company.culture.speed, 'Fast delivery vs careful development'],
        ['Quality', company.culture.quality, 'Bug-free code vs ship fast'],
        ['Work-Life', company.culture.workLife, 'Employee wellbeing vs deadlines'],
        ['Hierarchy', company.culture.hierarchy, 'Top-down vs flat structure'],
      ];

      const bars = traits.map(([name, value, desc]) => {
        const barLength = 20;
        const filled = Math.round((value as number) * barLength);
        const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
        return `  ${(name as string).padEnd(9)} ${bar} ${((value as number) * 100).toFixed(0)}% - ${desc}`;
      });

      const output = createBox('COMPANY CULTURE', [
        ...bars,
        '',
        'Use "culture adjust [trait] [0-1]" to modify values',
      ]);

      return { success: true, output };
    },
  },

  {
    name: 'history',
    description: 'Display company history',
    usage: 'history [months]',
    handler: (args): CommandResult => {
      const { company } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      const months = args[0] ? parseInt(args[0]) : 12;
      const recentHistory = company.history.slice(-months);

      if (recentHistory.length === 0) {
        return { success: true, output: 'No historical data available yet.' };
      }

      const lines = [
        `Showing last ${recentHistory.length} months:`,
        '',
        'MONTH  REVENUE      EXPENSES     PROFIT       CASH',
        '─────  ───────────  ───────────  ───────────  ───────────',
        ...recentHistory.map((h) => {
          const revenue = h.financials.revenue;
          const expenses =
            h.financials.payroll +
            h.financials.tools +
            h.financials.rent +
            h.financials.otherExpenses;
          const profit = revenue - expenses;
          return (
            `${h.month.toString().padStart(3)}    ` +
            `${formatMoney(revenue).padEnd(11)}  ` +
            `${formatMoney(expenses).padEnd(11)}  ` +
            `${(profit >= 0 ? '+' : '').padEnd(1)}${formatMoney(profit).padEnd(10)} ` +
            `${formatMoney(h.cash).padEnd(11)}`
          );
        }),
      ];

      const output = createBox('COMPANY HISTORY', lines);
      return { success: true, output };
    },
  },

  // Employee Commands
  {
    name: 'staff',
    aliases: ['employees', 'team', 'e'],
    description: 'List all employees',
    usage: 'staff [name]',
    handler: (args): CommandResult => {
      const { company } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      if (args.length > 0) {
        // Show specific employee
        const query = args.join(' ').toLowerCase();
        const employee = company.employees.find(
          (e) => e.name.toLowerCase().includes(query) && !e.quitMonth
        );

        if (!employee) {
          return { success: false, output: '', error: `Employee "${query}" not found.` };
        }

        const personality = personalities[employee.personality];
        const assignedProjects = employee.projectAssignments.length;

        const output = createBox(`EMPLOYEE: ${employee.name.toUpperCase()}`, [
          `Role:         ${employee.role}`,
          `Personality:  ${personality.name}`,
          `Salary:       ${formatMoney(employee.salary)}/month`,
          `Morale:       ${Math.round(employee.morale)}/100`,
          `Productivity: ${Math.round(employee.productivity * 100)}%`,
          `Loyalty:      ${employee.loyalty}/100`,
          `Hired:        Month ${employee.hiredMonth}`,
          `Projects:     ${assignedProjects} assigned`,
          '',
          'SKILLS:',
          `  Technical:   ${employee.skills.technical}/100`,
          `  Sales:       ${employee.skills.sales}/100`,
          `  Design:      ${employee.skills.design}/100`,
          `  Management:  ${employee.skills.management}/100`,
          '',
          `TRAITS:`,
          ...personality.specialTraits.map((t: string) => `  • ${t}`),
        ]);

        return { success: true, output };
      }

      // List all employees
      const activeEmployees = company.employees.filter((e) => !e.quitMonth);

      if (activeEmployees.length === 0) {
        return { success: true, output: 'No active employees.' };
      }

      const lines = [
        `Total: ${activeEmployees.length} employees`,
        '',
        'NAME              ROLE                SALARY      MORALE  PROJECTS',
        '────────────────  ──────────────────  ──────────  ──────  ────────',
        ...activeEmployees.map((e) => {
          const projects = e.projectAssignments.length;
          return `${e.name.padEnd(16)}  ${e.role.padEnd(18)}  ${formatMoney(e.salary).padEnd(10)}  ${Math.round(e.morale).toString().padEnd(6)}  ${projects}`;
        }),
      ];

      const output = createBox('EMPLOYEE ROSTER', lines);
      return { success: true, output };
    },
  },

  {
    name: 'hire',
    description: 'Hire a new employee',
    usage: 'hire [confirm|reject]',
    handler: (args): CommandResult => {
      const { company, pendingHire, hireEmployee, confirmHire, rejectHire } =
        useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      // Handle confirm/reject subcommands
      if (args.length > 0) {
        const subcommand = args[0].toLowerCase();

        if (subcommand === 'confirm') {
          if (!pendingHire) {
            return {
              success: false,
              output: '',
              error: 'No pending hire to confirm. Type "hire" to see a candidate.',
            };
          }

          const newEmployee = confirmHire();
          if (!newEmployee) {
            return { success: false, output: '', error: 'Failed to hire employee.' };
          }

          const personality = personalities[newEmployee.personality];

          const output = createBox('NEW HIRE CONFIRMED', [
            `Welcome to the team!`,
            '',
            `Name:         ${newEmployee.name}`,
            `Role:         ${newEmployee.role}`,
            `Personality:  ${personality.name}`,
            `Salary:       ${formatMoney(newEmployee.salary)}/month`,
            `Hiring Cost:  ${formatMoney(5000)}`,
            '',
            'SKILLS:',
            `  Technical:   ${newEmployee.skills.technical}/100`,
            `  Sales:       ${newEmployee.skills.sales}/100`,
            `  Design:      ${newEmployee.skills.design}/100`,
            `  Management:  ${newEmployee.skills.management}/100`,
          ]);

          return { success: true, output, sound: 'success' };
        }

        if (subcommand === 'reject') {
          if (!pendingHire) {
            return {
              success: false,
              output: '',
              error: 'No pending hire to reject. Type "hire" to see a candidate.',
            };
          }

          rejectHire();
          return {
            success: true,
            output: 'Candidate rejected. Type "hire" to see another candidate.',
          };
        }

        return {
          success: false,
          output: '',
          error: 'Usage: hire [confirm|reject]',
        };
      }

      // Check if already viewing a candidate
      if (pendingHire) {
        const personality = personalities[pendingHire.personality];
        const bestSkill = Object.entries(pendingHire.skills).sort((a, b) => b[1] - a[1])[0];

        const output = createBox('CANDIDATE PREVIEW', [
          `Review this candidate before hiring:`,
          '',
          `Name:         ${pendingHire.name}`,
          `Role:         ${pendingHire.role}`,
          `Personality:  ${personality.name}`,
          `Salary:       ${formatMoney(pendingHire.salary)}/month`,
          `Hiring Cost:  ${formatMoney(5000)}`,
          '',
          'SKILLS:',
          `  Technical:   ${pendingHire.skills.technical}/100`,
          `  Sales:       ${pendingHire.skills.sales}/100`,
          `  Design:      ${pendingHire.skills.design}/100`,
          `  Management:  ${pendingHire.skills.management}/100`,
          '',
          `★ Best Skill: ${bestSkill[0]} (${bestSkill[1]}/100)`,
          '',
          'ACTIONS:',
          '  Type "hire confirm" to hire this candidate',
          '  Type "hire reject" to see another candidate',
        ]);

        return { success: true, output };
      }

      // Check funds
      if (company.cash < 5000) {
        return {
          success: false,
          output: '',
          error: `Insufficient funds. Need $5,000 to hire. Current: ${formatMoney(company.cash)}`,
        };
      }

      // Generate new candidate preview
      const newEmployee = hireEmployee();
      if (!newEmployee) {
        return { success: false, output: '', error: 'Failed to generate candidate.' };
      }

      const personality = personalities[newEmployee.personality];
      const bestSkill = Object.entries(newEmployee.skills).sort((a, b) => b[1] - a[1])[0];

      const output = createBox('CANDIDATE PREVIEW', [
        `Review this candidate before hiring:`,
        '',
        `Name:         ${newEmployee.name}`,
        `Role:         ${newEmployee.role}`,
        `Personality:  ${personality.name}`,
        `Salary:       ${formatMoney(newEmployee.salary)}/month`,
        `Hiring Cost:  ${formatMoney(5000)}`,
        '',
        'SKILLS:',
        `  Technical:   ${newEmployee.skills.technical}/100`,
        `  Sales:       ${newEmployee.skills.sales}/100`,
        `  Design:      ${newEmployee.skills.design}/100`,
        `  Management:  ${newEmployee.skills.management}/100`,
        '',
        `★ Best Skill: ${bestSkill[0]} (${bestSkill[1]}/100)`,
        '',
        'ACTIONS:',
        '  Type "hire confirm" to hire this candidate',
        '  Type "hire reject" to see another candidate',
      ]);

      return { success: true, output };
    },
  },

  {
    name: 'fire',
    description: 'Fire an employee',
    usage: 'fire [name]',
    args: [{ name: 'name', description: 'Employee name (partial match)', required: true }],
    handler: (args): CommandResult => {
      const { company, fireEmployee } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      if (args.length === 0) {
        return { success: false, output: '', error: 'Usage: fire [name]' };
      }

      const query = args.join(' ').toLowerCase();
      const employee = company.employees.find(
        (e) => e.name.toLowerCase().includes(query) && !e.quitMonth
      );

      if (!employee) {
        return { success: false, output: '', error: `Employee "${query}" not found.` };
      }

      const severance = employee.salary * 2;
      if (company.cash < severance) {
        return {
          success: false,
          output: '',
          error: `Insufficient funds for severance (${formatMoney(severance)})`,
        };
      }

      const success = fireEmployee(employee.id);
      if (!success) {
        return { success: false, output: '', error: 'Failed to fire employee.' };
      }

      return {
        success: true,
        output: `${employee.name} has been terminated.\nSeverance paid: ${formatMoney(severance)}`,
      };
    },
  },

  {
    name: 'assign',
    description: 'Assign employee to project',
    usage: 'assign [employee] [project] [%]',
    args: [
      { name: 'employee', description: 'Employee name', required: true },
      { name: 'project', description: 'Project name', required: true },
      { name: '%', description: 'Allocation percentage (1-100)', required: false },
    ],
    handler: (args): CommandResult => {
      const { company, assignEmployeeToProject } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      if (args.length < 2) {
        return {
          success: false,
          output: '',
          error: formatError('Missing required arguments', {
            command: 'assign',
            usage: 'assign [employee] [project] [%]',
            examples: [
              'assign "Melissa Hall" "Mobile App" 50',
              'assign "John Smith" Website 100',
              'assign Melissa Mobile 75',
              'assign "Sarah Chen" "API Development"',
            ],
            tips: [
              'Use quotes for names with spaces',
              'Percentage defaults to 100 if omitted',
              'Type "staff" to see employee names',
              'Type "projects" to see project names',
            ],
          }),
        };
      }

      // Parse args - could be: "john website" or "john smith website redesign"
      // Last word is project, rest is employee name
      const allocation = parseInt(args[args.length - 1]);
      const hasAllocation = !isNaN(allocation) && allocation > 0 && allocation <= 100;

      const projectQuery = hasAllocation
        ? args[args.length - 2].toLowerCase()
        : args[args.length - 1].toLowerCase();
      const employeeQuery = hasAllocation
        ? args.slice(0, -2).join(' ').toLowerCase()
        : args.slice(0, -1).join(' ').toLowerCase();

      const employee = company.employees.find(
        (e) => e.name.toLowerCase().includes(employeeQuery) && !e.quitMonth
      );
      const project = company.projects.find(
        (p) =>
          p.name.toLowerCase().includes(projectQuery) &&
          (p.status === 'inProgress' || p.status === 'notStarted')
      );

      if (!employee) {
        return {
          success: false,
          output: '',
          error: formatError(`Employee matching "${employeeQuery}" not found`, {
            command: 'assign',
            usage: 'assign [employee] [project] [%]',
            examples: [
              'assign "Melissa Hall" "Mobile App" 50',
              'assign "John Smith" Website 100',
              'assign Melissa Mobile 75',
            ],
            tips: [
              'Use quotes for names with spaces (e.g., "Melissa Hall")',
              'Type "staff" to see all employee names',
              'Partial names work: "Mel" matches "Melissa Hall"',
            ],
          }),
        };
      }

      if (!project) {
        return {
          success: false,
          output: '',
          error: formatError(`Project matching "${projectQuery}" not found`, {
            command: 'assign',
            usage: 'assign [employee] [project] [%]',
            examples: [
              'assign "Melissa Hall" "Mobile App" 50',
              'assign "John Smith" Website 100',
              'assign Melissa Mobile 75',
            ],
            tips: [
              'Use quotes for names with spaces (e.g., "Mobile App")',
              'Type "projects" to see all projects',
              'Projects must not be completed or cancelled',
              'Partial names work: "Mob" matches "Mobile App"',
            ],
          }),
        };
      }

      const alloc = hasAllocation ? allocation : 100;
      const success = assignEmployeeToProject(employee.id, project.id, alloc);

      if (!success) {
        return {
          success: false,
          output: '',
          error: formatError('Assignment failed', {
            command: 'assign',
            usage: 'assign [employee] [project] [%]',
            examples: ['assign "Melissa Hall" "Mobile App" 50'],
            tips: [
              'Check that employee has available capacity',
              'Total allocation across all projects cannot exceed 100%',
              `Type "staff ${employee.name}" to see current assignments`,
            ],
          }),
        };
      }

      return {
        success: true,
        output: `${employee.name} assigned to "${project.name}" (${alloc}%)`,
        sound: 'success',
      };
    },
  },

  {
    name: 'unassign',
    description: 'Remove employee from project',
    usage: 'unassign [employee] [project]',
    handler: (args): CommandResult => {
      const { company, unassignEmployeeFromProject } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      if (args.length < 2) {
        return {
          success: false,
          output: '',
          error: formatError('Missing required arguments', {
            command: 'unassign',
            usage: 'unassign [employee] [project]',
            examples: [
              'unassign "Melissa Hall" "Mobile App"',
              'unassign "John Smith" Website',
              'unassign Melissa Mobile',
            ],
            tips: [
              'Use quotes for names with spaces',
              'Type "staff" to see employee names',
              'Type "projects" to see project names',
            ],
          }),
        };
      }

      const projectQuery = args[args.length - 1].toLowerCase();
      const employeeQuery = args.slice(0, -1).join(' ').toLowerCase();

      const employee = company.employees.find(
        (e) => e.name.toLowerCase().includes(employeeQuery) && !e.quitMonth
      );
      const project = company.projects.find((p) => p.name.toLowerCase().includes(projectQuery));

      if (!employee) {
        return {
          success: false,
          output: '',
          error: formatError(`Employee matching "${employeeQuery}" not found`, {
            command: 'unassign',
            usage: 'unassign [employee] [project]',
            examples: ['unassign "Melissa Hall" "Mobile App"', 'unassign "John Smith" Website'],
            tips: [
              'Use quotes for names with spaces (e.g., "Melissa Hall")',
              'Type "staff" to see all employee names',
              'Partial names work: "Mel" matches "Melissa Hall"',
            ],
          }),
        };
      }

      if (!project) {
        return {
          success: false,
          output: '',
          error: formatError(`Project matching "${projectQuery}" not found`, {
            command: 'unassign',
            usage: 'unassign [employee] [project]',
            examples: ['unassign "Melissa Hall" "Mobile App"', 'unassign "John Smith" Website'],
            tips: [
              'Use quotes for names with spaces (e.g., "Mobile App")',
              'Type "projects" to see all projects',
              'Partial names work: "Mob" matches "Mobile App"',
            ],
          }),
        };
      }

      const success = unassignEmployeeFromProject(employee.id, project.id);
      if (!success) {
        return {
          success: false,
          output: '',
          error: formatError('Failed to unassign employee', {
            command: 'unassign',
            usage: 'unassign [employee] [project]',
            examples: ['unassign "Melissa Hall" "Mobile App"'],
            tips: [
              'Check that employee is actually assigned to this project',
              `Type "staff ${employee.name}" to see current assignments`,
            ],
          }),
        };
      }

      return {
        success: true,
        output: `${employee.name} removed from "${project.name}"`,
      };
    },
  },

  // Project Commands
  {
    name: 'projects',
    aliases: ['p', 'proj'],
    description: 'List all projects',
    usage: 'projects [status]',
    handler: (args): CommandResult => {
      const { company } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      const statusFilter = args[0]?.toLowerCase();
      let filteredProjects = company.projects;

      if (statusFilter) {
        filteredProjects = company.projects.filter(
          (p) =>
            p.status.toLowerCase() === statusFilter ||
            (statusFilter === 'active' && p.status === 'inProgress')
        );
      }

      if (filteredProjects.length === 0) {
        return { success: true, output: 'No projects found.' };
      }

      const lines = filteredProjects.map((p) => {
        const status =
          p.status === 'inProgress'
            ? '▶ ACTIVE'
            : p.status === 'completed'
              ? '✓ DONE'
              : p.status === 'notStarted'
                ? '○ PENDING'
                : '✗ FAILED';
        const progress = `${p.progress.toFixed(0)}%`;
        const team = p.assignments.length;

        return `${status.padEnd(10)} ${p.name.padEnd(25)} ${p.type.padEnd(12)} ${progress.padEnd(6)} ${team} workers`;
      });

      const output = createBox('PROJECTS', [
        `Total: ${filteredProjects.length} projects`,
        '',
        'STATUS     NAME                      TYPE         PROG   TEAM',
        '─────────  ─────────────────────────  ───────────  ─────  ─────',
        ...lines,
      ]);

      return { success: true, output };
    },
  },

  {
    name: 'start',
    description: 'Create a new project',
    usage: 'start [type] [name]',
    args: [
      {
        name: 'type',
        description: 'Project type',
        required: true,
        choices: ['client', 'product', 'maintenance', 'research'],
      },
      { name: 'name', description: 'Project name', required: true },
    ],
    handler: (args): CommandResult => {
      const { company, createProject } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      if (args.length < 2) {
        return {
          success: false,
          output: '',
          error: 'Usage: start [client|product|maintenance|research] [name]',
        };
      }

      const typeMap: Record<string, Project['type']> = {
        client: 'clientWork',
        product: 'productFeature',
        maintenance: 'maintenance',
        research: 'rnd',
      };

      const typeArg = args[0].toLowerCase();
      const projectType = typeMap[typeArg];

      if (!projectType) {
        return {
          success: false,
          output: '',
          error: 'Invalid type. Use: client, product, maintenance, or research',
        };
      }

      const projectName = args.slice(1).join(' ');
      const project = createProject(projectType);

      if (!project) {
        return { success: false, output: '', error: 'Failed to create project.' };
      }

      // Override the generated name
      project.name = projectName;
      useGameStore.setState({ company: { ...company } });

      const output = createBox('PROJECT CREATED', [
        `Name:        ${project.name}`,
        `Type:        ${project.type}`,
        `Complexity:  ${project.complexity}/10`,
        `Value:       ${formatMoney(project.value)}`,
        `Deadline:    ${project.deadline || project.estimatedMonths} months`,
        '',
        'Status: NOT STARTED',
        'Use "assign" to add employees and start the project.',
      ]);

      return { success: true, output, sound: 'success' };
    },
  },

  {
    name: 'complete',
    description: 'Manually mark project as complete',
    usage: 'complete [project]',
    handler: (args): CommandResult => {
      const { company } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      if (args.length === 0) {
        return { success: false, output: '', error: 'Usage: complete [project]' };
      }

      const query = args.join(' ').toLowerCase();
      const project = company.projects.find(
        (p) => p.name.toLowerCase().includes(query) && p.status === 'inProgress'
      );

      if (!project) {
        return { success: false, output: '', error: `Active project "${query}" not found.` };
      }

      project.status = 'completed';
      project.completedMonth = company.currentMonth;
      company.cash += project.value;
      useGameStore.setState({ company: { ...company } });

      return {
        success: true,
        output: `Project "${project.name}" completed!\nReward: ${formatMoney(project.value)}`,
        sound: 'success',
      };
    },
  },

  {
    name: 'cancel',
    description: 'Cancel a project',
    usage: 'cancel [project]',
    handler: (args): CommandResult => {
      const { company } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      if (args.length === 0) {
        return { success: false, output: '', error: 'Usage: cancel [project]' };
      }

      const query = args.join(' ').toLowerCase();
      const project = company.projects.find(
        (p) => p.name.toLowerCase().includes(query) && p.status !== 'completed'
      );

      if (!project) {
        return { success: false, output: '', error: `Project "${query}" not found.` };
      }

      project.status = 'failed';
      // Remove all assignments
      project.assignments = [];
      useGameStore.setState({ company: { ...company } });

      return {
        success: true,
        output: `Project "${project.name}" cancelled.`,
      };
    },
  },

  // Event Commands
  {
    name: 'events',
    description: 'List pending events',
    usage: 'events',
    handler: (): CommandResult => {
      const { currentEvents, showEventModal } = useGameStore.getState();

      if (!showEventModal || currentEvents.length === 0) {
        return { success: true, output: 'No pending events.' };
      }

      const lines = currentEvents.map((e, i) => {
        return `${(i + 1).toString().padStart(2)}. ${e.title}\n    ${e.description}`;
      });

      const output = createBox('PENDING EVENTS', [
        ...lines,
        '',
        'Use "resolve [event#] [choice#]" to respond.',
      ]);

      return { success: true, output, sound: 'bell' };
    },
  },

  {
    name: 'resolve',
    description: 'Resolve an event',
    usage: 'resolve [event#] [choice#]',
    handler: (args): CommandResult => {
      const { currentEvents, resolveEvent } = useGameStore.getState();

      if (args.length < 2) {
        return { success: false, output: '', error: 'Usage: resolve [event#] [choice#]' };
      }

      const eventNum = parseInt(args[0]) - 1;
      const choiceNum = parseInt(args[1]) - 1;

      if (isNaN(eventNum) || eventNum < 0 || eventNum >= currentEvents.length) {
        return { success: false, output: '', error: 'Invalid event number.' };
      }

      const event = currentEvents[eventNum];
      if (isNaN(choiceNum) || choiceNum < 0 || choiceNum >= event.choices.length) {
        return { success: false, output: '', error: 'Invalid choice number.' };
      }

      const choice = event.choices[choiceNum];
      resolveEvent(event.id, choice.id);

      return {
        success: true,
        output: `Event resolved: ${event.title}\nChoice: ${choice.label}`,
        sound: 'success',
      };
    },
  },

  // Game Commands
  {
    name: 'next',
    aliases: ['advance', 'month'],
    description: 'Advance to next month',
    usage: 'next',
    handler: (): CommandResult => {
      const { company, advanceMonth } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      advanceMonth();

      const output = createBox(`MONTH ${company.currentMonth}`, [
        'Simulation advanced.',
        `Cash: ${formatMoney(company.cash)}`,
        '',
        'Use "status" for detailed report.',
      ]);

      return { success: true, output, sound: 'success' };
    },
  },

  {
    name: 'achievements',
    aliases: ['ach', 'trophies'],
    description: 'Display achievements',
    usage: 'achievements',
    handler: (): CommandResult => {
      const { company } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      const unlocked = company.unlockedAchievements;

      const rarityIcons: Record<string, string> = {
        common: '○',
        rare: '◇',
        epic: '◆',
        legendary: '★',
      };

      const lines = achievements.map((a) => {
        const isUnlocked = unlocked.includes(a.id);
        const icon = isUnlocked ? rarityIcons[a.rarity] : '·';
        const status = isUnlocked ? a.name : '???';
        const desc = isUnlocked ? a.description : 'Locked';
        return `${icon} ${status.padEnd(25)} ${a.rarity.padEnd(10)} ${desc}`;
      });

      const output = createBox('ACHIEVEMENTS', [
        `Unlocked: ${unlocked.length}/${achievements.length}`,
        '',
        ...lines,
      ]);

      return { success: true, output };
    },
  },

  {
    name: 'save',
    description: 'Export save data',
    usage: 'save',
    handler: (): CommandResult => {
      const { company } = useGameStore.getState();
      if (!company) return { success: false, output: '', error: 'No company data available.' };

      const saveData = JSON.stringify(company);
      const encoded = btoa(saveData);

      // Copy to clipboard
      navigator.clipboard.writeText(encoded).then(() => {
        console.log('Save data copied to clipboard');
      });

      return {
        success: true,
        output: createBox('SAVE DATA', [
          'Save data has been copied to clipboard.',
          '',
          'To restore: paste the data with "load [data]"',
          '',
          `Length: ${encoded.length} characters`,
        ]),
        sound: 'success',
      };
    },
  },

  {
    name: 'load',
    description: 'Import save data',
    usage: 'load [data]',
    handler: (args): CommandResult => {
      if (args.length === 0) {
        return {
          success: false,
          output: '',
          error: 'Usage: load [data]\nPaste your save data after the command.',
        };
      }

      const encoded = args.join(' ');
      try {
        const decoded = atob(encoded);
        const company = JSON.parse(decoded);

        useGameStore.setState({ company, isPlaying: true });

        return {
          success: true,
          output: `Game loaded successfully!\nWelcome back to ${company.name}.`,
          sound: 'success',
        };
      } catch (e) {
        return {
          success: false,
          output: '',
          error: 'Invalid save data. Please check and try again.',
        };
      }
    },
  },

  {
    name: 'reset',
    description: 'Reset the game (WARNING: Deletes all progress)',
    usage: 'reset [confirm]',
    handler: (args): CommandResult => {
      if (args[0] !== 'confirm') {
        return {
          success: false,
          output: '',
          error: 'WARNING: This will delete ALL progress!\nType "reset confirm" to proceed.',
        };
      }

      const { resetGame } = useGameStore.getState();
      resetGame();

      return {
        success: true,
        output: 'Game reset. Starting fresh...',
      };
    },
  },
];

// Helper function to find command
export const findCommand = (name: string): Command | undefined => {
  return commands.find((cmd) => cmd.name === name || cmd.aliases?.includes(name));
};

// Helper function to get command suggestions
export const getSuggestions = (partial: string): string[] => {
  const lower = partial.toLowerCase();
  return commands
    .filter((cmd) => cmd.name.startsWith(lower) || cmd.aliases?.some((a) => a.startsWith(lower)))
    .map((cmd) => cmd.name);
};
