import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, SortDesc, Star, Clock, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLearnFinance } from '@/contexts/LearnFinanceContext'
import PostCard from './PostCard'
import { type PostFilters, type PostSort, type FinanceCategory, FINANCE_CATEGORIES } from '@/types/learnFinance'

const PostFeed = () => {
  const { getFilteredPosts, getFeaturedPosts, loading } = useLearnFinance()
  const [filters, setFilters] = useState<PostFilters>({
    status: 'approved' // Only show approved posts by default
  })
  const [sort, setSort] = useState<PostSort>({
    field: 'createdAt',
    direction: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)

  const filteredPosts = useMemo(() => {
    return getFilteredPosts(filters, sort)
  }, [getFilteredPosts, filters, sort])

  const featuredPosts = useMemo(() => {
    return getFeaturedPosts()
  }, [getFeaturedPosts])

  const handleFilterChange = (key: keyof PostFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSortChange = (field: PostSort['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const clearFilters = () => {
    setFilters({ status: 'approved' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts, tips, and advice..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <Button
                  variant={sort.field === 'createdAt' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSortChange('createdAt')}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Latest
                </Button>
                <Button
                  variant={sort.field === 'likes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSortChange('likes')}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Popular
                </Button>
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-border"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filters.category || ''}
                      onChange={(e) => handleFilterChange('category', e.target.value as FinanceCategory || undefined)}
                    >
                      <option value="">All Categories</option>
                      {Object.entries(FINANCE_CATEGORIES).map(([key, category]) => (
                        <option key={key} value={key}>
                          {category.icon} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Featured Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filters.featured === undefined ? '' : filters.featured ? 'featured' : 'regular'}
                      onChange={(e) => handleFilterChange('featured', 
                        e.target.value === '' ? undefined : e.target.value === 'featured'
                      )}
                    >
                      <option value="">All Posts</option>
                      <option value="featured">Featured Only</option>
                      <option value="regular">Regular Posts</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && !filters.search && !filters.category && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Featured Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredPosts.slice(0, 3).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filters.search || filters.category ? 'Search Results' : 'Latest Posts'} 
            <span className="text-muted-foreground ml-2">({filteredPosts.length})</span>
          </h2>
          
          <div className="flex items-center gap-2">
            <SortDesc className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Sorted by {sort.field === 'createdAt' ? 'Date' : 'Popularity'} 
              ({sort.direction === 'desc' ? 'Newest first' : 'Oldest first'})
            </span>
          </div>
        </div>
      </motion.div>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <CardContent className="text-center py-16">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.category 
                  ? "Try adjusting your search or filters"
                  : "No posts have been published yet"
                }
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Load More (Placeholder for future pagination) */}
      {filteredPosts.length > 12 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="text-center"
        >
          <Button variant="outline" disabled>
            Load More Posts (Coming Soon)
          </Button>
        </motion.div>
      )}
    </div>
  )
}

export default PostFeed
