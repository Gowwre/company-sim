import type { Company } from '@/types';

export class CultureSystem {
  updateCulture(company: Company): void {
    // Culture emerges from player decisions
    // This is tracked but not directly set
    // We'll update it based on recent actions

    // For now, culture changes slowly based on:
    // 1. Speed: Average project completion time
    // 2. Quality: Average project quality scores
    // 3. Work-life: Average employee morale
    // 4. Hierarchy: Team size and management ratio

    const activeProjects = company.projects.filter((p) => p.status === 'completed');
    const activeEmployees = company.employees.filter((e) => !e.quitMonth);

    if (activeProjects.length > 0) {
      // Speed culture based on project completion speed
      const avgComplexity = activeProjects.reduce((sum, p) => sum + p.complexity, 0) / activeProjects.length;
      const avgDuration = activeProjects.reduce((sum, p) => {
        if (p.startMonth && p.completedMonth) {
          return sum + (p.completedMonth - p.startMonth);
        }
        return sum;
      }, 0) / activeProjects.length;

      if (avgDuration > 0) {
        // Faster completion = higher speed culture
        const speedScore = Math.min(1, avgComplexity / avgDuration);
        company.culture.speed = this.lerp(company.culture.speed, speedScore, 0.1);
      }

      // Quality culture based on project quality
      const avgQuality = activeProjects.reduce((sum, p) => sum + p.quality, 0) / activeProjects.length;
      const qualityTarget = avgQuality / 100;
      company.culture.quality = this.lerp(company.culture.quality, qualityTarget, 0.1);
    }

    if (activeEmployees.length > 0) {
      // Work-life culture based on morale
      const avgMorale = activeEmployees.reduce((sum, e) => sum + e.morale, 0) / activeEmployees.length;
      const workLifeTarget = avgMorale / 100;
      company.culture.workLife = this.lerp(company.culture.workLife, workLifeTarget, 0.1);

      // Hierarchy based on management ratio
      const managers = activeEmployees.filter((e) => e.skills.management > 60).length;
      const hierarchyTarget = Math.min(1, managers / Math.max(1, activeEmployees.length * 0.2));
      company.culture.hierarchy = this.lerp(company.culture.hierarchy, hierarchyTarget, 0.1);
    }
  }

  private lerp(current: number, target: number, factor: number): number {
    return current + (target - current) * factor;
  }

  getCultureDescription(culture: Company['culture']): string {
    const descriptions: string[] = [];

    if (culture.speed > 0.7) {
      descriptions.push('Fast-paced');
    } else if (culture.speed < 0.3) {
      descriptions.push('Methodical');
    }

    if (culture.quality > 0.7) {
      descriptions.push('Quality-focused');
    } else if (culture.quality < 0.3) {
      descriptions.push('Ship-it mentality');
    }

    if (culture.workLife > 0.7) {
      descriptions.push('Work-life balance');
    } else if (culture.workLife < 0.3) {
      descriptions.push('Hustle culture');
    }

    if (culture.hierarchy > 0.7) {
      descriptions.push('Structured');
    } else if (culture.hierarchy < 0.3) {
      descriptions.push('Flat organization');
    }

    return descriptions.join(', ') || 'Balanced culture';
  }
}
