import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Edit, Trash2, Receipt, Search } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useBudget } from '@/contexts/BudgetContext'
import { formatCurrency, formatDate } from '@/lib/utils'

const RecentExpenses = () => {
  const { expenses, currentBudget, deleteExpense } = useBudget()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleDelete = async (expenseId: string) => {
    try {
      setDeletingId(expenseId)
      await deleteExpense(expenseId)
    } catch (error) {
      console.error('Failed to delete expense:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const getCategoryName = (categoryId: string) => {
    return currentBudget?.categories.find(cat => cat.id === categoryId)?.name || 'Unknown Category'
  }

  const getCategoryColor = (categoryId: string) => {
    return currentBudget?.categories.find(cat => cat.id === categoryId)?.color || '#6b7280'
  }

  const normalizedQuery = searchTerm.toLowerCase().trim()
  const filteredExpenses = !normalizedQuery
    ? expenses
    : expenses.filter((expense) => {
        const categoryName = getCategoryName(expense.categoryId).toLowerCase()
        const notes = expense.notes?.toLowerCase() || ''
        return (
          expense.name.toLowerCase().includes(normalizedQuery) ||
          categoryName.includes(normalizedQuery) ||
          notes.includes(normalizedQuery)
        )
      })

  if (!expenses.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Recent Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No expenses recorded yet</p>
          <p className="text-sm text-muted-foreground">Add your first expense to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Recent Expenses
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredExpenses.length} of {expenses.length})
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, category, or note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-8 text-sm"
              />
            </div>
            {searchTerm && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredExpenses.slice(0, 10).map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center space-x-3">
                {/* Category Color Indicator */}
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getCategoryColor(expense.categoryId) }}
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{expense.name}</h4>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {getCategoryName(expense.categoryId)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(expense.date)}
                    {expense.notes && (
                      <span className="ml-2 text-xs">• {expense.notes}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Edit expense"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
                    title="Delete expense"
                  >
                    {deletingId === expense.id ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-3 w-3 border border-red-500 border-t-transparent rounded-full"
                      />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredExpenses.length > 10 && (
            <div className="text-center pt-4">
              <Button variant="outline" size="sm">
                View All Expenses ({filteredExpenses.length})
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentExpenses
