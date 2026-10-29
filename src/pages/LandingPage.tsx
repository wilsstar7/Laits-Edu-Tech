import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import heroStudentImg from '@/assets/hero-student.jpg'
import subjectGeneralImg from '@/assets/subject-general.jpg'
import subjectQuranImg from '@/assets/subject-quran.jpg'
import stepAssessmentImg from '@/assets/step-assessment.jpg'
import stepTutoringImg from '@/assets/step-tutoring.jpg'
import styleVisualImg from '@/assets/style-visual.jpg'
import styleAuditoryImg from '@/assets/style-auditory.jpg'
import styleKinestheticImg from '@/assets/style-kinesthetic.jpg'
import { useAuth } from '@/hooks/useAuth'

interface ModalityData {
  id: 'visual' | 'auditory' | 'kinesthetic'
  label: string
  title: string
  image: string
  alt: string
  caption: string
  summary: string
  tutorSop: string
  practiceFocus: string
}

interface FaqData {
  q: string
  a: string
}

const MODALITIES: ModalityData[] = [
  {
    id: 'visual',
    label: 'Visual',
    title: 'Peta Konsep Spasial',
    image: styleVisualImg,
    alt: 'Meja belajar siswa visual dengan peta konsep berwarna dan buku terstruktur',
    caption: 'Jalur Visual: memahami struktur materi lewat skema, diagram, dan hirarki warna.',
    summary:
      'Siswa mencerna materi baru lebih utuh ketika melihat hubungan antarbab dalam bentuk bagan alur dan skema tertulis sebelum masuk ke rincian rumus.',
    tutorSop:
      'Guru privat menggambar peta konsep di awal sesi dan menuliskan tahapan penurunan rumus secara berurutan tanpa ceramah lisan yang panjang.',
    practiceFocus:
      'Rangkuman visual satu halaman dan pengelompokan rumus dengan penanda warna.',
  },
  {
    id: 'auditory',
    label: 'Auditori',
    title: 'Dialog Lisan Terarah',
    image: styleAuditoryImg,
    alt: 'Perangkat diskusi dan rekaman suara untuk modalitas belajar auditori',
    caption: 'Jalur Auditori: membangun logika lewat tanya jawab lisan dan penjelasan naratif.',
    summary:
      'Siswa menangkap inti pelajaran melalui diskusi timbal balik, intonasi penjelasan yang jernih, serta kesempatan menceritakan ulang konsep dengan suaranya sendiri.',
    tutorSop:
      'Guru privat membuka sesi dengan pertanyaan pemantik, menguraikan konsep lewat analogi cerita, lalu meminta siswa menyimpulkan materi secara lisan.',
    practiceFocus:
      'Uji pemahaman lewat dialog dua arah sebelum siswa mengerjakan latihan tertulis.',
  },
  {
    id: 'kinesthetic',
    label: 'Kinestetik',
    title: 'Praktik Tangan Langsung',
    image: styleKinestheticImg,
    alt: 'Siswa mempraktikkan penyelesaian soal secara langsung dengan alat peraga dan buku catatan',
    caption: 'Jalur Kinestetik: menguasai materi lewat simulasi soal dan keterlibatan motorik.',
    summary:
      'Siswa memahami konsep ketika tangannya langsung bergerak membedah contoh kasus di atas kertas kerja, bukan sekadar mendengar atau melihat teori pasif.',
    tutorSop:
      'Guru privat melibatkan siswa menulis dan membedah soal sejak sepuluh menit pertama, membatasi penjelasan searah, dan menjaga ritme jeda tetap segar.',
    practiceFocus:
      'Eksperimen penyelesaian soal bertahap menggunakan lembar kerja langsung bersama tutor.',
  },
]

