import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Eye, User, Calendar, Hash, Star, Clock } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useLearnFinance } from '@/contexts/LearnFinanceContext'
import { useAuth } from '@/contexts/AuthContext'
import { type FinancePost, FINANCE_CATEGORIES } from '@/types/learnFinance'
import { formatDate } from '@/lib/utils'

interface PostCardProps {
  post: FinancePost
  onClick?: () => void
  showActions?: boolean
}

const PostCard = ({ post, onClick, showActions = true }: PostCardProps) => {
  const { likePost, incrementView } = useLearnFinance()
  const { currentUser } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likingPost, setLikingPost] = useState(false)

  const category = FINANCE_CATEGORIES[post.category]
  const isAuthor = currentUser?.uid === post.authorId

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentUser || liked || likingPost) return

    try {
      setLikingPost(true)
      await likePost(post.id)
      setLiked(true)
    } catch (error) {
      console.error('Failed to like post:', error)
    } finally {
      setLikingPost(false)
    }
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick()
      incrementView(post.id)
    }
  }

  const getStatusColor = () => {
    switch (post.status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card 
        className={`h-full cursor-pointer hover:shadow-lg transition-shadow ${
          post.featured ? 'ring-2 ring-yellow-400 bg-yellow-50/50' : ''
        }`}
        onClick={handleCardClick}
      >
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Category & Featured Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${category.color}20`,
                    color: category.color
                  }}
                >
                  <span className="text-sm">{category.icon}</span>
                  {category.label}
                </span>
                
                {post.featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    <Star className="h-3 w-3" />
                    Featured
                  </span>
                )}
                
                {/* Status Badge (for non-approved posts) */}
                {post.status !== 'approved' && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                {post.title}
              </h3>

              {/* Author & Date */}
              <div className="flex items-center text-sm text-muted-foreground gap-4">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{post.authorName}</span>
                  {isAuthor && (
                    <span className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="pt-0">
          {/* Post Content Preview */}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {post.content}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                >
                  <Hash className="h-2 w-2" />
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Actions & Stats */}
          {showActions && (
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views}</span>
                </div>
                
                {post.status === 'pending' && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Pending Review</span>
                  </div>
                )}
                
                {post.approvedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Published {formatDate(post.approvedAt)}</span>
                  </div>
                )}
              </div>

              {/* Like Button */}
              {post.status === 'approved' && currentUser && !isAuthor && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    disabled={liked || likingPost}
                    className={`flex items-center gap-1 ${
                      liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                    <span>{post.likes + (liked ? 1 : 0)}</span>
                  </Button>
                </motion.div>
              )}

              {/* Show likes count for approved posts */}
              {post.status === 'approved' && (isAuthor || !currentUser) && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes}</span>
                </div>
              )}
            </div>
          )}

          {/* Rejection Reason */}
          {post.status === 'rejected' && post.rejectionReason && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Rejection Reason:
              </h4>
              <p className="text-sm text-red-700">{post.rejectionReason}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default PostCard
