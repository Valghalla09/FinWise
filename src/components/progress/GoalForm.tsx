import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Plus, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useProgress } from '@/contexts/ProgressContext'
import { type GoalFormData } from '@/types/progress'

interface GoalFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const GoalForm = ({ onSuccess, onCancel }: GoalFormProps) => {
  const { createGoal } = useProgress()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    targetAmount: 0,
    category: '',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default: 30 days from now
    priority: 'medium'
  })

  const predefinedCategories = [
    'Emergency Fund',
    'Vacation',
    'New Car',
    'Home Down Payment',
    'Electronics',
    'Education',
    'Retirement',
    'Investment',
    'Debt Payment',
    'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.targetAmount || !formData.category) {
      return
    }

    try {
      setLoading(true)
      await createGoal(formData)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        targetAmount: 0,
        category: '',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priority: 'medium'
      })

      onSuccess?.()
    } catch (error) {
      console.error('Failed to create goal:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof GoalFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Create New Goal
            </CardTitle>
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="goal-title" className="text-sm font-medium">
                Goal Title *
              </label>
              <Input
                id="goal-title"
                placeholder="e.g., Emergency Fund, New Laptop"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="goal-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Input
                id="goal-description"
                placeholder="Add more details about your goal..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            {/* Target Amount and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="goal-amount" className="text-sm font-medium">
                  Target Amount *
                </label>
                <Input
                  id="goal-amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="1000.00"
                  value={formData.targetAmount || ''}
                  onChange={(e) => handleInputChange('targetAmount', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="goal-category" className="text-sm font-medium">
                  Category *
                </label>
                <select
                  id="goal-category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {predefinedCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deadline and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="goal-deadline" className="text-sm font-medium">
                  Deadline *
                </label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={formData.deadline.toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('deadline', new Date(e.target.value))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="goal-priority" className="text-sm font-medium">
                  Priority
                </label>
                <select
                  id="goal-priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'medium' | 'high')}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            {/* Goal Preview */}
            {formData.title && formData.targetAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-primary/5 rounded-lg border border-primary/20"
              >
                <h4 className="font-medium mb-2">Goal Preview</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Title:</span> {formData.title}</p>
                  <p><span className="text-muted-foreground">Target:</span> ${formData.targetAmount.toLocaleString()}</p>
                  <p><span className="text-muted-foreground">Category:</span> {formData.category || 'Not selected'}</p>
                  <p><span className="text-muted-foreground">Deadline:</span> {formData.deadline.toLocaleDateString()}</p>
                  <p><span className="text-muted-foreground">Priority:</span> 
                    <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                      formData.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : formData.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {formData.priority}
                    </span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  disabled={loading || !formData.title || !formData.targetAmount || !formData.category}
                  className="min-w-32"
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
                  {loading ? 'Creating...' : 'Create Goal'}
                </Button>
              </motion.div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default GoalForm
