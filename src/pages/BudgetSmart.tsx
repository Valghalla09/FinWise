import { motion } from 'framer-motion'
import { Coins, Settings, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useBudget } from '@/contexts/BudgetContext'
import BudgetSetupWizard from '@/components/budget/BudgetSetupWizard'
import BudgetStats from '@/components/budget/BudgetStats'
import ExpenseForm from '@/components/budget/ExpenseForm'
import RecentExpenses from '@/components/budget/RecentExpenses'
import { useState } from 'react'

const BudgetSmart = () => {
  const { currentBudget, loading, resetMonthlyBudget } = useBudget()
  const [showSetup, setShowSetup] = useState(false)
  const [resetting, setResetting] = useState(false)

  const intervalUnit = currentBudget?.intervalUnit ?? 'months'
  const intervalValue = currentBudget?.intervalValue ?? 1
  const intervalLabel = intervalUnit === 'days' ? 'day' : intervalUnit === 'weeks' ? 'week' : 'month'
  const resetLabel = `Reset ${intervalValue} ${intervalLabel}${intervalValue === 1 ? '' : 's'}`

  const handleResetBudget = async () => {
    if (!confirm('Are you sure you want to reset this budget period? This will clear all recorded expenses for the current period.')) return
    
    try {
      setResetting(true)
      await resetMonthlyBudget()
    } catch (error) {
      console.error('Failed to reset budget:', error)
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-16 bg-muted animate-pulse rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show setup wizard if no budget exists or user requested it
  if (!currentBudget || showSetup) {
    return <BudgetSetupWizard onComplete={() => setShowSetup(false)} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Coins className="h-8 w-8 mr-3 text-primary" />
              BudgetSmart
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your budget, track expenses, and monitor your financial health
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowSetup(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Setup Budget
            </Button>
            
            <Button
              variant="outline"
              onClick={handleResetBudget}
              disabled={resetting}
            >
              {resetting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 mr-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {resetLabel}
            </Button>
          </div>
        </div>

        {/* Budget Overview Stats */}
        <BudgetStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Add Expense Form */}
          <div className="lg:col-span-1">
            <ExpenseForm />
          </div>

          {/* Right Column - Recent Expenses */}
          <div className="lg:col-span-2">
            <RecentExpenses />
          </div>
        </div>

        {/* Budget Mode Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Budget Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold capitalize">{currentBudget.mode} Budget</p>
                  <p className="text-sm text-muted-foreground">
                    Budget period: {currentBudget.month}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Interval: {intervalValue} {intervalLabel}
                    {intervalValue === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="font-semibold">{currentBudget.categories.length} active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default BudgetSmart
