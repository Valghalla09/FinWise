export interface Category {
  id: string
  name: string
  allocatedAmount: number
  color?: string
  icon?: string
}

export interface Expense {
  id: string
  name: string
  amount: number
  categoryId: string
  date: Date
  notes?: string
  createdAt: Date
}

export interface IncomeSource {
  id: string
  name: string
  amount: number
  frequency: 'weekly' | 'monthly' | 'yearly' | 'one-time'
  color?: string
  createdAt: Date
}

export type BudgetIntervalUnit = 'days' | 'weeks' | 'months'

export interface Budget {
  id: string
  userId: string
  totalBudget: number
  mode: 'student' | 'worker' | 'custom'
  month: string // Format: YYYY-MM
  createdAt: Date
  categories: Category[]
  intervalUnit?: BudgetIntervalUnit
  intervalValue?: number
}

export type BudgetMode = 'student' | 'worker' | 'custom'

export interface BudgetStats {
  totalSpent: number
  totalBudget: number
  remainingBudget: number
  percentageUsed: number
  categoryBreakdown: {
    categoryId: string
    categoryName: string
    spent: number
    allocated: number
    percentage: number
  }[]
}
