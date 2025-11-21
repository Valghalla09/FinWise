import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Edit, Trash2, Plus, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useProgress } from '@/contexts/ProgressContext'
import { type Goal } from '@/types/progress'
import { formatCurrency, formatDate } from '@/lib/utils'

interface GoalCardProps {
  goal: Goal
}

const GoalCard = ({ goal }: GoalCardProps) => {
  const { updateGoalProgress, deleteGoal, updateGoal } = useProgress()
  const [isEditing, setIsEditing] = useState(false)
  const [addAmount, setAddAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const progress = (goal.currentAmount / goal.targetAmount) * 100
  const isCompleted = goal.status === 'completed'
  const isOverdue = new Date() > goal.deadline && !isCompleted

  const priorityColors = {
    low: 'bg-card border border-emerald-400/60 dark:border-emerald-500/70',
    medium: 'bg-card border border-amber-400/60 dark:border-amber-500/70',
    high: 'bg-card border border-red-400/60 dark:border-red-500/70'
  }

  const statusColors = {
    active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-100',
    paused: 'bg-gray-100 text-gray-800 dark:bg-gray-800/80 dark:text-gray-100'
  }

  const handleAddProgress = async () => {
    if (!addAmount || loading) return

    try {
      setLoading(true)
      await updateGoalProgress(goal.id, parseFloat(addAmount))
      setAddAmount('')
    } catch (error) {
      console.error('Failed to update goal progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${goal.title}"?`)) return

    try {
      await deleteGoal(goal.id)
    } catch (error) {
      console.error('Failed to delete goal:', error)
    }
  }

  const handleStatusToggle = async () => {
    const newStatus = goal.status === 'active' ? 'paused' : 'active'
    try {
      await updateGoal(goal.id, { status: newStatus })
    } catch (error) {
      console.error('Failed to update goal status:', error)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${priorityColors[goal.priority]} ${isOverdue ? 'border-red-500 dark:border-red-400' : ''}`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center text-lg">
                <Target className="h-5 w-5 mr-2 text-primary" />
                {goal.title}
                {isOverdue && (
                  <Clock className="h-4 w-4 ml-2 text-red-500" />
                )}
              </CardTitle>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[goal.status]}`}>
                {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
              </span>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
              </span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-3">
              <motion.div
                className={`h-3 rounded-full ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : progress > 75 
                      ? 'bg-blue-500' 
                      : 'bg-primary'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {progress.toFixed(1)}% complete
              </span>
              {isCompleted && (
                <span className="text-xs text-green-600 font-medium">✓ Goal Completed!</span>
              )}
            </div>
          </div>

          {/* Goal Details */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{goal.category}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Deadline</p>
              <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                {formatDate(goal.deadline)}
              </p>
            </div>
          </div>

          {/* Add Progress Section */}
          {!isCompleted && goal.status === 'active' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: isEditing ? 1 : 0, 
                height: isEditing ? 'auto' : 0 
              }}
              transition={{ duration: 0.3 }}
              className="border-t border-border pt-4"
            >
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Add amount"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="flex-1"
                  step="0.01"
                  min="0"
                />
                <Button
                  onClick={handleAddProgress}
                  disabled={!addAmount || loading}
                  size="sm"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Goal Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs ${
                goal.priority === 'high' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-100' 
                  : goal.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-amber-900/40 dark:text-amber-100'
                    : 'bg-green-100 text-green-800 dark:bg-emerald-900/40 dark:text-emerald-100'
              }`}>
                {goal.priority} priority
              </span>
            </div>

            {!isCompleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStatusToggle}
              >
                {goal.status === 'active' ? 'Pause' : 'Resume'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default GoalCard
