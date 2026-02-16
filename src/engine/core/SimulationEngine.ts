import type { Company, MonthSnapshot, GameEvent } from '@/types';
import { EmployeeSystem } from '../employees/EmployeeSystem';
import { ProjectSystem } from '../projects/ProjectSystem';
import { FinancialSystem } from '../finances/FinancialSystem';
import { EventSystem } from '../events/EventSystem';
import { CultureSystem } from '../culture/CultureSystem';
import { checkAchievements } from '@/data/achievements';

export interface SimulationResult {
  success: boolean;
  events: GameEvent[];
  snapshot: MonthSnapshot;
  messages: string[];
}

export class SimulationEngine {
  private employeeSystem: EmployeeSystem;
  private projectSystem: ProjectSystem;
  private financialSystem: FinancialSystem;
  private eventSystem: EventSystem;
  private cultureSystem: CultureSystem;

  constructor() {
    this.employeeSystem = new EmployeeSystem();
    this.projectSystem = new ProjectSystem();
    this.financialSystem = new FinancialSystem();
    this.eventSystem = new EventSystem();
    this.cultureSystem = new CultureSystem();
  }

  processMonth(company: Company): SimulationResult {
    const messages: string[] = [];
    const currentMonth = company.currentMonth;

    // 1. Calculate employee morale changes
    this.employeeSystem.updateMorale(company);

    // 2. Process project progress
    const projectUpdates = this.projectSystem.processProjects(company);
    messages.push(...projectUpdates.messages);

    // 3. Check for project completions and apply outcomes
    const completedProjects = company.projects.filter(
      (p) => p.status === 'completed' && p.completedMonth === currentMonth
    );

    let revenue = 0;
    for (const project of completedProjects) {
      const outcome = this.projectSystem.calculateProjectOutcome(project);
      revenue += outcome.payment;
      messages.push(
        `Project "${project.name}" completed: ${outcome.quality > 70 ? 'Success' : outcome.quality > 50 ? 'Mediocre' : 'Failure'}`
      );
    }

    // 4. Calculate finances
    const financials = this.financialSystem.calculateMonthlyFinances(company, revenue);

    // 5. Apply cash changes
    company.cash += financials.netCashflow;

    // 6. Process employee turnover
    const turnoverResults = this.employeeSystem.processTurnover(company);
    messages.push(...turnoverResults.messages);

    // 7. Generate events
    const events = this.eventSystem.generateEvents(company);

    // 8. Update culture
    this.cultureSystem.updateCulture(company);

    // 9. Check achievements
    const newlyUnlocked = checkAchievements(company, new Set(company.unlockedAchievements));
    for (const achievement of newlyUnlocked) {
      company.unlockedAchievements.push(achievement.id);
      messages.push(`Achievement unlocked: ${achievement.name}!`);
    }

    // 10. Create month snapshot
    const snapshot: MonthSnapshot = {
      month: currentMonth,
      cash: company.cash,
      reputation: company.reputation,
      employeeCount: company.employees.filter((e) => !e.quitMonth).length,
      activeProjects: company.projects.filter((p) => p.status === 'inProgress').length,
      completedProjects: company.projects.filter((p) => p.status === 'completed').length,
      financials,
      culture: { ...company.culture },
    };

    company.history.push(snapshot);

    // 10. Increment month
    company.currentMonth++;

    // 11. Check for game over
    const success = company.cash >= 0;
    if (!success) {
      messages.push('Company has gone bankrupt!');
    }

    return {
      success,
      events,
      snapshot,
      messages,
    };
  }

  calculateScore(company: Company): number {
    const monthsSurvived = company.currentMonth;
    const finalCash = company.cash;
    const reputation = company.reputation;
    const employeesHired = company.employees.length;
    const projectsCompleted = company.projects.filter((p) => p.status === 'completed').length;

    // Scoring algorithm
    const score =
      monthsSurvived * 100 +
      finalCash * 0.1 +
      reputation * 50 +
      employeesHired * 200 +
      projectsCompleted * 500;

    return Math.floor(score);
  }
}
