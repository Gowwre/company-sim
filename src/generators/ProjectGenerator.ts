import type { Project, ProjectType, SkillSet } from '@/types';

export class ProjectGenerator {
  private projectNames: Record<ProjectType, string[]> = {
    clientWork: [
      'E-commerce Platform',
      'Mobile Banking App',
      'Healthcare Portal',
      'Real Estate Website',
      'Inventory Management System',
      'Customer Dashboard',
      'Analytics Platform',
      'Social Media Integration',
      'Payment Gateway',
      'CRM System',
    ],
    productFeature: [
      'User Authentication System',
      'Notification Service',
      'Search Functionality',
      'Reporting Module',
      'API Integration',
      'Data Migration Tool',
      'Performance Optimization',
      'Security Audit',
      'Mobile Responsiveness',
      'Third-party Integration',
    ],
    maintenance: [
      'Code Refactoring',
      'Dependency Updates',
      'Bug Fixing Sprint',
      'Documentation Update',
      'Database Optimization',
      'Server Migration',
      'Security Patches',
      'Performance Tuning',
      'Technical Debt Reduction',
      'Legacy System Cleanup',
    ],
    rnd: [
      'AI/ML Research',
      'Blockchain Exploration',
      'New Framework Evaluation',
      'Prototyping Lab',
      'Innovation Workshop',
      'Technology Spike',
      'Proof of Concept',
      'Architecture Redesign',
      'Platform Migration Study',
      'Emerging Tech Analysis',
    ],
  };

  generateProject(type: ProjectType, currentMonth: number): Project {
    const names = this.projectNames[type];
    const name = names[Math.floor(Math.random() * names.length)];

    const complexity = this.generateComplexity(type);
    const requiredSkills = this.generateRequiredSkills(type, complexity);
    const estimatedMonths = Math.floor(1 + complexity * 0.8 + Math.random() * 2);
    const value = this.calculateValue(type, complexity, estimatedMonths);

    // Calculate realistic deadline based on actual progress speed
    // With new base progress of 25, skillMatch ~0.7, productivity ~1.0
    const realisticProgressPerMonth = (25 * 0.7 * 1.0) / Math.sqrt(complexity);
    const completionMonths = Math.ceil(100 / realisticProgressPerMonth);
    const deadline = type === 'clientWork' ? currentMonth + completionMonths + 2 : undefined;

    return {
      id: crypto.randomUUID(),
      name,
      type,
      complexity,
      requiredSkills,
      estimatedMonths,
      deadline,
      value,
      progress: 0,
      quality: 0,
      techDebt: 0,
      status: 'notStarted',
      assignments: [],
      startMonth: currentMonth,
      milestone25Paid: false,
      milestone50Paid: false,
      milestone75Paid: false,
    };
  }

  private generateComplexity(type: ProjectType): number {
    switch (type) {
      case 'clientWork':
        return Math.floor(3 + Math.random() * 6); // 3-9
      case 'productFeature':
        return Math.floor(2 + Math.random() * 5); // 2-7
      case 'maintenance':
        return Math.floor(1 + Math.random() * 4); // 1-5
      case 'rnd':
        return Math.floor(4 + Math.random() * 5); // 4-9
      default:
        return 5;
    }
  }

  private generateRequiredSkills(type: ProjectType, complexity: number): SkillSet {
    const intensity = complexity / 10;

    switch (type) {
      case 'clientWork':
        return {
          technical: Math.floor(40 + intensity * 40),
          sales: Math.floor(20 + intensity * 20),
          design: Math.floor(30 + intensity * 30),
          management: Math.floor(30 + intensity * 30),
        };
      case 'productFeature':
        return {
          technical: Math.floor(50 + intensity * 40),
          sales: Math.floor(10 + intensity * 10),
          design: Math.floor(40 + intensity * 30),
          management: Math.floor(20 + intensity * 20),
        };
      case 'maintenance':
        return {
          technical: Math.floor(60 + intensity * 30),
          sales: 0,
          design: Math.floor(10 + intensity * 10),
          management: Math.floor(10 + intensity * 10),
        };
      case 'rnd':
        return {
          technical: Math.floor(70 + intensity * 25),
          sales: 0,
          design: Math.floor(20 + intensity * 20),
          management: Math.floor(30 + intensity * 30),
        };
      default:
        return {
          technical: 50,
          sales: 25,
          design: 25,
          management: 25,
        };
    }
  }

  private calculateValue(type: ProjectType, complexity: number, estimatedMonths: number): number {
    const baseValue = complexity * estimatedMonths * 2500;

    switch (type) {
      case 'clientWork':
        return Math.floor(baseValue * (0.8 + Math.random() * 0.4));
      case 'productFeature':
        return Math.floor(baseValue * 0.5); // Indirect value
      case 'maintenance':
        return Math.floor(baseValue * 0.3); // Cost savings
      case 'rnd':
        return Math.floor(baseValue * 0.4); // Future value
      default:
        return baseValue;
    }
  }
}
