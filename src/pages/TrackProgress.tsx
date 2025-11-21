import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Target, Plus, BarChart3, Award } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useProgress } from '@/contexts/ProgressContext'
import { useSearchParams } from 'react-router-dom'
import GoalCard from '@/components/progress/GoalCard'
import GoalForm from '@/components/progress/GoalForm'
import ProgressAnalytics from '@/components/progress/ProgressAnalytics'
import Achievements from '@/components/progress/Achievements'

type TabType = 'analytics' | 'goals' | 'achievements'

const TrackProgress = () => {
  const { goals, loading } = useProgress()
  const [searchParams] = useSearchParams()
  const initialTab = (searchParams.get('view') as TabType) || 'analytics'
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [showGoalForm, setShowGoalForm] = useState(false)

  const tabs = [
    { id: 'analytics' as TabType, label: 'Spending Analytics', icon: BarChart3 },
    { id: 'goals' as TabType, label: 'Goals', icon: Target },
    { id: 'achievements' as TabType, label: 'Achievements', icon: Award }
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-16 bg-muted animate-pulse rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
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
              <TrendingUp className="h-8 w-8 mr-3 text-primary" />
              Track Progress
            </h1>
            <p className="text-muted-foreground mt-2">
              Understand your spending, then set goals and earn achievements
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {activeTab !== 'goals' && (
              <Button
                variant="outline"
                onClick={() => setActiveTab('goals')}
              >
                <Target className="h-4 w-4 mr-2" />
                Manage Goals
              </Button>
            )}

            {activeTab === 'goals' && (
              <Button onClick={() => setShowGoalForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        layoutId="activeTab"
                        initial={false}
                      />
                    )}
                  </Button>
                )
              })}
            </div>
          </CardHeader>
        </Card>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Goal Form */}
              <AnimatePresence>
                {showGoalForm && (
                  <GoalForm
                    onSuccess={() => setShowGoalForm(false)}
                    onCancel={() => setShowGoalForm(false)}
                  />
                )}
              </AnimatePresence>

              {/* Goals Grid */}
              {goals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {goals.map((goal) => (
                      <GoalCard key={goal.id} goal={goal} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-16">
                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by creating your first financial goal to track your progress
                    </p>
                    <Button onClick={() => setShowGoalForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Goal
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Goals Summary */}
              {goals.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Goals Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{goals.length}</p>
                          <p className="text-sm text-muted-foreground">Total Goals</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {goals.filter(g => g.status === 'completed').length}
                          </p>
                          <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {goals.filter(g => g.status === 'active').length}
                          </p>
                          <p className="text-sm text-muted-foreground">In Progress</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            ${goals.reduce((sum, goal) => sum + goal.currentAmount, 0).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">Total Saved</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProgressAnalytics />
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Achievements />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default TrackProgress