const FAQS: FaqData[] = [
  {
    q: 'Apa fungsi diagnostik modalitas belajar di ZEINBOX?',
    a: 'Diagnostik ini memetakan kecenderungan sensori anak (Visual, Auditori, atau Kinestetik) saat menerima materi baru. Hasilnya menjadi standar operasional bagi guru privat dalam menyiapkan catatan, mengatur tempo penjelasan, dan memilih bentuk latihan.',
  },
  {
    q: 'Berapa lama siswa mengerjakan tes diagnostik?',
    a: 'Tes disusun adaptif sesuai jenjang sekolah: 15 soal untuk SD (sekitar 5 menit), 20 soal untuk SMP (sekitar 7 menit), dan 30 soal untuk SMA (sekitar 10 menit). Seluruh pertanyaan berupa situasi belajar sehari-hari.',
  },
  {
    q: 'Bagaimana jika anak memiliki kombinasi dua gaya belajar?',
    a: 'Sistem ZEINBOX mendeteksi profil kombinasi seperti Visual-Auditori atau Visual-Kinestetik, lalu menyusun panduan gabungan agar guru privat memadukan media skema dan interaksi yang seimbang.',
  },
  {
    q: 'Bagaimana cara orang tua memantau hasil les setiap pekan?',
    a: 'Setiap sesi bimbingan selesai, guru privat mencatat materi yang dibahas, tingkat pemahaman siswa, dan tindak lanjut latihan di dashboard yang dapat diakses langsung oleh orang tua.',
  },
]

