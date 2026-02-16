import { useGameStore } from '@/store/gameStore';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function FinancialPanel() {
  const { company } = useGameStore();

  if (!company) return null;

  const lastMonth = company.history[company.history.length - 1];
  const monthlyRevenue = lastMonth?.financials.revenue || 0;
  const monthlyPayroll = lastMonth?.financials.payroll || 0;
  const monthlyTools = lastMonth?.financials.tools || 0;
  const monthlyRent = lastMonth?.financials.rent || 0;
  const netCashflow = lastMonth?.financials.netCashflow || 0;

  const totalExpenses = monthlyPayroll + monthlyTools + monthlyRent;
  const profitMargin = monthlyRevenue > 0 ? ((netCashflow / monthlyRevenue) * 100).toFixed(1) : '0';

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3 text-terminal-green" />;
    if (value < 0) return <TrendingDown className="w-3 h-3 text-terminal-red" />;
    return <Minus className="w-3 h-3 text-terminal-dark" />;
  };

  return (
    <div className="p-3 space-y-3">
      {/* Monthly Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-terminal-green-dark p-2">
          <div className="text-terminal-dark text-xs font-mono">REVENUE</div>
          <div className="text-terminal-green font-mono text-sm font-bold">
            +${monthlyRevenue.toLocaleString()}
          </div>
        </div>
        <div className="border border-terminal-green-dark p-2">
          <div className="text-terminal-dark text-xs font-mono">EXPENSES</div>
          <div className="text-terminal-red font-mono text-sm font-bold">
            -${totalExpenses.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Net Cashflow */}
      <div
        className={`
        border p-2 flex items-center justify-between
        ${netCashflow >= 0 ? 'border-terminal-green bg-terminal-green/5' : 'border-terminal-red bg-terminal-red/5'}
      `}
      >
        <span className="text-xs font-mono text-terminal-dim">NET CASHFLOW</span>
        <div className="flex items-center gap-2">
          {getTrendIcon(netCashflow)}
          <span
            className={`font-mono font-bold ${netCashflow >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}
          >
            {netCashflow >= 0 ? '+' : ''}${netCashflow.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-1.5 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-terminal-dark">Payroll:</span>
          <span className="text-terminal-dim">-${monthlyPayroll.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-terminal-dark">Tools:</span>
          <span className="text-terminal-dim">-${monthlyTools.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-terminal-dark">Rent:</span>
          <span className="text-terminal-dim">-${monthlyRent.toLocaleString()}</span>
        </div>
        <div className="border-t border-terminal-green-dark pt-1 mt-2 flex justify-between">
          <span className="text-terminal-dim">Profit Margin:</span>
          <span className={netCashflow >= 0 ? 'text-terminal-green' : 'text-terminal-red'}>
            {profitMargin}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default FinancialPanel;
