import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Briefcase, Settings, Coins } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useBudget } from '@/contexts/BudgetContext'
import { type BudgetMode, type Category, type BudgetIntervalUnit } from '@/types/budget'
import { generateId, formatCurrency } from '@/lib/utils'

interface BudgetSetupWizardProps {
  onComplete: () => void
}

const BudgetSetupWizard = ({ onComplete }: BudgetSetupWizardProps) => {
  const { createBudget } = useBudget()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedMode, setSelectedMode] = useState<BudgetMode | null>(null)
  const [totalBudget, setTotalBudget] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [intervalUnit, setIntervalUnit] = useState<BudgetIntervalUnit>('months')
  const [intervalValue, setIntervalValue] = useState(1)

  const modes = [
    {
      id: 'student' as BudgetMode,
      title: 'Student',
      icon: GraduationCap,
      description: 'For students with limited income and educational expenses',
      defaultCategories: [
        { name: 'Food & Dining', allocatedAmount: 200, color: '#f59e0b' },
        { name: 'Transportation', allocatedAmount: 100, color: '#3b82f6' },
        { name: 'School Supplies', allocatedAmount: 150, color: '#8b5cf6' },
        { name: 'Entertainment', allocatedAmount: 100, color: '#10b981' },
        { name: 'Personal Care', allocatedAmount: 50, color: '#ef4444' },
      ]
    },
    {
      id: 'worker' as BudgetMode,
      title: 'Working Professional',
      icon: Briefcase,
      description: 'For working professionals with regular income',
      defaultCategories: [
        { name: 'Groceries', allocatedAmount: 400, color: '#f59e0b' },
        { name: 'Transportation', allocatedAmount: 200, color: '#3b82f6' },
        { name: 'Utilities', allocatedAmount: 150, color: '#8b5cf6' },
        { name: 'Entertainment', allocatedAmount: 200, color: '#10b981' },
        { name: 'Healthcare', allocatedAmount: 100, color: '#ef4444' },
        { name: 'Shopping', allocatedAmount: 250, color: '#f97316' },
      ]
    },
    {
      id: 'custom' as BudgetMode,
      title: 'Custom Setup',
      icon: Settings,
      description: 'Create your own categories and budget allocation',
      defaultCategories: [
        { name: 'Category 1', allocatedAmount: 200, color: '#f59e0b' },
        { name: 'Category 2', allocatedAmount: 200, color: '#3b82f6' },
      ]
    }
  ]

  const handleModeSelect = (mode: BudgetMode) => {
    setSelectedMode(mode)
    const selectedModeData = modes.find(m => m.id === mode)
    if (selectedModeData) {
      const defaultCategories = selectedModeData.defaultCategories.map(cat => ({
        id: generateId(),
        ...cat
      }))
      setCategories(defaultCategories)
      
      // Auto-calculate budget based on categories
      const suggestedBudget = defaultCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0)
      setTotalBudget(suggestedBudget.toString())
    }
  }

  const updateCategoryAmount = (categoryId: string, amount: number) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, allocatedAmount: amount } : cat
    ))
  }

  const addCategory = () => {
    const newCategory: Category = {
      id: generateId(),
      name: `Category ${categories.length + 1}`,
      allocatedAmount: 100,
      color: '#6b7280'
    }
    setCategories(prev => [...prev, newCategory])
  }

  const removeCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId))
  }

  const updateCategoryName = (categoryId: string, name: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, name } : cat
    ))
  }

  const handleComplete = async () => {
    if (!selectedMode || !totalBudget || categories.length === 0) return

    try {
      setLoading(true)
      await createBudget(
        parseFloat(totalBudget),
        selectedMode,
        categories,
        intervalUnit,
        intervalValue
      )
      onComplete()
    } catch (error) {
      console.error('Failed to create budget:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0)
  const budgetValue = parseFloat(totalBudget) || 0

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Coins className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Setup Your Budget</h1>
          <p className="text-muted-foreground">
            Let's create a personalized budget plan that works for you
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  num <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {num}
                </div>
                {num < 3 && <div className={`w-8 h-0.5 ${num < step ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Mode Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Choose Your Budget Mode</h2>
              <p className="text-muted-foreground">Select the option that best describes your situation</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {modes.map((mode) => {
                const Icon = mode.icon
                return (
                  <motion.div
                    key={mode.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-colors ${
                        selectedMode === mode.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => handleModeSelect(mode.id)}
                    >
                      <CardContent className="p-6 text-center">
                        <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h3 className="font-semibold mb-2">{mode.title}</h3>
                        <p className="text-sm text-muted-foreground">{mode.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedMode}
              >
                Next Step
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Budget Amount */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Set Your Budget Amount</h2>
              <p className="text-muted-foreground">How much do you plan to spend for this period?</p>
            </div>

            <Card className="max-w-md mx-auto mb-8">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium mb-2">
                      Budget Amount
                    </label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="Enter amount"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Budget Interval
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['days', 'weeks', 'months'] as BudgetIntervalUnit[]).map((unit) => (
                          <Button
                            key={unit}
                            type="button"
                            variant={intervalUnit === unit ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setIntervalUnit(unit)}
                          >
                            {unit.charAt(0).toUpperCase() + unit.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="intervalValue" className="block text-sm font-medium mb-2">
                        How long is this budget for?
                      </label>
                      <Input
                        id="intervalValue"
                        type="number"
                        min={1}
                        value={intervalValue}
                        onChange={(e) =>
                          setIntervalValue(Math.max(1, Number(e.target.value) || 1))
                        }
                      />
                    </div>
                  </div>

                  {totalBudget && (
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(parseFloat(totalBudget))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        per {intervalValue} {intervalUnit}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Previous
              </Button>
              <Button onClick={() => setStep(3)} disabled={!totalBudget}>
                Next Step
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Categories */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Customize Your Categories</h2>
              <p className="text-muted-foreground">Adjust the budget allocation for each category</p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Budget Categories</span>
                  <div className="text-sm">
                    <span className={totalAllocated > budgetValue ? 'text-red-500' : 'text-green-500'}>
                      {formatCurrency(totalAllocated)} / {formatCurrency(budgetValue)}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <Input
                        value={category.name}
                        onChange={(e) => updateCategoryName(category.id, e.target.value)}
                        className="font-medium"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        value={category.allocatedAmount}
                        onChange={(e) => updateCategoryAmount(category.id, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    {categories.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCategory(category.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}

                <Button variant="outline" onClick={addCategory} className="w-full">
                  Add Category
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Previous
              </Button>
              <Button 
                onClick={handleComplete} 
                disabled={loading || totalAllocated > budgetValue || categories.length === 0}
              >
                {loading ? 'Creating Budget...' : 'Complete Setup'}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default BudgetSetupWizard
