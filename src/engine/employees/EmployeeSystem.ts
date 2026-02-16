import type { Company, Employee } from '@/types';

export interface TurnoverResult {
  quitEmployees: Employee[];
  messages: string[];
}

export class EmployeeSystem {
  private readonly BASE_QUIT_RATE = 0.02; // 2% monthly base

  updateMorale(company: Company): void {
    for (const employee of company.employees) {
      if (employee.quitMonth) continue;

      let moraleChange = 0;

      // Salary fairness check
      const avgSalary = this.calculateAverageSalary(company);
      if (employee.salary < avgSalary * 0.8) {
        moraleChange -= 10;
      } else if (employee.salary > avgSalary * 1.2) {
        moraleChange += 5;
      }

      // Workload balance
      const workload = employee.projectAssignments.reduce((sum, a) => sum + a.allocation, 0);
      if (workload > 100) {
        moraleChange -= 15;
      } else if (workload < 50) {
        moraleChange -= 5;
      } else {
        moraleChange += 2;
      }

      // Culture fit
      const cultureFit = this.calculateCultureFit(employee, company.culture);
      moraleChange += (cultureFit - 0.5) * 20;

      // Recent project success
      const recentSuccess = this.checkRecentProjectSuccess(company, employee);
      moraleChange += recentSuccess * 10;

      // Apply morale change
      employee.morale = Math.max(0, Math.min(100, employee.morale + moraleChange));

      // Update productivity based on morale
      employee.productivity = this.calculateProductivity(employee);
    }
  }

  processTurnover(company: Company): TurnoverResult {
    const quitEmployees: Employee[] = [];
    const messages: string[] = [];

    for (const employee of company.employees) {
      if (employee.quitMonth) continue;

      const quitProbability = this.calculateQuitProbability(employee, company.currentMonth);

      if (Math.random() < quitProbability) {
        employee.quitMonth = company.currentMonth;
        quitEmployees.push(employee);
        messages.push(`${employee.name} (${employee.role}) has quit.`);

        // Pay severance
        const severance = employee.salary * 2;
        company.cash -= severance;
      }
    }

    return { quitEmployees, messages };
  }

  private calculateAverageSalary(company: Company): number {
    const activeEmployees = company.employees.filter((e) => !e.quitMonth);
    if (activeEmployees.length === 0) return 0;
    return activeEmployees.reduce((sum, e) => sum + e.salary, 0) / activeEmployees.length;
  }

  private calculateCultureFit(employee: Employee, culture: Company['culture']): number {
    // Simplified culture fit calculation
    // Different personalities prefer different cultures
    switch (employee.personality) {
      case 'rockstar':
        return culture.quality * 0.6 + (1 - culture.hierarchy) * 0.4;
      case 'teamPlayer':
        return (1 - culture.hierarchy) * 0.7 + culture.workLife * 0.3;
      case 'wildcard':
        return (1 - culture.speed) * 0.5 + (1 - culture.hierarchy) * 0.5;
      case 'workhorse':
        return culture.speed * 0.6 + culture.workLife * 0.4;
      case 'leader':
        return culture.hierarchy * 0.6 + culture.quality * 0.4;
      default:
        return 0.5;
    }
  }

  private checkRecentProjectSuccess(company: Company, employee: Employee): number {
    // Check if employee was on a recently completed successful project
    const recentCompletedProjects = company.projects.filter(
      (p) =>
        p.status === 'completed' && p.completedMonth && company.currentMonth - p.completedMonth <= 3
    );

    let successCount = 0;
    for (const project of recentCompletedProjects) {
      const wasAssigned = project.assignments.some((a) => a.employeeId === employee.id);
      if (wasAssigned && project.quality > 70) {
        successCount++;
      }
    }

    return Math.min(1, successCount * 0.3);
  }

  private calculateProductivity(employee: Employee): number {
    // Base productivity 1.0, modified by morale and personality
    let productivity = 1.0;

    // Morale modifier (-0.5 to +0.5)
    productivity += (employee.morale - 50) / 100;

    // Personality modifiers
    switch (employee.personality) {
      case 'rockstar':
        productivity *= 1.3;
        break;
      case 'workhorse':
        productivity *= 1.1;
        break;
      case 'wildcard':
        // Wildcard varies between 0.5 and 1.5
        productivity *= 0.5 + Math.random();
        break;
    }

    // Clamp between 0.5 and 2.0
    return Math.max(0.5, Math.min(2.0, productivity));
  }

  private calculateQuitProbability(employee: Employee, currentMonth: number): number {
    let probability = this.BASE_QUIT_RATE;

    // Morale modifier (low morale increases quit chance)
    if (employee.morale < 30) {
      probability *= 3;
    } else if (employee.morale < 50) {
      probability *= 1.5;
    } else if (employee.morale > 80) {
      probability *= 0.5;
    }

    // Loyalty modifier
    probability *= (100 - employee.loyalty) / 50;

    // Tenure modifier
    const tenure = currentMonth - employee.hiredMonth;
    if (tenure < 3) {
      // New employees are flight risks
      probability *= 1.5;
    } else if (tenure > 24) {
      // Veterans are more stable
      probability *= 0.7;
    }

    // Personality modifiers
    switch (employee.personality) {
      case 'workhorse':
        probability *= 0.5;
        break;
      case 'rockstar':
        probability *= 1.3;
        break;
    }

    return Math.min(0.5, probability); // Cap at 50%
  }
}
