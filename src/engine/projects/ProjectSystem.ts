import type { Company, Project, SkillSet } from '@/types';

export interface ProjectOutcome {
  payment: number;
  quality: number;
  reputationChange: number;
}

export interface ProjectUpdate {
  messages: string[];
}

export class ProjectSystem {
  processProjects(company: Company): ProjectUpdate {
    const messages: string[] = [];

    for (const project of company.projects) {
      if (project.status !== 'inProgress') continue;

      // Get active assignments only (filter out quit employees)
      const activeAssignments = project.assignments.filter((a) => {
        const employee = company.employees.find((e) => e.id === a.employeeId);
        return employee && !employee.quitMonth;
      });

      // Calculate progress for this month using only active assignments
      const assignedEmployees = company.employees.filter((e) =>
        activeAssignments.some((a) => a.employeeId === e.id)
      );

      if (assignedEmployees.length === 0) {
        continue;
      }

      // Calculate skill match
      const skillMatch = this.calculateSkillMatch(assignedEmployees, project.requiredSkills);

      // Calculate progress
      let monthlyProgress = 25;
      monthlyProgress *= skillMatch;

      // Apply productivity multipliers
      const avgProductivity =
        assignedEmployees.reduce((sum, e) => sum + e.productivity, 0) / assignedEmployees.length;
      monthlyProgress *= avgProductivity;

      // Apply complexity penalty
      monthlyProgress /= Math.sqrt(project.complexity);

      // Update progress
      const oldProgress = project.progress;
      project.progress = Math.min(100, project.progress + monthlyProgress);

      // Calculate quality contribution
      const qualityContribution = skillMatch * (avgProductivity / 2) * 10;
      project.quality = Math.min(100, project.quality + qualityContribution);

      // Add tech debt if rushing or low skill match
      if (skillMatch < 0.6) {
        project.techDebt += 5;
      }

      // Process milestone payments for client work
      if (project.type === 'clientWork' && project.status === 'inProgress') {
        const newProgress = project.progress;

        // 25% milestone
        if (oldProgress < 25 && newProgress >= 25 && !project.milestone25Paid) {
          const payment = project.value * 0.15;
          company.cash += payment;
          project.milestone25Paid = true;
          messages.push(
            `Project "${project.name}" milestone reached (25%) - received $${Math.floor(payment).toLocaleString()}`
          );
        }

        // 50% milestone
        if (oldProgress < 50 && newProgress >= 50 && !project.milestone50Paid) {
          const payment = project.value * 0.15;
          company.cash += payment;
          project.milestone50Paid = true;
          messages.push(
            `Project "${project.name}" milestone reached (50%) - received $${Math.floor(payment).toLocaleString()}`
          );
        }

        // 75% milestone
        if (oldProgress < 75 && newProgress >= 75 && !project.milestone75Paid) {
          const payment = project.value * 0.15;
          company.cash += payment;
          project.milestone75Paid = true;
          messages.push(
            `Project "${project.name}" milestone reached (75%) - received $${Math.floor(payment).toLocaleString()}`
          );
        }
      }

      // Check for completion
      if (project.progress >= 100) {
        project.status = 'completed';
        project.completedMonth = company.currentMonth;
        project.progress = 100;
        project.quality = Math.max(0, project.quality - project.techDebt * 0.5);
        messages.push(`Project "${project.name}" completed!`);

        // Unassign all employees from completed project
        this.unassignAllEmployeesFromProject(company, project);
      }

      // Check for deadline failure
      if (
        project.deadline &&
        company.currentMonth > project.deadline &&
        project.status === 'inProgress'
      ) {
        project.status = 'failed';
        messages.push(`Project "${project.name}" failed to meet deadline!`);

        // Unassign all employees from failed project
        this.unassignAllEmployeesFromProject(company, project);
      }
    }

    return { messages };
  }

  calculateProjectOutcome(project: Project): ProjectOutcome {
    const quality = project.quality;

    if (quality >= 90) {
      return {
        payment: project.value * 1.2,
        quality,
        reputationChange: 5,
      };
    } else if (quality >= 70) {
      return {
        payment: project.value,
        quality,
        reputationChange: 2,
      };
    } else if (quality >= 50) {
      return {
        payment: project.value * 0.8,
        quality,
        reputationChange: 0,
      };
    } else {
      return {
        payment: 0,
        quality,
        reputationChange: -5,
      };
    }
  }

  private calculateSkillMatch(employees: Company['employees'], requiredSkills: SkillSet): number {
    if (employees.length === 0) return 0;

    const totalSkills: SkillSet = {
      technical: 0,
      sales: 0,
      design: 0,
      management: 0,
    };

    for (const employee of employees) {
      totalSkills.technical += employee.skills.technical;
      totalSkills.sales += employee.skills.sales;
      totalSkills.design += employee.skills.design;
      totalSkills.management += employee.skills.management;
    }

    const avgSkills: SkillSet = {
      technical: totalSkills.technical / employees.length,
      sales: totalSkills.sales / employees.length,
      design: totalSkills.design / employees.length,
      management: totalSkills.management / employees.length,
    };

    let matchSum = 0;
    let weightSum = 0;

    if (requiredSkills.technical > 0) {
      matchSum += Math.min(1, avgSkills.technical / requiredSkills.technical);
      weightSum += 1;
    }
    if (requiredSkills.sales > 0) {
      matchSum += Math.min(1, avgSkills.sales / requiredSkills.sales);
      weightSum += 1;
    }
    if (requiredSkills.design > 0) {
      matchSum += Math.min(1, avgSkills.design / requiredSkills.design);
      weightSum += 1;
    }
    if (requiredSkills.management > 0) {
      matchSum += Math.min(1, avgSkills.management / requiredSkills.management);
      weightSum += 1;
    }

    return weightSum > 0 ? matchSum / weightSum : 0.5;
  }

  assignEmployeeToProject(project: Project, employeeId: string, allocation: number): boolean {
    const existingIndex = project.assignments.findIndex((a) => a.employeeId === employeeId);

    if (existingIndex >= 0) {
      project.assignments[existingIndex].allocation = allocation;
    } else {
      project.assignments.push({ employeeId, allocation });
    }

    return true;
  }

  unassignEmployeeFromProject(project: Project, employeeId: string): boolean {
    const index = project.assignments.findIndex((a) => a.employeeId === employeeId);
    if (index >= 0) {
      project.assignments.splice(index, 1);
      return true;
    }
    return false;
  }

  private unassignAllEmployeesFromProject(company: Company, project: Project): void {
    // Remove project from each employee's projectAssignments
    for (const assignment of project.assignments) {
      const employee = company.employees.find((e) => e.id === assignment.employeeId);
      if (employee) {
        employee.projectAssignments = employee.projectAssignments.filter(
          (a) => a.projectId !== project.id
        );
      }
    }

    // Clear all assignments from the project
    project.assignments = [];
  }
}
