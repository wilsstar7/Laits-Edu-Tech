import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import type { LearningProfileOverview } from '@/types/learning'
import { Button } from '@/components/ui/button'

export function LearningProfileCard({ profile }: { profile: LearningProfileOverview | null }) {
  if (!profile?.hasResult) {
    return (
      <section className="space-y-3 rounded-xl border border-border bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-ink-primary">Kenali Cara Belajar Anda</h2>
        <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
          Ikuti asesmen kepribadian untuk mendapat rekomendasi metode dan mata pelajaran.
        </p>
        <Button asChild className="min-h-11 rounded-lg">
          <Link to="/student/assessment">Mulai Asesmen <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </Button>
      </section>
    )
  }

  const details = [
    ['Gaya belajar', profile.learningStyle === profile.personalityName ? null : profile.learningStyle],
    ['Motivasi', profile.motivation],
    ['Komunikasi', profile.communicationStyle],
  ].filter(([, value]) => Boolean(value))

  return (
    <section className="min-w-0 rounded-xl border border-border bg-white p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-brand-primary">Profil Belajar</h2>
      <p className="mt-2 wrap-break-word text-xl font-bold tracking-tight text-ink-primary">{profile.personalityName}</p>
      {profile.description && <p className="mt-2 text-sm leading-relaxed text-ink-muted">{profile.description}</p>}
      {details.length > 0 && (
        <dl className="mt-4 divide-y divide-border border-t border-border">
          {details.map(([label, value]) => (
            <div key={label} className="grid gap-1 py-2.5 text-sm sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
              <dt className="font-semibold text-ink-primary">{label}</dt>
              <dd className="wrap-break-word text-ink-muted">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild variant="outline" className="min-h-11 rounded-lg">
          <Link to="/student/personality">Lihat Hasil Asesmen <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </Button>
        <Button asChild variant="ghost" className="min-h-11 rounded-lg">
          <Link to="/student/tutors">Lihat Tutor</Link>
        </Button>
      </div>
    </section>
  )
}
