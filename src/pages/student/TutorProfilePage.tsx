import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import {
  ArrowLeft,
  Star,
  Clock,
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { ErrorState } from '@/components/ui/ErrorState'
import { TutorProfileSkeleton } from '@/components/tutor/TutorSkeletons'
import { BookingDialog } from '@/components/booking/BookingDialog'
import { TutorAvailabilityCalendar } from '@/components/tutor/TutorAvailabilityCalendar'
import { ReviewSummaryCard } from '@/components/review/ReviewSummaryCard'
import { ReviewCard } from '@/components/review/ReviewCard'
import { tutorService } from '@/services/tutorService'
import { reviewService } from '@/services/reviewService'
import { paymentService } from '@/services/paymentService'
import { formatCurrency } from '@/utils/format'
import type { TutorSummary, AvailableTimeSlot } from '@/types/tutor'
import type { Booking, BookingDurationMinutes } from '@/types/booking'
import type { Review, TutorRatingSummary } from '@/types/review'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function TutorProfilePage() {
  const navigate = useNavigate()
  const { tutorId } = useParams<{ tutorId: string }>()
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [tutor, setTutor] = useState<TutorSummary | null>(null)

  // Review states
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratingSummary, setRatingSummary] = useState<TutorRatingSummary | null>(null)
  const [loadingReviews, setLoadingReviews] = useState(true)

  // Booking states
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<AvailableTimeSlot | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<BookingDurationMinutes>(60)

  const reloadTutor = () => {
    if (!tutorId) return
    setLoading(true)
    setErrorMsg(null)
    tutorService
      .getTutorById(tutorId)
      .then((data) => {
        if (!data) {
          setErrorMsg('Profil tutor tidak ditemukan atau telah dinonaktifkan.')
        } else {
          setTutor(data)
        }
      })
      .catch((err) => {
        setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat profil tutor.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!tutorId) return
    let isMounted = true

    tutorService
      .getTutorById(tutorId)
      .then((data) => {
        if (!isMounted) return
        if (!data) {
          setErrorMsg('Profil tutor tidak ditemukan atau telah dinonaktifkan.')
        } else {
          setTutor(data)
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setErrorMsg(
          err instanceof Error ? err.message : 'Gagal memuat profil tutor.'
        )
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    // Load reviews & rating summary
    reviewService
      .getTutorReviews(tutorId, 1, 10)
      .then((res) => {
        if (isMounted) setReviews(res.reviews)
      })
      .catch(console.warn)

    reviewService
      .getTutorRatingSummary(tutorId)
      .then((res) => {
        if (isMounted) setRatingSummary(res)
      })
      .catch(console.warn)
      .finally(() => {
        if (isMounted) setLoadingReviews(false)
      })

    return () => {
      isMounted = false
    }
  }, [tutorId])

  const handleBookingSuccess = async (newBooking: Booking) => {
    toast.success('Pemesanan Sesi Belajar Berhasil!', {
      description: `Mengarahkan ke halaman pembayaran sesi bimbingan bersama ${newBooking.tutorName}...`,
    })
    try {
      const paymentId = await paymentService.createPayment({
        bookingId: newBooking.id,
        paymentMethod: 'manual_transfer',
      })
      navigate(`/student/payments/${paymentId}`)
    } catch {
      navigate('/student/schedule')
    }
  }

  return (
    <AppShell>
      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/student/tutors"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-brand-primary min-h-[44px] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Tutor</span>
        </Link>
      </div>

      {loading ? (
        <TutorProfileSkeleton />
      ) : errorMsg || !tutor ? (
        <ErrorState
          title="Tutor Tidak Ditemukan"
          message={errorMsg || 'Data tutor tidak dapat diakses saat ini.'}
          onRetry={reloadTutor}
        />
      ) : (
        <div className="space-y-6">
          {/* Header Profile Card */}
          <Card className="border border-border/80 bg-white shadow-xs overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-border/80 shadow-xs shrink-0">
                  {tutor.avatarUrl && <AvatarImage src={tutor.avatarUrl} alt={tutor.fullName} />}
                  <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-2xl font-bold">
                    {tutor.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-3 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-ink-primary">
                          {tutor.fullName}
                        </h1>
                        {tutor.isVerified && (
                          <Badge variant="outline" className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 text-xs font-semibold gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Terverifikasi
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                        {tutor.headline || 'Pendidik Berpengalaman & Mitra Pembelajaran Personal'}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs text-ink-muted block">Tarif Sesi Standar</span>
                      <span className="text-xl sm:text-2xl font-bold text-brand-primary">
                        {formatCurrency(tutor.hourlyRate)}
                      </span>
                      <span className="text-[11px] text-ink-muted"> / jam</span>
                    </div>
                  </div>

                  {/* Quick stats pills */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-ink-muted border-t border-border">
                    <div className="flex items-center gap-1.5 font-medium text-ink-primary">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span>{tutor.rating.toFixed(1)}</span>
                      <span className="text-ink-muted">({tutor.totalReviews} ulasan)</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium text-ink-primary">
                      <Clock className="w-4 h-4 text-brand-primary" />
                      <span>{tutor.experienceYears} Tahun Pengalaman</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium text-ink-primary">
                      <BookOpen className="w-4 h-4 text-brand-primary" />
                      <span>{tutor.subjects.length} Mata Pelajaran</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid: Left detail & Right interactive booking calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio & Pengenalan */}
              <Card className="border border-border/80 bg-white shadow-xs">
                <CardContent className="p-6 space-y-3">
                  <h2 className="text-base font-bold text-ink-primary flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-brand-primary" />
                    Tentang Tutor & Pendekatan Bimbingan
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed whitespace-pre-line">
                    {tutor.bio ||
                      `${tutor.fullName} memiliki komitmen mendalam untuk membantu setiap siswa memahami konsep secara mendasar dengan metode yang disesuaikan pada kecepatan belajar masing-masing.`}
                  </p>
                </CardContent>
              </Card>

              {/* Gaya Mengajar */}
              {tutor.teachingStyle && (
                <Card className="border border-border/80 bg-white shadow-xs">
                  <CardContent className="p-6 space-y-3">
                    <h2 className="text-base font-bold text-ink-primary flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-primary" />
                      Gaya & Metodologi Pengajaran
                    </h2>
                    <div className="p-4 bg-surface rounded-xl border border-border">
                      <p className="text-xs sm:text-sm text-ink-primary font-medium leading-relaxed">
                        {tutor.teachingStyle}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Latar Belakang Pendidikan & Pengalaman */}
              <Card className="border border-border/80 bg-white shadow-xs">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-base font-bold text-ink-primary flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-brand-primary" />
                    Kualifikasi Pendidikan & Pengalaman
                  </h2>

                  <div className="space-y-3">
                    {tutor.educationBackground && (
                      <div className="p-3.5 bg-surface rounded-xl border border-border">
                        <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                          Pendidikan Formal
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-ink-primary mt-0.5">
                          {tutor.educationBackground}
                        </p>
                      </div>
                    )}

                    {tutor.experience && (
                      <div className="p-3.5 bg-surface rounded-xl border border-border">
                        <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                          Pengalaman Profesional
                        </span>
                        <p className="text-xs sm:text-sm text-ink-secondary mt-0.5 whitespace-pre-line leading-relaxed">
                          {tutor.experience}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Mata Pelajaran yang Diampu */}
              <Card className="border border-border/80 bg-white shadow-xs">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-base font-bold text-ink-primary flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-primary" />
                    Mata Pelajaran yang Diampu ({tutor.subjects.length})
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tutor.subjects.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 bg-surface rounded-xl border border-border space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-ink-primary text-xs sm:text-sm">
                            {sub.name}
                          </h4>
                          <Badge variant="outline" className="text-[10px] bg-white text-ink-muted">
                            {sub.category === 'religious' ? 'Pendidikan Islam' : 'Umum'}
                          </Badge>
                        </div>
                        {sub.description && (
                          <p className="text-[11px] text-ink-secondary line-clamp-2">
                            {sub.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ulasan & Rating Siswa */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-ink-primary flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Ulasan & Penilaian Siswa ({ratingSummary?.totalReviews || 0})</span>
                </h2>

                {ratingSummary && <ReviewSummaryCard summary={ratingSummary} />}

                {loadingReviews ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="p-8 bg-white border border-border/80 rounded-2xl text-center text-xs text-muted-foreground">
                    Belum ada ulasan untuk tutor ini. Jadilah yang pertama memberikan ulasan setelah menyelesaikan sesi bimbingan!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <ReviewCard key={rev.id} review={rev} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Booking Widget (1 Col) */}
            <div className="space-y-6">
              <Card className="border border-border/80 bg-white shadow-md sticky top-6">
                <CardContent className="p-6 space-y-5">
                  <div className="pb-3 border-b border-border">
                    <h3 className="text-base font-bold text-ink-primary">
                      Pilih Waktu Belajar
                    </h3>
                    <p className="text-xs text-ink-muted">
                      Pilih tanggal dan durasi untuk melihat slot jam ketersediaan tutor.
                    </p>
                  </div>

                  {/* Embedded interactive availability calendar */}
                  <TutorAvailabilityCalendar
                    tutorId={tutor.id}
                    selectedSlot={selectedSlot}
                    onSelectSlot={(slot) => {
                      setSelectedSlot(slot)
                      setIsBookingOpen(true)
                    }}
                    selectedDuration={selectedDuration}
                    onDurationChange={(d) => {
                      setSelectedDuration(d)
                      setSelectedSlot(null)
                    }}
                  />

                  {/* Primary CTA */}
                  <Button
                    type="button"
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full min-h-[44px] bg-brand-primary text-white hover:bg-brand-primary/90 font-bold text-xs gap-2 shadow-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Lanjutkan Pemesanan Sesi</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Booking Dialog Modal */}
      {tutor && isBookingOpen && (
        <BookingDialog
          tutor={tutor}
          initialSubjectId={tutor.subjects[0]?.id}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </AppShell>
  )
}
