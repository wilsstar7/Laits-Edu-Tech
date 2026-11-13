import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { subjectService, type SubjectSummary } from '@/services/subjectService'
import { privateTutoringService } from '@/services/privateTutoringService'
import { formatCurrency } from '@/utils/format'

export function MonthlyTutoringForm() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<SubjectSummary[]>()
  const [subjectId, setSubjectId] = useState('')
  const [rate, setRate] = useState<number>()
  const [sessionCount, setSessionCount] = useState('4')
  const [tutorName, setTutorName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const request = useRef<{ id: string; count: string; tutorName: string; rate: number; subjectId: string }>(null)

  useEffect(() => {
    let active = true
    Promise.all([privateTutoringService.getSettings(), subjectService.listActiveSubjects()])
      .then(([settings, activeSubjects]) => {
        if (!active) return
        setRate(settings.ratePerSession)
        setSubjects(activeSubjects)
      })
      .catch((err: Error) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!rate || !subjectId || !validCount || submitting) return
    const previous = request.current
    const id = previous?.count === sessionCount && previous.tutorName === tutorName && previous.rate === rate && previous.subjectId === subjectId
      ? previous.id
      : crypto.randomUUID()
    request.current = { id, count: sessionCount, tutorName, rate, subjectId }
    setSubmitting(true)
    setError('')
    try {
      const paymentId = await privateTutoringService.createPayment(Number(sessionCount), tutorName, id, rate, subjectId)
      navigate(`/student/payments/${paymentId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat tagihan.')
    } finally {
      setSubmitting(false)
    }
  }

  const count = Number(sessionCount)
  const validCount = Number.isInteger(count) && count >= 1 && count <= 31

  return (
    <section id="program-les-privat" className="surface-card rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold">Program Les Privat Bulanan</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pilih mata pelajaran dan jumlah sesi untuk satu bulan. Tim ZEINBOX akan menetapkan tutor setelah pembayaran diverifikasi.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,12rem)_minmax(0,1fr)]">
          <label className="space-y-1.5 text-sm font-semibold">
            <span>Mata pelajaran</span>
            <NativeSelect className="min-h-11 w-full" required value={subjectId}
              disabled={!subjects?.length || submitting} onChange={(event) => setSubjectId(event.target.value)}>
              <option value="">{subjects ? 'Pilih mata pelajaran' : error ? 'Daftar tidak tersedia' : 'Memuat mata pelajaran…'}</option>
              {subjects?.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </NativeSelect>
          </label>
          <label className="space-y-1.5 text-sm font-semibold">
            <span>Jumlah sesi per bulan</span>
            <Input type="number" min={1} max={31} step={1} required value={sessionCount}
              onChange={(event) => setSessionCount(event.target.value)} disabled={submitting} className="min-h-11" />
          </label>
          <label className="space-y-1.5 text-sm font-semibold">
            <span>Usulan nama tutor (opsional)</span>
            <Input value={tutorName} maxLength={100} onChange={(event) => setTutorName(event.target.value)}
              disabled={submitting} className="min-h-11" />
          </label>
        </div>
        {subjects?.length === 0 && <p className="text-sm text-muted-foreground">Belum ada mata pelajaran aktif. Hubungi admin untuk membuat tagihan.</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
          {rate && (
            <div>
              <p className="text-sm text-muted-foreground">{formatCurrency(rate)} per sesi</p>
              <p className="font-bold" aria-live="polite">
                Total {validCount ? formatCurrency(rate * count) : '—'}
              </p>
            </div>
          )}
          <Button type="submit" className="min-h-11" disabled={!rate || !subjectId || !validCount || submitting}>
            {submitting ? 'Membuat tagihan…' : 'Buat Tagihan'}
          </Button>
        </div>
      </form>
    </section>
  )
}
