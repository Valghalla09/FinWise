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
  Timestamp,
  increment,
  getDoc
} from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { useAuth } from './AuthContext'
import { type FinancePost, type PostFormData, type UserContribution, type AdminStats, type PostFilters, type PostSort } from '@/types/learnFinance'
import { DEFAULT_LEARNING_POSTS } from '@/data/defaultLearningContent'

// Replace with your actual admin UID
const ADMIN_UID = 's1mVXxl7rUPCZPD39zbIYyX37M52' // You'll need to replace this with your actual Firebase UID

interface LearnFinanceContextType {
  // State
  posts: FinancePost[]
  userContribution: UserContribution | null
  adminStats: AdminStats | null
  loading: boolean
  isAdmin: boolean
  
  // Post Management
  submitPost: (postData: PostFormData) => Promise<void>
  updatePost: (postId: string, updates: Partial<FinancePost>) => Promise<void>
  deletePost: (postId: string) => Promise<void>
  
  // Admin Functions
  approvePost: (postId: string) => Promise<void>
  rejectPost: (postId: string, reason: string) => Promise<void>
  toggleFeatured: (postId: string) => Promise<void>
  
  // User Interactions
  likePost: (postId: string) => Promise<void>
  incrementView: (postId: string) => Promise<void>
  
  // Filtering & Search
  getFilteredPosts: (filters: PostFilters, sort: PostSort) => FinancePost[]
  getPendingPosts: () => FinancePost[]
  getFeaturedPosts: () => FinancePost[]
  getUserPosts: (userId: string) => FinancePost[]
}

const LearnFinanceContext = createContext<LearnFinanceContextType | undefined>(undefined)

export function useLearnFinance() {
  const context = useContext(LearnFinanceContext)
  if (context === undefined) {
    throw new Error('useLearnFinance must be used within a LearnFinanceProvider')
  }
  return context
}

interface LearnFinanceProviderProps {
  children: ReactNode
}

