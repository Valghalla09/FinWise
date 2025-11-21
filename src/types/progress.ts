export interface Goal {
  id: string
  userId: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  category: string
  deadline: Date
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused'
  createdAt: Date
  updatedAt: Date
}

export interface Achievement {
  id: string
  userId: string
  title: string
  description: string
  icon: string
  type: 'budget' | 'savings' | 'goals' | 'streaks'
  criteria: AchievementCriteria
  unlockedAt?: Date
  isUnlocked: boolean
}

export interface AchievementCriteria {
  type: 'expense_count' | 'savings_amount' | 'budget_streak' | 'goal_completion'
  targetValue: number
  currentValue: number
}

export interface ExpenseTrend {
  month: string
  amount: number
  categoryBreakdown: {
    categoryId: string
    categoryName: string
    amount: number
    color: string
  }[]
}

export interface ProgressStats {
  totalGoals: number
  completedGoals: number
  activeGoals: number
  totalSavings: number
  monthlyTrends: ExpenseTrend[]
  goalCompletionRate: number
  averageMonthlySpending: number
  topCategory: string
  achievementsUnlocked: number
}

export type TimeRange = 'week' | 'month' | '3months' | '6months' | 'year'

export interface GoalFormData {
  title: string
  description: string
  targetAmount: number
  category: string
  deadline: Date
  priority: 'low' | 'medium' | 'high'
}
