export type AnnouncementAudience = 'all' | 'students' | 'tutors' | 'admins'
export type AnnouncementStatus = 'draft' | 'published' | 'archived'

export interface Announcement {
  id: string
  title: string
  content: string
  audience: AnnouncementAudience
  status: AnnouncementStatus
  publishedAt: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}
