import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Users, Shield, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useLearnFinance } from '@/contexts/LearnFinanceContext'
import { useAuth } from '@/contexts/AuthContext'
import PostSubmissionForm from '@/components/learnFinance/PostSubmissionForm'
import AdminDashboard from '@/components/learnFinance/AdminDashboard'
import PostFeed from '@/components/learnFinance/PostFeed'

type TabType = 'feed' | 'submit' | 'admin' | 'my-posts'

const LearnFinance = () => {
  const { posts, userContribution, loading, isAdmin, getUserPosts } = useLearnFinance()
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('feed')
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)

  const approvedPosts = posts.filter(p => p.status === 'approved')
  const userPosts = currentUser ? getUserPosts(currentUser.uid) : []

  const tabs = [
    { id: 'feed' as TabType, label: 'Community Feed', icon: BookOpen, count: approvedPosts.length },
    ...(currentUser ? [{ id: 'submit' as TabType, label: 'Share Tip', icon: Plus, count: null }] : []),
    ...(currentUser && userPosts.length > 0 ? [{ id: 'my-posts' as TabType, label: 'My Posts', icon: Users, count: userPosts.length }] : []),
    ...(isAdmin ? [{ id: 'admin' as TabType, label: 'Admin Panel', icon: Shield, count: posts.filter(p => p.status === 'pending').length }] : [])
  ]

  const handleSubmissionSuccess = () => {
    setShowSubmissionForm(false)
    if (activeTab === 'submit') {
      setActiveTab('my-posts')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-16 bg-muted animate-pulse rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <BookOpen className="h-8 w-8 mr-3 text-primary" />
              Learn Finance
            </h1>
            <p className="text-muted-foreground mt-2">
              Share financial tips and learn from the community
            </p>
          </div>
          
          {currentUser && activeTab === 'feed' && (
            <Button onClick={() => setShowSubmissionForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Share a Tip
            </Button>
          )}
        </div>

        {/* Stats Overview */}
        {approvedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Community Posts</p>
                      <p className="text-2xl font-bold">{approvedPosts.length}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Likes</p>
                      <p className="text-2xl font-bold">
                        {approvedPosts.reduce((sum, post) => sum + post.likes, 0)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Contributors</p>
                      <p className="text-2xl font-bold">
                        {new Set(approvedPosts.map(p => p.authorId)).size}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isAdminTab = tab.id === 'admin'
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : isAdminTab ? 'secondary' : 'ghost'}
                    size={isAdminTab ? 'lg' : 'default'}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setShowSubmissionForm(false)
                    }}
                    className={`relative whitespace-nowrap ${isAdminTab ? 'ml-2 font-semibold border border-primary text-primary' : ''}`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                    {tab.count !== null && tab.count > 0 && (
                      <span className="ml-2 bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        layoutId="activeLearnTab"
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
          {/* Submission Form */}
          {showSubmissionForm && (
            <PostSubmissionForm
              onSuccess={handleSubmissionSuccess}
              onCancel={() => setShowSubmissionForm(false)}
            />
          )}

          {/* Community Feed */}
          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PostFeed />
            </motion.div>
          )}

          {/* Submit Post */}
          {activeTab === 'submit' && (
            <motion.div
              key="submit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PostSubmissionForm onSuccess={handleSubmissionSuccess} />
            </motion.div>
          )}

          {/* My Posts */}
          {activeTab === 'my-posts' && (
            <motion.div
              key="my-posts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>My Posts ({userPosts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {userPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userPosts.map((post) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Using dynamic import to avoid circular dependency */}
                          <div className="h-full">
                            {/* Simplified post card for user posts */}
                            <Card className="h-full">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{post.title}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      post.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {post.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {post.content}
                                  </p>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{post.likes} likes</span>
                                    <span>{post.views} views</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No posts yet</p>
                      <Button 
                        className="mt-4"
                        onClick={() => setActiveTab('submit')}
                      >
                        Share Your First Tip
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Admin Panel */}
          {activeTab === 'admin' && isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State for New Users */}
        {!loading && approvedPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card>
              <CardContent className="text-center py-16">
                <BookOpen className="h-16 w-16 mx-auto mb-6 text-primary opacity-50" />
                <h3 className="text-2xl font-semibold mb-4">Welcome to Learn Finance!</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  This is where the community shares financial tips, strategies, and experiences. 
                  Be the first to contribute and help others on their financial journey!
                </p>
                {currentUser && (
                  <Button onClick={() => setShowSubmissionForm(true)} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Share the First Tip
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* User Contribution Stats */}
        {currentUser && userContribution && userPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Contribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{userContribution.totalSubmissions}</p>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{userContribution.approvedPosts}</p>
                    <p className="text-sm text-muted-foreground">Approved Posts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{userContribution.totalLikes}</p>
                    <p className="text-sm text-muted-foreground">Total Likes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {((userContribution.approvedPosts / Math.max(userContribution.totalSubmissions, 1)) * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Approval Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default LearnFinance
