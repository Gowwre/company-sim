import type { Company, GameEvent, EventChoice } from '@/types';

export class EventSystem {
  private predefinedEvents: GameEvent[] = [
    {
      id: 'competing_offer',
      title: 'Key Employee Recruited',
      description:
        'One of your top employees has received a competing offer from a larger company.',
      type: 'triggered',
      choices: [
        {
          id: 'match_offer',
          label: 'Match the offer',
          description: 'Increase their salary by 20% to keep them',
          consequences: {
            cash: -2500,
            moraleChange: 10,
          },
        },
        {
          id: 'let_go',
          label: 'Let them go',
          description: 'Wish them well and focus on the team',
          consequences: {
            moraleChange: -5,
          },
        },
        {
          id: 'counter_offer',
          label: 'Counter with equity',
          description: 'Offer profit sharing instead of higher salary',
          consequences: {
            moraleChange: 5,
          },
        },
      ],
      triggerConditions: {
        minMonth: 8,
        minEmployees: 4,
        probability: 0.06,
      },
      resolved: false,
    },
    {
      id: 'client_threatens',
      title: 'Major Client Unhappy',
      description: 'Your largest client is threatening to leave due to missed deadlines.',
      type: 'triggered',
      choices: [
        {
          id: 'rush_project',
          label: 'Rush the project',
          description: 'Assign more resources to finish quickly',
          consequences: {
            cash: -1000,
            moraleChange: -10,
          },
        },
        {
          id: 'negotiate',
          label: 'Negotiate extension',
          description: 'Ask for more time with a discount',
          consequences: {
            reputation: -5,
            cash: -1500,
          },
        },
        {
          id: 'accept_loss',
          label: 'Accept the loss',
          description: 'Let them go and focus on other clients',
          consequences: {
            reputation: -10,
            cash: -2500,
          },
        },
      ],
      triggerConditions: {
        minMonth: 6,
        minEmployees: 2,
        probability: 0.08,
      },
      resolved: false,
    },
    {
      id: 'viral_success',
      title: 'Viral Success!',
      description: 'One of your projects went viral on social media!',
      type: 'random',
      choices: [
        {
          id: 'capitalize',
          label: 'Capitalize on it',
          description: 'Invest in marketing to ride the wave',
          consequences: {
            cash: -1500,
            reputation: 15,
          },
        },
        {
          id: 'stay_focused',
          label: 'Stay focused',
          description: 'Keep working without distraction',
          consequences: {
            reputation: 5,
            moraleChange: 5,
          },
        },
      ],
      triggerConditions: {
        probability: 0.05,
      },
      resolved: false,
    },
    {
      id: 'tech_debt_crisis',
      title: 'Technical Debt Crisis',
      description: 'Your codebase has accumulated too much technical debt.',
      type: 'triggered',
      choices: [
        {
          id: 'refactor',
          label: 'Refactor everything',
          description: 'Spend a month fixing technical debt',
          consequences: {
            cash: -2000,
            moraleChange: 10,
          },
        },
        {
          id: 'ignore',
          label: 'Ignore it',
          description: 'Continue shipping features',
          consequences: {
            moraleChange: -15,
            reputation: -5,
          },
        },
      ],
      triggerConditions: {
        minMonth: 15,
        probability: 0.06,
      },
      resolved: false,
    },
    {
      id: 'cofounder_conflict',
      title: 'Cofounder Conflict',
      description: 'Tension is rising between cofounders about company direction.',
      type: 'triggered',
      choices: [
        {
          id: 'mediate',
          label: 'Team building retreat',
          description: 'Invest in team bonding',
          consequences: {
            cash: -2500,
            moraleChange: 15,
          },
        },
        {
          id: 'pick_side',
          label: 'Pick a side',
          description: 'Make a decision and move forward',
          consequences: {
            moraleChange: -10,
            reputation: 5,
          },
        },
      ],
      triggerConditions: {
        minMonth: 10,
        minEmployees: 6,
        probability: 0.05,
      },
      resolved: false,
    },
  ];