export function LandingPage() {
  const { session, role } = useAuth()
  const [activeModalityIndex, setActiveModalityIndex] = useState<number>(0)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  const pageRef = useRef<HTMLDivElement>(null)

  const dashboardUrl =
    role === 'admin' || role === 'super_admin'
      ? '/admin/dashboard'
      : role === 'tutor'
      ? '/tutor/dashboard'
      : '/student/dashboard'

  const activeModality = MODALITIES[activeModalityIndex] ?? MODALITIES[0]!

  useEffect(() => {
    const root = pageRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = Array.from(root.querySelectorAll<HTMLElement>('.landing-reveal'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    )

    for (const el of targets) {
      io.observe(el)
    }

    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={pageRef}
      className="min-h-dvh bg-[#F4F6FA] text-[#0F1D33] antialiased flex flex-col justify-between selection:bg-[#183058] selection:text-white"
    >
      <header className="w-full bg-[#F4F6FA]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-6">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-[#0F1D33] min-h-[44px]"
          >
            <span className="w-9 h-9 bg-[#0F1D33] p-2 flex items-center justify-center shrink-0">
              <img
                src="/logo-mark.png"
                alt="Logo ZEINBOX"
                width={20}
                height={20}
                className="w-full h-full object-contain brightness-0 invert"
              />
            </span>
            <span className="font-extrabold text-[18px] tracking-tight">
              ZEINBOX
            </span>
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-8 type-body font-medium text-[#0F1D33]"
          >
            <a
              href="#modalitas"
              className="min-h-[44px] inline-flex items-center hover:text-[#183058] transition-colors duration-150"
            >
              Modalitas
            </a>
            <a
              href="#kurikulum"
              className="min-h-[44px] inline-flex items-center hover:text-[#183058] transition-colors duration-150"
            >
              Kurikulum
            </a>
            <a
              href="#faq"
              className="min-h-[44px] inline-flex items-center hover:text-[#183058] transition-colors duration-150"
            >
              Tanya Jawab
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {session ? (
              <Link
                to={dashboardUrl}
                className="px-4 sm:px-5 py-2.5 bg-[#183058] hover:bg-[#102342] active:scale-[0.98] text-white type-body font-semibold transition-transform duration-150 min-h-[44px] inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-2.5 sm:px-3 py-2 type-body font-semibold text-[#0F1D33] hover:text-[#183058] transition-colors duration-150 min-h-[44px] inline-flex items-center whitespace-nowrap"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-4 sm:px-5 py-2.5 bg-[#183058] hover:bg-[#102342] active:scale-[0.98] text-white type-body font-semibold transition-transform duration-150 min-h-[44px] inline-flex items-center whitespace-nowrap"
                >
                  Daftar Siswa
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-6 pb-20 lg:pt-10 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between py-2 lg:py-6">
              <div className="space-y-8">
                <h1 className="type-hero font-extrabold text-[#0F1D33] max-w-[13ch] text-balance">
                  <span className="landing-line-mask">
                    <span
                      className="landing-line-inner"
                      style={{ '--delay': '80ms' } as React.CSSProperties}
                    >
                      Kenali Cara Belajar
                    </span>
                  </span>
                  <span className="landing-line-mask">
                    <span
                      className="landing-line-inner"
                      style={{ '--delay': '170ms' } as React.CSSProperties}
                    >
                      Anak Anda
                    </span>
                  </span>
                </h1>

                <p
                  className="landing-load-item type-lead text-[#1D1D24] max-w-[44ch]"
                  style={{ '--delay': '260ms' } as React.CSSProperties}
                >
                  ZEINBOX memetakan jalur sensori Visual, Auditori, dan Kinestetik siswa sebelum menyelaraskan metode mengajar guru privat untuk kurikulum sekolah maupun Al-Qur&rsquo;an.
                </p>

                <div
                  className="landing-load-item flex flex-wrap items-center gap-6 pt-2"
                  style={{ '--delay': '340ms' } as React.CSSProperties}
                >
                  <Link
                    to={session ? dashboardUrl : '/register'}
                    className="px-6 py-3.5 bg-[#183058] hover:bg-[#102342] active:scale-[0.98] text-white type-body font-semibold transition-transform duration-150 min-h-[48px] inline-flex items-center gap-2.5"
                  >
                    <span>{session ? 'Lanjutkan ke Dashboard' : 'Mulai Diagnostik Siswa'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#modalitas"
                    className="type-body font-semibold text-[#0F1D33] underline decoration-[#183058] decoration-2 underline-offset-6 hover:text-[#183058] transition-colors duration-150 min-h-[44px] inline-flex items-center"
                  >
                    Lihat metode mengajar
                  </a>
                </div>
              </div>

              <div
                className="landing-load-item grid grid-cols-1 sm:grid-cols-2 gap-4 pt-12 lg:pt-16"
                style={{ '--delay': '420ms' } as React.CSSProperties}
              >
                <div className="bg-[#E8ECF6] p-5">
                  <p className="type-body font-bold text-[#0F1D33]">
                    Diagnostik Adaptif SD, SMP, SMA
                  </p>
                  <p className="type-small text-[#3E4756] mt-1">
                    15 hingga 30 butir soal situasi belajar dalam 5 sampai 10 menit.
                  </p>
                </div>
                <div className="bg-[#E8ECF6] p-5">
                  <p className="type-body font-bold text-[#0F1D33]">
                    Satu Siswa Satu Guru Privat
                  </p>
                  <p className="type-small text-[#3E4756] mt-1">
                    Pendampingan terfokus dengan SOP mengajar sesuai profil anak.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <figure className="landing-shutter bg-[#E8ECF6] h-full flex flex-col justify-between">
                <img
                  src={heroStudentImg}
                  alt="Siswa belajar secara terfokus dengan meja belajar yang rapi"
                  width={1200}
                  height={960}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-[360px] sm:h-[460px] lg:h-[580px] object-cover"
                />
                <figcaption className="p-5 bg-[#E8ECF6] flex flex-wrap items-center justify-between gap-3 type-small text-[#0F1D33]">
                  <span className="font-semibold">
                    Pemetaan karakter belajar sebelum sesi bimbingan dimulai
                  </span>
                  <span className="text-[#3E4756]">
                    Kurikulum Akademik &amp; Al-Qur&rsquo;an
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section
          id="modalitas"
          className="scroll-mt-16 w-full bg-[#E8ECF6] py-20 lg:py-28"
        >
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
                <div className="space-y-3">
                  <h2 className="landing-reveal type-h2 font-extrabold text-[#0F1D33] max-w-[14ch] text-balance">
                    Tiga Jalur Sensori
                  </h2>
                  <p
                    className="landing-reveal type-body text-[#1D1D24] max-w-[48ch]"
                    style={{ '--delay': '80ms' } as React.CSSProperties}
                  >
                    Pilih salah satu modalitas di samping untuk melihat bagaimana cara anak memproses materi dan bagaimana guru privat menyesuaikan metode bimbingan.
                  </p>
                </div>

                <figure
                  className="landing-reveal bg-[#F4F6FA]"
                  style={{ '--delay': '160ms' } as React.CSSProperties}
                >
                  <img
                    key={activeModality.id}
                    src={activeModality.image}
                    alt={activeModality.alt}
                    width={960}
                    height={960}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-4/3 sm:aspect-square max-h-[460px] object-cover transition-opacity duration-300"
                  />
                  <figcaption className="p-5 type-small text-[#1D1D24] font-medium">
                    {activeModality.caption}
                  </figcaption>
                </figure>
              </div>

              <div className="lg:col-span-6 flex flex-col justify-between space-y-10 bg-[#F4F6FA] p-6 sm:p-10 lg:p-12">
                <div
                  role="tablist"
                  aria-label="Pilih modalitas belajar"
                  className="landing-reveal flex flex-wrap gap-3 sm:gap-6"
                >
                  {MODALITIES.map((item, idx) => {
                    const isSelected = activeModalityIndex === idx
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setActiveModalityIndex(idx)}
                        className={`min-h-[48px] px-5 py-2.5 type-body font-bold transition-colors duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-[#0F1D33] text-white'
                            : 'bg-[#E8ECF6] text-[#0F1D33] hover:bg-[#D5DCF0]'
                        }`}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-5 my-auto py-4">
                  <h3 className="type-h3 font-extrabold text-[#0F1D33]">
                    {activeModality.title}
                  </h3>
                  <p className="type-body text-[#1D1D24] max-w-[50ch]">
                    {activeModality.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#0F1D33] text-white p-6 flex flex-col justify-between space-y-3">
                    <span className="type-small font-bold text-[#B0B4E0]">
                      SOP Guru Privat
                    </span>
                    <p className="type-body text-white">
                      {activeModality.tutorSop}
                    </p>
                  </div>

                  <div className="bg-[#E8ECF6] text-[#0F1D33] p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="type-small font-bold text-[#183058] block">
                        Fokus Latihan Sesi
                      </span>
                      <p className="type-body text-[#0F1D33]">
                        {activeModality.practiceFocus}
                      </p>
                    </div>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 type-small font-bold text-[#183058] hover:text-[#0F1D33] min-h-[44px]"
                    >
                      <span>Coba tes diagnostik</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="kurikulum"
          className="scroll-mt-16 w-full bg-[#0F1D33] text-[#F4F6FA] py-20 lg:py-28"
        >
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-start">
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
                <h2 className="landing-reveal type-h2 font-extrabold text-white max-w-[10ch] text-balance">
                  Dua Rumpun Kurikulum
                </h2>
                <p
                  className="landing-reveal type-lead text-[#E8ECF6] max-w-[38ch]"
                  style={{ '--delay': '80ms' } as React.CSSProperties}
                >
                  Pendampingan akademik sekolah dan pembinaan Al-Qur&rsquo;an berjalan selaras dalam satu laporan perkembangan.
                </p>
                <div
                  className="landing-reveal pt-2"
                  style={{ '--delay': '160ms' } as React.CSSProperties}
                >
                  <Link
                    to="/register"
                    className="px-6 py-3.5 bg-[#F4F6FA] hover:bg-[#E8ECF6] active:scale-[0.98] text-[#0F1D33] type-body font-bold transition-transform duration-150 min-h-[48px] inline-flex items-center gap-2"
                  >
                    <span>Pilih Mata Pelajaran</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-16 lg:space-y-24">
                <article className="landing-reveal bg-[#183058] p-6 sm:p-10 space-y-6">
                  <h3 className="type-h3 font-extrabold text-white">
                    Akademik Sekolah &amp; Sains
                  </h3>
                  <p className="type-body text-[#E8ECF6] max-w-[54ch]">
                    Pendampingan satu-satu untuk membedah konsep dasar hingga latihan soal ujian sekolah dan seleksi masuk perguruan tinggi.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-start pt-2">
                    <div className="sm:col-span-5">
                      <img
                        src={subjectGeneralImg}
                        alt="Buku pelajaran matematika, fisika, kimia, dan sains di atas meja belajar"
                        width={640}
                        height={520}
                        loading="lazy"
                        decoding="async"
                        className="w-full aspect-3/4 max-w-[240px] object-cover bg-[#0F1D33]"
                      />
                    </div>
                    <ul className="sm:col-span-7 space-y-3.5 type-body text-white font-medium">
                      <li>Matematika Dasar &amp; Peminatan</li>
                      <li>Fisika, Kimia, dan Biologi</li>
                      <li>Bahasa Indonesia &amp; Bahasa Inggris</li>
                      <li>Persiapan Asesmen Nasional &amp; Ujian PTN</li>
                    </ul>
                  </div>
                </article>

                <article
                  className="landing-reveal bg-[#183058] p-6 sm:p-10 space-y-6"
                  style={{ '--delay': '120ms' } as React.CSSProperties}
                >
                  <h3 className="type-h3 font-extrabold text-white">
                    Al-Qur&rsquo;an &amp; Studi Keagamaan
                  </h3>
                  <p className="type-body text-[#E8ECF6] max-w-[54ch]">
                    Bimbingan talaqqi hafalan, perbaikan makharijul huruf, dan pemahaman adab harian bersama pengajar berlatar pesantren.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-start pt-2">
                    <ul className="sm:col-span-7 space-y-3.5 type-body text-white font-medium order-2 sm:order-1">
                      <li>Tahfidz Al-Qur&rsquo;an Juz 30 &amp; Lanjutan</li>
                      <li>Tahsin Bacaan &amp; Tajwid Praktis</li>
                      <li>Bahasa Arab Dasar &amp; Percakapan</li>
                      <li>Fiqih Ibadah &amp; Hadits Pilihan</li>
                    </ul>
                    <div className="sm:col-span-5 order-1 sm:order-2">
                      <img
                        src={subjectQuranImg}
                        alt="Mushaf Al-Quran di atas rehal kayu beserta lentera belajar"
                        width={640}
                        height={520}
                        loading="lazy"
                        decoding="async"
                        className="w-full aspect-3/4 max-w-[240px] object-cover bg-[#0F1D33]"
                      />
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="scroll-mt-16 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 lg:py-28"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-6 space-y-10">
              <div className="space-y-3">
                <h2 className="landing-reveal type-h2 font-extrabold text-[#0F1D33]">
                  Tanya Jawab
                </h2>
                <p
                  className="landing-reveal type-body text-[#1D1D24] max-w-[48ch]"
                  style={{ '--delay': '80ms' } as React.CSSProperties}
                >
                  Hal pokok yang perlu diketahui orang tua dan siswa sebelum memulai pemetaan gaya belajar.
                </p>
              </div>

              <div className="space-y-7">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx
                  return (
                    <div
                      key={faq.q}
                      className="landing-reveal"
                      style={{ '--delay': `${(idx + 1) * 70}ms` } as React.CSSProperties}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() =>
                          setOpenFaqIndex((prev) => (prev === idx ? null : idx))
                        }
                        className="w-full py-2 text-left flex items-start justify-between gap-6 type-lead font-bold text-[#0F1D33] hover:text-[#183058] transition-colors duration-150 cursor-pointer min-h-[48px]"
                      >
                        <span>{faq.q}</span>
                        <span
                          aria-hidden="true"
                          className="text-[22px] leading-none font-bold text-[#183058] shrink-0 pt-0.5 select-none"
                        >
                          {isOpen ? '\u2212' : '+'}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="pt-2.5 text-[#1D1D24] type-body max-w-[54ch]">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
              <figure className="landing-reveal sm:col-span-7 bg-[#E8ECF6]">
                <img
                  src={stepTutoringImg}
                  alt="Penjadwalan rutin sesi bimbingan belajar privat"
                  width={720}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-4/5 object-cover"
                />
                <figcaption className="p-4 type-small text-[#0F1D33] font-medium">
                  Jadwal les teratur dan terpantau setiap sesi.
                </figcaption>
              </figure>

              <figure
                className="landing-reveal sm:col-span-5 bg-[#E8ECF6]"
                style={{ '--delay': '140ms' } as React.CSSProperties}
              >
                <img
                  src={stepAssessmentImg}
                  alt="Ilustrasi kuesioner pemetaan gaya belajar siswa"
                  width={520}
                  height={520}
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-square object-cover"
                />
                <figcaption className="p-4 type-small text-[#0F1D33] font-medium">
                  Hasil diagnostik langsung tersedia setelah pengisian.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="w-full bg-[#E8ECF6] py-20 lg:py-28">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="landing-reveal type-h2 font-extrabold text-[#0F1D33] max-w-[14ch] text-balance">
                Mulai dari Pemetaan Belajar
              </h2>
              <p
                className="landing-reveal type-lead text-[#1D1D24] max-w-[42ch]"
                style={{ '--delay': '80ms' } as React.CSSProperties}
              >
                Buat akun siswa gratis, kerjakan kuesioner diagnostik dalam lima menit, dan temukan guru privat yang mengajar sesuai cara berpikir anak Anda.
              </p>
            </div>

            <div
              className="landing-reveal lg:col-span-5 flex flex-wrap items-center lg:justify-end gap-5"
              style={{ '--delay': '160ms' } as React.CSSProperties}
            >
              <Link
                to={session ? dashboardUrl : '/register'}
                className="px-7 py-4 bg-[#183058] hover:bg-[#102342] active:scale-[0.98] text-white type-body font-bold transition-transform duration-150 min-h-[48px] inline-flex items-center gap-2.5"
              >
                <span>{session ? 'Buka Dashboard' : 'Daftar Akun Siswa'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              {!session && (
                <Link
                  to="/login"
                  className="px-4 py-3 type-body font-semibold text-[#0F1D33] underline decoration-[#183058] decoration-2 underline-offset-6 hover:text-[#183058] min-h-[48px] inline-flex items-center"
                >
                  Masuk ke akun terdaftar
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-[#0F1D33] text-[#E8ECF6] py-12">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white p-2 flex items-center justify-center shrink-0">
              <img
                src="/logo-mark.png"
                alt="Logo ZEINBOX"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="font-extrabold text-white type-body leading-none">
                ZEINBOX
              </p>
              <p className="type-small text-[#B0B4E0] mt-1">
                Where every mind grows
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 type-small font-medium text-[#E8ECF6]">
            <a
              href="#modalitas"
              className="min-h-[44px] inline-flex items-center hover:text-white transition-colors"
            >
              Modalitas VAK
            </a>
            <a
              href="#kurikulum"
              className="min-h-[44px] inline-flex items-center hover:text-white transition-colors"
            >
              Kurikulum
            </a>
            <a
              href="#faq"
              className="min-h-[44px] inline-flex items-center hover:text-white transition-colors"
            >
              Tanya Jawab
            </a>
            <Link
              to="/login"
              className="min-h-[44px] inline-flex items-center hover:text-white transition-colors"
            >
              Portal Pengguna
            </Link>
          </div>

          <p className="type-small text-[#B0B4E0]">
            &copy; {new Date().getFullYear()} ZEINBOX. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  )
}
