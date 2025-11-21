import { motion } from 'framer-motion'
import { Award, Lock, Trophy, Target } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useProgress } from '@/contexts/ProgressContext'

const Achievements = () => {
  const { achievements } = useProgress()

  const unlockedAchievements = achievements.filter(ach => ach.isUnlocked)
  const lockedAchievements = achievements.filter(ach => !ach.isUnlocked)

  if (achievements.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Loading achievements...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Award className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Achievements</h2>
          <p className="text-muted-foreground">
            You've unlocked {unlockedAchievements.length} out of {achievements.length} achievements
          </p>
          
          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto mt-4">
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {((unlockedAchievements.length / achievements.length) * 100).toFixed(1)}% Complete
            </p>
          </div>
        </motion.div>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Unlocked Achievements ({unlockedAchievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg hover:shadow-md transition-shadow">
                      {/* Achievement Icon */}
                      <div className="flex items-center mb-3">
                        <div className="text-2xl mr-3">{achievement.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-800">{achievement.title}</h3>
                          <p className="text-xs text-green-600 uppercase tracking-wide">
                            {achievement.type.replace('_', ' ')}
                          </p>
                        </div>
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      </div>

                      {/* Description */}
                      <p className="text-sm text-green-700 mb-3">{achievement.description}</p>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-600">Progress</span>
                          <span className="font-medium text-green-800">
                            {achievement.criteria.currentValue} / {achievement.criteria.targetValue}
                          </span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>

                      {/* Unlock Date */}
                      {achievement.unlockedAt && (
                        <p className="text-xs text-green-600 mt-3">
                          Unlocked {achievement.unlockedAt.toLocaleDateString()}
                        </p>
                      )}

                      {/* Sparkle Effect */}
                      <motion.div
                        className="absolute -top-1 -right-1"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        <div className="text-yellow-400 text-sm">✨</div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2 text-gray-500" />
                Locked Achievements ({lockedAchievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg hover:shadow-md transition-shadow opacity-75">
                      {/* Achievement Icon */}
                      <div className="flex items-center mb-3">
                        <div className="text-2xl mr-3 grayscale">{achievement.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-600">{achievement.title}</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {achievement.type.replace('_', ' ')}
                          </p>
                        </div>
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium text-gray-600">
                            {achievement.criteria.currentValue} / {achievement.criteria.targetValue}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gray-400 h-2 rounded-full"
                            style={{ 
                              width: `${Math.min((achievement.criteria.currentValue / achievement.criteria.targetValue) * 100, 100)}%` 
                            }}
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${Math.min((achievement.criteria.currentValue / achievement.criteria.targetValue) * 100, 100)}%` 
                            }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {Math.min((achievement.criteria.currentValue / achievement.criteria.targetValue) * 100, 100).toFixed(1)}% complete
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {achievements.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-2">No achievements available yet</p>
            <p className="text-sm text-muted-foreground">
              Start using BudgetSmart to unlock achievements!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Achievements
