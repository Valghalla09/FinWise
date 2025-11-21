import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { useAuth } from './AuthContext'
import { useBudget } from './BudgetContext'
import { type Goal, type Achievement, type ProgressStats, type ExpenseTrend, type GoalFormData } from '@/types/progress'
import { generateId } from '@/lib/utils'

interface ProgressContextType {
  // State
  goals: Goal[]
  achievements: Achievement[]
  stats: ProgressStats | null
  loading: boolean
  
  // Goal Management
  createGoal: (goalData: GoalFormData) => Promise<void>
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
  updateGoalProgress: (goalId: string, amount: number) => Promise<void>
  
  // Achievement System
  checkAndUnlockAchievements: () => Promise<void>
  getUnlockedAchievements: () => Achievement[]
  
  // Analytics
  calculateProgressStats: () => void
  getExpenseTrends: (months: number) => ExpenseTrend[]
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}

interface ProgressProviderProps {
  children: ReactNode
}

export function ProgressProvider({ children }: ProgressProviderProps) {
  const { currentUser } = useAuth()
  const { expenses, currentBudget } = useBudget()
  const [goals, setGoals] = useState<Goal[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Predefined achievements
  const defaultAchievements: Omit<Achievement, 'id' | 'userId' | 'unlockedAt' | 'isUnlocked'>[] = [
    {
      title: 'First Expense',
      description: 'Record your first expense',
      icon: '🎯',
      type: 'budget',
      criteria: { type: 'expense_count', targetValue: 1, currentValue: 0 }
    },
    {
      title: 'Spending Tracker',
      description: 'Record 10 expenses',
      icon: '📊',
      type: 'budget',
      criteria: { type: 'expense_count', targetValue: 10, currentValue: 0 }
    },
    {
      title: 'Budget Master',
      description: 'Stay within budget for a month',
      icon: '👑',
      type: 'budget',
      criteria: { type: 'budget_streak', targetValue: 1, currentValue: 0 }
    },
    {
      title: 'Goal Setter',
      description: 'Complete your first financial goal',
      icon: '🏆',
      type: 'goals',
      criteria: { type: 'goal_completion', targetValue: 1, currentValue: 0 }
    },
    {
      title: 'Savings Champion',
      description: 'Save $1000 in total',
      icon: '💰',
      type: 'savings',
      criteria: { type: 'savings_amount', targetValue: 1000, currentValue: 0 }
    },
    {
      title: 'Financial Guru',
      description: 'Complete 5 financial goals',
      icon: '🌟',
      type: 'goals',
      criteria: { type: 'goal_completion', targetValue: 5, currentValue: 0 }
    }
  ]

  // Load goals and achievements
  useEffect(() => {
    if (!currentUser) {
      setGoals([])
      setAchievements([])
      setLoading(false)
      return
    }

    // Listen to goals
    const goalsQuery = query(
      collection(db, 'users', currentUser.uid, 'goals'),
      orderBy('createdAt', 'desc')
    )
    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
      const goalsList: Goal[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Goal))
      setGoals(goalsList)
    })

    // Listen to achievements
    const achievementsQuery = query(
      collection(db, 'users', currentUser.uid, 'achievements'),
      orderBy('unlockedAt', 'desc')
    )
    const unsubscribeAchievements = onSnapshot(achievementsQuery, (snapshot) => {
      const achievementsList: Achievement[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        unlockedAt: doc.data().unlockedAt?.toDate()
      } as Achievement))
      
      // Merge with default achievements
      const allAchievements = defaultAchievements.map(defaultAch => {
        const existing = achievementsList.find(ach => ach.title === defaultAch.title)
        return existing || {
          ...defaultAch,
          id: generateId(),
          userId: currentUser.uid,
          isUnlocked: false
        }
      })
      
      setAchievements(allAchievements)
      setLoading(false)
    })

    // Initialize achievements if none exist
    initializeAchievements()

    return () => {
      unsubscribeGoals()
      unsubscribeAchievements()
    }
  }, [currentUser])

  // Calculate stats when data changes
  useEffect(() => {
    if (currentUser && (goals.length >= 0 || expenses.length >= 0)) {
      calculateProgressStats()
      checkAndUnlockAchievements()
    }
  }, [goals, expenses, currentBudget])

  const initializeAchievements = async () => {
    if (!currentUser) return

    // Check if achievements already exist
    const existingAchievements = achievements.length > 0
    if (existingAchievements) return

    // Create default achievements
    for (const achievement of defaultAchievements) {
      try {
        await addDoc(collection(db, 'users', currentUser.uid, 'achievements'), {
          ...achievement,
          userId: currentUser.uid,
          isUnlocked: false,
          criteria: {
            ...achievement.criteria,
            currentValue: 0
          }
        })
      } catch (error) {
        console.error('Failed to create achievement:', error)
      }
    }
  }

  const createGoal = async (goalData: GoalFormData) => {
    if (!currentUser) throw new Error('User not authenticated')

    const goal = {
      ...goalData,
      userId: currentUser.uid,
      currentAmount: 0,
      status: 'active' as const,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      deadline: Timestamp.fromDate(goalData.deadline)
    }

    await addDoc(collection(db, 'users', currentUser.uid, 'goals'), goal)
  }

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    if (!currentUser) throw new Error('User not authenticated')

    const updateData = { 
      ...updates, 
      updatedAt: Timestamp.now()
    }
    
    if (updates.deadline) {
      updateData.deadline = Timestamp.fromDate(updates.deadline) as any
    }

    await updateDoc(doc(db, 'users', currentUser.uid, 'goals', goalId), updateData)
  }

  const deleteGoal = async (goalId: string) => {
    if (!currentUser) throw new Error('User not authenticated')

    await deleteDoc(doc(db, 'users', currentUser.uid, 'goals', goalId))
  }

  const updateGoalProgress = async (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount)
    const status = newAmount >= goal.targetAmount ? 'completed' : 'active'

    await updateGoal(goalId, { 
      currentAmount: newAmount, 
      status 
    })
  }

  const checkAndUnlockAchievements = async () => {
    if (!currentUser) return

    const completedGoals = goals.filter(g => g.status === 'completed').length
    const totalExpenses = expenses.length
    const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)

    for (const achievement of achievements) {
      if (achievement.isUnlocked) continue

      let shouldUnlock = false
      let newCurrentValue = achievement.criteria.currentValue

      switch (achievement.criteria.type) {
        case 'expense_count':
          newCurrentValue = totalExpenses
          shouldUnlock = totalExpenses >= achievement.criteria.targetValue
          break
        case 'goal_completion':
          newCurrentValue = completedGoals
          shouldUnlock = completedGoals >= achievement.criteria.targetValue
          break
        case 'savings_amount':
          newCurrentValue = totalSavings
          shouldUnlock = totalSavings >= achievement.criteria.targetValue
          break
        case 'budget_streak':
          // Check if user stayed within budget this month
          if (currentBudget && expenses.length > 0) {
            const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
            const withinBudget = totalSpent <= currentBudget.totalBudget
            newCurrentValue = withinBudget ? 1 : 0
            shouldUnlock = withinBudget
          }
          break
      }

      if (shouldUnlock && !achievement.isUnlocked) {
        try {
          // If this is a default achievement, create it in Firestore
          if (!achievement.unlockedAt) {
            await addDoc(collection(db, 'users', currentUser.uid, 'achievements'), {
              ...achievement,
              isUnlocked: true,
              unlockedAt: Timestamp.now(),
              criteria: {
                ...achievement.criteria,
                currentValue: newCurrentValue
              }
            })
          } else {
            await updateDoc(doc(db, 'users', currentUser.uid, 'achievements', achievement.id), {
              isUnlocked: true,
              unlockedAt: Timestamp.now(),
              'criteria.currentValue': newCurrentValue
            })
          }
        } catch (error) {
          console.error('Failed to unlock achievement:', error)
        }
      }
    }
  }

  const getUnlockedAchievements = () => {
    return achievements.filter(ach => ach.isUnlocked)
  }

  const calculateProgressStats = () => {
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.status === 'completed').length
    const activeGoals = goals.filter(g => g.status === 'active').length
    const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)

    // Calculate monthly trends (simplified)
    const monthlyTrends: ExpenseTrend[] = []
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    if (currentBudget && expenses.length > 0) {
      const currentMonthExpenses = expenses.filter(exp => 
        exp.date.toISOString().slice(0, 7) === currentMonth
      )
      
      const totalAmount = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      const categoryBreakdown = currentBudget.categories.map(cat => {
        const categoryExpenses = currentMonthExpenses.filter(exp => exp.categoryId === cat.id)
        const amount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        return {
          categoryId: cat.id,
          categoryName: cat.name,
          amount,
          color: cat.color || '#6b7280'
        }
      }).filter(cat => cat.amount > 0)

      monthlyTrends.push({
        month: currentMonth,
        amount: totalAmount,
        categoryBreakdown
      })
    }

    const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0
    const averageMonthlySpending = expenses.length > 0 
      ? expenses.reduce((sum, exp) => sum + exp.amount, 0) / Math.max(monthlyTrends.length, 1)
      : 0
    
    const topCategory = monthlyTrends.length > 0 && monthlyTrends[0].categoryBreakdown.length > 0
      ? monthlyTrends[0].categoryBreakdown.reduce((top, cat) => cat.amount > top.amount ? cat : top).categoryName
      : 'No data'

    const achievementsUnlocked = achievements.filter(ach => ach.isUnlocked).length

    setStats({
      totalGoals,
      completedGoals,
      activeGoals,
      totalSavings,
      monthlyTrends,
      goalCompletionRate,
      averageMonthlySpending,
      topCategory,
      achievementsUnlocked
    })
  }

  const getExpenseTrends = () => {
    return stats?.monthlyTrends || []
  }

  const value = {
    goals,
    achievements,
    stats,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    checkAndUnlockAchievements,
    getUnlockedAchievements,
    calculateProgressStats,
    getExpenseTrends
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}
