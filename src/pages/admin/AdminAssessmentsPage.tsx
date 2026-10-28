import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Sliders,
  Search,
  Edit2,
  Trash2,
  Plus,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Volume2,
  Activity,
  Layers,
  Sparkles,
  GraduationCap,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  assessmentAdminService,
  type LevelConfigMap,
} from '@/services/assessmentAdminService'
import type { PersonaQuestion, StudentLevel, QuestionOption } from '@/data/personaModalityData'

type ModalityIndicator = 'V' | 'A' | 'K'

export function AdminAssessmentsPage() {
  const [questions, setQuestions] = useState<PersonaQuestion[]>([])
  const [levelConfig, setLevelConfig] = useState<LevelConfigMap>(() =>
    assessmentAdminService.getLevelConfig()
  )

  // Local state for level quota inputs
  const [sdQuota, setSdQuota] = useState<number>(15)
  const [sdMinutes, setSdMinutes] = useState<number>(5)
  const [smpQuota, setSmpQuota] = useState<number>(20)
  const [smpMinutes, setSmpMinutes] = useState<number>(7)
  const [smaQuota, setSmaQuota] = useState<number>(30)
  const [smaMinutes, setSmaMinutes] = useState<number>(10)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isConfigChanged, setIsConfigChanged] = useState(false)

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<'ALL' | StudentLevel>('ALL')
  const [modalityFilter, setModalityFilter] = useState<'ALL' | ModalityIndicator>('ALL')
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)

  // Edit / Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<PersonaQuestion | null>(null)
  const [formNumber, setFormNumber] = useState<number>(1)
  const [formText, setFormText] = useState('')
  const [formLevels, setFormLevels] = useState<StudentLevel[]>(['SD', 'SMP', 'SMA'])

  const [optALabel, setOptALabel] = useState('')
  const [optAIndicator, setOptAIndicator] = useState<ModalityIndicator>('V')

  const [optBLabel, setOptBLabel] = useState('')
  const [optBIndicator, setOptBIndicator] = useState<ModalityIndicator>('A')

  const [optCLabel, setOptCLabel] = useState('')
  const [optCIndicator, setOptCIndicator] = useState<ModalityIndicator>('K')

  // Delete & Reset Confirmations
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)

  // Item refs for fast smooth scrolling
  const questionItemRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Load Initial Data
  const refreshData = useCallback(() => {
    const qList = assessmentAdminService.getQuestions()
    const cfg = assessmentAdminService.getLevelConfig()
    setQuestions(qList)
    setLevelConfig(cfg)
    setSdQuota(cfg.SD.totalCount)
    setSdMinutes(cfg.SD.estimatedMinutes)
    setSmpQuota(cfg.SMP.totalCount)
    setSmpMinutes(cfg.SMP.estimatedMinutes)
    setSmaQuota(cfg.SMA.totalCount)
    setSmaMinutes(cfg.SMA.estimatedMinutes)
    setIsConfigChanged(false)
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Track if config changed from saved
  useEffect(() => {
    const changed =
      sdQuota !== levelConfig.SD.totalCount ||
      sdMinutes !== levelConfig.SD.estimatedMinutes ||
      smpQuota !== levelConfig.SMP.totalCount ||
      smpMinutes !== levelConfig.SMP.estimatedMinutes ||
      smaQuota !== levelConfig.SMA.totalCount ||
      smaMinutes !== levelConfig.SMA.estimatedMinutes
    setIsConfigChanged(changed)
  }, [sdQuota, sdMinutes, smpQuota, smpMinutes, smaQuota, smaMinutes, levelConfig])

  // Save Level Quota Configuration
  const handleSaveLevelConfig = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingConfig(true)
    try {
      const validSdQuota = Math.max(1, Math.min(questions.length || 30, Number(sdQuota) || 15))
      const validSmpQuota = Math.max(validSdQuota, Math.min(questions.length || 30, Number(smpQuota) || 20))
      const validSmaQuota = Math.max(validSmpQuota, Math.min(Math.max(questions.length, 30), Number(smaQuota) || 30))

      const newConfig: LevelConfigMap = {
        SD: {
          ...levelConfig.SD,
          totalCount: validSdQuota,
          estimatedMinutes: Math.max(1, Number(sdMinutes) || 5),
        },
        SMP: {
          ...levelConfig.SMP,
          totalCount: validSmpQuota,
          estimatedMinutes: Math.max(1, Number(smpMinutes) || 7),
        },
        SMA: {
          ...levelConfig.SMA,
          totalCount: validSmaQuota,
          estimatedMinutes: Math.max(1, Number(smaMinutes) || 10),
        },
      }

      assessmentAdminService.saveLevelConfig(newConfig)
      setLevelConfig(newConfig)
      setSdQuota(validSdQuota)
      setSmpQuota(validSmpQuota)
      setSmaQuota(validSmaQuota)
      refreshData()
      toast.success('Pengaturan jenjang berhasil disimpan dan otomatis diselaraskan ke siswa.')
    } catch {
      toast.error('Gagal menyimpan pengaturan jenjang.')
    } finally {
      setIsSavingConfig(false)
    }
  }

  // Open Edit Modal
  const handleOpenEdit = (q: PersonaQuestion) => {
    setEditingQuestion(q)
    setFormNumber(q.number)
    setFormText(q.questionText)
    setFormLevels([...q.levels])

    const optA = q.options[0]
    const optB = q.options[1]
    const optC = q.options[2]

    setOptALabel(optA?.label || '')
    setOptAIndicator((optA?.indicator as ModalityIndicator) || 'V')

    setOptBLabel(optB?.label || '')
    setOptBIndicator((optB?.indicator as ModalityIndicator) || 'A')

    setOptCLabel(optC?.label || '')
    setOptCIndicator((optC?.indicator as ModalityIndicator) || 'K')

    setIsModalOpen(true)
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextNumber = questions.length + 1
    setEditingQuestion(null)
    setFormNumber(nextNumber)
    setFormText('')
    setFormLevels(['SD', 'SMP', 'SMA'])

    setOptALabel('')
    setOptAIndicator('V')

    setOptBLabel('')
    setOptBIndicator('A')

    setOptCLabel('')
    setOptCIndicator('K')

    setIsModalOpen(true)
  }

  // Toggle Level Checkbox in Modal
  const handleToggleLevel = (lvl: StudentLevel) => {
    setFormLevels((prev) =>
      prev.includes(lvl) ? prev.filter((item) => item !== lvl) : [...prev, lvl]
    )
  }

  // Save Question (Create or Edit)
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formText.trim()) {
      toast.error('Teks narasi pertanyaan wajib diisi.')
      return
    }
    if (!optALabel.trim() || !optBLabel.trim() || !optCLabel.trim()) {
      toast.error('Ketiga pilihan jawaban (A, B, C) wajib diisi.')
      return
    }
    if (formLevels.length === 0) {
      toast.error('Pilih minimal satu jenjang pendidikan (SD, SMP, atau SMA).')
      return
    }

    const questionId = editingQuestion
      ? editingQuestion.id
      : `pm-vak-${String(formNumber).padStart(2, '0')}`

    const options: QuestionOption[] = [
      {
        id: `${questionId}-opt-a`,
        label: optALabel.trim(),
        indicator: optAIndicator,
      },
      {
        id: `${questionId}-opt-b`,
        label: optBLabel.trim(),
        indicator: optBIndicator,
      },
      {
        id: `${questionId}-opt-c`,
        label: optCLabel.trim(),
        indicator: optCIndicator,
      },
    ]

    const updatedQuestion: PersonaQuestion = {
      id: questionId,
      number: Number(formNumber) || questions.length + 1,
      moduleCode: 'PM-VAK-01',
      moduleName: 'Sensory Modality (VAK)',
      cluster: 'VAK',
      levels: formLevels,
      questionText: formText.trim(),
      options,
    }

    assessmentAdminService.saveQuestion(updatedQuestion)
    refreshData()
    setIsModalOpen(false)
    toast.success(
      editingQuestion
        ? `Butir soal nomor ${updatedQuestion.number} berhasil diperbarui.`
        : `Butir soal nomor ${updatedQuestion.number} berhasil ditambahkan.`
    )
  }

  // Delete Question
  const handleDeleteQuestion = (id: string) => {
    assessmentAdminService.deleteQuestion(id)
    refreshData()
    setDeletingId(null)
    toast.success('Butir soal berhasil dihapus dari bank soal.')
  }

  // Reset to Defaults
  const handleResetToDefaults = () => {
    assessmentAdminService.resetToDefaults()
    refreshData()
    setIsResetConfirmOpen(false)
    toast.success('Bank soal dan kuota jenjang berhasil di-reset ke standar Soal.Md.')
  }

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        !searchQuery.trim() ||
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.options.some((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchLevel = levelFilter === 'ALL' || q.levels.includes(levelFilter)
      const matchModality =
        modalityFilter === 'ALL' || q.options.some((opt) => opt.indicator === modalityFilter)

      return matchSearch && matchLevel && matchModality
    })
  }, [questions, searchQuery, levelFilter, modalityFilter])

  // Statistics
  const stats = useMemo(() => {
    let vCount = 0
    let aCount = 0
    let kCount = 0

    questions.forEach((q) => {
      q.options.forEach((opt) => {
        if (opt.indicator === 'V') vCount++
        if (opt.indicator === 'A') aCount++
        if (opt.indicator === 'K') kCount++
      })
    })

    return {
      total: questions.length,
      sd: levelConfig.SD.totalCount,
      smp: levelConfig.SMP.totalCount,
      sma: levelConfig.SMA.totalCount,
      vCount,
      aCount,
      kCount,
    }
  }, [questions, levelConfig])

  // Quick jump to a question
  const scrollToQuestion = (questionId: string) => {
    setActiveQuestionId(questionId)
    const el = questionItemRefs.current[questionId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* =========================================================================
            HEADER: APP SCREEN TITLE & PRIMARY ACTIONS
            ========================================================================= */}
        <PageHeader
          title="Bank Soal & Asesmen Modalitas"
          subtitle="Instrumen diagnostik sensori belajar siswa (Visual, Auditori, Kinestetik) dan pengaturan kuota pengerjaan per jenjang."
          badge="Super Admin"
          action={
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsResetConfirmOpen(true)}
                className="text-xs font-medium text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset Standar Dokumen
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleOpenCreate}
                className="text-xs font-semibold bg-[#183058] hover:bg-[#102342] text-white shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Tambah Butir Soal
              </Button>
            </div>
          }
        />

        {/* =========================================================================
            UNIFIED METRIC STRIP (Anti-slop: Type over tiles, 1px hairline dividers)
            ========================================================================= */}
        <div className="border border-border/80 bg-white rounded-2xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border/80 grid grid-cols-2 sm:grid-cols-4">
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Total Bank Soal
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-[#17181C]">
                {stats.total}
              </span>
              <span className="text-xs text-muted-foreground">butir terbit</span>
            </div>
            <span className="text-[11px] text-muted-foreground/80 mt-1 block">
              Paket 1 Sensory Modality
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Cakupan Jenjang SD
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-emerald-800">
                1 s.d. {stats.sd}
              </span>
              <span className="text-xs text-muted-foreground">soal</span>
            </div>
            <span className="text-[11px] text-emerald-700/80 mt-1 block">
              Durasi target {levelConfig.SD.estimatedMinutes} menit
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Cakupan Jenjang SMP
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-indigo-800">
                1 s.d. {stats.smp}
              </span>
              <span className="text-xs text-muted-foreground">soal</span>
            </div>
            <span className="text-[11px] text-indigo-700/80 mt-1 block">
              Durasi target {levelConfig.SMP.estimatedMinutes} menit
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Distribusi Opsi V·A·K
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-sm font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                V:{stats.vCount}
              </span>
              <span className="font-mono text-sm font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                A:{stats.aCount}
              </span>
              <span className="font-mono text-sm font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                K:{stats.kCount}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground/80 mt-1 block">
              Rasio seimbang 1 : 1 : 1
            </span>
          </div>
        </div>

        {/* =========================================================================
            PANEL 1: PENGATURAN KUOTA SOAL & DURASI PER JENJANG
            ========================================================================= */}
        <div className="border border-border/80 bg-white rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2 text-[#183058] mb-1">
                <Sliders className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Konfigurasi Kuota &amp; Waktu Pengerjaan
                </span>
              </div>
              <h2 className="text-base font-bold text-[#17181C]">
                Penentuan Batas Soal Siswa per Jenjang
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tentukan urutan nomor soal terakhir yang dikerjakan siswa SD, SMP, dan SMA beserta alokasi durasi tes.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Sinkron Langsung ke Siswa
              </span>
            </div>
          </div>

          {/* Visual Distribution Scope Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-slate-700">Cakupan Bank Soal (Nomor 1 s.d. {questions.length})</span>
              <span className="font-mono text-[11px]">Skala Total: {questions.length} Soal</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-border/60">
              <div
                style={{ width: `${(sdQuota / Math.max(questions.length, 1)) * 100}%` }}
                className="bg-emerald-600/80 hover:bg-emerald-600 transition-all relative group cursor-pointer"
                title={`SD: 1 s.d. ${sdQuota} soal`}
              />
              <div
                style={{ width: `${((smpQuota - sdQuota) / Math.max(questions.length, 1)) * 100}%` }}
                className="bg-indigo-600/80 hover:bg-indigo-600 transition-all relative group cursor-pointer"
                title={`Tambahan SMP: ${sdQuota + 1} s.d. ${smpQuota} soal`}
              />
              <div
                style={{ width: `${((smaQuota - smpQuota) / Math.max(questions.length, 1)) * 100}%` }}
                className="bg-blue-600/80 hover:bg-blue-600 transition-all relative group cursor-pointer"
                title={`Tambahan SMA: ${smpQuota + 1} s.d. ${smaQuota} soal`}
              />
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-0.5">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                SD: 1 s.d. {sdQuota} ({Math.round((sdQuota / Math.max(questions.length, 1)) * 100)}%)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                SMP: 1 s.d. {smpQuota} ({Math.round((smpQuota / Math.max(questions.length, 1)) * 100)}%)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                SMA: 1 s.d. {smaQuota} (100%)
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveLevelConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* SD Quota */}
              <div className="p-4 rounded-xl border border-border/80 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    <div>
                      <h3 className="font-semibold text-xs text-[#17181C]">
                        Jenjang SD
                      </h3>
                      <span className="text-[10px] text-muted-foreground">Kelas 3 s.d. 6</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                    Soal 1–{sdQuota}
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div>
                    <label htmlFor="sd-quota-input" className="block text-[11px] font-medium text-slate-700 mb-1">
                      Jumlah Butir Soal (Maks: {questions.length})
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sd-quota-input"
                        type="number"
                        min={1}
                        max={questions.length}
                        value={sdQuota}
                        onChange={(e) => setSdQuota(Number(e.target.value))}
                        className="bg-white font-mono text-xs h-8"
                        required
                      />
                      <span className="text-xs text-muted-foreground font-mono shrink-0">soal</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sd-minutes-input" className="block text-[11px] font-medium text-slate-700 mb-1">
                      Alokasi Waktu Pengerjaan
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sd-minutes-input"
                        type="number"
                        min={1}
                        max={60}
                        value={sdMinutes}
                        onChange={(e) => setSdMinutes(Number(e.target.value))}
                        className="bg-white font-mono text-xs h-8"
                        required
                      />
                      <span className="text-xs text-muted-foreground font-mono shrink-0">menit</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SMP Quota */}
              <div className="p-4 rounded-xl border border-border/80 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-700" />
                    <div>
                      <h3 className="font-semibold text-xs text-[#17181C]">
                        Jenjang SMP
                      </h3>
                      <span className="text-[10px] text-muted-foreground">Kelas 7 s.d. 9</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-50 text-indigo-800 border border-indigo-200/80">
                    Soal 1–{smpQuota}
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div>
                    <label htmlFor="smp-quota-input" className="block text-[11px] font-medium text-slate-700 mb-1">
                      Jumlah Butir Soal (Maks: {questions.length})
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="smp-quota-input"
                        type="number"
                        min={sdQuota}
                        max={questions.length}
                        value={smpQuota}
                        onChange={(e) => setSmpQuota(Number(e.target.value))}
                        className="bg-white font-mono text-xs h-8"
                        required
                      />
                      <span className="text-xs text-muted-foreground font-mono shrink-0">soal</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="smp-minutes-input" className="block text-[11px] font-medium text-slate-700 mb-1">
                      Alokasi Waktu Pengerjaan
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="smp-minutes-input"
                        type="number"
                        min={1}
                        max={60}
                        value={smpMinutes}
                        onChange={(e) => setSmpMinutes(Number(e.target.value))}
                        className="bg-white font-mono text-xs h-8"
                        required
                      />
                      <span className="text-xs text-muted-foreground font-mono shrink-0">menit</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SMA Quota */}
              <div className="p-4 rounded-xl border border-border/80 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-700" />
                    <div>
                      <h3 className="font-semibold text-xs text-[#17181C]">
                        Jenjang SMA / SMK
                      </h3>
                      <span className="text-[10px] text-muted-foreground">Kelas 10 s.d. 12</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-50 text-blue-800 border border-blue-200/80">
                    Soal 1–{smaQuota}
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div>
                    <label htmlFor="sma-quota-input" className="block text-[11px] font-medium text-slate-700 mb-1">
                      Jumlah Butir Soal (Maks: {questions.length})
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sma-quota-input"
                        type="number"
                        min={smpQuota}
                        max={questions.length}
                        value={smaQuota}
                        onChange={(e) => setSmaQuota(Number(e.target.value))}
                        className="bg-white font-mono text-xs h-8"
                        required
                      />
                      <span className="text-xs text-muted-foreground font-mono shrink-0">soal</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sma-minutes-input" className="block text-[11px] font-medium text-slate-700 mb-1">
                      Alokasi Waktu Pengerjaan
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sma-minutes-input"
                        type="number"
                        min={1}
                        max={60}
                        value={smaMinutes}
                        onChange={(e) => setSmaMinutes(Number(e.target.value))}
                        className="bg-white font-mono text-xs h-8"
                        required
                      />
                      <span className="text-xs text-muted-foreground font-mono shrink-0">menit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">
                Perubahan kuota akan otomatis menetapkan urutan soal yang aktif saat siswa mengerjakan tes.
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingConfig || !isConfigChanged}
                className="bg-[#183058] hover:bg-[#102342] text-white text-xs font-semibold px-4"
              >
                {isSavingConfig ? 'Menyimpan...' : 'Simpan Pengaturan Jenjang'}
              </Button>
            </div>
          </form>
        </div>

        {/* =========================================================================
            PANEL 2: BANK SOAL MODALITAS (READING EXPERIENCE & EDITING)
            ========================================================================= */}
        <div className="border border-border/80 bg-white rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2 text-[#183058] mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Daftar Butir Soal Terbit
                </span>
              </div>
              <h2 className="text-base font-bold text-[#17181C]">
                Kurikulum Soal &amp; Penanda Modalitas Sensori
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Setiap butir soal memetakan tiga respons siswa terhadap preferensi Visual, Auditori, atau Kinestetik.
              </p>
            </div>

            {/* Quick Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Jenjang Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <span className="text-[11px] font-medium text-slate-500 px-1.5">Jenjang:</span>
                {(['ALL', 'SD', 'SMP', 'SMA'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevelFilter(lvl)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      levelFilter === lvl
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl === 'ALL' ? 'Semua' : lvl}
                  </button>
                ))}
              </div>

              {/* Modality Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <span className="text-[11px] font-medium text-slate-500 px-1.5">Indikator:</span>
                {(['ALL', 'V', 'A', 'K'] as const).map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setModalityFilter(mod)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      modalityFilter === mod
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mod === 'ALL'
                      ? 'Semua'
                      : mod === 'V'
                      ? 'Visual'
                      : mod === 'A'
                      ? 'Auditori'
                      : 'Kinestetik'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick-Jump Question Number Navigation Strip */}
          <div className="space-y-1.5 pb-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Lompat Cepat ke Nomor Soal:</span>
              <span>Menampilkan {filteredQuestions.length} dari {questions.length} butir</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap overflow-x-auto py-1">
              {questions.map((q) => {
                const isActive = activeQuestionId === q.id
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => scrollToQuestion(q.id)}
                    className={`w-7 h-7 rounded text-xs font-mono transition-all flex items-center justify-center ${
                      isActive
                        ? 'bg-[#183058] text-white font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium'
                    }`}
                    title={`Lompat ke Soal #${q.number}`}
                  >
                    {String(q.number).padStart(2, '0')}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Cari teks soal atau pilihan jawaban..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50/70 border-border/80 focus:bg-white"
            />
          </div>

          {/* Questions Editorial List */}
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs space-y-2 border border-dashed border-border rounded-xl">
              <AlertCircle className="w-6 h-6 text-muted-foreground/60 mx-auto" />
              <p className="font-semibold text-slate-800">Tidak ada butir soal yang sesuai filter.</p>
              <p>Ubah pilihan jenjang, indikator sensori, atau kata kunci pencarian.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q) => {
                const isSelected = activeQuestionId === q.id
                return (
                  <div
                    key={q.id}
                    ref={(el) => {
                      questionItemRefs.current[q.id] = el
                    }}
                    className={`p-5 rounded-xl border transition-all space-y-3.5 ${
                      isSelected
                        ? 'border-[#183058] bg-slate-50/40 ring-1 ring-[#183058]/10'
                        : 'border-border/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Item Meta Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          #{String(q.number).padStart(2, '0')}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {q.moduleCode}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <span>Jenjang:</span>
                          <span className="font-medium text-slate-700">
                            {q.levels.join(' · ')}
                          </span>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(q)}
                          className="h-7 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-2.5"
                        >
                          <Edit2 className="w-3 h-3 mr-1 text-slate-500" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingId(q.id)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus butir soal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Question Prompt Narrative (High-readability editorial typography) */}
                    <p className="text-[15px] font-medium text-slate-900 leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* 3 Answer Options (Subtle pale tints with dark text of the same hue) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const letter = optIdx === 0 ? 'A' : optIdx === 1 ? 'B' : 'C'
                        const isV = opt.indicator === 'V'
                        const isA = opt.indicator === 'A'

                        return (
                          <div
                            key={opt.id}
                            className={`p-3.5 rounded-lg border text-xs space-y-2 flex flex-col justify-between transition-colors ${
                              isV
                                ? 'bg-blue-50/30 border-blue-200/60'
                                : isA
                                ? 'bg-amber-50/30 border-amber-200/60'
                                : 'bg-emerald-50/30 border-emerald-200/60'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[11px] font-semibold text-slate-500">
                                Opsi {letter}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide inline-flex items-center gap-1 ${
                                  isV
                                    ? 'bg-blue-100/80 text-blue-800'
                                    : isA
                                    ? 'bg-amber-100/80 text-amber-800'
                                    : 'bg-emerald-100/80 text-emerald-800'
                                }`}
                              >
                                {isV ? (
                                  <Eye className="w-3 h-3" />
                                ) : isA ? (
                                  <Volume2 className="w-3 h-3" />
                                ) : (
                                  <Activity className="w-3 h-3" />
                                )}
                                <span>
                                  {isV ? 'Visual [V]' : isA ? 'Auditori [A]' : 'Kinestetik [K]'}
                                </span>
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 leading-normal font-normal">
                              {opt.label}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL: EDIT ATAU TAMBAH BUTIR SOAL
          ========================================================================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="pb-3 border-b border-border/60">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#183058]" />
              <span>
                {editingQuestion
                  ? `Edit Butir Soal Nomor #${editingQuestion.number}`
                  : 'Tambah Butir Soal Baru'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tulis narasi situasi pertanyaan dan tetapkan indikator modalitas sensori untuk tiap opsi jawaban.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveQuestion} className="space-y-4 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="form-number-input"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Nomor Urut Soal:
                </label>
                <Input
                  id="form-number-input"
                  type="number"
                  min={1}
                  value={formNumber}
                  onChange={(e) => setFormNumber(Number(e.target.value))}
                  className="font-mono text-xs h-8"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Jenjang Siswa:
                </label>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {(['SD', 'SMP', 'SMA'] as const).map((lvl) => {
                    const isChecked = formLevels.includes(lvl)
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleToggleLevel(lvl)}
                        className={`px-3 py-1 rounded text-xs font-semibold border transition-colors ${
                          isChecked
                            ? 'bg-[#183058] text-white border-[#183058]'
                            : 'bg-white text-slate-600 border-border hover:bg-slate-50'
                        }`}
                      >
                        {isChecked ? `✓ ${lvl}` : `+ ${lvl}`}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="form-text-input"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Teks Narasi Soal:
              </label>
              <textarea
                id="form-text-input"
                rows={3}
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="Tuliskan pertanyaan situasi belajar yang mengukur kecenderungan sensori..."
                className="w-full text-xs p-3 rounded-lg border border-border bg-white focus:outline-hidden focus:ring-1 focus:ring-[#183058] focus:border-[#183058] leading-relaxed"
                required
              />
            </div>

            {/* Pilihan Jawaban A, B, C */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <span className="text-xs font-semibold text-[#183058] uppercase tracking-wider block">
                3 Pilihan Jawaban &amp; Penanda Modalitas
              </span>

              {/* Opsi A */}
              <div className="p-3.5 rounded-lg border border-blue-200/80 bg-blue-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">Pilihan A</span>
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="select-ind-a" className="text-[11px] text-muted-foreground">
                      Indikator:
                    </label>
                    <select
                      id="select-ind-a"
                      value={optAIndicator}
                      onChange={(e) => setOptAIndicator(e.target.value as ModalityIndicator)}
                      aria-label="Indikator Pilihan A"
                      className="text-xs font-semibold rounded border border-border bg-white px-2 py-0.5 text-slate-800"
                    >
                      <option value="V">Visual [V] - Jalur Penglihatan</option>
                      <option value="A">Auditori [A] - Jalur Pendengaran</option>
                      <option value="K">Kinestetik [K] - Jalur Gerak &amp; Sentuhan</option>
                    </select>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={optALabel}
                  onChange={(e) => setOptALabel(e.target.value)}
                  placeholder="Teks pilihan jawaban A..."
                  className="w-full text-xs p-2.5 rounded border border-border bg-white focus:outline-hidden focus:ring-1 focus:ring-[#183058]"
                  required
                />
              </div>

              {/* Opsi B */}
              <div className="p-3.5 rounded-lg border border-amber-200/80 bg-amber-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">Pilihan B</span>
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="select-ind-b" className="text-[11px] text-muted-foreground">
                      Indikator:
                    </label>
                    <select
                      id="select-ind-b"
                      value={optBIndicator}
                      onChange={(e) => setOptBIndicator(e.target.value as ModalityIndicator)}
                      aria-label="Indikator Pilihan B"
                      className="text-xs font-semibold rounded border border-border bg-white px-2 py-0.5 text-slate-800"
                    >
                      <option value="A">Auditori [A] - Jalur Pendengaran</option>
                      <option value="V">Visual [V] - Jalur Penglihatan</option>
                      <option value="K">Kinestetik [K] - Jalur Gerak &amp; Sentuhan</option>
                    </select>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={optBLabel}
                  onChange={(e) => setOptBLabel(e.target.value)}
                  placeholder="Teks pilihan jawaban B..."
                  className="w-full text-xs p-2.5 rounded border border-border bg-white focus:outline-hidden focus:ring-1 focus:ring-[#183058]"
                  required
                />
              </div>

              {/* Opsi C */}
              <div className="p-3.5 rounded-lg border border-emerald-200/80 bg-emerald-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">Pilihan C</span>
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="select-ind-c" className="text-[11px] text-muted-foreground">
                      Indikator:
                    </label>
                    <select
                      id="select-ind-c"
                      value={optCIndicator}
                      onChange={(e) => setOptCIndicator(e.target.value as ModalityIndicator)}
                      aria-label="Indikator Pilihan C"
                      className="text-xs font-semibold rounded border border-border bg-white px-2 py-0.5 text-slate-800"
                    >
                      <option value="K">Kinestetik [K] - Jalur Gerak &amp; Sentuhan</option>
                      <option value="V">Visual [V] - Jalur Penglihatan</option>
                      <option value="A">Auditori [A] - Jalur Pendengaran</option>
                    </select>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={optCLabel}
                  onChange={(e) => setOptCLabel(e.target.value)}
                  placeholder="Teks pilihan jawaban C..."
                  className="w-full text-xs p-2.5 rounded border border-border bg-white focus:outline-hidden focus:ring-1 focus:ring-[#183058]"
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#183058] hover:bg-[#102342] text-white text-xs font-semibold px-4"
              >
                {editingQuestion ? 'Perbarui Soal' : 'Simpan Butir Baru'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          DIALOG: KONFIRMASI HAPUS BUTIR SOAL
          ========================================================================= */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Hapus Butir Soal?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Butir soal ini akan dihapus dari bank soal aktif. Tindakan ini tidak dapat dibatalkan, namun Anda selalu dapat melakukan reset ke standar dokumen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingId(null)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => deletingId && handleDeleteQuestion(deletingId)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              Ya, Hapus Butir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          DIALOG: KONFIRMASI RESET KE STANDAR SOAL.MD
          ========================================================================= */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <span>Reset ke Standar Soal.Md?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1 leading-relaxed">
              Tindakan ini akan mengembalikan seluruh 30 butir soal dan konfigurasi kuota jenjang (SD=15, SMP=20, SMA=30) persis sesuai dokumen referensi <strong>Soal.Md</strong>. Seluruh penyesuaian lokal akan ditimpa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetConfirmOpen(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleResetToDefaults}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              Ya, Reset Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
