import type { Achievement, Company, AchievementRarity } from '@/types';

export const achievements: Achievement[] = [
  // Survival achievements
  {
    id: 'survive_6_months',
    name: 'First Steps',
    description: 'Survive 6 months in business',
    rarity: 'common',
    unlocked: false,
    checkCondition: (company: Company) => company.currentMonth >= 6,
  },
  {
    id: 'survive_12_months',
    name: 'One Year Anniversary',
    description: 'Survive one full year',
    rarity: 'common',
    unlocked: false,
    checkCondition: (company: Company) => company.currentMonth >= 12,
  },
  {
    id: 'survive_24_months',
    name: 'Established',
    description: 'Survive two years',
    rarity: 'rare',
    unlocked: false,
    checkCondition: (company: Company) => company.currentMonth >= 24,
  },
  {
    id: 'survive_60_months',
    name: 'Legacy',
    description: 'Survive five years',
    rarity: 'epic',
    unlocked: false,
    checkCondition: (company: Company) => company.currentMonth >= 60,
  },
  
  // Financial achievements
  {
    id: 'first_profit',
    name: 'In the Black',
    description: 'Achieve positive cash flow',
    rarity: 'common',
    unlocked: false,
    checkCondition: (company: Company) => {
      const lastSnapshot = company.history[company.history.length - 1];
      return lastSnapshot ? lastSnapshot.financials.netCashflow > 0 : false;
    },
  },
  {
    id: 'reach_100k',
    name: 'Six Figures',
    description: 'Reach $100,000 in cash',
    rarity: 'common',
    unlocked: false,
    checkCondition: (company: Company) => company.cash >= 100000,
  },
  {
    id: 'reach_500k',
    name: 'Half Million',
    description: 'Reach $500,000 in cash',
    rarity: 'rare',
    unlocked: false,
    checkCondition: (company: Company) => company.cash >= 500000,
  },
  {
    id: 'reach_1m',
    name: 'Millionaire',
    description: 'Reach $1,000,000 in cash',
    rarity: 'epic',
    unlocked: false,
    checkCondition: (company: Company) => company.cash >= 1000000,
  },
  
  // Team achievements
  {
    id: 'hire_first_employee',
    name: 'Growing Team',
    description: 'Hire your first employee',
    rarity: 'common',
    unlocked: false,
    checkCondition: (company: Company) => company.employees.length >= 2,
  },
  {
    id: 'team_of_5',
    name: 'Small but Mighty',
    description: 'Build a team of 5 employees',
    rarity: 'common',
    unlocked: false,
    checkCondition: (company: Company) => company.employees.filter(e => !e.quitMonth).length >= 5,
  },
  {
    id: 'team_of_10',
    name: 'Double Digits',
    description: 'Build a team of 10 employees',
    rarity: 'rare',
    unlocked: false,
    checkCondition: (company: Company) => company.employees.filter(e => !e.quitMonth).length >= 10,
  },
  {
    id: 'team_of_25',
    name: 'Unicorn Team',
    description: 'Build a team of 25 employees',
    rarity: 'epic',
    unlocked: false,
    checkCondition: (company: Company) => company.employees.filter(e => !e.quitMonth).length >= 25,
  },
  
  // Project achievements
  {
    id: 'first_project',
    name: 'First Delivery',
    description: 'Complete your first project',
    rarity: 'common',
    unlocked: false,
    checkCondition: (company: Company) => company.projects.some(p => p.status === 'completed'),
  },
  {
    id: 'complete_5_projects',
    name: 'Getting Things Done',
    description: 'Complete 5 projects',
    rarity: 'common',
    unlocked: false,
    checkCondition: (company: Company) => company.projects.filter(p => p.status === 'completed').length >= 5,
  },
  {
    id: 'complete_20_projects',
    name: 'Project Machine',
    description: 'Complete 20 projects',
    rarity: 'rare',
    unlocked: false,
    checkCondition: (company: Company) => company.projects.filter(p => p.status === 'completed').length >= 20,
  },
  {
    id: 'perfect_project',
    name: 'Perfect Execution',
    description: 'Complete a project with 90%+ quality',
    rarity: 'rare',
    unlocked: false,
    checkCondition: (company: Company) => company.projects.some(p => p.status === 'completed' && p.quality >= 90),
  },
  
  // Reputation achievements
  {
    id: 'reputation_75',
    name: 'Well Known',
    description: 'Reach 75 reputation',
    rarity: 'rare',
    unlocked: false,
    checkCondition: (company: Company) => company.reputation >= 75,
  },
  {
    id: 'reputation_95',
    name: 'Industry Leader',
    description: 'Reach 95 reputation',
    rarity: 'epic',
    unlocked: false,
    checkCondition: (company: Company) => company.reputation >= 95,
  },
  
  // Culture achievements
  {
    id: 'balanced_culture',
    name: 'Goldilocks Zone',
    description: 'Maintain balanced culture across all dimensions (0.4-0.6)',
    rarity: 'rare',
    unlocked: false,
    checkCondition: (company: Company) => {
      const { speed, quality, workLife, hierarchy } = company.culture;
      return [speed, quality, workLife, hierarchy].every(v => v >= 0.4 && v <= 0.6);
    },
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Achieve speed culture above 0.8',
    rarity: 'rare',
    unlocked: false,
    checkCondition: (company: Company) => company.culture.speed >= 0.8,
  },
  {
    id: 'quality_focused',
    name: 'Quality Obsessed',
    description: 'Achieve quality culture above 0.8',
    rarity: 'rare',
    unlocked: false,
    checkCondition: (company: Company) => company.culture.quality >= 0.8,
  },
  
  // Special achievements
  {
    id: 'no_quitters',
    name: 'Retention Master',
    description: 'Reach month 12 without any employees quitting',
    rarity: 'epic',
    unlocked: false,
    checkCondition: (company: Company) => company.currentMonth >= 12 && company.employees.every(e => !e.quitMonth || e.quitMonth === company.currentMonth),
  },
  {
    id: 'jack_of_all_trades',
    name: 'Jack of All Trades',
    description: 'Have employees with all 5 personality types',
    rarity: 'epic',
    unlocked: false,
    checkCondition: (company: Company) => {
      const personalities = new Set(company.employees.map(e => e.personality));
      return personalities.size >= 5;
    },
  },
  {
    id: 'legendary_survivor',
    name: 'Legendary Survivor',
    description: 'Reach month 100 with positive cash flow',
    rarity: 'legendary',
    unlocked: false,
    checkCondition: (company: Company) => company.currentMonth >= 100 && company.cash > 0,
  },
];

export function getAchievementRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'common':
      return '#9ca3af'; // gray-400
    case 'rare':
      return '#3b82f6'; // blue-500
    case 'epic':
      return '#a855f7'; // purple-500
    case 'legendary':
      return '#eab308'; // yellow-500
    default:
      return '#9ca3af';
  }
}

export function checkAchievements(company: Company, unlockedAchievements: Set<string>): Achievement[] {
  return achievements.filter(achievement => {
    if (unlockedAchievements.has(achievement.id)) return false;
    return achievement.checkCondition(company);
  });
}
