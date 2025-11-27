import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Clock, CheckCircle, XCircle, Users, TrendingUp, Star, Eye } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useLearnFinance } from '@/contexts/LearnFinanceContext'
import PostCard from './PostCard'
import { type FinancePost } from '@/types/learnFinance'

const AdminDashboard = () => {
  const { 
    adminStats, 
    getPendingPosts, 
    approvePost, 
    rejectPost, 
    toggleFeatured,
    loading 
  } = useLearnFinance()
  
  const [selectedPost, setSelectedPost] = useState<FinancePost | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const pendingPosts = getPendingPosts()

  const handleApprove = async (postId: string) => {
    try {
      setActionLoading(postId)
      await approvePost(postId)
    } catch (error) {
      console.error('Failed to approve post:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (postId: string) => {
    if (!rejectReason.trim()) return
    
    try {
      setActionLoading(postId)
      await rejectPost(postId, rejectReason)
      setRejectReason('')
      setSelectedPost(null)
    } catch (error) {
      console.error('Failed to reject post:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleFeatured = async (postId: string) => {
    try {
      setActionLoading(postId)
      await toggleFeatured(postId)
    } catch (error) {
      console.error('Failed to toggle featured:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Manage community submissions and content moderation
        </p>
      </motion.div>

      {/* Stats Cards */}
      {adminStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">{adminStats.pendingPosts}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved Posts</p>
                    <p className="text-2xl font-bold text-green-600">{adminStats.approvedPosts}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{adminStats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Activity</p>
                    <p className="text-2xl font-bold text-purple-600">{adminStats.postsToday}</p>
                    <p className="text-xs text-muted-foreground">{adminStats.likesToday} likes</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Pending Posts Queue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                Posts Pending Review ({pendingPosts.length})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPosts.length > 0 ? (
              <div className="space-y-6">
                {pendingPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Post Preview */}
                      <div className="lg:col-span-2">
                        <PostCard 
                          post={post} 
                          showActions={false}
                        />
                      </div>

                      {/* Admin Actions */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Admin Actions</h4>
                        
                        <div className="space-y-2">
                          <Button
                            onClick={() => handleApprove(post.id)}
                            disabled={actionLoading === post.id}
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>

                          <Button
                            onClick={() => setSelectedPost(post)}
                            disabled={actionLoading === post.id}
                            variant="destructive"
                            className="w-full"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>

                          <Button
                            onClick={() => handleToggleFeatured(post.id)}
                            disabled={actionLoading === post.id}
                            variant="outline"
                            className="w-full"
                            size="sm"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            {post.featured ? 'Remove Feature' : 'Make Featured'}
                          </Button>
                        </div>

                        {/* Post Stats */}
                        <div className="pt-3 border-t border-border">
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Eye className="h-3 w-3" />
                              <span>{post.views} views</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              <span>By {post.authorName}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No posts pending review</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-background rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Reject Post</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please provide a reason for rejecting "{selectedPost.title}"
              </p>
              <textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 border border-border rounded-lg resize-none bg-background text-foreground placeholder:text-muted-foreground"
                rows={4}
              />
              <div className="flex items-center justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPost(null)
                    setRejectReason('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedPost.id)}
                  disabled={!rejectReason.trim() || actionLoading === selectedPost.id}
                >
                  {actionLoading === selectedPost.id ? 'Rejecting...' : 'Reject Post'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminDashboard
