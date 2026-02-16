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
  productivityMultiplier: number;
  quitResistance: number;
  specialTraits: string[];
}

export const personalities: Record<PersonalityType, PersonalityData> = {
  rockstar: {
    name: 'Rockstar',
    description: 'Exceptionally skilled but difficult to manage. High output but low collaboration.',
    skillModifiers: {
      technical: 15,
      sales: 5,
      design: 10,
      management: -10,
    },
    baseSalaryMultiplier: 1.5,
    productivityMultiplier: 1.3,
    quitResistance: 0.7,
    specialTraits: ['High skill ceiling', 'Low team morale impact', 'Expensive', 'Prone to leaving'],
  },
  teamPlayer: {
    name: 'Team Player',
    description: 'Boosts team morale and collaborates well. Reliable and steady performer.',
    skillModifiers: {
      technical: 0,
      sales: 5,
      design: 5,
      management: 10,
    },
    baseSalaryMultiplier: 1.0,
    productivityMultiplier: 1.0,
    quitResistance: 1.2,
    specialTraits: ['Morale boost to team', 'Reliable', 'Good culture fit', 'Stable'],
  },
  wildcard: {
    name: 'Wildcard',
    description: 'Unpredictable creative genius. Can produce breakthroughs or disasters.',
    skillModifiers: {
      technical: 5,
      sales: 0,
      design: 15,
      management: -5,
    },
    baseSalaryMultiplier: 1.1,
    productivityMultiplier: 1.0,
    quitResistance: 0.9,
    specialTraits: ['Variable productivity (0.5-1.5x)', 'Creative breakthroughs', 'Unpredictable', 'Unique solutions'],
  },
  workhorse: {
    name: 'Workhorse',
    description: 'Steady, reliable, never quits voluntarily. Consistent output day after day.',
    skillModifiers: {
      technical: 5,
      sales: 0,
      design: 0,
      management: 0,
    },
    baseSalaryMultiplier: 1.0,
    productivityMultiplier: 1.1,
    quitResistance: 2.0,
    specialTraits: ['Never quits voluntarily', 'Consistent output', 'Reliable', 'Low maintenance'],
  },
  leader: {
    name: 'Leader',
    description: 'Natural manager who unlocks team bonuses and improves overall performance.',
    skillModifiers: {
      technical: 0,
      sales: 10,
      design: 0,
      management: 20,
    },
    baseSalaryMultiplier: 1.3,
    productivityMultiplier: 1.0,
    quitResistance: 1.1,
    specialTraits: ['Team productivity boost', 'Natural manager', 'Unlocks bonuses', 'Strategic thinker'],
  },
};

export function getPersonalityDescription(type: PersonalityType): string {
  return personalities[type].description;
}

export function getPersonalityName(type: PersonalityType): string {
  return personalities[type].name;
}
