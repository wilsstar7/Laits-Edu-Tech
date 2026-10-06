import { Link } from 'react-router'
import { Compass, Sparkles, BookOpen, MessageSquare, ArrowRight, Brain } from 'lucide-react'
import type { LearningProfileOverview } from '@/types/learning'
import { Button } from '@/components/ui/button'

interface LearningProfileCardProps {
  profile: LearningProfileOverview
}

export function LearningProfileCard({ profile }: LearningProfileCardProps) {
  if (!profile.hasResult) {
    return (
      <div className="surface-card p-6 sm:p-8 bg-gradient-to-br from-white via-white to-[#EFEDFD]/40 border border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-[#6C5CE7]">
              <Brain className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Profil Karakter Belajar
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#17181C]">
              Temukan Gaya Belajar Personal Anda
            </h2>
            <p className="text-xs sm:text-sm text-[#676A78] leading-relaxed">
              Anda belum menyelesaikan asesmen karakter belajar. Selesaikan kuesioner singkat untuk membuka rekomendasi metode belajar, mata pelajaran, dan karakteristik tutor yang paling sesuai.
            </p>
          </div>
          <Button asChild size="default" className="shrink-0 min-h-[44px]">
            <Link to="/student/assessment" className="flex items-center gap-2 font-bold">
              <span>Ambil Asesmen Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="surface-card p-6 sm:p-8 bg-white border border-border space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#6C5CE7]" />
            <span className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider">
              Profil Belajar Anda
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17181C] tracking-tight mt-1">
            {profile.personalityName}
          </h2>
          <p className="text-xs text-[#676A78] mt-1 max-w-2xl leading-relaxed">
            {profile.description}
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="self-start sm:self-center shrink-0 min-h-[42px]">
          <Link to="/student/personality" className="flex items-center gap-1.5 font-bold text-xs">
            <span>Lihat Hasil Asesmen Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#6C5CE7]" />
          </Link>
        </Button>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gaya Belajar */}
        <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/80 space-y-1.5">
          <div className="flex items-center gap-2 text-[#6C5CE7]">
            <BookOpen className="w-4 h-4" />
            <h3 className="text-xs font-bold text-[#17181C]">Gaya Belajar Utama</h3>
          </div>
          <p className="text-xs text-[#676A78] leading-relaxed">
            {profile.learningStyle || 'Eksploratif dan Berbasis Masalah'}
          </p>
        </div>

        {/* Motivasi */}
        <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/80 space-y-1.5">
          <div className="flex items-center gap-2 text-[#6C5CE7]">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-xs font-bold text-[#17181C]">Faktor Motivasi</h3>
          </div>
          <p className="text-xs text-[#676A78] leading-relaxed">
            {profile.motivation || 'Memahami relevansi materi dalam konteks nyata'}
          </p>
        </div>

        {/* Komunikasi */}
        <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/80 space-y-1.5">
          <div className="flex items-center gap-2 text-[#6C5CE7]">
            <MessageSquare className="w-4 h-4" />
            <h3 className="text-xs font-bold text-[#17181C]">Gaya Komunikasi</h3>
          </div>
          <p className="text-xs text-[#676A78] leading-relaxed">
            {profile.communicationStyle || 'Dialogis, terbuka, dan suka bertanya'}
          </p>
        </div>
      </div>
    </div>
  )
}
