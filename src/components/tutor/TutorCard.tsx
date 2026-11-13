import { Link } from 'react-router'
import { ArrowUpRight, CheckCircle, Clock, Star } from 'lucide-react'
import type { TutorSummary } from '@/types/tutor'
import { getInitials } from '@/utils/format'
import { TutorMatchBadge } from './TutorMatchBadge'

export function TutorCard({ tutor }: { tutor: TutorSummary }) {
  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-border bg-white transition-colors hover:border-brand-primary/40 focus-within:border-brand-primary/40">
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {tutor.avatarUrl ? (
            <img src={tutor.avatarUrl} alt="" loading="lazy" className="size-12 shrink-0 rounded-lg object-cover" />
          ) : (
            <div aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#E8ECF6] text-sm font-bold text-brand-primary">
              {getInitials(tutor.fullName)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="flex items-start gap-1.5 text-base leading-snug font-bold text-ink-primary">
              <span className="min-w-0 wrap-break-word">{tutor.fullName}</span>
              {tutor.isVerified && <CheckCircle aria-label="Tutor terverifikasi" className="mt-0.5 size-4 shrink-0 text-emerald-700" />}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
              {tutor.headline || tutor.educationBackground || 'Pendidik Les Privat'}
            </p>
          </div>
        </div>

        <div className="flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-secondary">
          {tutor.subjects.length ? tutor.subjects.map((subject) => (
            <span key={subject.id} className="max-w-full wrap-break-word rounded bg-surface px-2 py-1">{subject.name}</span>
          )) : <span className="text-ink-muted">Mata pelajaran belum dicantumkan</span>}
        </div>

        {tutor.bio && <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">{tutor.bio}</p>}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Star aria-hidden="true" className="size-4 shrink-0 text-amber-700" />
            {tutor.rating > 0 ? `${tutor.rating.toFixed(1)} (${tutor.totalReviews} ulasan)` : 'Belum ada ulasan'}
          </span>
          {tutor.experienceYears > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden="true" className="size-4 shrink-0 text-ink-muted" />
              {tutor.experienceYears} tahun pengalaman
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-2 border-t border-border px-4 sm:px-5">
        <TutorMatchBadge score={tutor.matchScore} reasons={tutor.matchReasons} />
        <Link to={`/student/tutors/${tutor.id}`} aria-label={`Lihat profil ${tutor.fullName}`}
          className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-semibold text-brand-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
          Lihat Profil <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  )
}