export function LearnFinanceProvider({ children }: LearnFinanceProviderProps) {
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState<FinancePost[]>([])
  const [userContribution, setUserContribution] = useState<UserContribution | null>(null)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = currentUser?.uid === ADMIN_UID

  // Initialize default posts if none exist
  const initializeDefaultPosts = async () => {
    try {
      // Check if any posts exist
      const postsQuery = query(collection(db, 'learnFinancePosts'))
      const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
        if (snapshot.empty) {
          // No posts exist, add default ones
          console.log('No posts found, initializing default content...')
          for (const defaultPost of DEFAULT_LEARNING_POSTS) {
            await addDoc(collection(db, 'learnFinancePosts'), {
              ...defaultPost,
              createdAt: Timestamp.now(),
              approvedAt: Timestamp.now(),
              likes: Math.floor(Math.random() * 50) + 10, // Random likes 10-60
              views: Math.floor(Math.random() * 200) + 50 // Random views 50-250
            })
          }
        }
        unsubscribe() // Unsubscribe after first check
      })
    } catch (error) {
      console.error('Failed to initialize default posts:', error)
    }
  }

  // Load posts
  useEffect(() => {
    const postsQuery = query(
      collection(db, 'learnFinancePosts'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsList: FinancePost[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        approvedAt: doc.data().approvedAt?.toDate()
      } as FinancePost))
      
      setPosts(postsList)
      setLoading(false)
    })

    // Initialize default posts on first load
    initializeDefaultPosts()

    return unsubscribe
  }, [])

  // Load user contribution data
  useEffect(() => {
    if (!currentUser) {
      setUserContribution(null)
      return
    }

    const loadUserContribution = async () => {
      try {
        const userContribDoc = await getDoc(doc(db, 'userContributions', currentUser.uid))
        if (userContribDoc.exists()) {
          const data = userContribDoc.data()
          setUserContribution({
            userId: currentUser.uid,
            ...data,
            joinedAt: data.joinedAt?.toDate() || new Date()
          } as UserContribution)
        } else {
          // Initialize user contribution document
          const initialContrib: Omit<UserContribution, 'userId'> = {
            totalSubmissions: 0,
            approvedPosts: 0,
            totalLikes: 0,
            badges: [],
            joinedAt: new Date()
          }
          
          await addDoc(collection(db, 'userContributions'), {
            ...initialContrib,
            userId: currentUser.uid,
            joinedAt: Timestamp.now()
          })
          
          setUserContribution({
            userId: currentUser.uid,
            ...initialContrib
          })
        }
      } catch (error) {
        console.error('Failed to load user contribution:', error)
      }
    }

    loadUserContribution()
  }, [currentUser])

  // Calculate admin stats
  useEffect(() => {
    if (isAdmin && posts.length >= 0) {
      const totalPosts = posts.length
      const pendingPosts = posts.filter(p => p.status === 'pending').length
      const approvedPosts = posts.filter(p => p.status === 'approved').length
      const rejectedPosts = posts.filter(p => p.status === 'rejected').length
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const postsToday = posts.filter(p => p.createdAt >= today).length
      const likesToday = posts
        .filter(p => p.createdAt >= today)
        .reduce((sum, p) => sum + p.likes, 0)

      // Get unique user count (simplified)
      const totalUsers = new Set(posts.map(p => p.authorId)).size

      setAdminStats({
        totalPosts,
        pendingPosts,
        approvedPosts,
        rejectedPosts,
        totalUsers,
        postsToday,
        likesToday
      })
    }
  }, [isAdmin, posts])

  const submitPost = async (postData: PostFormData) => {
    if (!currentUser) throw new Error('User not authenticated')

    const post = {
      ...postData,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || currentUser.email || 'Anonymous',
      status: 'pending' as const,
      createdAt: Timestamp.now(),
      likes: 0,
      views: 0,
      featured: false
    }

    await addDoc(collection(db, 'learnFinancePosts'), post)

    // Update user contribution
    if (userContribution) {
      await updateDoc(doc(db, 'userContributions', currentUser.uid), {
        totalSubmissions: increment(1)
      })
    }
  }

  const updatePost = async (postId: string, updates: Partial<FinancePost>) => {
    const updateData = { ...updates }
    if (updates.approvedAt) {
      updateData.approvedAt = Timestamp.fromDate(updates.approvedAt) as any
    }

    await updateDoc(doc(db, 'learnFinancePosts', postId), updateData)
  }

  const deletePost = async (postId: string) => {
    if (!isAdmin) throw new Error('Not authorized')
    await deleteDoc(doc(db, 'learnFinancePosts', postId))
  }

  const approvePost = async (postId: string) => {
    if (!isAdmin) throw new Error('Not authorized')
    
    const post = posts.find(p => p.id === postId)
    if (!post) return

    await updatePost(postId, {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: currentUser?.uid
    })

    // Update user contribution
    try {
      await updateDoc(doc(db, 'userContributions', post.authorId), {
        approvedPosts: increment(1)
      })
    } catch (error) {
      console.error('Failed to update user contribution:', error)
    }
  }

  const rejectPost = async (postId: string, reason: string) => {
    if (!isAdmin) throw new Error('Not authorized')

    await updatePost(postId, {
      status: 'rejected',
      rejectionReason: reason
    })
  }

  const toggleFeatured = async (postId: string) => {
    if (!isAdmin) throw new Error('Not authorized')
    
    const post = posts.find(p => p.id === postId)
    if (!post) return

    await updatePost(postId, {
      featured: !post.featured
    })
  }

  const likePost = async (postId: string) => {
    if (!currentUser) return

    await updateDoc(doc(db, 'learnFinancePosts', postId), {
      likes: increment(1)
    })

    // Update author's total likes
    const post = posts.find(p => p.id === postId)
    if (post && post.authorId !== currentUser.uid) {
      try {
        await updateDoc(doc(db, 'userContributions', post.authorId), {
          totalLikes: increment(1)
        })
      } catch (error) {
        console.error('Failed to update author likes:', error)
      }
    }
  }

  const incrementView = async (postId: string) => {
    await updateDoc(doc(db, 'learnFinancePosts', postId), {
      views: increment(1)
    })
  }

  const getFilteredPosts = (filters: PostFilters, sort: PostSort) => {
    let filteredPosts = [...posts]

    // Apply filters
    if (filters.category) {
      filteredPosts = filteredPosts.filter(p => p.category === filters.category)
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredPosts = filteredPosts.filter(p => 
        p.tags.some(tag => filters.tags?.includes(tag))
      )
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredPosts = filteredPosts.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.content.toLowerCase().includes(searchLower)
      )
    }

    if (filters.status) {
      filteredPosts = filteredPosts.filter(p => p.status === filters.status)
    }

    if (filters.authorId) {
      filteredPosts = filteredPosts.filter(p => p.authorId === filters.authorId)
    }

    if (filters.featured !== undefined) {
      filteredPosts = filteredPosts.filter(p => p.featured === filters.featured)
    }

    // Apply sorting
    filteredPosts.sort((a, b) => {
      const aValue = a[sort.field]
      const bValue = b[sort.field]
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sort.direction === 'desc' 
          ? bValue.getTime() - aValue.getTime()
          : aValue.getTime() - bValue.getTime()
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sort.direction === 'desc' ? bValue - aValue : aValue - bValue
      }
      
      return 0
    })

    return filteredPosts
  }

  const getPendingPosts = () => {
    return posts.filter(p => p.status === 'pending')
  }

  const getFeaturedPosts = () => {
    return posts.filter(p => p.featured && p.status === 'approved')
  }

  const getUserPosts = (userId: string) => {
    return posts.filter(p => p.authorId === userId)
  }

  const value = {
    posts,
    userContribution,
    adminStats,
    loading,
    isAdmin,
    submitPost,
    updatePost,
    deletePost,
    approvePost,
    rejectPost,
    toggleFeatured,
    likePost,
    incrementView,
    getFilteredPosts,
    getPendingPosts,
    getFeaturedPosts,
    getUserPosts
  }

  return (
    <LearnFinanceContext.Provider value={value}>
      {children}
    </LearnFinanceContext.Provider>
  )
}
