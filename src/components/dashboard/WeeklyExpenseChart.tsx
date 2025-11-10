
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useMemo, useState } from 'react';
import { subDays, format, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WeeklyExpenseChartProps {
  transactions: any[];
}

type DateFilter = 'last7days' | 'thisweek' | 'lastweek' | 'lastmonth';

const WeeklyExpenseChart = ({ transactions }: WeeklyExpenseChartProps) => {
  const [selectedFilter, setSelectedFilter] = useState<DateFilter>('last7days');

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let dataPoints: { day: string; date: Date; amount: number }[] = [];

    switch (selectedFilter) {
      case 'last7days':
        // Last 7 days
        dataPoints = Array.from({ length: 7 }, (_, i) => {
          const date = startOfDay(subDays(now, 6 - i));
          return {
            day: format(date, 'EEE'),
            date,
            amount: 0,
          };
        });
        break;

      case 'thisweek':
        // This week (Monday to Sunday)
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        dataPoints = Array.from({ length: 7 }, (_, i) => {
          const date = startOfDay(subDays(endDate, 6 - i));
          return {
            day: format(date, 'EEE'),
            date,
            amount: 0,
          };
        });
        break;

      case 'lastweek':
        // Last week (Monday to Sunday)
        const lastWeekStart = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
        const lastWeekEnd = endOfWeek(subDays(now, 7), { weekStartsOn: 1 });
        dataPoints = Array.from({ length: 7 }, (_, i) => {
          const date = startOfDay(subDays(lastWeekEnd, 6 - i));
          return {
            day: format(date, 'EEE'),
            date,
            amount: 0,
          };
        });
        break;

      case 'lastmonth':
        // Last month - show data by weeks
        const lastMonthStart = startOfMonth(subDays(now, 30));
        const lastMonthEnd = endOfMonth(subDays(now, 30));
        
        // Create 4-5 data points for weeks in the month
        const weeksInMonth = Math.ceil((lastMonthEnd.getTime() - lastMonthStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
        dataPoints = Array.from({ length: Math.min(weeksInMonth, 5) }, (_, i) => {
          const weekStart = startOfDay(new Date(lastMonthStart.getTime() + i * 7 * 24 * 60 * 60 * 1000));
          return {
            day: `W${i + 1}`,
            date: weekStart,
            amount: 0,
          };
        });
        break;
    }

    // Filter transactions based on selected period and aggregate data
    const filteredTransactions = transactions.filter(transaction => {
      if (transaction.type !== 'expense') return false;
      
      const transactionDate = startOfDay(new Date(transaction.date));
      
      switch (selectedFilter) {
        case 'last7days':
          const sevenDaysAgo = startOfDay(subDays(now, 6));
          return transactionDate >= sevenDaysAgo && transactionDate <= startOfDay(now);
          
        case 'thisweek':
          return isWithinInterval(transactionDate, {
            start: startOfWeek(now, { weekStartsOn: 1 }),
            end: endOfWeek(now, { weekStartsOn: 1 })
          });
          
        case 'lastweek':
          const lastWeekStart = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
          const lastWeekEnd = endOfWeek(subDays(now, 7), { weekStartsOn: 1 });
          return isWithinInterval(transactionDate, {
            start: lastWeekStart,
            end: lastWeekEnd
          });
          
        case 'lastmonth':
          const lastMonthStart = startOfMonth(subDays(now, 30));
          const lastMonthEnd = endOfMonth(subDays(now, 30));
          return isWithinInterval(transactionDate, {
            start: lastMonthStart,
            end: lastMonthEnd
          });
          
        default:
          return false;
      }
    });

    // Aggregate transaction amounts into data points
    filteredTransactions.forEach(transaction => {
      const transactionDate = startOfDay(new Date(transaction.date));
      
      if (selectedFilter === 'lastmonth') {
        // For last month, group by week
        const lastMonthStart = startOfMonth(subDays(now, 30));
        const weekIndex = Math.floor((transactionDate.getTime() - lastMonthStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const dataPoint = dataPoints[Math.min(weekIndex, dataPoints.length - 1)];
        if (dataPoint) {
          dataPoint.amount += Number(transaction.amount);
        }
      } else {
        // For other periods, match by exact date
        const dayData = dataPoints.find(day => 
          day.date.getTime() === transactionDate.getTime()
        );
        if (dayData) {
          dayData.amount += Number(transaction.amount);
        }
      }
    });

    return dataPoints.map(day => ({
      day: day.day,
      amount: Math.round(day.amount * 100) / 100,
    }));
  }, [transactions, selectedFilter]);

  const getFilterLabel = (filter: DateFilter) => {
    switch (filter) {
      case 'last7days': return 'Last 7 Days';
      case 'thisweek': return 'This Week';
      case 'lastweek': return 'Last Week';
      case 'lastmonth': return 'Last Month';
      default: return 'Last 7 Days';
    }
  };

  return (
    <div className="premium-card p-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-semibold text-foreground">Weekly Expenses</h3>
        <Select value={selectedFilter} onValueChange={(value: DateFilter) => setSelectedFilter(value)}>
          <SelectTrigger className="w-40 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last7days">Last 7 Days</SelectItem>
            <SelectItem value="thisweek">This Week</SelectItem>
            <SelectItem value="lastweek">Last Week</SelectItem>
            <SelectItem value="lastmonth">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis hide />
            <Tooltip 
              formatter={(value) => [`$${value}`, 'Expenses']}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 6 }}
              activeDot={{ r: 8, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--card))', strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyExpenseChart;
