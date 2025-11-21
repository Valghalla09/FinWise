import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, X, Plus, Hash } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLearnFinance } from '@/contexts/LearnFinanceContext'
import { type PostFormData, type FinanceCategory, FINANCE_CATEGORIES } from '@/types/learnFinance'

interface PostSubmissionFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const PostSubmissionForm = ({ onSuccess, onCancel }: PostSubmissionFormProps) => {
  const { submitPost } = useLearnFinance()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    category: 'general',
    tags: []
  })
  const [newTag, setNewTag] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      return
    }

    try {
      setLoading(true)
      await submitPost(formData)
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'general',
        tags: []
      })

      onSuccess?.()
    } catch (error) {
      console.error('Failed to submit post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof PostFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              Share a Financial Tip
            </CardTitle>
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="post-title" className="text-sm font-medium">
                Title *
              </label>
              <Input
                id="post-title"
                placeholder="e.g., How I saved $5000 in 6 months"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={100}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="post-category" className="text-sm font-medium">
                Category *
              </label>
              <select
                id="post-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as FinanceCategory)}
                required
              >
                {Object.entries(FINANCE_CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label htmlFor="post-content" className="text-sm font-medium">
                Content *
              </label>
              <textarea
                id="post-content"
                placeholder="Share your financial tip, strategy, or experience in detail. Be specific and helpful to others in the community..."
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                maxLength={2000}
                rows={8}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.content.length}/2000 characters
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Tags (Optional)
              </label>
              
              {/* Existing Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      <Hash className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Add Tag Input */}
              {formData.tags.length < 5 && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag (e.g., emergency-fund, budgeting)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    maxLength={20}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Add up to 5 tags to help others find your post
              </p>
            </div>

            {/* Post Preview */}
            {formData.title && formData.content && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-accent rounded-lg border"
              >
                <h4 className="font-medium mb-2 flex items-center">
                  <div className="text-sm mr-2">
                    {FINANCE_CATEGORIES[formData.category].icon}
                  </div>
                  Post Preview
                </h4>
                <div className="space-y-2">
                  <h3 className="font-semibold">{formData.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.content.substring(0, 150)}
                    {formData.content.length > 150 ? '...' : ''}
                  </p>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                        >
                          <Hash className="h-2 w-2" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Guidelines */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">
                Submission Guidelines
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Share practical, actionable financial advice</li>
                <li>• Be respectful and constructive</li>
                <li>• Avoid promotional content or spam</li>
                <li>• Posts will be reviewed before publication</li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  disabled={loading || !formData.title.trim() || !formData.content.trim()}
                  className="min-w-32"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Submitting...' : 'Submit for Review'}
                </Button>
              </motion.div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default PostSubmissionForm
