import type { Employee, PersonalityType, SkillSet } from '@/types';
import { personalities } from '@/data/personalities';
import { generateEmployeeName } from './nameGenerator';

export class EmployeeGenerator {
  private usedNames: Set<string> = new Set();

  reset(): void {
    this.usedNames.clear();
  }

  generateEmployee(currentMonth: number, isFounder: boolean = false): Employee {
    const personality = this.selectPersonality();
    const skills = this.generateSkills(personality, isFounder);
    const salary = this.calculateSalary(skills, personality);

    return {
      id: crypto.randomUUID(),
      name: isFounder ? 'You' : this.generateUniqueName(),
      role: this.selectRole(skills),
      personality,
      skills,
      morale: isFounder ? 100 : 50 + Math.random() * 30,
      productivity: 1.0,
      loyalty: isFounder ? 100 : 30 + Math.random() * 40,
      salary: isFounder ? 0 : Math.floor(salary / 100) * 100,
      hiredMonth: currentMonth,
      projectAssignments: [],
    };
  }

  private selectPersonality(): PersonalityType {
    const rand = Math.random();
    if (rand < 0.2) return 'rockstar';
    if (rand < 0.4) return 'teamPlayer';
    if (rand < 0.6) return 'wildcard';
    if (rand < 0.8) return 'workhorse';
    return 'leader';
  }

  private generateSkills(personality: PersonalityType, isFounder: boolean): SkillSet {
    const baseLevel = isFounder ? 80 : 30 + Math.random() * 40;
    const variance = 15;

    const skills: SkillSet = {
      technical: this.clamp(baseLevel + (Math.random() - 0.5) * variance * 2),
      sales: this.clamp(baseLevel + (Math.random() - 0.5) * variance * 2),
      design: this.clamp(baseLevel + (Math.random() - 0.5) * variance * 2),
      management: this.clamp(baseLevel + (Math.random() - 0.5) * variance * 2),
    };

    // Apply personality modifiers
    const personalityData = personalities[personality];
    if (personalityData?.skillModifiers) {
      skills.technical = this.clamp(skills.technical + personalityData.skillModifiers.technical);
      skills.sales = this.clamp(skills.sales + personalityData.skillModifiers.sales);
      skills.design = this.clamp(skills.design + personalityData.skillModifiers.design);
      skills.management = this.clamp(skills.management + personalityData.skillModifiers.management);
    }

    return skills;
  }

  private selectRole(skills: SkillSet): string {
    const { technical, sales, design, management } = skills;
    const maxSkill = Math.max(technical, sales, design, management);

    if (maxSkill === technical) {
      const roles = [
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'DevOps Engineer',
        'QA Engineer',
      ];
      return roles[Math.floor(Math.random() * roles.length)];
    } else if (maxSkill === sales) {
      const roles = [
        'Sales Representative',
        'Business Development',
        'Account Manager',
        'Sales Engineer',
      ];
      return roles[Math.floor(Math.random() * roles.length)];
    } else if (maxSkill === design) {
      const roles = ['UI Designer', 'UX Designer', 'Product Designer', 'Visual Designer'];
      return roles[Math.floor(Math.random() * roles.length)];
    } else {
      const roles = ['Project Manager', 'Product Manager', 'Team Lead', 'Operations Manager'];
      return roles[Math.floor(Math.random() * roles.length)];
    }
  }

  private calculateSalary(skills: SkillSet, personality: PersonalityType): number {
    const avgSkill = (skills.technical + skills.sales + skills.design + skills.management) / 4;
    let baseSalary = 3000 + (avgSkill / 100) * 7000;

    // Personality salary modifiers
    switch (personality) {
      case 'rockstar':
        baseSalary *= 1.5;
        break;
      case 'leader':
        baseSalary *= 1.3;
        break;
      case 'workhorse':
        baseSalary *= 1.1;
        break;
    }

    // Cap salary for early game balance (first 6 months)
    const maxSalary = 7000;
    baseSalary = Math.min(baseSalary, maxSalary);

    return Math.floor(baseSalary);
  }

  private generateUniqueName(): string {
    let attempts = 0;
    let name = generateEmployeeName();

    while (this.usedNames.has(name) && attempts < 100) {
      name = generateEmployeeName();
      attempts++;
    }

    this.usedNames.add(name);
    return name;
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(100, Math.floor(value)));
  }
}
