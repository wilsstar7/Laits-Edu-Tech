import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { assessmentSessionService } from '@/services/assessmentSessionService'
import { assessmentService } from '@/services/assessmentService'
import { assessmentAnswerService } from '@/services/assessmentAnswerService'
import { assessmentScoringService } from '@/services/assessmentScoringService'
import type { AssessmentQuestion } from '@/types/assessment'
import { AssessmentProgress } from '@/components/assessment/AssessmentProgress'
import { QuestionCard } from '@/components/assessment/QuestionCard'
import { AssessmentNavigation } from '@/components/assessment/AssessmentNavigation'

export function AssessmentQuestionPage() {
  const { id: sessionId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)

  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Initial Load & Session Validation
  useEffect(() => {
    async function initSession() {
      if (!sessionId || !user) return
      setLoading(true)
      setErrorMsg(null)

      try {
        const session = await assessmentSessionService.getSessionById(sessionId)

        if (!session) {
          setErrorMsg('Sesi asesmen tidak ditemukan.')
          setLoading(false)
          return
        }

        // Security check: Session must belong to user
        if (session.user_id !== user.id) {
          setErrorMsg('Anda tidak memiliki akses ke sesi asesmen ini.')
          setLoading(false)
          return
        }

        // If already completed, redirect to personality result
        if (session.status === 'scored') {
          navigate('/student/personality', { replace: true })
          return
        }

        if (session.status !== 'in_progress') {
          setErrorMsg(`Sesi asesmen telah berstatus ${session.status}.`)
          setLoading(false)
          return
        }

        // Load questions from database
        const qList = await assessmentService.getQuestions(session.assessment_id)
        if (qList.length === 0) {
          setErrorMsg('Belum ada butir pertanyaan yang aktif untuk asesmen ini.')
          setLoading(false)
          return
        }
        setQuestions(qList)

        // Load already saved answers
        const savedAnswers = await assessmentAnswerService.getAnswersForSession(sessionId)
        setAnswers(savedAnswers)

        // Resume to the saved index (clamped within range)
        const validIndex = Math.min(
          Math.max(session.current_question_index ?? 0, 0),
          qList.length - 1
        )
        setCurrentIndex(validIndex)
        setLastSavedAt(session.last_saved_at)
      } catch (err) {
        console.error('Error initializing assessment session:', err)
        setErrorMsg('Gagal memuat sesi asesmen. Periksa koneksi internet Anda.')
      } finally {
        setLoading(false)
      }
    }

    initSession()
  }, [sessionId, user, navigate])

  // 2. Select Option & Auto-Save
  const handleSelectOption = useCallback(
    async (optionId: string) => {
      if (!sessionId || isSubmitting) return

      const currentQ = questions[currentIndex]
      if (!currentQ) return

      // Optimistic update
      setAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }))
      setValidationError(null)
      setIsSaving(true)

      try {
        await assessmentAnswerService.saveAnswer(sessionId, currentQ.id, optionId)
        setLastSavedAt(new Date().toISOString())
      } catch (err) {
        console.error('Failed to auto-save answer:', err)
        setValidationError('Gagal menyimpan jawaban. Periksa koneksi Anda dan coba lagi.')
      } finally {
        setIsSaving(false)
      }
    },
    [sessionId, questions, currentIndex, isSubmitting]
  )

  // 3. Navigation Controls
  const handleNext = () => {
    const currentQ = questions[currentIndex]
    if (!currentQ) return

    // Validation: Required check
    if (currentQ.required && !answers[currentQ.id]) {
      setValidationError('Silakan pilih salah satu jawaban terlebih dahulu.')
      return
    }

    setValidationError(null)
    const nextIndex = Math.min(currentIndex + 1, questions.length - 1)
    setCurrentIndex(nextIndex)

    // Update progress index in database asynchronously
    if (sessionId) {
      assessmentSessionService.updateProgress(sessionId, nextIndex)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    setValidationError(null)
    const prevIndex = Math.max(currentIndex - 1, 0)
    setCurrentIndex(prevIndex)

    if (sessionId) {
      assessmentSessionService.updateProgress(sessionId, prevIndex)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 4. Submit and Score Assessment
  const handleSubmit = async () => {
    if (!sessionId || isSubmitting) return

    const currentQ = questions[currentIndex]
    if (currentQ?.required && !answers[currentQ.id]) {
      setValidationError('Silakan pilih salah satu jawaban terlebih dahulu.')
      return
    }

    // Verify all required questions have answers
    const unanswered = questions.filter((q) => q.required && !answers[q.id])
    if (unanswered.length > 0) {
      setValidationError(
        `Terdapat ${unanswered.length} pertanyaan yang belum Anda jawab. Silakan lengkapi seluruh pertanyaan.`
      )
      // Navigate to first unanswered question
      const firstUnansweredIndex = questions.findIndex(
        (q) => q.required && !answers[q.id]
      )
      if (firstUnansweredIndex !== -1) {
        setCurrentIndex(firstUnansweredIndex)
      }
      return
    }

    setIsSubmitting(true)
    setValidationError(null)

    try {
      // Call trusted PostgreSQL RPC scoring engine
      const resultId = await assessmentScoringService.submitAndScore(sessionId)

      // Redirect to personality result page
      navigate(`/student/personality/${resultId}`, { replace: true })
    } catch (err: unknown) {
      console.error('Error submitting assessment:', err)
      const message =
        err instanceof Error ? err.message : 'Gagal memproses penilaian asesmen.'
      setValidationError(message)
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
        <p className="text-xs text-[#676A78]">Menyiapkan butir pertanyaan...</p>
      </div>
    )
  }

  if (errorMsg || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-[#17181C]">
          {errorMsg || 'Pertanyaan tidak tersedia'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/student/assessment')}
          className="px-5 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold"
        >
          Kembali ke Halaman Asesmen
        </button>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1

  return (
    <div className="min-h-screen pb-28">
      {/* Sticky Progress Header */}
      <AssessmentProgress
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
      />

      {/* Main Question Area */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            selectedOptionId={answers[currentQuestion.id] || null}
            onSelectOption={handleSelectOption}
            disabled={isSubmitting}
          />
        )}
      </main>

      {/* Sticky Bottom Navigation */}
      <AssessmentNavigation
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        canGoPrevious={currentIndex > 0}
        isLastQuestion={isLast}
        isSubmitting={isSubmitting}
        validationError={validationError}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
