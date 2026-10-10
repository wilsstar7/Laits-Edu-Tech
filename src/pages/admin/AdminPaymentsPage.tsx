import { useState, useEffect, useMemo } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PaymentStatusBadge } from '@/components/payment/PaymentStatusBadge'
import { paymentService } from '@/services/paymentService'
import type { Payment } from '@/types/payment'
import { formatCurrency, formatReportDate } from '@/utils/format'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Search,
  RefreshCw,
  Clock,
  Wallet,
  Building2,
  User,
  GraduationCap,
  BookOpen,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function AdminPaymentsPage() {
  const { role } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Proof Modal
  const [activeProofPayment, setActiveProofPayment] = useState<Payment | null>(null)

  // Reject Reason Modal
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const loadPendingPayments = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)
    try {
      const data = await paymentService.getPendingVerifications()
      setPayments(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat antrean verifikasi pembayaran.'
      setError(msg)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    paymentService
      .getPendingVerifications()
      .then((data) => {
        if (isMounted) setPayments(data)
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Gagal memuat antrean verifikasi pembayaran.'
          setError(msg)
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleApprove = async (paymentId: string) => {
    setIsProcessing(true)
    try {
      await paymentService.verifyPayment(paymentId, 'approve')
      await loadPendingPayments()
      setActiveProofPayment(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyetujui pembayaran.'
      setError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectingPayment) return
    setIsProcessing(true)
    try {
      await paymentService.verifyPayment(
        rejectingPayment.id,
        'reject',
        rejectReason.trim() || undefined
      )
      setRejectingPayment(null)
      setRejectReason('')
      if (activeProofPayment?.id === rejectingPayment.id) {
        setActiveProofPayment(null)
      }
      await loadPendingPayments()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menolak pembayaran.'
      setError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  // Real queue summary calculations (no invented metrics)
  const totalPendingAmount = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  }, [payments])

  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments
    const q = searchQuery.toLowerCase().trim()
    return payments.filter((p) => {
      const invoiceMatch = p.invoice?.invoiceNumber?.toLowerCase().includes(q)
      const studentMatch = p.studentName?.toLowerCase().includes(q)
      const emailMatch = p.studentEmail?.toLowerCase().includes(q)
      const tutorMatch = p.tutorName?.toLowerCase().includes(q)
      const subjectMatch = p.subjectName?.toLowerCase().includes(q)
      return invoiceMatch || studentMatch || emailMatch || tutorMatch || subjectMatch
    })
  }, [payments, searchQuery])

  if (role !== 'super_admin') {
    return (
      <AppShell>
        <div className="surface-card p-10 bg-white border border-border rounded-xl text-center space-y-3 max-w-lg mx-auto mt-12">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Akses Terbatas: Khusus Super Admin
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Verifikasi transfer manual hanya dapat diproses oleh Super Administrator. Hubungi Super Admin jika terdapat bukti transaksi yang perlu ditinjau.
          </p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Verifikasi Pembayaran Manual"
          subtitle="Antrean bukti transfer siswa via rekening BSI untuk verifikasi dan konfirmasi booking sesi bimbingan."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPendingPayments(true)}
              disabled={isLoading || isRefreshing}
              className="min-h-[40px] gap-2 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Segarkan Antrean</span>
            </Button>
          }
        />

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Queue Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-border/80 rounded-xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground">Menunggu Verifikasi</div>
              <div className="text-lg font-bold text-foreground tracking-tight">
                {isLoading ? (
                  <Skeleton className="h-6 w-12 mt-1" />
                ) : (
                  `${payments.length} transaksi`
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-border/80 rounded-xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground">Total Nominal Antrean</div>
              <div className="text-lg font-bold text-foreground tracking-tight">
                {isLoading ? (
                  <Skeleton className="h-6 w-24 mt-1" />
                ) : (
                  formatCurrency(totalPendingAmount)
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-border/80 rounded-xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground">Rekening Penampung</div>
              <div className="text-xs font-bold text-foreground">
                Bank Syariah Indonesia (BSI)
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                Manual Transfer Verifier
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-border/80 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor invoice, nama siswa, atau tutor..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-border/70 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-colors"
            />
          </div>

          <div className="text-xs text-muted-foreground flex items-center justify-between sm:justify-end gap-2 px-1">
            <span>
              Menampilkan <span className="font-semibold text-foreground">{filteredPayments.length}</span> dari {payments.length} antrean
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-primary hover:underline font-semibold ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="bg-white border border-border rounded-xl p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Antrean Verifikasi Kosong
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Tidak ada bukti transfer yang menunggu verifikasi saat ini. Setiap bukti baru yang diunggah siswa akan langsung muncul di daftar ini.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPendingPayments(true)}
              className="min-h-[40px] text-xs font-semibold gap-1.5 mt-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Cek Pembayaran Baru</span>
            </Button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-8 text-center space-y-2">
            <h4 className="text-sm font-bold text-foreground">Tidak Ada Hasil Ditemukan</h4>
            <p className="text-xs text-muted-foreground">
              Tidak ada pembayaran yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="min-h-[38px] text-xs mt-2"
            >
              Hapus Filter Pencarian
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Ledger Table */}
            <div className="hidden md:block bg-white border border-border rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-auto scrollbar-thin">
                <table className="w-full text-left text-xs min-w-[940px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-border text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                      <th className="py-3 px-3.5 whitespace-nowrap">Invoice & Waktu</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">Siswa</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">Bimbingan & Tutor</th>
                      <th className="py-3 px-3.5 text-right whitespace-nowrap">Nominal Transfer</th>
                      <th className="py-3 px-3.5 text-center whitespace-nowrap">Status</th>
                      <th className="py-3 px-3.5 text-right whitespace-nowrap">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-3.5 align-top whitespace-nowrap">
                          <div className="font-mono text-xs font-bold text-primary">
                            {p.invoice?.invoiceNumber || `#${p.id.slice(0, 8)}`}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {formatReportDate(p.createdAt)}
                          </div>
                        </td>

                        <td className="py-3.5 px-3.5 align-top">
                          <div className="font-semibold text-foreground flex items-center gap-1.5 whitespace-nowrap">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{p.studentName}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                            {p.studentEmail || '-'}
                          </div>
                        </td>

                        <td className="py-3.5 px-3.5 align-top">
                          <div className="font-medium text-foreground flex items-center gap-1.5 whitespace-nowrap">
                            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{p.subjectName}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 whitespace-nowrap">
                            <GraduationCap className="w-3 h-3" />
                            <span>Tutor: {p.tutorName}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3.5 align-top text-right whitespace-nowrap">
                          <div className="font-bold text-foreground text-sm">
                            {formatCurrency(p.amount)}
                          </div>
                          <div className="text-[10px] text-muted-foreground">Transfer BSI</div>
                        </td>

                        <td className="py-3.5 px-3.5 align-top text-center whitespace-nowrap">
                          <PaymentStatusBadge status={p.status} />
                        </td>

                        <td className="py-3.5 px-3.5 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveProofPayment(p)}
                              className="h-8 px-2.5 text-xs font-semibold gap-1 text-slate-700 hover:text-primary hover:border-primary/50"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat Bukti</span>
                            </Button>

                            <Button
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleApprove(p.id)}
                              className="h-8 px-2.5 text-xs font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => setRejectingPayment(p)}
                              className="h-8 px-2.5 text-xs font-semibold gap-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-3">
              {filteredPayments.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-border rounded-xl p-4 space-y-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono text-xs font-bold text-primary">
                        {p.invoice?.invoiceNumber || `#${p.id.slice(0, 8)}`}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatReportDate(p.createdAt)}
                      </div>
                    </div>
                    <PaymentStatusBadge status={p.status} />
                  </div>

                  <div className="bg-slate-50/70 rounded-lg p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-muted-foreground text-[11px]">Siswa:</span>
                      <span className="font-semibold text-foreground text-right">{p.studentName}</span>
                    </div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-muted-foreground text-[11px]">Bimbingan:</span>
                      <span className="text-foreground text-right font-medium">{p.subjectName} ({p.tutorName})</span>
                    </div>
                    <div className="flex justify-between items-baseline gap-2 pt-1 border-t border-border/50">
                      <span className="text-muted-foreground text-[11px]">Nominal:</span>
                      <span className="font-bold text-sm text-foreground">{formatCurrency(p.amount)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveProofPayment(p)}
                      className="min-h-[44px] gap-1 text-xs font-semibold px-2"
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span>Bukti</span>
                    </Button>

                    <Button
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleApprove(p.id)}
                      className="min-h-[44px] gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Setujui</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => setRejectingPayment(p)}
                      className="min-h-[44px] gap-1 text-xs font-semibold text-rose-600 border-rose-300 hover:bg-rose-50 px-2"
                    >
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Tolak</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Proof Inspection Modal */}
        {activeProofPayment && (
          <Dialog
            open={!!activeProofPayment}
            onOpenChange={(open: boolean) => !open && setActiveProofPayment(null)}
          >
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Pemeriksaan Bukti Transfer</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Invoice {activeProofPayment.invoice?.invoiceNumber || `#${activeProofPayment.id.slice(0, 8)}`} oleh {activeProofPayment.studentName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-1">
                {/* Meta Summary Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-border/80 rounded-lg p-2.5 text-[11px]">
                  <div>
                    <div className="text-muted-foreground">Nominal</div>
                    <div className="font-bold text-foreground text-xs">{formatCurrency(activeProofPayment.amount)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Mata Pelajaran</div>
                    <div className="font-medium text-foreground truncate">{activeProofPayment.subjectName}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tutor</div>
                    <div className="font-medium text-foreground truncate">{activeProofPayment.tutorName}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tanggal Unggah</div>
                    <div className="font-medium text-foreground truncate">{formatReportDate(activeProofPayment.createdAt)}</div>
                  </div>
                </div>

                {/* Proof Image / Document Container */}
                <div className="rounded-xl overflow-hidden border border-border bg-slate-100/60 flex items-center justify-center p-2 min-h-[260px]">
                  {(() => {
                    const proofUrl =
                      activeProofPayment.proof?.signedUrl ||
                      (activeProofPayment.proof?.filePath?.startsWith('data:')
                        ? activeProofPayment.proof.filePath
                        : null)

                    if (!proofUrl) {
                      return (
                        <div className="text-muted-foreground text-xs p-6 text-center space-y-1">
                          <AlertCircle className="w-6 h-6 text-muted-foreground/60 mx-auto mb-1" />
                          <p className="font-medium text-foreground">File Bukti Tidak Ditemukan</p>
                          <p className="text-[11px]">Data berkas bukti transfer tidak tersedia atau URL kedaluwarsa.</p>
                        </div>
                      )
                    }

                    const isImage =
                      proofUrl.startsWith('data:image/') ||
                      (activeProofPayment.proof?.mimeType?.startsWith('image/') ?? false)

                    if (isImage) {
                      return (
                        <img
                          src={proofUrl}
                          alt={`Bukti Transfer ${activeProofPayment.invoice?.invoiceNumber || activeProofPayment.id}`}
                          className="max-h-[440px] w-auto object-contain rounded-lg shadow-2xs"
                        />
                      )
                    }

                    return (
                      <div className="text-center p-6 space-y-2">
                        <FileText className="w-10 h-10 text-primary mx-auto" />
                        <div className="font-semibold text-xs">Dokumen Bukti Transfer (PDF)</div>
                        <a
                          href={proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={activeProofPayment.proof?.originalFileName || 'bukti-transfer.pdf'}
                          className="text-primary hover:underline text-xs font-semibold inline-block pt-1"
                        >
                          Buka / Unduh Dokumen
                        </a>
                      </div>
                    )
                  })()}
                </div>

                <div className="text-[11px] text-muted-foreground flex justify-between px-1">
                  <span>Berkas: {activeProofPayment.proof?.originalFileName || 'bukti_transfer'}</span>
                  <span>Tujuan: Rekening BSI PT Laits Edu Tech</span>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-2 flex-col-reverse sm:flex-row pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  onClick={() => setActiveProofPayment(null)}
                  className="min-h-[40px] text-xs"
                >
                  Tutup
                </Button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setRejectingPayment(activeProofPayment)}
                    disabled={isProcessing}
                    className="min-h-[40px] text-xs font-semibold text-rose-600 border-rose-300 hover:bg-rose-50 flex-1 sm:flex-none"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    <span>Tolak</span>
                  </Button>
                  <Button
                    onClick={() => handleApprove(activeProofPayment.id)}
                    disabled={isProcessing}
                    className="min-h-[40px] text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Setujui Pembayaran</span>
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Reject Dialog */}
        {rejectingPayment && (
          <Dialog
            open={!!rejectingPayment}
            onOpenChange={(open: boolean) => !open && setRejectingPayment(null)}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-rose-600 text-base">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Tolak Bukti Pembayaran</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Invoice {rejectingPayment.invoice?.invoiceNumber || rejectingPayment.id.slice(0, 8)} oleh {rejectingPayment.studentName}. Siswa akan diberitahu alasan penolakan dan dapat mengunggah bukti perbaikan.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-1">
                <label className="text-xs font-semibold text-foreground block">
                  Alasan Penolakan
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Nominal transfer kurang, nama pemilik rekening berbeda, atau foto bukti terpotong..."
                  className="w-full text-xs rounded-lg border border-border p-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRejectingPayment(null)}
                  disabled={isProcessing}
                  className="min-h-[40px] text-xs"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectConfirm}
                  disabled={isProcessing}
                  className="min-h-[40px] text-xs font-semibold gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Konfirmasi Tolak</span>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppShell>
  )
}

