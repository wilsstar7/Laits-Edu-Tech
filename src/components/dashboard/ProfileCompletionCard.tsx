import { Link } from 'react-router'
import { UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getStudentProfileCompletion } from '@/utils/profileCompletion'

export function ProfileCompletionCard() {
  const { profile, account } = useAuth()
  if (!profile) return null

  const completion = getStudentProfileCompletion(profile, account?.studentProfile ?? null)

  if (completion.percent >= 100) {
    return (
      <div className="surface-card p-4 sm:p-5 bg-white border border-[#45B97C]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#E6F6EE] text-[#45B97C] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-[#17181C]">Profil Siswa 100% Lengkap</h4>
            <p className="text-xs text-[#676A78]">
              Data akademik dan nomor kontak wali murid sudah terisi lengkap.
            </p>
          </div>
        </div>
        <Link
          to="/student/settings"
          className="min-h-[44px] inline-flex items-center text-xs font-bold text-[#45B97C] hover:underline shrink-0"
        >
          Perbarui Profil
        </Link>
      </div>
    )
  }

  return (
    <div className="surface-card p-4 sm:p-6 bg-white border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
      <div className="space-y-2.5 max-w-xl min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-[#E8ECF6] text-[#183058] flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#17181C]">
            Kelengkapan Data Profil: {completion.percent}%
          </h4>
        </div>

        <p className="text-xs text-[#676A78] leading-relaxed">
          Lengkapi data sekolah, jenjang kelas, dan kontak orang tua untuk memaksimalkan rekomendasi materi belajar dan mempermudah koordinasi tutor.
        </p>

        <div className="w-full sm:w-72 h-2.5 bg-[#ECF0F7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#183058] rounded-full transition-all duration-300"
            style={{ width: `${completion.percent}%` }}
          />
        </div>

        {completion.missing.length > 0 && (
          <p className="text-xs text-[#676A78] flex items-start sm:items-center gap-1.5 pt-0.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#F2B84B] shrink-0 mt-0.5 sm:mt-0" />
            <span>Belum diisi: {completion.missing.slice(0, 3).join(', ')}{completion.missing.length > 3 ? '...' : ''}</span>
          </p>
        )}
      </div>

      <div className="shrink-0">
        <Link
          to="/student/settings"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#183058] text-white text-xs font-bold hover:bg-[#102342] active:scale-[0.98] transition-colors min-h-[44px] w-full md:w-auto"
        >
          Lengkapi Profil
        </Link>
      </div>
    </div>
  )
}
