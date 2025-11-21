import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Target, Award, DollarSign } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useProgress } from '@/contexts/ProgressContext'
import { useBudget } from '@/contexts/BudgetContext'
import { useTheme } from '@/contexts/ThemeContext'
import { formatCurrency } from '@/lib/utils'

const ProgressAnalytics = () => {
  const { stats } = useProgress()
  const { expenses } = useBudget()
  const { actualTheme } = useTheme()

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const chartColors = {
    text: actualTheme === 'dark' ? '#e4e4e7' : '#374151',
    grid: actualTheme === 'dark' ? '#374151' : '#e5e7eb',
    primary: '#3b82f6',
    secondary: '#ef4444',
    success: '#10b981'
  }

  // Prepare data for charts
  const goalStatusData = [
    { name: 'Completed', value: stats.completedGoals, fill: chartColors.success },
    { name: 'Active', value: stats.activeGoals, fill: chartColors.primary },
    { name: 'Total', value: stats.totalGoals - stats.completedGoals - stats.activeGoals, fill: '#6b7280' }
  ].filter(item => item.value > 0)

  // Spending over time based on real expenses from BudgetSmart
  const spendingByDate = new Map<string, { date: Date; label: string; expenses: number }>()

  expenses.forEach((expense) => {
    const d = expense.date
    const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
    const existing = spendingByDate.get(key)

    if (existing) {
      existing.expenses += expense.amount
    } else {
      spendingByDate.set(key, {
        date: d,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        expenses: expense.amount
      })
    }
  })

  const spendingOverTime = Array.from(spendingByDate.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  )

  // Category spending breakdown
  const categoryData = stats.monthlyTrends.length > 0 
    ? stats.monthlyTrends[0].categoryBreakdown.map((cat, index) => ({
        name: cat.categoryName,
        amount: cat.amount,
        fill: cat.color || `hsl(${index * 60}, 70%, 50%)`
      }))
    : []

  const statCards = [
    {
      title: 'Total Savings',
      value: formatCurrency(stats.totalSavings),
      icon: DollarSign,
      trend: '+12.5%',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Goal Completion',
      value: `${stats.goalCompletionRate.toFixed(1)}%`,
      icon: Target,
      trend: stats.completedGoals > 0 ? '+' + stats.completedGoals : '0',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Goals',
      value: stats.activeGoals.toString(),
      icon: TrendingUp,
      trend: 'In progress',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Achievements',
      value: stats.achievementsUnlocked.toString(),
      icon: Award,
      trend: 'Unlocked',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Over Time (based on BudgetSmart expenses) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Spending Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spendingOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fontSize: 12, fill: chartColors.text }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: chartColors.text }} />
                    <Tooltip 
                      formatter={(value) => [
                        formatCurrency(Number(value)), 
                        'Spent'
                      ]}
                      labelStyle={{ color: chartColors.text }}
                      contentStyle={{ 
                        backgroundColor: actualTheme === 'dark' ? '#1f2937' : '#ffffff',
                        border: `1px solid ${chartColors.grid}`
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke={chartColors.secondary} 
                      strokeWidth={3}
                      dot={{ fill: chartColors.secondary, strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Goal Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Goal Status</CardTitle>
            </CardHeader>
            <CardContent>
              {goalStatusData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={goalStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {goalStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Goals']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No goals yet</p>
                    <p className="text-sm">Create your first goal to see analytics</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: chartColors.text }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis tick={{ fontSize: 12, fill: chartColors.text }} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Spent']}
                      labelStyle={{ color: chartColors.text }}
                      contentStyle={{ 
                        backgroundColor: actualTheme === 'dark' ? '#1f2937' : '#ffffff',
                        border: `1px solid ${chartColors.grid}`
                      }}
                    />
                    <Bar dataKey="amount" fill={chartColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(stats.averageMonthlySpending)}
                </p>
                <p className="text-sm text-muted-foreground">Average Monthly Spending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.topCategory}
                </p>
                <p className="text-sm text-muted-foreground">Top Spending Category</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {((stats.totalSavings / (stats.averageMonthlySpending || 1)) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Savings Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default ProgressAnalytics
