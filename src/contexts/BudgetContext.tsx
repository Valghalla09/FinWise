import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { useAuth } from './AuthContext'
import { type Budget, type Category, type Expense, type IncomeSource, type BudgetStats, type BudgetMode, type BudgetIntervalUnit } from '@/types/budget'
import { generateId } from '@/lib/utils'

interface BudgetContextType {
  // State
  currentBudget: Budget | null
  expenses: Expense[]
  incomeSources: IncomeSource[]
  stats: BudgetStats | null
  loading: boolean
  
  // Budget Management
  createBudget: (totalBudget: number, mode: BudgetMode, categories: Category[], intervalUnit?: BudgetIntervalUnit, intervalValue?: number) => Promise<void>
  updateBudget: (budget: Partial<Budget>) => Promise<void>
  
  // Category Management
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>
  updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (categoryId: string) => Promise<void>
  
  // Expense Management
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  updateExpense: (expenseId: string, updates: Partial<Expense>) => Promise<void>
  deleteExpense: (expenseId: string) => Promise<void>
  
  // Income Management
  addIncomeSource: (income: Omit<IncomeSource, 'id' | 'createdAt'>) => Promise<void>
  updateIncomeSource: (incomeId: string, updates: Partial<IncomeSource>) => Promise<void>
  deleteIncomeSource: (incomeId: string) => Promise<void>
  
  // Utility
  getCurrentMonth: () => string
  getCategoryRemaining: (categoryId: string) => number
  getBudgetRemaining: () => number
  resetMonthlyBudget: () => Promise<void>
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

export function useBudget() {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider')
  }
  return context
}

interface BudgetProviderProps {
  children: ReactNode
}

