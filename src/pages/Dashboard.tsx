import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  BarChart3,
  BookOpen,
  Plus,
  ArrowRight,
  Users
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useBudget } from '@/contexts/BudgetContext'
import { useProgress } from '@/contexts/ProgressContext'
import { useLearnFinance } from '@/contexts/LearnFinanceContext'
import { formatCurrency, formatDate } from '@/lib/utils'

const Dashboard = () => {
  const { currentUser } = useAuth()
  const { stats: budgetStats, expenses, currentBudget } = useBudget()
  const { goals } = useProgress()
  const { posts, getFeaturedPosts } = useLearnFinance()

  const featuredLearningPosts = getFeaturedPosts().slice(0, 3)
  const recentExpenses = expenses.slice(0, 5)
  const activeGoals = goals.filter(g => g.status === 'active').slice(0, 3)

  // Enhanced stats with click navigation
  const stats = budgetStats ? [
    {
      title: 'Total Budget',
      amount: formatCurrency(budgetStats.totalBudget),
      icon: DollarSign,
      trend: 'This month',
      isPositive: true,
      href: '/budget-smart',
      description: 'Manage your monthly budget'
    },
    {
      title: 'Spent This Month',
      amount: formatCurrency(budgetStats.totalSpent),
      icon: TrendingDown,
      trend: `${budgetStats.percentageUsed.toFixed(1)}% used`,
      isPositive: budgetStats.percentageUsed <= 80,
      href: '/budget-smart',
      description: 'View expense breakdown'
    },
    {
      title: 'Remaining',
      amount: formatCurrency(budgetStats.remainingBudget),
      icon: budgetStats.remainingBudget >= 0 ? TrendingUp : TrendingDown,
      trend: budgetStats.remainingBudget >= 0 ? 'On track' : 'Over budget',
      isPositive: budgetStats.remainingBudget >= 0,
      href: '/budget-smart',
      description: 'Budget balance'
    },
    {
      title: 'Active Goals',
      amount: goals.filter(g => g.status === 'active').length.toString(),
      icon: Target,
      trend: `${goals.filter(g => g.status === 'completed').length} completed`,
      isPositive: true,
      href: '/track-progress',
      description: 'Track your financial goals'
    }
  ] : [
    {
      title: 'Set Your Budget',
      amount: 'Get Started',
      icon: Coins,
      trend: 'Setup needed',
      isPositive: false,
      href: '/budget-smart',
      description: 'Create your first budget'
    },
    {
      title: 'Track Expenses',
      amount: 'No data',
      icon: TrendingDown,
      trend: 'Add expenses',
      isPositive: false,
      href: '/budget-smart',
      description: 'Start tracking spending'
    },
    {
      title: 'Set Goals',
      amount: 'No goals',
      icon: Target,
      trend: 'Create goals',
      isPositive: false,
      href: '/track-progress',
      description: 'Set financial goals'
    },
    {
      title: 'Learn Finance',
      amount: `${posts.filter(p => p.status === 'approved').length} tips`,
      icon: BookOpen,
      trend: 'Available',
      isPositive: true,
      href: '/learn-finance',
      description: 'Community financial tips'
    }
  ]

  const quickActions = [
    { 
      title: 'Add Expense', 
      icon: Plus, 
      href: '/budget-smart',
      description: 'Record a new expense'
    },
    { 
      title: 'Set Goal', 
      icon: Target, 
      href: '/track-progress',
      description: 'Create financial goal'
    },
    { 
      title: 'View Analytics', 
      icon: BarChart3, 
      href: '/track-progress',
      description: 'See your progress'
    },
    { 
      title: 'Learn Tips', 
      icon: BookOpen, 
      href: '/learn-finance',
      description: 'Read finance tips'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {currentUser?.displayName?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your financial overview for this month
          </p>
        </div>

        {/* Stats Grid - Clickable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <Link to={stat.href}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className="text-2xl font-bold">{stat.amount}</p>
                          <p className={`text-sm flex items-center mt-1 ${
                            stat.isPositive ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {stat.isPositive ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {stat.trend}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        </div>
                        <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Click to manage</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Quick Actions
                <span className="text-sm font-normal text-muted-foreground">
                  Get started with these common tasks
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  
                  return (
                    <motion.div
                      key={action.title}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to={action.href}>
                        <Button
                          variant="outline"
                          className="h-24 w-full flex flex-col items-center justify-center space-y-2 hover:border-primary hover:bg-primary/5"
                        >
                          <Icon className="h-6 w-6 text-primary" />
                          <span className="text-sm font-medium">{action.title}</span>
                          <span className="text-xs text-muted-foreground text-center">
                            {action.description}
                          </span>
                        </Button>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Highlights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Expenses */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Expenses</span>
                  <Link to="/budget-smart" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentExpenses.length > 0 ? (
                  <div className="space-y-3">
                    {recentExpenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                            <DollarSign className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">{expense.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(expense.date)} • {currentBudget?.categories.find(c => c.id === expense.categoryId)?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-red-600">
                          -{formatCurrency(expense.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No expenses yet</p>
                    <p className="text-sm">Start tracking your spending!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Goals or Featured Learning */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {activeGoals.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Active Goals</span>
                    <Link to="/track-progress" className="text-sm text-primary hover:underline">
                      View all
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeGoals.map((goal) => {
                      const progress = (goal.currentAmount / goal.targetAmount) * 100
                      return (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{goal.title}</p>
                              <p className="text-xs text-muted-foreground">{goal.category}</p>
                            </div>
                            <span className="text-sm font-semibold">
                              {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {progress.toFixed(1)}% completed
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Featured Financial Tips</span>
                    <Link to="/learn-finance" className="text-sm text-primary hover:underline">
                      View all
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {featuredLearningPosts.map((post) => (
                      <div key={post.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-2">{post.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              By {post.authorName} • {post.likes} likes
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {featuredLearningPosts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No featured tips yet</p>
                        <p className="text-sm">Check back soon for financial wisdom!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Budget Health Score */}
        {budgetStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Financial Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="font-semibold text-green-600">
                      {budgetStats.percentageUsed <= 80 ? 'On Track' : budgetStats.percentageUsed <= 100 ? 'Caution' : 'Over Budget'}
                    </p>
                    <p className="text-sm text-muted-foreground">Budget Status</p>
                  </div>
                  <div className="text-center">
                    <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/20 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(budgetStats.totalSpent / Math.max(expenses.length, 1))}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg. Daily Spending</p>
                  </div>
                  <div className="text-center">
                    <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/20 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="font-semibold text-purple-600">
                      {expenses.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Expenses This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default Dashboard
