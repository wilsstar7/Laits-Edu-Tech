export type ReviewStatus = 'published' | 'hidden' | 'flagged'

export interface Review {
  id: string
  bookingId: string
  studentId: string
  studentName: string
  studentAvatarUrl?: string | null
  tutorId: string
  tutorName?: string
  subjectName?: string
  rating: number
  reviewText: string | null
  status: ReviewStatus
  createdAt: string
  updatedAt: string
}

export interface CreateReviewInput {
  bookingId: string
  rating: number
  reviewText?: string
}

export interface TutorRatingSummary {
  tutorId: string
  averageRating: number
  totalReviews: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}
