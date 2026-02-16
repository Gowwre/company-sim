import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Activity,
  Briefcase,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function Dashboard() {
  const { company, advanceMonth } = useGameStore();

  if (!company) return null;

  const activeEmployees = company.employees.filter((e) => !e.quitMonth);
  const activeProjects = company.projects.filter((p) => p.status === 'inProgress');
  const completedProjects = company.projects.filter((p) => p.status === 'completed');

  const lastMonth = company.history[company.history.length - 1];
  const monthlyRevenue = lastMonth?.financials.revenue || 0;

  const chartData = company.history.slice(-12).map((snapshot) => ({
    month: `M${snapshot.month}`,
    cash: snapshot.cash,
    employees: snapshot.employeeCount,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{company.name}</h1>
          <div className="flex items-center gap-2 text-zinc-400 mt-1">
            <Calendar className="w-4 h-4" />
            <span>Month {company.currentMonth}</span>
          </div>
        </div>

        <Button
          onClick={advanceMonth}
          size="lg"
          className="bg-terminal-green text-terminal-bg hover:bg-terminal-green/90 font-mono font-bold border-0"
        >
          Next Month
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Cash"
          value={`$${company.cash.toLocaleString()}`}
          trend={lastMonth?.financials.netCashflow}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Employees"
          value={activeEmployees.length.toString()}
          subValue={`${company.employees.filter((e) => e.quitMonth).length} quit`}
          color="blue"
        />
        <StatCard
          icon={Briefcase}
          label="Active Projects"
          value={activeProjects.length.toString()}
          subValue={`${completedProjects.length} completed`}
          color="purple"
        />
        <StatCard
          icon={Award}
          label="Reputation"
          value={company.reputation.toString()}
          maxValue={100}
          color="yellow"
        />
      </div>

      {/* Charts & Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cash"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Financials */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Monthly Financials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Revenue</span>
              <span className="text-green-400 font-semibold">
                +${monthlyRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Payroll</span>
              <span className="text-red-400">
                -${lastMonth?.financials.payroll.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Tools & Services</span>
              <span className="text-red-400">
                -${lastMonth?.financials.tools.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Office Rent</span>
              <span className="text-red-400">
                -${lastMonth?.financials.rent.toLocaleString() || 0}
              </span>
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-300 font-semibold">Net Cashflow</span>
                <span
                  className={`font-bold ${
                    (lastMonth?.financials.netCashflow || 0) >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {(lastMonth?.financials.netCashflow || 0) >= 0 ? '+' : ''}$
                  {lastMonth?.financials.netCashflow.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects Preview */}
      {activeProjects.length > 0 && (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.slice(0, 3).map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-200 font-medium">{project.name}</span>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                      {project.progress.toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  trend?: number;
  maxValue?: number;
  color: 'green' | 'blue' | 'purple' | 'yellow' | 'red';
}

function StatCard({ icon: Icon, label, value, subValue, trend, maxValue, color }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="w-5 h-5" />
            </div>

            {trend !== undefined && (
              <Badge
                variant="outline"
                className={`${
                  trend >= 0
                    ? 'text-green-400 border-green-500/30'
                    : 'text-red-400 border-red-500/30'
                }`}
              >
                {trend >= 0 ? '+' : ''}
                {trend.toLocaleString()}
              </Badge>
            )}
          </div>

          <div className="mt-3">
            <p className="text-zinc-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>

            {subValue && <p className="text-zinc-500 text-xs mt-1">{subValue}</p>}

            {maxValue && (
              <div className="mt-2">
                <Progress value={parseInt(value)} max={maxValue} className="h-1" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
