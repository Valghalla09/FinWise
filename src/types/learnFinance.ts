export interface FinancePost {
  id: string
  title: string
  content: string
  category: FinanceCategory
  tags: string[]
  authorId: string
  authorName: string
  status: PostStatus
  createdAt: Date
  approvedAt?: Date
  approvedBy?: string
  likes: number
  views: number
  featured: boolean
  rejectionReason?: string
}

export type PostStatus = 'pending' | 'approved' | 'rejected'

export type FinanceCategory = 
  | 'budgeting'
  | 'saving'
  | 'investing'
  | 'debt'
  | 'career'
  | 'student'
  | 'emergency'
  | 'general'

export interface PostFormData {
  title: string
  content: string
  category: FinanceCategory
  tags: string[]
}

export interface UserContribution {
  userId: string
  totalSubmissions: number
  approvedPosts: number
  totalLikes: number
  badges: string[]
  joinedAt: Date
}

export interface AdminStats {
  totalPosts: number
  pendingPosts: number
  approvedPosts: number
  rejectedPosts: number
  totalUsers: number
  postsToday: number
  likesToday: number
}

export interface PostFilters {
  category?: FinanceCategory
  tags?: string[]
  search?: string
  status?: PostStatus
  authorId?: string
  featured?: boolean
}

export interface PostSort {
  field: 'createdAt' | 'approvedAt' | 'likes' | 'views'
  direction: 'asc' | 'desc'
}

export const FINANCE_CATEGORIES: Record<FinanceCategory, { label: string; icon: string; color: string }> = {
  budgeting: { label: 'Budgeting Tips', icon: '📊', color: '#3b82f6' },
  saving: { label: 'Saving Strategies', icon: '🏦', color: '#10b981' },
  investing: { label: 'Investment Basics', icon: '📈', color: '#8b5cf6' },
  debt: { label: 'Debt Management', icon: '💳', color: '#ef4444' },
  career: { label: 'Career & Income', icon: '💼', color: '#f59e0b' },
  student: { label: 'Student Finance', icon: '🎓', color: '#06b6d4' },
  emergency: { label: 'Emergency Planning', icon: '🛡️', color: '#84cc16' },
  general: { label: 'General Tips', icon: '💡', color: '#6b7280' }
}