export function BudgetProvider({ children }: BudgetProviderProps) {
  const { currentUser } = useAuth()
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [stats, setStats] = useState<BudgetStats | null>(null)
  const [loading, setLoading] = useState(true)

  const getCurrentMonth = () => {
    return new Date().toISOString().slice(0, 7) // YYYY-MM format
  }

  // Calculate stats whenever budget or expenses change
  useEffect(() => {
    if (currentBudget && expenses.length >= 0) {
      calculateStats()
    }
  }, [currentBudget, expenses])

  const calculateStats = () => {
    if (!currentBudget) return

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalBudget = currentBudget.totalBudget
    const remainingBudget = totalBudget - totalSpent
    const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    const categoryBreakdown = currentBudget.categories.map(category => {
      const categoryExpenses = expenses.filter(expense => expense.categoryId === category.id)
      const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      const percentage = category.allocatedAmount > 0 ? (spent / category.allocatedAmount) * 100 : 0

      return {
        categoryId: category.id,
        categoryName: category.name,
        spent,
        allocated: category.allocatedAmount,
        percentage
      }
    })

    setStats({
      totalSpent,
      totalBudget,
      remainingBudget,
      percentageUsed,
      categoryBreakdown
    })
  }

  const getCategoryRemaining = (categoryId: string): number => {
    if (!currentBudget) return 0

    const category = currentBudget.categories.find(cat => cat.id === categoryId)
    if (!category) return 0

    const spent = expenses
      .filter(expense => expense.categoryId === categoryId)
      .reduce((sum, expense) => sum + expense.amount, 0)

    return category.allocatedAmount - spent
  }

  const getBudgetRemaining = (): number => {
    if (!currentBudget) return 0

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return currentBudget.totalBudget - totalSpent
  }

  // Load user's current budget and expenses
  useEffect(() => {
    if (!currentUser) {
      setCurrentBudget(null)
      setExpenses([])
      setIncomeSources([])
      setLoading(false)
      return
    }

    const currentMonth = getCurrentMonth()

    // Listen to current month's budget
    const budgetDocRef = doc(db, 'users', currentUser.uid, 'budgets', currentMonth)
    const unsubscribeBudget = onSnapshot(budgetDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setCurrentBudget({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Budget)
      } else {
        setCurrentBudget(null)
      }
      setLoading(false)
    })

    // Listen to expenses for current month
    // Note: we avoid orderBy here to prevent requiring a composite index in Firestore.
    // We sort by createdAt on the client instead.
    const expensesQuery = query(
      collection(db, 'users', currentUser.uid, 'expenses'),
      where('month', '==', currentMonth)
    )
    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expenseList: Expense[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Expense))

      // Sort newest first on the client
      expenseList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      setExpenses(expenseList)
    })

    // Listen to income sources
    const incomeQuery = query(
      collection(db, 'users', currentUser.uid, 'incomeSources'),
      orderBy('createdAt', 'desc')
    )
    const unsubscribeIncome = onSnapshot(incomeQuery, (snapshot) => {
      const incomeList: IncomeSource[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as IncomeSource))
      setIncomeSources(incomeList)
    })

    return () => {
      unsubscribeBudget()
      unsubscribeExpenses()
      unsubscribeIncome()
    }
  }, [currentUser])

  const createBudget = async (
    totalBudget: number,
    mode: BudgetMode,
    categories: Category[],
    intervalUnit: BudgetIntervalUnit = 'months',
    intervalValue = 1
  ) => {
    if (!currentUser) throw new Error('User not authenticated')

    const currentMonth = getCurrentMonth()
    const budgetData: Omit<Budget, 'id'> = {
      userId: currentUser.uid,
      totalBudget,
      mode,
      month: currentMonth,
      categories,
      createdAt: new Date(),
      intervalUnit,
      intervalValue
    }

    await setDoc(doc(db, 'users', currentUser.uid, 'budgets', currentMonth), {
      ...budgetData,
      createdAt: Timestamp.fromDate(budgetData.createdAt)
    })
  }

  const updateBudget = async (updates: Partial<Budget>) => {
    if (!currentUser || !currentBudget) throw new Error('No budget to update')

    const currentMonth = getCurrentMonth()
    await updateDoc(doc(db, 'users', currentUser.uid, 'budgets', currentMonth), updates)
  }

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!currentBudget) throw new Error('No budget available')

    const newCategory: Category = {
      ...category,
      id: generateId()
    }

    const updatedCategories = [...currentBudget.categories, newCategory]
    await updateBudget({ categories: updatedCategories })
  }

  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    if (!currentBudget) throw new Error('No budget available')

    const updatedCategories = currentBudget.categories.map(cat =>
      cat.id === categoryId ? { ...cat, ...updates } : cat
    )
    await updateBudget({ categories: updatedCategories })
  }

  const deleteCategory = async (categoryId: string) => {
    if (!currentBudget) throw new Error('No budget available')

    const updatedCategories = currentBudget.categories.filter(cat => cat.id !== categoryId)
    await updateBudget({ categories: updatedCategories })
  }

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!currentUser) throw new Error('User not authenticated')

    const currentMonth = getCurrentMonth()
    const expenseData = {
      ...expense,
      month: currentMonth,
      createdAt: Timestamp.now(),
      date: Timestamp.fromDate(expense.date)
    }

    await addDoc(collection(db, 'users', currentUser.uid, 'expenses'), expenseData)
  }

  const updateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    if (!currentUser) throw new Error('User not authenticated')

    const updateData = { ...updates }
    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date) as any
    }

    await updateDoc(doc(db, 'users', currentUser.uid, 'expenses', expenseId), updateData)
  }

  const deleteExpense = async (expenseId: string) => {
    if (!currentUser) throw new Error('User not authenticated')

    await deleteDoc(doc(db, 'users', currentUser.uid, 'expenses', expenseId))
  }

  const addIncomeSource = async (income: Omit<IncomeSource, 'id' | 'createdAt'>) => {
    if (!currentUser) throw new Error('User not authenticated')

    const incomeData = {
      ...income,
      createdAt: Timestamp.now()
    }

    await addDoc(collection(db, 'users', currentUser.uid, 'incomeSources'), incomeData)
  }

  const updateIncomeSource = async (incomeId: string, updates: Partial<IncomeSource>) => {
    if (!currentUser) throw new Error('User not authenticated')

    await updateDoc(doc(db, 'users', currentUser.uid, 'incomeSources', incomeId), updates)
  }

  const deleteIncomeSource = async (incomeId: string) => {
    if (!currentUser) throw new Error('User not authenticated')

    await deleteDoc(doc(db, 'users', currentUser.uid, 'incomeSources', incomeId))
  }

  const resetMonthlyBudget = async () => {
    if (!currentUser || !currentBudget) throw new Error('No budget to reset')

    const currentMonth = getCurrentMonth()

    // Clear all expenses for the current period
    const expensesRef = collection(db, 'users', currentUser.uid, 'expenses')
    const expensesForMonthQuery = query(expensesRef, where('month', '==', currentMonth))
    const snapshot = await getDocs(expensesForMonthQuery)

    if (!snapshot.empty) {
      const batch = writeBatch(db)
      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref)
      })
      await batch.commit()
    }

    // Refresh budget timestamp so the user sees a recent reset
    await updateDoc(doc(db, 'users', currentUser.uid, 'budgets', currentMonth), {
      createdAt: Timestamp.now()
    })
  }

  const value = {
    currentBudget,
    expenses,
    incomeSources,
    stats,
    loading,
    createBudget,
    updateBudget,
    addCategory,
    updateCategory,
    deleteCategory,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    getCurrentMonth,
    getCategoryRemaining,
    getBudgetRemaining,
    resetMonthlyBudget
  }

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  )
}
