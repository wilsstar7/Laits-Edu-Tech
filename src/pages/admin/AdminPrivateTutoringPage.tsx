import { Link } from 'react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { useAuth } from '@/hooks/useAuth'
import { privateTutoringService } from '@/services/privateTutoringService'
import { tutorService } from '@/services/tutorService'
import type { PrivateTutoringSettings } from '@/types/payment'
import type { TutorSummary } from '@/types/tutor'
import { formatCurrency } from '@/utils/format'

function TutoringSettingsForm() {
  const [settings, setSettings] = useState<PrivateTutoringSettings>()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    privateTutoringService.getSettings()
      .then((data) => { if (active) setSettings(data) })
      .catch((err: Error) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!settings || saving) return
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await privateTutoringService.saveSettings(settings)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="surface-card rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold">Tarif dan Rekening Perusahaan</h2>
      <p className="mt-1 text-sm text-muted-foreground">Perubahan berlaku untuk tagihan baru.</p>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      {settings ? (
        <form onSubmit={save} className="mt-4 space-y-4">
          <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Tarif per sesi (Rp)</span>
              <Input required type="number" min={1} max={1000000000} step={1} className="min-h-11"
                value={settings.ratePerSession || ''} onChange={(event) => {
                  setSettings({ ...settings, ratePerSession: Number(event.target.value) })
                  setSaved(false)
                }} />
            </label>
            {([
              ['bankName', 'Nama bank'],
              ['accountNumber', 'Nomor rekening'],
              ['accountHolder', 'Nama pemilik rekening'],
            ] as const).map(([key, label]) => (
              <label key={key} className="space-y-1.5 text-sm font-semibold">
                <span>{label}</span>
                <Input required maxLength={key === 'accountNumber' ? 34 : 100}
                  inputMode={key === 'accountNumber' ? 'numeric' : undefined}
                  pattern={key === 'accountNumber' ? '[0-9]{4,34}' : undefined}
                  className="min-h-11" value={settings[key]} onChange={(event) => {
                    setSettings({ ...settings, [key]: event.target.value })
                    setSaved(false)
                  }} />
              </label>
            ))}
          </fieldset>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={saving} className="min-h-11">
              {saving ? 'Menyimpan…' : 'Simpan Pengaturan'}
            </Button>
            {saved && <p role="status" className="text-sm text-muted-foreground">Pengaturan tersimpan.</p>}
          </div>
        </form>
      ) : !error && <p role="status" className="mt-3 text-sm text-muted-foreground">Memuat pengaturan…</p>}
    </section>
  )
}

type PaidPayment = Awaited<ReturnType<typeof privateTutoringService.listPaidPayments>>['payments'][number]

function TutorAssignment({ payment, tutors }: { payment: PaidPayment; tutors: TutorSummary[] }) {
  const [assignedId, setAssignedId] = useState(payment.assigned_tutor_id ?? '')
  const [selectedId, setSelectedId] = useState(assignedId)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function assign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedId || saving) return
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await privateTutoringService.assignTutor(payment.id, selectedId)
      setAssignedId(selectedId)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menetapkan tutor.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className="grid gap-4 border-b border-border py-4 last:border-b-0 md:grid-cols-2">
      <div className="min-w-0 space-y-1">
        <h3 className="break-words font-semibold">{payment.student?.full_name ?? 'Siswa'}</h3>
        <p className="text-sm text-muted-foreground">{payment.monthly_subject_name && `${payment.monthly_subject_name} · `}{payment.monthly_session_count} sesi · {formatCurrency(payment.amount)}</p>
        <p className="break-words text-sm text-muted-foreground">Usulan tutor: {payment.requested_tutor_name || 'Tidak ada'}</p>
      </div>
      <form onSubmit={assign} className="space-y-2">
        <label htmlFor={payment.id} className="text-sm font-semibold">Tutor pengajar</label>
        <div className="flex flex-wrap gap-2">
          <NativeSelect id={payment.id} className="min-h-11 max-w-full"
            value={selectedId} disabled={saving}
            onChange={(event) => { setSelectedId(event.target.value); setSaved(false) }}>
            <option value="">Pilih tutor</option>
            {assignedId && !tutors.some((tutor) => tutor.id === assignedId) && (
              <option value={assignedId}>{payment.assignedTutor?.profile?.full_name ?? 'Tutor saat ini'}</option>
            )}
            {tutors.map((tutor) => <option key={tutor.id} value={tutor.id}>{tutor.fullName}</option>)}
          </NativeSelect>
          <Button type="submit" className="min-h-11" disabled={saving || !selectedId || selectedId === assignedId}>
            {saving ? 'Menyimpan…' : 'Tetapkan Tutor'}
          </Button>
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {saved && <p role="status" className="text-sm text-muted-foreground">Tutor ditetapkan.</p>}
      </form>
    </li>
  )
}

async function listActiveTutors() {
  const tutors: TutorSummary[] = []
  for (let page = 1; ; page++) {
    const result = await tutorService.listTutors({ page, limit: 100 })
    tutors.push(...result.tutors)
    if (!result.hasMore) return tutors.sort((a, b) => a.fullName.localeCompare(b.fullName, 'id'))
  }
}

export function AdminPrivateTutoringPage() {
  const { role } = useAuth()
  const [page, setPage] = useState(1)
  const [tutors, setTutors] = useState<TutorSummary[]>([])
  const [result, setResult] = useState<{ page: number; payments: PaidPayment[]; pageCount: number }>()
  const [error, setError] = useState<{ page: number; message: string }>()

  useEffect(() => {
    let active = true
    listActiveTutors().then((data) => { if (active) setTutors(data) })
      .catch((err: Error) => { if (active) setError({ page, message: err.message }) })
    privateTutoringService.listPaidPayments(page)
      .then((data) => { if (active) setResult({ ...data, page }) })
      .catch((err: Error) => { if (active) setError({ page, message: err.message }) })
    return () => { active = false }
  }, [page])

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Program Les Privat" subtitle="Tetapkan tutor untuk siswa yang sudah melunasi tagihan bulanan." />
        {role === 'super_admin' && (
          <>
            <TutoringSettingsForm />
            <Button asChild variant="outline" className="min-h-11">
              <Link to="/admin/subjects">Kelola Pilihan Mata Pelajaran</Link>
            </Button>
          </>
        )}
        <section className="surface-card rounded-2xl border border-border bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold">Penetapan Tutor</h2>
          {error?.page === page && <p role="alert" className="mt-3 text-sm text-destructive">{error.message}</p>}
          {result?.page === page ? (
            result.payments.length ? (
              <ul>{result.payments.map((payment) => <TutorAssignment key={payment.id} payment={payment} tutors={tutors} />)}</ul>
            ) : <p className="mt-3 text-sm text-muted-foreground">Belum ada tagihan bulanan yang lunas di halaman ini.</p>
          ) : error?.page !== page && <p role="status" className="mt-3 text-sm text-muted-foreground">Memuat tagihan…</p>}
          {((result?.pageCount ?? 0) > 1 || page > 1) && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)} className="min-h-11">Sebelumnya</Button>
              <span className="text-sm">Halaman {page}</span>
              <Button variant="outline" disabled={page >= (result?.pageCount ?? 0)} onClick={() => setPage(page + 1)} className="min-h-11">Berikutnya</Button>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
