import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getQuizByLessonId, submitQuiz } from './quizService'
import * as supabaseLib from '@/lib/supabase'

describe('quizService (Phase 8)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches quiz structure without leaking is_correct options to client', async () => {
    const mockQuizData = {
      id: 'quiz-1',
      lesson_id: 'lesson-1',
      title: 'Kuis Evaluasi Bab 1',
      description: 'Pilihlah jawaban yang paling tepat.',
      passing_score: 75,
      max_attempts: 3,
      status: 'published',
      quiz_questions: [
        {
          id: 'q-1',
          quiz_id: 'quiz-1',
          question: 'Apa definisi isim mufrad?',
          question_type: 'SINGLE_CHOICE',
          points: 10,
          sort_order: 1,
          quiz_options: [
            {
              id: 'opt-1',
              question_id: 'q-1',
              label: 'Kata benda tunggal',
              sort_order: 1,
            },
            {
              id: 'opt-2',
              question_id: 'q-1',
              label: 'Kata benda jamak',
              sort_order: 2,
            },
          ],
        },
      ],
    }

    const mockSupabase = {
      from: vi.fn((table: string) => {
        expect(table).toBe('quizzes')
        return {
          select: vi.fn((queryStr: string) => {
            // Verify is_correct is not queried
            expect(queryStr).not.toContain('is_correct')
            return {
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: mockQuizData,
                error: null,
              }),
            }
          }),
        }
      }),
    }

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    )

    const quiz = await getQuizByLessonId('lesson-1')
    expect(quiz).toBeDefined()
    expect(quiz?.title).toBe('Kuis Evaluasi Bab 1')
    expect(quiz?.questions).toHaveLength(1)
    expect(quiz?.questions?.[0]?.options).toHaveLength(2)
  })

  it('submits quiz answers through secure submit_quiz_attempt RPC', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: {
        score: 100,
        passed: true,
        attempt_number: 1,
        attempt_id: 'attempt-1',
      },
      error: null,
    })

    const mockSupabase = {
      rpc: mockRpc,
    }

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    )

    const answers = [
      { question_id: 'q-1', selected_option_id: 'opt-1' },
    ]

    const result = await submitQuiz('quiz-1', answers)
    expect(mockRpc).toHaveBeenCalledWith('submit_quiz_attempt', {
      p_quiz_id: 'quiz-1',
      p_answers: answers,
    })
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
  })
})
