import {
  PERSONA_MODALITY_QUESTIONS,
  type PersonaQuestion,
  type StudentLevel,
} from '@/data/personaModalityData'

export interface LevelSettings {
  totalCount: number
  estimatedMinutes: number
  label: string
  desc: string
}

export type LevelConfigMap = Record<StudentLevel, LevelSettings>

export const STORAGE_KEYS = {
  LEVEL_CONFIG: 'laits_assessment_level_config_v1',
  QUESTIONS: 'laits_assessment_questions_v1',
} as const

export const DEFAULT_LEVEL_CONFIG: LevelConfigMap = {
  SD: {
    totalCount: 15,
    estimatedMinutes: 5,
    label: 'SD (Kelas 3 - 6)',
    desc: 'Modalitas sensori belajar dasar (Visual, Auditory, Kinesthetic).',
  },
  SMP: {
    totalCount: 20,
    estimatedMinutes: 7,
    label: 'SMP (Kelas 7 - 9)',
    desc: 'Modalitas sensori belajar mencakup situasi kelas dan belajar mandiri.',
  },
  SMA: {
    totalCount: 30,
    estimatedMinutes: 10,
    label: 'SMA / SMK (Kelas 10 - 12)',
    desc: 'Diagnostik lengkap modalitas sensori untuk persiapan studi lanjut.',
  },
}

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
  if (typeof globalThis !== 'undefined' && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
    return (globalThis as unknown as { localStorage: Storage }).localStorage
  }
  return null
}

function safeGetStorage(key: string): string | null {
  const storage = getStorage()
  if (!storage) return null
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function safeSetStorage(key: string, value: string): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(key, value)
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('laits_assessment_updated', { detail: { key } }))
    }
  } catch (err) {
    console.warn(`[assessmentAdminService] Gagal menyimpan ke localStorage (${key}):`, err)
  }
}

function safeRemoveStorage(key: string): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(key)
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('laits_assessment_updated', { detail: { key } }))
    }
  } catch (err) {
    console.warn(`[assessmentAdminService] Gagal menghapus storage (${key}):`, err)
  }
}

/**
 * Service untuk mengelola penentuan kelas/jenjang dan pengeditan bank soal
 * yang dipublish dari dashboard Super Admin.
 */
