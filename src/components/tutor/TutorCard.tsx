import { Link } from 'react-router'
import { Star, CheckCircle, ArrowRight, Clock, Calendar } from 'lucide-react'
import type { TutorSummary } from '@/types/tutor'
import { getInitials, formatCurrency } from '@/utils/format'
import { TutorMatchBadge } from './TutorMatchBadge'
import { Button } from '@/components/ui/button'

interface TutorCardProps {
  tutor: TutorSummary
  onBook?: (tutor: TutorSummary) => void
}

export function TutorCard({ tutor, onBook }: TutorCardProps) {
  const initials = getInitials(tutor.fullName)

  return (
    <div className="surface-card p-6 bg-white border border-border rounded-2xl flex flex-col justify-between gap-5 hover:border-[#6C5CE7]/30 transition-all">
      <div className="space-y-4">
        {/* Header: Avatar, Name, Rating, Match Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {tutor.avatarUrl ? (
              <img
                src={tutor.avatarUrl}
                alt={tutor.fullName}
                className="w-12 h-12 rounded-2xl object-cover border border-border"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center font-extrabold text-sm border border-[#6C5CE7]/20">
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-[#17181C] leading-snug">
                  {tutor.fullName}
                </h3>
                {tutor.isVerified && (
                  <CheckCircle className="w-4 h-4 text-[#45B97C] shrink-0" aria-label="Tutor Terverifikasi" />
                )}
              </div>
              <p className="text-xs text-[#676A78] line-clamp-1 mt-0.5">
                {tutor.headline || tutor.educationBackground || 'Pendidik Les Privat'}
              </p>
            </div>
          </div>

          {tutor.matchScore && (
            <TutorMatchBadge score={tutor.matchScore} reasons={tutor.matchReasons} />
          )}
        </div>

        {/* Subjects taught */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tutor.subjects.map((sub) => (
            <span
              key={sub.id}
              className="px-2.5 py-0.5 rounded-lg bg-[#F4F5FB] text-[#17181C] text-[11px] font-semibold border border-border/80"
            >
              {sub.name}
            </span>
          ))}
          {tutor.subjects.length === 0 && (
            <span className="text-xs text-[#676A78]">Pelajaran umum</span>
          )}
        </div>

        {/* Bio excerpt */}
        {tutor.bio && (
          <p className="text-xs text-[#676A78] leading-relaxed line-clamp-2">
            {tutor.bio}
          </p>
        )}

        {/* Key Metrics: Rating, Experience, Hourly rate */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs text-[#333542]">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-[#F2B84B] fill-[#F2B84B]" />
            <span className="font-bold text-[#17181C]">
              {tutor.rating > 0 ? tutor.rating.toFixed(1) : 'Belum ada ulasan'}
            </span>
            {tutor.totalReviews > 0 && (
              <span className="text-[#676A78]">({tutor.totalReviews})</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 justify-end">
            <Clock className="w-3.5 h-3.5 text-[#676A78]" />
            <span className="text-[#676A78]">
              {tutor.experienceYears > 0
                ? `${tutor.experienceYears} tahun pengalaman`
                : 'Pengajar baru'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Price and CTA buttons */}
      <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-[#676A78]">Biaya Sesi</div>
          <div className="font-extrabold text-sm sm:text-base text-[#17181C]">
            {formatCurrency(tutor.hourlyRate)}
            <span className="text-xs font-normal text-[#676A78]"> / jam</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBook && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onBook(tutor)}
              className="font-bold text-xs min-h-[44px] px-3 gap-1.5 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Pesan Sesi</span>
            </Button>
          )}
          <Button asChild size="sm" className="font-bold text-xs min-h-[44px] px-4">
            <Link to={`/student/tutors/${tutor.id}`}>
              <span>Lihat Profil</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
