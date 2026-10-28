import { describe, it, expect, beforeEach } from 'vitest'
import {
  assessmentAdminService,
  DEFAULT_LEVEL_CONFIG,
  STORAGE_KEYS,
} from './assessmentAdminService'
import type { PersonaQuestion } from '@/data/personaModalityData'
const store: Record<string, string> = {}
const mockStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, val: string) => {
    store[key] = String(val)
  },
  removeItem: (key: string) => {
    delete store[key]
  },
  clear: () => {
    Object.keys(store).forEach((k) => delete store[k])
  },
  key: (i: number) => Object.keys(store)[i] ?? null,
  get length() {
    return Object.keys(store).length
  },
}

if (!globalThis.localStorage) {
  // @ts-expect-error test mock
  globalThis.localStorage = mockStorage
}

describe('assessmentAdminService (Super Admin Level Quota & Question Editor)', () => {
  beforeEach(() => {
    globalThis.localStorage.clear()
  })

  it('returns default level config when storage is empty', () => {
    const config = assessmentAdminService.getLevelConfig()
    expect(config.SD.totalCount).toBe(15)
    expect(config.SMP.totalCount).toBe(20)
    expect(config.SMA.totalCount).toBe(30)
  })

  it('saves and retrieves custom level quotas set by Super Admin (e.g. SD=20, SMP=25, SMA=30)', () => {
    const customConfig = {
      SD: {
        ...DEFAULT_LEVEL_CONFIG.SD,
        totalCount: 20,
        estimatedMinutes: 6,
      },
      SMP: {
        ...DEFAULT_LEVEL_CONFIG.SMP,
        totalCount: 25,
        estimatedMinutes: 8,
      },
      SMA: {
        ...DEFAULT_LEVEL_CONFIG.SMA,
        totalCount: 30,
        estimatedMinutes: 10,
      },
    }

    assessmentAdminService.saveLevelConfig(customConfig)
    const saved = assessmentAdminService.getLevelConfig()

    expect(saved.SD.totalCount).toBe(20)
    expect(saved.SD.estimatedMinutes).toBe(6)
    expect(saved.SMP.totalCount).toBe(25)
    expect(saved.SMP.estimatedMinutes).toBe(8)
    expect(saved.SMA.totalCount).toBe(30)

    // Check questions returned for SD now match quota 20
    const sdQuestions = assessmentAdminService.getQuestionsForLevel('SD')
    expect(sdQuestions.length).toBe(20)

    // Check questions returned for SMP now match quota 25
    const smpQuestions = assessmentAdminService.getQuestionsForLevel('SMP')
    expect(smpQuestions.length).toBe(25)
  })

  it('fetches published questions with Visual, Auditory, and Kinesthetic indicators', () => {
    const questions = assessmentAdminService.getQuestions()
    expect(questions.length).toBe(30)

    const first = questions[0]
    expect(first).toBeDefined()
    expect(first.options.length).toBe(3)
    const indicators = first.options.map((opt) => opt.indicator)
    expect(indicators).toContain('V')
    expect(indicators).toContain('A')
    expect(indicators).toContain('K')
  })

  it('allows Super Admin to edit question text, options, and modify indicator tags', () => {
    const questions = assessmentAdminService.getQuestions()
    const target = questions[0]

    const modified: PersonaQuestion = {
      ...target,
      questionText: 'Pertanyaan editan super admin tentang preferensi belajar:',
      options: [
        {
          id: `${target.id}-opt-a`,
          label: 'Membaca modul teks berilustrasi visual',
          indicator: 'V',
        },
        {
          id: `${target.id}-opt-b`,
          label: 'Mendengarkan rekaman penjelasan audio',
          indicator: 'A',
        },
        {
          id: `${target.id}-opt-c`,
          label: 'Praktik langsung merakit alat peraga',
          indicator: 'K',
        },
      ],
    }

    assessmentAdminService.saveQuestion(modified)

    const reloaded = assessmentAdminService.getQuestions()
    const updated = reloaded.find((q) => q.id === target.id)!

    expect(updated.questionText).toBe(
      'Pertanyaan editan super admin tentang preferensi belajar:'
    )
    expect(updated.options[0].label).toBe(
      'Membaca modul teks berilustrasi visual'
    )
    expect(updated.options[0].indicator).toBe('V')
    expect(updated.options[1].indicator).toBe('A')
    expect(updated.options[2].indicator).toBe('K')
  })

  it('allows adding a new question and automatically numbers it', () => {
    const initialCount = assessmentAdminService.getQuestions().length

    const newQuestion: PersonaQuestion = {
      id: 'pm-vak-custom-31',
      number: initialCount + 1,
      moduleCode: 'PM-VAK-01',
      moduleName: 'Sensory Modality (VAK)',
      cluster: 'VAK',
      levels: ['SD', 'SMP', 'SMA'],
      questionText: 'Bagaimana caramu mengingat rumus baru?',
      options: [
        { id: 'opt-31-a', label: 'Melihat diagram rumus warna-warni', indicator: 'V' },
        { id: 'opt-31-b', label: 'Mengulang rumus dengan bersuara', indicator: 'A' },
        { id: 'opt-31-c', label: 'Menuliskan rumus sambil berjalan', indicator: 'K' },
      ],
    }

    assessmentAdminService.saveQuestion(newQuestion)
    const after = assessmentAdminService.getQuestions()
    expect(after.length).toBe(initialCount + 1)
    expect(after[after.length - 1].questionText).toBe('Bagaimana caramu mengingat rumus baru?')
  })

  it('deletes a question and renumbers subsequent questions', () => {
    const questions = assessmentAdminService.getQuestions()
    const targetToDelete = questions[1] // question #2

    assessmentAdminService.deleteQuestion(targetToDelete.id)

    const afterDelete = assessmentAdminService.getQuestions()
    expect(afterDelete.length).toBe(questions.length - 1)
    expect(afterDelete.find((q) => q.id === targetToDelete.id)).toBeUndefined()
    // Verify renumbering
    expect(afterDelete[0].number).toBe(1)
    expect(afterDelete[1].number).toBe(2)
  })

  it('resets all questions and level configs to default Soal.Md document', () => {
    // Make changes
    assessmentAdminService.saveLevelConfig({
      ...DEFAULT_LEVEL_CONFIG,
      SD: { ...DEFAULT_LEVEL_CONFIG.SD, totalCount: 22 },
    })

    // Reset
    const { questions, levelConfig } = assessmentAdminService.resetToDefaults()

    expect(levelConfig.SD.totalCount).toBe(15)
    expect(questions.length).toBe(30)
    expect(globalThis.localStorage.getItem(STORAGE_KEYS.QUESTIONS)).toBeNull()
    expect(globalThis.localStorage.getItem(STORAGE_KEYS.LEVEL_CONFIG)).toBeNull()
  })
})