export const assessmentAdminService = {
  /**
   * Mengambil konfigurasi kuota dan waktu per jenjang (SD, SMP, SMA).
   */
  getLevelConfig(): LevelConfigMap {
    const raw = safeGetStorage(STORAGE_KEYS.LEVEL_CONFIG)
    if (!raw) return { ...DEFAULT_LEVEL_CONFIG }
    try {
      const parsed = JSON.parse(raw) as Partial<LevelConfigMap>
      return {
        SD: { ...DEFAULT_LEVEL_CONFIG.SD, ...parsed.SD },
        SMP: { ...DEFAULT_LEVEL_CONFIG.SMP, ...parsed.SMP },
        SMA: { ...DEFAULT_LEVEL_CONFIG.SMA, ...parsed.SMA },
      }
    } catch {
      return { ...DEFAULT_LEVEL_CONFIG }
    }
  },

  /**
   * Menyimpan perubahan kuota jenjang oleh Super Admin (misal: SD=20, SMP=25, SMA=30).
   * Otomatis menyelaraskan flag 'levels' pada butir soal agar konsisten dengan kuota.
   */
  saveLevelConfig(newConfig: LevelConfigMap): LevelConfigMap {
    safeSetStorage(STORAGE_KEYS.LEVEL_CONFIG, JSON.stringify(newConfig))

    // Sinkronkan levels pada butir soal agar soal nomor 1..N otomatis aktif untuk jenjang terkait
    const questions = this.getQuestions()
    let changed = false
    const updated = questions.map((q, idx) => {
      const qIndex = idx + 1
      const levels: StudentLevel[] = []
      if (qIndex <= newConfig.SD.totalCount) levels.push('SD')
      if (qIndex <= newConfig.SMP.totalCount) levels.push('SMP')
      if (qIndex <= newConfig.SMA.totalCount) levels.push('SMA')

      // Jika ada perubahan pada levels otomatis
      if (
        levels.length !== q.levels.length ||
        levels.some((lvl) => !q.levels.includes(lvl))
      ) {
        changed = true
        return { ...q, levels }
      }
      return q
    })

    if (changed) {
      this.saveAllQuestions(updated)
    }

    return newConfig
  },

  /**
   * Mengambil seluruh butir soal yang aktif / dipublish.
   */
  getQuestions(): PersonaQuestion[] {
    const raw = safeGetStorage(STORAGE_KEYS.QUESTIONS)
    if (!raw) {
      return PERSONA_MODALITY_QUESTIONS.map((q) => ({
        ...q,
        options: q.options.map((opt) => ({ ...opt })),
        levels: [...q.levels],
      }))
    }
    try {
      const parsed = JSON.parse(raw) as PersonaQuestion[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    } catch {
      // fallback jika json corrupt
    }
    return PERSONA_MODALITY_QUESTIONS.map((q) => ({
      ...q,
      options: q.options.map((opt) => ({ ...opt })),
      levels: [...q.levels],
    }))
  },

  /**
   * Mengambil daftar butir soal khusus untuk jenjang tertentu sesuai kuota aktif yang diatur Super Admin.
   */
  getQuestionsForLevel(level: StudentLevel): PersonaQuestion[] {
    const config = this.getLevelConfig()
    const quota = config[level]?.totalCount ?? DEFAULT_LEVEL_CONFIG[level].totalCount
    const allQuestions = this.getQuestions()

    // Ambil soal yang ditandai untuk jenjang ini
    const levelQuestions = allQuestions.filter((q) => q.levels.includes(level))

    // Jika jumlah soal dengan tag jenjang mencukupi kuota, batasi ke kuota
    if (levelQuestions.length >= quota) {
      return levelQuestions.slice(0, quota)
    }

    // Jika kurang, ambil dari daftar urutan awal sampai kuota terpenuhi
    const extraNeeded = quota - levelQuestions.length
    const pool = allQuestions.filter((q) => !levelQuestions.some((lq) => lq.id === q.id))
    const combined = [...levelQuestions, ...pool.slice(0, extraNeeded)]

    return combined.slice(0, quota)
  },

  /**
   * Menyimpan / memperbarui satu butir soal beserta opsi jawaban dan indikator (V, A, K).
   */
  saveQuestion(question: PersonaQuestion): PersonaQuestion[] {
    const questions = this.getQuestions()
    const existingIndex = questions.findIndex((q) => q.id === question.id)

    let updated: PersonaQuestion[]
    if (existingIndex >= 0) {
      updated = [...questions]
      updated[existingIndex] = { ...question }
    } else {
      updated = [...questions, question]
    }

    // Urutkan berdasarkan number
    updated.sort((a, b) => a.number - b.number)
    this.saveAllQuestions(updated)
    return updated
  },

  /**
   * Menyimpan array penuh butir soal ke storage.
   */
  saveAllQuestions(questions: PersonaQuestion[]): void {
    safeSetStorage(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions))
  },

  /**
   * Menghapus satu butir soal berdasarkan ID.
   */
  deleteQuestion(id: string): PersonaQuestion[] {
    const questions = this.getQuestions()
    const filtered = questions.filter((q) => q.id !== id)
    // Renumber ulang nomor urut soal
    const renumbered = filtered.map((q, idx) => ({
      ...q,
      number: idx + 1,
    }))
    this.saveAllQuestions(renumbered)
    return renumbered
  },

  /**
   * Mengembalikan seluruh soal dan pengaturan kuota jenjang ke default dokumen Soal.Md.
   */
  resetToDefaults(): { questions: PersonaQuestion[]; levelConfig: LevelConfigMap } {
    safeRemoveStorage(STORAGE_KEYS.QUESTIONS)
    safeRemoveStorage(STORAGE_KEYS.LEVEL_CONFIG)

    return {
      questions: PERSONA_MODALITY_QUESTIONS.map((q) => ({
        ...q,
        options: q.options.map((opt) => ({ ...opt })),
        levels: [...q.levels],
      })),
      levelConfig: { ...DEFAULT_LEVEL_CONFIG },
    }
  },
}
