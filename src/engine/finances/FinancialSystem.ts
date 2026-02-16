import type { Company, FinancialSnapshot } from '@/types';

export class FinancialSystem {
  private readonly TOOL_COST_PER_EMPLOYEE = 500;
  private readonly BASE_RENT = 2000;
  private readonly MAX_RENT = 20000;

  calculateMonthlyFinances(company: Company, revenue: number): FinancialSnapshot {
    const activeEmployees = company.employees.filter((e) => !e.quitMonth);

    // Calculate payroll
    const payroll = activeEmployees.reduce((sum, e) => sum + e.salary, 0);

    // Calculate tools cost
    const tools = activeEmployees.length * this.TOOL_COST_PER_EMPLOYEE;

    // Calculate rent (scales with team size)
    const rent = this.calculateRent(activeEmployees.length);

    // Total expenses
    const totalExpenses = payroll + tools + rent;

    // Net cashflow
    const netCashflow = revenue - totalExpenses;

    return {
      month: company.currentMonth,
      startingCash: company.cash,
      revenue,
      payroll,
      tools,
      rent,
      otherExpenses: 0,
      netCashflow,
      endingCash: company.cash + netCashflow,
    };
  }

  private calculateRent(employeeCount: number): number {
    // Rent scales from $2K (1-5 employees) to $20K (50+ employees)
    if (employeeCount <= 1) return this.BASE_RENT;
    if (employeeCount >= 50) return this.MAX_RENT;

    const progress = (employeeCount - 1) / 49;
    return Math.floor(this.BASE_RENT + (this.MAX_RENT - this.BASE_RENT) * progress);
  }

  canAffordExpense(company: Company, amount: number): boolean {
    return company.cash >= amount;
  }

  processHiringCost(company: Company): boolean {
    const hiringCost = 2000;
    if (this.canAffordExpense(company, hiringCost)) {
      company.cash -= hiringCost;
      return true;
    }
    return false;
  }

  processSeverance(company: Company, employeeSalary: number): void {
    const severance = employeeSalary * 2;
    company.cash -= severance;
  }

  calculateBurnRate(company: Company): number {
    const activeEmployees = company.employees.filter((e) => !e.quitMonth);
    const payroll = activeEmployees.reduce((sum, e) => sum + e.salary, 0);
    const tools = activeEmployees.length * this.TOOL_COST_PER_EMPLOYEE;
    const rent = this.calculateRent(activeEmployees.length);
    return payroll + tools + rent;
  }

  calculateRunway(company: Company): number {
    const burnRate = this.calculateBurnRate(company);
    if (burnRate <= 0) return Infinity;
    return Math.floor(company.cash / burnRate);
  }
}
