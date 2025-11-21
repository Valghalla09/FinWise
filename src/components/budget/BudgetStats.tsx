import { useState } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Wallet, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useBudget } from '@/contexts/BudgetContext'
import { formatCurrency } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'

const BudgetStats = () => {
  const { currentBudget, stats, addCategory, deleteCategory } = useBudget()
  const { actualTheme } = useTheme()
  const navigate = useNavigate()
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryAmount, setNewCategoryAmount] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  if (!currentBudget || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Budget',
      amount: stats.totalBudget,
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Total Spent',
      amount: stats.totalSpent,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    },
    {
      title: 'Remaining',
      amount: stats.remainingBudget,
      icon: stats.remainingBudget >= 0 ? TrendingUp : TrendingDown,
      color: stats.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.remainingBudget >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
    },
    {
      title: 'Budget Used',
      amount: `${stats.percentageUsed.toFixed(1)}%`,
      icon: DollarSign,
      color: stats.percentageUsed > 90 ? 'text-red-600' : stats.percentageUsed > 70 ? 'text-yellow-600' : 'text-green-600',
      bgColor: stats.percentageUsed > 90 ? 'bg-red-100 dark:bg-red-900/20' : stats.percentageUsed > 70 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-green-100 dark:bg-green-900/20'
    }
  ]

  // Prepare data for charts
  const categoryData = stats.categoryBreakdown.map((cat, index) => ({
    name: cat.categoryName,
    spent: cat.spent,
    allocated: cat.allocated,
    fill: currentBudget.categories.find(c => c.id === cat.categoryId)?.color || `hsl(${index * 60}, 70%, 50%)`
  }))

  const pieData = categoryData.filter(cat => cat.spent > 0)

  const chartColors = {
    text: actualTheme === 'dark' ? '#e4e4e7' : '#374151',
    grid: actualTheme === 'dark' ? '#374151' : '#e5e7eb'
  }

  const goToExpenseAnalytics = () => {
    navigate('/track-progress?view=analytics')
  }

  const handleAddCategory = async () => {
    if (!currentBudget) return

    const name = newCategoryName.trim()
    const amount = parseFloat(newCategoryAmount)

    if (!name || isNaN(amount) || amount <= 0) return

    try {
      setAddingCategory(true)
      await addCategory({
        name,
        allocatedAmount: amount,
        color: '#6b7280'
      })
      setNewCategoryName('')
      setNewCategoryAmount('')
    } catch (error) {
      console.error('Failed to add category:', error)
    } finally {
      setAddingCategory(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!currentBudget) return

    const confirmed = window.confirm(
      `Delete ${categoryName} from your budget? This will not remove past expenses, but they will no longer be grouped under this category.`
    )
    if (!confirmed) return

    try {
      await deleteCategory(categoryId)
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }

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
                      <p className="text-2xl font-bold">
                        {typeof stat.amount === 'number' ? formatCurrency(stat.amount) : stat.amount}
                      </p>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card
            onClick={goToExpenseAnalytics}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Expense Breakdown</span>
                <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  View detailed expense trends
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="spent"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Spent']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <p>No expenses recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Budget vs Spent */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card
            onClick={goToExpenseAnalytics}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Budget vs Spending</span>
                <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Open spending analytics
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                      formatter={(value, name) => [formatCurrency(Number(value)), name]}
                      labelStyle={{ color: chartColors.text }}
                      contentStyle={{ 
                        backgroundColor: actualTheme === 'dark' ? '#1f2937' : '#ffffff',
                        border: `1px solid ${chartColors.grid}`
                      }}
                    />
                    <Legend />
                    <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" />
                    <Bar dataKey="spent" fill="#ef4444" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Tip: Click any chart to see more details in Track Progress.
      </p>

      {/* Progress Bars for Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle>Category Progress</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="h-9 max-w-[160px] text-sm"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newCategoryAmount}
                  onChange={(e) => setNewCategoryAmount(e.target.value)}
                  className="h-9 w-24 text-sm"
                  min={0}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCategory}
                  disabled={addingCategory || !newCategoryName.trim() || !newCategoryAmount}
                >
                  {addingCategory ? 'Adding...' : 'Add Category'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.categoryBreakdown.map((category) => {
              const progressPercentage = Math.min((category.spent / category.allocated) * 100, 100)
              const isOverBudget = category.spent > category.allocated
              
              return (
                <div key={category.categoryId} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-medium block">{category.categoryName}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDeleteCategory(category.categoryId, category.categoryName)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        isOverBudget ? 'bg-red-500' : progressPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  {isOverBudget && (
                    <p className="text-sm text-red-500">
                      Over budget by {formatCurrency(category.spent - category.allocated)}
                    </p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default BudgetStats
