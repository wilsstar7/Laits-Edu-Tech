import { Check } from 'lucide-react'

interface StudyMethodsSectionProps {
  methods: string[]
  strengths: string[]
}

export function StudyMethodsSection({ methods, strengths }: StudyMethodsSectionProps) {
  if (methods.length === 0 && strengths.length === 0) return null

  return (
    <section className="min-w-0 rounded-xl border border-border bg-[#F4F6FA] p-5 sm:p-6">
      <h2 className="text-lg font-bold text-ink-primary">Cara Belajar yang Disarankan</h2>
      {methods.length > 0 && (
        <ul className="mt-2 divide-y divide-border">
          {methods.map((method, index) => (
            <li key={index} className="flex items-start gap-2.5 py-2.5 text-sm leading-relaxed text-ink-secondary">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-primary" />
              <span className="min-w-0 wrap-break-word">{method}</span>
            </li>
          ))}
        </ul>
      )}
      {strengths.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <h3 className="text-sm font-semibold text-ink-primary">Kekuatan Belajar</h3>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-ink-muted">
            {strengths.map((strength, index) => <li key={index}>{strength}</li>)}
          </ul>
        </div>
      )}
    </section>
  )
}
