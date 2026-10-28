import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { assessmentSessionService, isLegacySession } from '@/services/assessmentSessionService'
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
  const [sessionPackageName, setSessionPackageName] = useState('Paket 1: Persona Modality')

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

        if (isLegacySession(session)) {
          await assessmentSessionService.abandonSession(session.id)
          setErrorMsg(
            'Sesi ini berasal dari versi asesmen lama dan tidak bisa dilanjutkan. Silakan mulai sesi baru.'
          )
          setLoading(false)
          return
        }

        if (session.package_code === 'PAKET_2_PERSONA_POTENTIAL') {
          setSessionPackageName('Paket 2: Persona Potential')
        } else if (session.package_code === 'PAKET_3_PERSONA_MASTERY') {
          setSessionPackageName('Paket 3: Persona Mastery')
        } else {
          setSessionPackageName('Paket 1: Persona Modality')
        }

        // Load questions from database filtered by student level and package
        const qList = await assessmentService.getQuestions(
          session.assessment_id,
          session.student_level || 'SMA',
          session.package_code || 'PAKET_1_PERSONA_MODALITY'
        )
        if (qList.length === 0) {
          setErrorMsg('Belum ada butir pertanyaan yang aktif untuk asesmen ini.')
          setLoading(false)
          return
        }
        setQuestions(qList)

        // Load already saved answers
        const savedAnswers = await assessmentAnswerService.getAnswersForSession(sessionId)
        setAnswers(savedAnswers)

        // Resume ke indeks tersimpan, tapi jangan melewati soal pertama yang belum terjawab
        const firstUnanswered = qList.findIndex((q) => q.required && !savedAnswers[q.id])
        const savedIndex = Math.max(session.current_question_index ?? 0, 0)
        const validIndex = Math.min(
          firstUnanswered === -1 ? savedIndex : Math.min(savedIndex, firstUnanswered),
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
  const handleNext = useCallback(() => {
    const currentQ = questions[currentIndex]
    if (!currentQ) return

    // Validation: Required check
    if (currentQ.required && !answers[currentQ.id]) {
      setValidationError('Silakan pilih salah satu jawaban sebelum melanjutkan.')
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
  }, [currentIndex, questions, answers, sessionId])

  const handlePrevious = useCallback(() => {
    setValidationError(null)
    const prevIndex = Math.max(currentIndex - 1, 0)
    setCurrentIndex(prevIndex)

    if (sessionId) {
      assessmentSessionService.updateProgress(sessionId, prevIndex)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentIndex, sessionId])

  // 4. Submit and Score Assessment
  const handleSubmit = useCallback(async () => {
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
        `Terdapat ${unanswered.length} butir soal yang belum dijawab. Lengkapi seluruh soal untuk melihat profil lengkap.`
      )
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
      const resultId = await assessmentScoringService.submitAndScore(sessionId)
      navigate(`/student/personality/${resultId}`, { replace: true })
    } catch (err: unknown) {
      console.error('Error submitting assessment:', err)
      const message =
        err instanceof Error ? err.message : 'Gagal memproses penilaian asesmen.'
      setValidationError(message)
      setIsSubmitting(false)
    }
  }, [sessionId, isSubmitting, questions, currentIndex, answers, navigate])

  // 5. Keyboard Navigation (Power UX: A, B, C, Enter, Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      const currentQ = questions[currentIndex]
      if (!currentQ || isSubmitting) return

      const options = currentQ.assessment_options ?? []

      if (e.key === 'a' || e.key === 'A' || e.key === '1') {
        if (options[0]) handleSelectOption(options[0].id)
      } else if (e.key === 'b' || e.key === 'B' || e.key === '2') {
        if (options[1]) handleSelectOption(options[1].id)
      } else if (e.key === 'c' || e.key === 'C' || e.key === '3') {
        if (options[2]) handleSelectOption(options[2].id)
      } else if (e.key === 'd' || e.key === 'D' || e.key === '4') {
        if (options[3]) handleSelectOption(options[3].id)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (currentIndex === questions.length - 1) {
          handleSubmit()
        } else {
          handleNext()
        }
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < questions.length - 1) handleNext()
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) handlePrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, questions, isSubmitting, handleSelectOption, handleNext, handlePrevious, handleSubmit])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#183058]" />
        <p className="text-xs text-muted-foreground font-medium">Menyiapkan butir pertanyaan...</p>
      </div>
    )
  }

  if (errorMsg || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-base font-bold text-slate-900">
          {errorMsg || 'Pertanyaan tidak tersedia'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/student/assessment')}
          className="px-5 py-2.5 rounded-xl bg-[#183058] text-white text-xs font-semibold"
        >
          Kembali ke Katalog Asesmen
        </button>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1

  return (
    <div className="min-h-dvh bg-[#F8FAFC] pb-[calc(8rem+env(safe-area-inset-bottom))] flex flex-col justify-between">
      {/* Sticky Progress Header with Direct Question Jumping */}
      <AssessmentProgress
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        answersCount={Object.keys(answers).length}
        onJumpToIndex={(idx) => {
          setCurrentIndex(idx)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        moduleLabel={sessionPackageName}
      />

      {/* Main Question Area with Smooth Focused Framing */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex-1 flex flex-col justify-center">
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