  generateEvents(company: Company): GameEvent[] {
    const triggeredEvents: GameEvent[] = [];

    for (const eventTemplate of this.predefinedEvents) {
      if (this.shouldTriggerEvent(eventTemplate, company)) {
        const event: GameEvent = {
          ...eventTemplate,
          id: `${eventTemplate.id}_${company.currentMonth}_${Date.now()}`,
          monthOccurred: company.currentMonth,
        };
        triggeredEvents.push(event);
      }
    }

    // Random events (lower probability)
    if (Math.random() < 0.03) {
      triggeredEvents.push(this.generateRandomEvent(company));
    }

    return triggeredEvents;
  }

  private shouldTriggerEvent(event: GameEvent, company: Company): boolean {
    if (!event.triggerConditions) return false;

    const conditions = event.triggerConditions;

    if (conditions.minMonth && company.currentMonth < conditions.minMonth) return false;
    if (conditions.maxMonth && company.currentMonth > conditions.maxMonth) return false;
    if (conditions.minEmployees && company.employees.length < conditions.minEmployees) return false;
    if (conditions.minCash && company.cash < conditions.minCash) return false;
    if (conditions.minReputation && company.reputation < conditions.minReputation) return false;

    return Math.random() < conditions.probability;
  }

  private generateRandomEvent(company: Company): GameEvent {
    const randomEvents: Omit<GameEvent, 'id' | 'monthOccurred'>[] = [
      {
        title: 'Equipment Failure',
        description: 'Several workstations need replacement.',
        type: 'random',
        choices: [
          {
            id: 'replace_now',
            label: 'Replace immediately',
            description: 'Buy new equipment',
            consequences: { cash: -1500 },
          },
          {
            id: 'wait',
            label: 'Wait and repair',
            description: 'Try to fix what you have',
            consequences: { moraleChange: -5 },
          },
        ],
        resolved: false,
      },
      {
        title: 'Networking Opportunity',
        description: 'A major industry conference is happening this month.',
        type: 'random',
        choices: [
          {
            id: 'attend',
            label: 'Send the team',
            description: 'Invest in networking',
            consequences: { cash: -1000, reputation: 5 },
          },
          {
            id: 'skip',
            label: 'Skip it',
            description: 'Focus on work',
            consequences: {},
          },
        ],
        resolved: false,
      },
    ];

    const template = randomEvents[Math.floor(Math.random() * randomEvents.length)];

    return {
      ...template,
      id: `random_${company.currentMonth}_${Date.now()}`,
      monthOccurred: company.currentMonth,
    };
  }

  resolveEvent(company: Company, event: GameEvent, choice: EventChoice): void {
    const consequences = choice.consequences;

    // Apply cash changes
    if (consequences.cash) {
      company.cash += consequences.cash;
    }

    // Apply reputation changes
    if (consequences.reputation) {
      company.reputation = Math.max(0, Math.min(100, company.reputation + consequences.reputation));
    }

    // Apply morale changes to all employees
    if (consequences.moraleChange) {
      for (const employee of company.employees) {
        if (!employee.quitMonth) {
          employee.morale = Math.max(0, Math.min(100, employee.morale + consequences.moraleChange));
        }
      }
    }

    // Apply specific employee effects
    if (consequences.employeeEffects) {
      for (const effect of consequences.employeeEffects) {
        const employee = company.employees.find((e) => e.id === effect.employeeId);
        if (employee && !employee.quitMonth) {
          employee.morale = Math.max(0, Math.min(100, employee.morale + effect.moraleChange));
          employee.loyalty = Math.max(0, Math.min(100, employee.loyalty + effect.loyaltyChange));
        }
      }
    }

    // Apply project effects
    if (consequences.projectEffects) {
      for (const effect of consequences.projectEffects) {
        const project = company.projects.find((p) => p.id === effect.projectId);
        if (project && project.status === 'inProgress') {
          project.progress = Math.max(0, Math.min(100, project.progress + effect.progressChange));
          project.quality = Math.max(0, Math.min(100, project.quality + effect.qualityChange));
        }
      }
    }

    // Mark event as resolved
    event.resolved = true;
    company.events.push(event);
  }
}
