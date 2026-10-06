import { useState, useEffect } from 'react'
import { X, UserPlus, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { adminService, type CreateTutorPayload } from '@/services/adminService'
import { subjectService, type SubjectSummary } from '@/services/subjectService'
import { getErrorMessage } from '@/utils/errors'

interface AdminCreateTutorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AdminCreateTutorModal({ isOpen, onClose, onSuccess }: AdminCreateTutorModalProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [hourlyRate, setHourlyRate] = useState('100000')
  const [education, setEducation] = useState('')
  const [bio, setBio] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<SubjectSummary[]>([])

  const [loading, setLoading] = useState(false)
  const [fetchingSubjects, setFetchingSubjects] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFetchingSubjects(true)
      subjectService
        .listActiveSubjects()
        .then((res) => setAvailableSubjects(res))
        .catch(() => setAvailableSubjects([]))
        .finally(() => setFetchingSubjects(false))
    } else {
      // Reset form
      setFullName('')
      setEmail('')
      setPassword('')
      setPhone('')
      setHourlyRate('100000')
      setEducation('')
      setBio('')
      setSelectedSubjects([])
    }
  }, [isOpen])

  if (!isOpen) return null

  const toggleSubject = (subId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      toast.error('Nama lengkap tutor wajib diisi.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Email tutor valid wajib diisi.')
      return
    }
    if (!password || password.length < 6) {
      toast.error('Password awal minimal 6 karakter.')
      return
    }

    setLoading(true)
    try {
      const payload: CreateTutorPayload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        hourlyRate: Number(hourlyRate) || 100000,
        education: education.trim() || undefined,
        bio: bio.trim() || undefined,
        subjectIds: selectedSubjects,
      }

      await adminService.createTutor(payload)
      toast.success(`Akun tutor "${fullName}" berhasil dibuat!`)
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal membuat akun tutor.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-3xl shadow-2xl border border-border w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border/80 flex items-center justify-between shrink-0 bg-[#F9FAFD]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#17181C]">Buat Akun Tutor Baru</h3>
              <p className="text-xs text-muted-foreground">
                Daftarkan akun tutor resmi dengan hak akses portal pengajar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-foreground mb-1.5">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1.5">
                Email Akun Tutor <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tutor@laits.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-foreground mb-1.5">
                Password Awal <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all bg-white"
              />
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Berikan password ini kepada tutor untuk login pertama kali.
              </span>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1.5">No. WhatsApp / HP</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-foreground mb-1.5">Tarif per Jam (IDR)</label>
              <input
                type="number"
                min={0}
                step={5000}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="100000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1.5">Pendidikan / Almamater</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Contoh: S1 Matematika UI / LIPIA Jakarta"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1.5">Bio & Keahlian Mengajar</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Jelaskan pengalaman mengajar, metode, dan latar belakang tutor..."
              className="w-full px-3.5 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all bg-white resize-none"
            />
          </div>

          {/* Subject Assignment */}
          <div>
            <label className="block font-bold text-foreground mb-1.5">
              Mata Pelajaran yang Diajarkan
            </label>
            {fetchingSubjects ? (
              <div className="py-3 text-center text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6C5CE7]" />
                <span>Memuat mata pelajaran...</span>
              </div>
            ) : availableSubjects.length === 0 ? (
              <p className="text-muted-foreground italic">Belum ada data mata pelajaran.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 border border-border/60 rounded-xl bg-[#F9FAFD]">
                {availableSubjects.map((sub) => {
                  const isChecked = selectedSubjects.includes(sub.id)
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleSubject(sub.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all border cursor-pointer ${
                        isChecked
                          ? 'bg-[#EFEDFD] border-[#6C5CE7] text-[#6C5CE7] font-bold shadow-xs'
                          : 'bg-white border-border/80 text-foreground hover:bg-white/80'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                          isChecked ? 'bg-[#6C5CE7] border-[#6C5CE7] text-white' : 'border-border'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="truncate text-[11px]">{sub.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-[#EEF0F8] transition-colors font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#6C5CE7] text-white hover:bg-[#5243D6] transition-colors font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Simpan & Buat Akun Tutor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
