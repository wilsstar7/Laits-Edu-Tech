import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ClipboardList,
  GraduationCap,
  Plus,
  RotateCcw,
  Search,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Volume2,
  Activity,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<'ALL' | StudentLevel>('ALL')
  const [modalityFilter, setModalityFilter] = useState<'ALL' | ModalityIndicator>('ALL')

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
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

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
      toast.success('Pengaturan kuota jenjang berhasil disimpan dan langsung diterapkan ke siswa!')
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
      toast.error('Teks pertanyaan tidak boleh kosong.')
      return
    }
    if (!optALabel.trim() || !optBLabel.trim() || !optCLabel.trim()) {
      toast.error('Seluruh pilihan jawaban (A, B, C) wajib diisi.')
      return
    }
    if (formLevels.length === 0) {
      toast.error('Pilih minimal satu jenjang target (SD, SMP, atau SMA).')
      return
    }

    const questionId = editingQuestion ? editingQuestion.id : `pm-vak-${String(formNumber).padStart(2, '0')}`

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
        ? `Soal nomor ${updatedQuestion.number} berhasil diperbarui!`
        : `Soal baru nomor ${updatedQuestion.number} berhasil ditambahkan!`
    )
  }

  // Delete Question
  const handleDeleteQuestion = (id: string) => {
    assessmentAdminService.deleteQuestion(id)
    refreshData()
    setDeletingId(null)
    toast.success('Butir soal berhasil dihapus.')
  }

  // Reset to Defaults
  const handleResetToDefaults = () => {
    assessmentAdminService.resetToDefaults()
    refreshData()
    setIsResetConfirmOpen(false)
    toast.success('Bank soal dan kuota jenjang berhasil di-reset ke dokumen Soal.Md.')
  }

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Search
      const matchSearch =
        !searchQuery.trim() ||
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.options.some((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))

      // Level
      const matchLevel = levelFilter === 'ALL' || q.levels.includes(levelFilter)

      // Modality
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
      sd: questions.filter((q) => q.levels.includes('SD')).length,
      smp: questions.filter((q) => q.levels.includes('SMP')).length,
      sma: questions.filter((q) => q.levels.includes('SMA')).length,
      vCount,
      aCount,
      kCount,
    }
  }, [questions])

  return (
    <AppShell>
      <PageHeader
        title="Kelola Asesmen & Bank Soal"
        subtitle="Konfigurasi kuota soal jenjang pendidikan (SD, SMP, SMA) dan manajemen butir soal modalitas sensori (Visual, Auditory, Kinesthetic)."
        badge="Super Admin"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Default Dokumen
            </Button>
            <Button
              type="button"
              onClick={handleOpenCreate}
              className="text-xs font-bold bg-[#183058] hover:bg-[#102342] text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              + Tambah Soal Baru
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
        {/* =========================================================================
            BAGIAN 1: PENGATURAN KUOTA SOAL & DURASI PER JENJANG
            ========================================================================= */}
        <div className="surface-card p-6 sm:p-8 bg-white border border-border/80 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#183058]">
                <Sliders className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Pengaturan Super Admin
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#17181C]">
                Penentuan Kuota Soal &amp; Alokasi Waktu per Jenjang
              </h3>
              <p className="text-xs text-muted-foreground">
                Tentukan berapa butir soal yang wajib diselesaikan siswa pada masing-masing jenjang (misal: SD sampai 20, SMP sampai 25, SMA sampai 30).
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#183058]/10 text-[#183058] text-[11px] font-bold self-start sm:self-center">
              Sinkronisasi Otomatis
            </span>
          </div>

          <form onSubmit={handleSaveLevelConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card SD */}
              <div className="p-5 rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#17181C]">
                        Jenjang SD
                      </h4>
                      <span className="text-[10px] text-muted-foreground">Kelas 3 - 6</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-100/60 text-emerald-800 border-emerald-200 text-[10px]">
                    SD Aktif
                  </Badge>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label
                      htmlFor="sd-quota-input"
                      className="block text-xs font-bold text-[#17181C] mb-1"
                    >
                      Batas Kuota Soal (Maks: {questions.length}):
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sd-quota-input"
                        type="number"
                        min={1}
                        max={questions.length}
                        value={sdQuota}
                        onChange={(e) => setSdQuota(Number(e.target.value))}
                        className="bg-white font-mono font-bold text-sm"
                        required
                      />
                      <span className="text-xs text-muted-foreground font-medium shrink-0">
                        Soal
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="sd-minutes-input"
                      className="block text-xs font-bold text-[#17181C] mb-1"
                    >
                      Estimasi Durasi Pengerjaan:
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sd-minutes-input"
                        type="number"
                        min={1}
                        max={60}
                        value={sdMinutes}
                        onChange={(e) => setSdMinutes(Number(e.target.value))}
                        className="bg-white font-mono text-sm"
                        required
                      />
                      <span className="text-xs text-muted-foreground font-medium shrink-0">
                        Menit
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-emerald-200/50">
                  Siswa SD akan mengisi butir soal urutan nomor <strong>1 s.d. {sdQuota}</strong>.
                </p>
              </div>

              {/* Card SMP */}
              <div className="p-5 rounded-2xl border-2 border-indigo-500/20 bg-indigo-50/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#17181C]">
                        Jenjang SMP
                      </h4>
                      <span className="text-[10px] text-muted-foreground">Kelas 7 - 9</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-indigo-100/60 text-indigo-800 border-indigo-200 text-[10px]">
                    SMP Aktif
                  </Badge>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label
                      htmlFor="smp-quota-input"
                      className="block text-xs font-bold text-[#17181C] mb-1"
                    >
                      Batas Kuota Soal (Maks: {questions.length}):
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="smp-quota-input"
                        type="number"
                        min={sdQuota}
                        max={questions.length}
                        value={smpQuota}
                        onChange={(e) => setSmpQuota(Number(e.target.value))}
                        className="bg-white font-mono font-bold text-sm"
                        required
                      />
                      <span className="text-xs text-muted-foreground font-medium shrink-0">
                        Soal
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="smp-minutes-input"
                      className="block text-xs font-bold text-[#17181C] mb-1"
                    >
                      Estimasi Durasi Pengerjaan:
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="smp-minutes-input"
                        type="number"
                        min={1}
                        max={60}
                        value={smpMinutes}
                        onChange={(e) => setSmpMinutes(Number(e.target.value))}
                        className="bg-white font-mono text-sm"
                        required
                      />
                      <span className="text-xs text-muted-foreground font-medium shrink-0">
                        Menit
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-indigo-200/50">
                  Siswa SMP akan mengisi butir soal urutan nomor <strong>1 s.d. {smpQuota}</strong>.
                </p>
              </div>

              {/* Card SMA */}
              <div className="p-5 rounded-2xl border-2 border-blue-500/20 bg-blue-50/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#17181C]">
                        Jenjang SMA / SMK
                      </h4>
                      <span className="text-[10px] text-muted-foreground">Kelas 10 - 12</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-100/60 text-blue-800 border-blue-200 text-[10px]">
                    SMA Aktif
                  </Badge>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label
                      htmlFor="sma-quota-input"
                      className="block text-xs font-bold text-[#17181C] mb-1"
                    >
                      Batas Kuota Soal (Maks: {questions.length}):
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sma-quota-input"
                        type="number"
                        min={smpQuota}
                        max={questions.length}
                        value={smaQuota}
                        onChange={(e) => setSmaQuota(Number(e.target.value))}
                        className="bg-white font-mono font-bold text-sm"
                        required
                      />
                      <span className="text-xs text-muted-foreground font-medium shrink-0">
                        Soal
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="sma-minutes-input"
                      className="block text-xs font-bold text-[#17181C] mb-1"
                    >
                      Estimasi Durasi Pengerjaan:
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sma-minutes-input"
                        type="number"
                        min={1}
                        max={60}
                        value={smaMinutes}
                        onChange={(e) => setSmaMinutes(Number(e.target.value))}
                        className="bg-white font-mono text-sm"
                        required
                      />
                      <span className="text-xs text-muted-foreground font-medium shrink-0">
                        Menit
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-blue-200/50">
                  Siswa SMA akan mengisi butir soal lengkap nomor <strong>1 s.d. {smaQuota}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan langsung berlaku di halaman pengerjaan soal siswa tanpa perlu restart server.</span>
              </span>
              <Button
                type="submit"
                disabled={isSavingConfig}
                className="bg-[#183058] hover:bg-[#102342] text-white text-xs font-bold"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {isSavingConfig ? 'Menyimpan...' : 'Simpan Pengaturan Jenjang'}
              </Button>
            </div>
          </form>
        </div>

        {/* =========================================================================
            BAGIAN 2: STATISTIK & DISTRIBUSI INDIKATOR VAK
            ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Soal Terbit"
            value={stats.total}
            icon={ClipboardList}
            description="Paket 1 Sensori"
          />
          <StatCard
            label="Kuota Jenjang SD"
            value={`${stats.sd} Soal`}
            icon={GraduationCap}
            description="Target Siswa SD"
          />
          <StatCard
            label="Kuota Jenjang SMP"
            value={`${stats.smp} Soal`}
            icon={GraduationCap}
            description="Target Siswa SMP"
          />
          <StatCard
            label="Opsi Visual [V]"
            value={stats.vCount}
            icon={Eye}
            description="Jalur Penglihatan"
          />
          <StatCard
            label="Opsi Auditori [A]"
            value={stats.aCount}
            icon={Volume2}
            description="Jalur Pendengaran"
          />
          <StatCard
            label="Opsi Kinestetik [K]"
            value={stats.kCount}
            icon={Activity}
            description="Jalur Fisik & Gerak"
          />
        </div>

        {/* =========================================================================
            BAGIAN 3: EDITOR BANK SOAL & DAFTAR SOAL TERBIT
            ========================================================================= */}
        <div className="surface-card p-6 sm:p-8 bg-white border border-border/80 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2 text-[#183058]">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Daftar Butir Soal Terbit
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#17181C]">
                Daftar Pertanyaan &amp; Penanda Jawaban Sensori (VAK)
              </h3>
              <p className="text-xs text-muted-foreground">
                Setiap butir pertanyaan memiliki 3 opsi jawaban yang wajib diberi penanda apakah untuk Visual (V), Auditori (A), atau Kinestetik (K).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Jenjang */}
              <div className="flex items-center gap-1.5 bg-[#F4F6FA] p-1 rounded-xl border border-border/60 text-xs">
                <span className="text-[11px] font-bold text-muted-foreground px-2">Jenjang:</span>
                {(['ALL', 'SD', 'SMP', 'SMA'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevelFilter(lvl)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                      levelFilter === lvl
                        ? 'bg-[#183058] text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lvl === 'ALL' ? 'Semua' : lvl}
                  </button>
                ))}
              </div>

              {/* Filter Modality */}
              <div className="flex items-center gap-1.5 bg-[#F4F6FA] p-1 rounded-xl border border-border/60 text-xs">
                <span className="text-[11px] font-bold text-muted-foreground px-2">Indikator:</span>
                {(['ALL', 'V', 'A', 'K'] as const).map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setModalityFilter(mod)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                      modalityFilter === mod
                        ? 'bg-[#183058] text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {mod === 'ALL' ? 'Semua' : mod === 'V' ? 'Visual' : mod === 'A' ? 'Auditori' : 'Kinestetik'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Cari kata kunci pada teks soal atau opsi jawaban..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs bg-[#F9FAFD]"
            />
          </div>

          {/* List Soal */}
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-muted-foreground/60 mx-auto" />
              <p className="font-semibold text-foreground">Tidak ada butir soal yang cocok dengan kriteria filter.</p>
              <p>Silakan ubah filter jenjang, indikator sensori, atau kata kunci pencarian Anda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl border border-border/80 bg-[#FAFAFC] hover:border-[#183058]/40 transition-colors space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="w-8 h-8 rounded-xl bg-[#183058] text-white font-mono font-extrabold text-xs flex items-center justify-center shrink-0">
                        #{q.number}
                      </span>
                      <span className="text-xs font-bold text-[#183058] uppercase tracking-wider">
                        Soal Nomor {q.number}
                      </span>
                      <div className="flex items-center gap-1">
                        {q.levels.map((lvl) => (
                          <span
                            key={lvl}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              lvl === 'SD'
                                ? 'bg-emerald-100 text-emerald-800'
                                : lvl === 'SMP'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {lvl}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEdit(q)}
                        className="text-xs font-bold text-[#183058] hover:bg-[#E8ECF6] border-border/70"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Edit Soal &amp; Jawaban
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingId(q.id)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-[#17181C] leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* 3 Opsi Jawaban dengan Indikator VAK */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const letter = optIdx === 0 ? 'A' : optIdx === 1 ? 'B' : 'C'
                      const isV = opt.indicator === 'V'
                      const isA = opt.indicator === 'A'
                      const isK = opt.indicator === 'K'

                      return (
                        <div
                          key={opt.id}
                          className={`p-3.5 rounded-xl border text-xs space-y-2 flex flex-col justify-between ${
                            isV
                              ? 'bg-blue-50/40 border-blue-200/70'
                              : isA
                              ? 'bg-amber-50/40 border-amber-200/70'
                              : 'bg-emerald-50/40 border-emerald-200/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-extrabold text-[#17181C] text-xs">
                              Opsi {letter}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                                isV
                                  ? 'bg-blue-600 text-white'
                                  : isA
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {isV ? <Eye className="w-3 h-3" /> : isA ? <Volume2 className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                              <span>{isV ? 'Visual [V]' : isA ? 'Auditori [A]' : isK ? 'Kinestetik [K]' : 'Modality'}</span>
                            </span>
                          </div>
                          <p className="text-xs text-[#333542] leading-relaxed font-medium">
                            {opt.label}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL: EDIT ATAU TAMBAH BUTIR SOAL
          ========================================================================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-[#17181C] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#183058]" />
              <span>{editingQuestion ? `Edit Butir Soal Nomor #${editingQuestion.number}` : 'Tambah Butir Soal Baru'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ubah narasi pertanyaan dan tentukan label jawaban beserta penanda modalitas sensori (Visual, Auditori, Kinestetik).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveQuestion} className="space-y-5 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="form-number-input"
                  className="block text-xs font-bold text-[#17181C] mb-1"
                >
                  Nomor Urut Soal:
                </label>
                <Input
                  id="form-number-input"
                  type="number"
                  min={1}
                  value={formNumber}
                  onChange={(e) => setFormNumber(Number(e.target.value))}
                  className="font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17181C] mb-1">
                  Target Jenjang Siswa yang Mengisi:
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {(['SD', 'SMP', 'SMA'] as const).map((lvl) => {
                    const isChecked = formLevels.includes(lvl)
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleToggleLevel(lvl)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          isChecked
                            ? 'bg-[#183058] text-white border-[#183058]'
                            : 'bg-white text-muted-foreground border-border hover:bg-slate-50'
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
                className="block text-xs font-bold text-[#17181C] mb-1"
              >
                Teks Narasi Soal:
              </label>
              <textarea
                id="form-text-input"
                rows={3}
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="Tuliskan pertanyaan situasi belajar yang mengukur kecenderungan sensori..."
                className="w-full text-xs p-3 rounded-xl border border-border bg-white focus:outline-hidden focus:ring-2 focus:ring-[#183058]/20 focus:border-[#183058]"
                required
              />
            </div>

            {/* Pilihan Jawaban A, B, C */}
            <div className="space-y-4 pt-2 border-t border-border/60">
              <span className="text-xs font-bold text-[#183058] uppercase tracking-wider block">
                3 Pilihan Jawaban &amp; Penanda Indikator (V, A, K)
              </span>

              {/* Opsi A */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#17181C]">Pilihan A</span>
                  <div className="flex items-center gap-1.5">
                    <label
                      htmlFor="select-ind-a"
                      className="text-[11px] font-bold text-muted-foreground"
                    >
                      Indikator:
                    </label>
                    <select
                      id="select-ind-a"
                      value={optAIndicator}
                      onChange={(e) => setOptAIndicator(e.target.value as ModalityIndicator)}
                      aria-label="Indikator Pilihan A"
                      className="text-xs font-bold rounded-lg border border-border bg-white px-2 py-1 text-[#17181C]"
                    >
                      <option value="V">Visual [V] - Penglihatan &amp; Gambar</option>
                      <option value="A">Auditori [A] - Pendengaran &amp; Diskusi</option>
                      <option value="K">Kinestetik [K] - Gerak &amp; Sentuhan</option>
                    </select>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={optALabel}
                  onChange={(e) => setOptALabel(e.target.value)}
                  placeholder="Isi teks pilihan jawaban A..."
                  aria-label="Teks Pilihan A"
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-white"
                  required
                />
              </div>

              {/* Opsi B */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#17181C]">Pilihan B</span>
                  <div className="flex items-center gap-1.5">
                    <label
                      htmlFor="select-ind-b"
                      className="text-[11px] font-bold text-muted-foreground"
                    >
                      Indikator:
                    </label>
                    <select
                      id="select-ind-b"
                      value={optBIndicator}
                      onChange={(e) => setOptBIndicator(e.target.value as ModalityIndicator)}
                      aria-label="Indikator Pilihan B"
                      className="text-xs font-bold rounded-lg border border-border bg-white px-2 py-1 text-[#17181C]"
                    >
                      <option value="V">Visual [V] - Penglihatan &amp; Gambar</option>
                      <option value="A">Auditori [A] - Pendengaran &amp; Diskusi</option>
                      <option value="K">Kinestetik [K] - Gerak &amp; Sentuhan</option>
                    </select>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={optBLabel}
                  onChange={(e) => setOptBLabel(e.target.value)}
                  placeholder="Isi teks pilihan jawaban B..."
                  aria-label="Teks Pilihan B"
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-white"
                  required
                />
              </div>

              {/* Opsi C */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#17181C]">Pilihan C</span>
                  <div className="flex items-center gap-1.5">
                    <label
                      htmlFor="select-ind-c"
                      className="text-[11px] font-bold text-muted-foreground"
                    >
                      Indikator:
                    </label>
                    <select
                      id="select-ind-c"
                      value={optCIndicator}
                      onChange={(e) => setOptCIndicator(e.target.value as ModalityIndicator)}
                      aria-label="Indikator Pilihan C"
                      className="text-xs font-bold rounded-lg border border-border bg-white px-2 py-1 text-[#17181C]"
                    >
                      <option value="V">Visual [V] - Penglihatan &amp; Gambar</option>
                      <option value="A">Auditori [A] - Pendengaran &amp; Diskusi</option>
                      <option value="K">Kinestetik [K] - Gerak &amp; Sentuhan</option>
                    </select>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={optCLabel}
                  onChange={(e) => setOptCLabel(e.target.value)}
                  placeholder="Isi teks pilihan jawaban C..."
                  aria-label="Teks Pilihan C"
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-white"
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-[#183058] hover:bg-[#102342] text-white text-xs font-bold"
              >
                <Save className="w-4 h-4 mr-1.5" />
                Simpan Butir Soal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          MODAL: KONFIRMASI HAPUS
          ========================================================================= */}
      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-[#17181C]">
              Konfirmasi Hapus Butir Soal
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menghapus butir soal ini? Nomor urut soal berikutnya akan disesuaikan secara otomatis.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingId(null)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => deletingId && handleDeleteQuestion(deletingId)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              Ya, Hapus Soal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          MODAL: KONFIRMASI RESET KE DEFAULT
          ========================================================================= */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-[#17181C]">
              Kembalikan ke Default Soal.Md?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tindakan ini akan mereset seluruh bank soal dan batas kuota jenjang (SD: 15, SMP: 20, SMA: 30) kembali ke naskah asli dokumen Soal.Md.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResetConfirmOpen(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleResetToDefaults}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              Ya, Reset ke Default
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
