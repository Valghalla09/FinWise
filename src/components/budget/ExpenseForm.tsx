import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useBudget } from '@/contexts/BudgetContext'
import { formatCurrency } from '@/lib/utils'

interface ExpenseFormProps {
  onSuccess?: () => void
}

const ExpenseForm = ({ onSuccess }: ExpenseFormProps) => {
  const { currentBudget, addExpense, getCategoryRemaining, getBudgetRemaining } = useBudget()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError(null)

    if (!formData.name || !formData.amount || !formData.categoryId) {
      return
    }

    const amountValue = parseFloat(formData.amount)
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError('Amount must be more than 0.')
      return
    }

    const categoryRemaining = getCategoryRemaining(formData.categoryId)
    const budgetRemaining = getBudgetRemaining()

    if (categoryRemaining <= 0) {
      const categoryName = currentBudget?.categories.find(cat => cat.id === formData.categoryId)?.name || 'this category'
      setError(`You have already used all of your ${categoryName} budget.`)
      return
    }

    if (amountValue > categoryRemaining) {
      const categoryName = currentBudget?.categories.find(cat => cat.id === formData.categoryId)?.name || 'this category'
      setError(
        `This expense is higher than your remaining ${categoryName} budget (${formatCurrency(
          Math.max(categoryRemaining, 0)
        )} left). Please lower the amount or choose another category.`
      )
      return
    }

    if (budgetRemaining <= 0) {
      setError('You have already used all of your budget for this period.')
      return
    }

    if (amountValue > budgetRemaining) {
      setError(
        `This expense is higher than your remaining budget for this period (${formatCurrency(
          Math.max(budgetRemaining, 0)
        )} left). Please lower the amount.`
      )
      return
    }

    try {
      setLoading(true)
      const expensePayload: {
        name: string
        amount: number
        categoryId: string
        date: Date
        notes?: string
      } = {
        name: formData.name,
        amount: amountValue,
        categoryId: formData.categoryId,
        date: new Date(formData.date)
      }

      if (formData.notes.trim()) {
        expensePayload.notes = formData.notes.trim()
      }

      await addExpense(expensePayload)

      // Reset form
      setFormData({
        name: '',
        amount: '',
        categoryId: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      })

      onSuccess?.()
    } catch (error) {
      console.error('Failed to add expense:', error)
      setError('Could not save this expense. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!currentBudget || currentBudget.categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            No budget categories available. Please set up your budget first.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add New Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Expense Name */}
          <div className="space-y-2">
            <label htmlFor="expense-name" className="text-sm font-medium">
              Expense Name *
            </label>
            <Input
              id="expense-name"
              placeholder="e.g., Lunch at cafe"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Amount and Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="expense-amount" className="text-sm font-medium">
                Amount *
              </label>
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="expense-category" className="text-sm font-medium">
                Category *
              </label>
              <select
                id="expense-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                required
              >
                <option value="">Select category</option>
                {currentBudget.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label htmlFor="expense-date" className="text-sm font-medium">
              Date
            </label>
            <div className="relative">
              <Input
                id="expense-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="pl-10"
              />
              <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="expense-notes" className="text-sm font-medium">
              Notes (Optional)
            </label>
            <Input
              id="expense-notes"
              placeholder="Additional details..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              type="submit" 
              disabled={loading || !formData.name || !formData.amount || !formData.categoryId}
              className="w-full"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Adding Expense...' : 'Add Expense'}
            </Button>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  )
}

export default ExpenseForm
