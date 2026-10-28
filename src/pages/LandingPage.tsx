import { useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  Eye,
  Headphones,
  Activity,
  ChevronDown,
  ShieldCheck,
  Check,
} from 'lucide-react'
import heroStudentImg from '@/assets/hero-student.jpg'
import subjectGeneralImg from '@/assets/subject-general.jpg'
import subjectQuranImg from '@/assets/subject-quran.jpg'
import stepRegisterImg from '@/assets/step-register.jpg'
import stepAssessmentImg from '@/assets/step-assessment.jpg'
import stepTutoringImg from '@/assets/step-tutoring.jpg'
import styleVisualImg from '@/assets/style-visual.jpg'
import styleAuditoryImg from '@/assets/style-auditory.jpg'
import styleKinestheticImg from '@/assets/style-kinesthetic.jpg'
import { useAuth } from '@/hooks/useAuth'

interface ModalityData {
  id: 'visual' | 'auditory' | 'kinesthetic'
  name: string
  code: 'V' | 'A' | 'K'
  tagline: string
  icon: typeof Eye
  image: string
  alt: string
  summary: string
  primaryFocus: string
  tutorSop: string
  teachingSteps: string[]
}

interface FaqData {
  q: string
  a: string
}

export function LandingPage() {
  const { session, role } = useAuth()
  const [activeModalityIndex, setActiveModalityIndex] = useState<number>(0)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const dashboardUrl =
    role === 'admin' || role === 'super_admin'
      ? '/admin/dashboard'
      : role === 'tutor'
      ? '/tutor/dashboard'
      : '/student/dashboard'

  const modalities: ModalityData[] = [
    {
      id: 'visual',
      name: 'Visual',
      code: 'V',
      tagline: 'Peta Konsep & Spasial',
      icon: Eye,
      image: styleVisualImg,
      alt: 'Siswa belajar menggunakan peta pikiran dan diagram visual terstruktur',
      summary:
        'Siswa memahami konsep lebih mendalam melalui bagan alur hubungan, diagram warna terarah, dan visualisasi skema terstruktur sebelum masuk ke perhitungan teknis.',
      primaryFocus: 'Pemetaan Spasial & Rangkuman',
      tutorSop:
        'Tutor menggambar bagan konsep di awal sesi, menyusun tahapan rumus langkah demi langkah secara tertulis, dan tidak menggunakan ceramah lisan tanpa media visual pendukung.',
      teachingSteps: [
        'Pemetaan gambaran besar konsep materi ke dalam bagan alur terstruktur',
        'Pengelompokan definisi dan rumus penting dengan penanda warna sistematis',
        'Latihan mandiri terbimbing dengan rujukan diagram penyelesaian soal',
      ],
    },
    {
      id: 'auditory',
      name: 'Auditori',
      code: 'A',
      tagline: 'Dialog & Narasi Lisan',
      icon: Headphones,
      image: styleAuditoryImg,
      alt: 'Siswa berdiskusi aktif dengan tutor melalui dialog dan tanya jawab lisan',
      summary:
        'Siswa mencerna konsep secara optimal melalui diskusi terarah, penjelasan lisan berintonasi jelas, dan kesempatan menerangkan kembali pemahamannya secara bersuara.',
      primaryFocus: 'Dialektika & Eksplorasi Konsep',
      tutorSop:
        'Tutor mengawali sesi dengan tanya jawab kontekstual, menerangkan konsep melalui analogi verbal terstruktur, lalu meminta siswa merumuskan kembali kesimpulan dengan suara terdengar.',
      teachingSteps: [
        'Pengenalan ide pokok materi melalui analogi naratif yang akrab dengan siswa',
        'Sesi tanya jawab timbal-balik untuk menguji alur logika berpikir',
        'Siswa merangkum pemahamannya secara lisan di akhir setiap topik bahasan',
      ],
    },
    {
      id: 'kinesthetic',
      name: 'Kinestetik',
      code: 'K',
      tagline: 'Praktik & Gerak Motorik',
      icon: Activity,
      image: styleKinestheticImg,
      alt: 'Siswa langsung mempraktikkan latihan soal dengan corat-coret kertas buram',
      summary:
        'Siswa menginternalisasi rumus dan aturan lewat keterlibatan fisik langsung: mencorat-coret kertas buram, membedah soal nyata, serta jeda berkala yang teratur.',
      primaryFocus: 'Eksperimen & Praktik Mandiri',
      tutorSop:
        'Tutor langsung melibatkan tangan siswa memegang alat tulis sejak 10 menit pertama, membatasi penjelasan diam searah, dan menyisipkan jeda gerak ringan di tengah sesi.',
      teachingSteps: [
        'Pembedahan contoh kasus langsung di atas kertas kerja bersama tutor',
        'Penyelesaian soal variasi secara mandiri dengan alat bantu coretan',
        'Jeda peregangan fisik singkat untuk memulihkan konsentrasi belajar anak',
      ],
    },
  ]

  const activeModality = modalities[activeModalityIndex] ?? modalities[0]!

  const faqs: FaqData[] = [
    {
      q: 'Apa itu diagnostik modalitas sensori belajar di ZEINBOX?',
      a: 'Diagnostik ini memetakan jalur sensori paling dominan anak dalam mencerna materi baru (Visual, Auditori, atau Kinestetik). Hasilnya menjadi pedoman operasional bagi guru privat dalam menentukan format rangkuman, ritme bicara, dan jenis latihan.',
    },
    {
      q: 'Berapa durasi tes diagnostik untuk siswa?',
      a: 'Tes dirancang ringkas dan adaptif berjenjang: 15 butir soal untuk SD (sekitar 5 menit), 20 butir soal untuk SMP (sekitar 7 menit), dan 30 butir soal untuk SMA (sekitar 10 menit). Soal berupa pilihan situasi belajar sehari-hari.',
    },
    {
      q: 'Bagaimana jika cara belajar siswa merupakan kombinasi dua jalur?',
      a: 'Sistem ZEINBOX secara otomatis mengidentifikasi tipe bimodal (misalnya Visual-Auditori atau Visual-Kinestetik) dan menghasilkan panduan gabungan bagi guru privat untuk menyampaikan pelajaran secara multi-stimulus.',
    },
    {
      q: 'Mata pelajaran apa saja yang disediakan?',
      a: 'Tersedia dua rumpun kurikulum: Akademik Umum (Matematika, Fisika, Kimia, Biologi, Bahasa Inggris) dan Studi Keagamaan (Tahfidz Al-Qur\'an, Tajwid, Bahasa Arab, Fiqih, Hadits) untuk jenjang SD, SMP, SMA, hingga persiapan seleksi masuk universitas.',
    },
    {
      q: 'Bagaimana orang tua memantau perkembangan sesi belajar?',
      a: 'Setiap kali sesi les selesai, tutor mengisi rangkuman materi, capaian pemahaman siswa, dan tugas latihan ke dashboard. Orang tua dapat memantau riwayat bimbingan dan laporan bulanan secara transparan.',
    },
  ]

  const handleToggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx))
  }

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-[#0F1D33] antialiased flex flex-col justify-between selection:bg-[#0F1D33] selection:text-white">
      {/* =========================================================================
          NAVIGATION BAR
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#F8FAFD]/95 backdrop-blur-sm border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F1D33] p-1.5 flex items-center justify-center shrink-0">
              <img
                src="/logo-mark.png"
                alt="Logo ZEINBOX"
                className="w-full h-full object-contain brightness-0 invert"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[#0F1D33] text-base tracking-tight leading-none">
                ZEINBOX
              </span>
              <span className="text-xs text-[#64748B] font-medium mt-0.5">
                Where every mind grows
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#334155]">
            <a href="#modalitas" className="hover:text-[#0F1D33] transition-colors">
              Modalitas
            </a>
            <a href="#kurikulum" className="hover:text-[#0F1D33] transition-colors">
              Kurikulum
            </a>
            <a href="#alur" className="hover:text-[#0F1D33] transition-colors">
              Alur Belajar
            </a>
            <a href="#faq" className="hover:text-[#0F1D33] transition-colors">
              Tanya Jawab
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {session ? (
              <Link
                to={dashboardUrl}
                className="px-4 py-2 rounded-lg bg-[#0F1D33] hover:bg-[#1E293B] text-white text-xs sm:text-sm font-bold transition-colors min-h-[38px] flex items-center gap-1.5"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-[#0F1D33] hover:bg-[#E2E8F0]/50 transition-colors min-h-[36px] flex items-center"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-[#0F1D33] hover:bg-[#1E293B] text-white text-xs sm:text-sm font-bold transition-colors min-h-[38px] flex items-center gap-1.5"
                >
                  <span>Daftar Siswa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN EDITORIAL CONTENT
          ========================================================================= */}
      <main className="flex-1 space-y-12 sm:space-y-16 pb-16">
        {/* =======================================================================
            SECTION 1: HERO SECTION
            ======================================================================= */}
        <section className="pt-6 sm:pt-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Left Column: Two-line Title at display size + Lead sentence */}
              <div className="lg:col-span-8 space-y-4 sm:space-y-5">
                <h1 className="taste-reveal type-hero font-extrabold text-[#0F1D33] tracking-tight">
                  Les Privat Berbasis Karakter Belajar
                </h1>

                <p className="taste-reveal type-lead text-[#334155] max-w-[50ch] font-normal">
                  ZEINBOX memetakan modalitas sensori belajar anak sejak awal, lalu menyelaraskan metode mengajar guru privat pilihan untuk kurikulum akademik dan studi keagamaan.
                </p>

                <div className="taste-reveal flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-lg bg-[#0F1D33] hover:bg-[#1E293B] text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <span>Mulai Asesmen &amp; Daftar Siswa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <a
                    href="#modalitas"
                    className="px-4 py-2.5 rounded-lg bg-white text-[#0F1D33] text-xs sm:text-sm font-semibold hover:bg-[#E2E8F0]/40 transition-colors flex items-center justify-center min-h-[40px] border border-slate-200/60"
                  >
                    <span>Pelajari Cara Kerja</span>
                  </a>
                </div>

                <div className="taste-reveal pt-2 flex flex-wrap items-center gap-3.5 text-xs text-[#475569] font-medium">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Diagnostik VAK SD, SMP, SMA</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kurikulum Umum &amp; Tahfidz</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SOP Mengajar Khusus</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Hero Visual Frame */}
              <div className="lg:col-span-4">
                <div className="taste-reveal rounded-xl overflow-hidden bg-slate-200 shadow-xs border border-slate-200/60">
                  <img
                    src={heroStudentImg}
                    alt="Siswa belajar dengan pendampingan guru privat"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-56 sm:h-64 lg:h-68 object-cover"
                  />
                  <div className="p-3 bg-[#EEF2F6] flex items-center justify-between gap-2 text-xs font-semibold text-[#0F1D33]">
                    <span>Satu siswa satu guru privat pilihan</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Terverifikasi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================================
            SECTION 2: MODALITAS SENSORI SHOWCASE (#modalitas)
            ======================================================================= */}
        <section id="modalitas" className="scroll-mt-20 max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="taste-reveal space-y-1.5 max-w-[54ch]">
            <h2 className="type-h2 font-extrabold text-[#0F1D33] tracking-tight">
              Tiga Modalitas Sensori Belajar
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Setiap siswa memiliki jalur dominan dalam memproses konsep baru. Guru privat menyelaraskan format catatan dan ritme bimbingan berdasarkan hasil diagnostik.
            </p>
          </div>

          {/* Segmented Tab Bar */}
          <div className="taste-reveal inline-flex flex-wrap p-1 rounded-xl bg-[#EEF2F6] gap-1 max-w-full">
            {modalities.map((item, idx) => {
              const isSelected = activeModalityIndex === idx
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveModalityIndex(idx)}
                  className={`group relative px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F1D33] text-white shadow-2xs'
                      : 'text-[#475569] hover:text-[#0F1D33] hover:bg-white/60'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-white/10 text-emerald-400'
                        : 'bg-white text-[#475569] group-hover:text-[#0F1D33]'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 font-bold text-xs sm:text-sm leading-tight">
                      <span>{item.name} [{item.code}]</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-medium leading-tight mt-0.5 ${
                        isSelected ? 'text-slate-300' : 'text-[#64748B]'
                      }`}
                    >
                      {item.tagline}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Animated Modality Dossier Presentation */}
          <div
            key={activeModality.id}
            className="animate-modal-enter grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/60 shadow-xs"
          >
            {/* Left Column */}
            <div className="lg:col-span-5 space-y-3">
              <div className="group relative rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={activeModality.image}
                  alt={activeModality.alt}
                  className="w-full h-44 sm:h-52 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#0F1D33]/90 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs">
                  <activeModality.icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Jalur Belajar {activeModality.name}</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-[50ch]">
                {activeModality.summary}
              </p>
            </div>

            {/* Right Column: Clinical Protocol & Steps */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#0F1D33] tracking-tight leading-snug">
                  {activeModality.primaryFocus}
                </h3>
              </div>

              {/* SOP Protocol Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAFD] border-l-3 border-[#0F1D33] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F1D33]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SOP Terverifikasi Guru Privat</span>
                </div>
                <p className="text-xs sm:text-sm text-[#1E293B] leading-relaxed font-medium">
                  {activeModality.tutorSop}
                </p>
              </div>

              {/* Interactive 3-Step Flow */}
              <div className="space-y-2 pt-0.5">
                <span className="text-xs font-bold text-[#0F1D33] uppercase tracking-wider block">
                  Tahapan bimbingan di setiap sesi belajar:
                </span>
                <div className="space-y-1.5">
                  {activeModality.teachingSteps.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="group/step flex items-start gap-2.5 px-2 py-1.5 rounded-lg transition-colors hover:bg-[#F8FAFD] cursor-default"
                    >
                      <span className="w-5 h-5 rounded-md bg-[#EEF2F6] group-hover/step:bg-[#0F1D33] group-hover/step:text-white transition-colors text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 text-[#0F1D33]">
                        {sIdx + 1}
                      </span>
                      <span className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minimalist Interactive CTA Link */}
              <div className="pt-1 border-t border-slate-100">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0F1D33] hover:text-[#1E293B] transition-colors"
                >
                  <span>Ikuti diagnostik untuk mengetahui profil anak</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================================
            SECTION 3: KURIKULUM TERPADU (#kurikulum)
            ======================================================================= */}
        <section id="kurikulum" className="scroll-mt-20 max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="taste-reveal space-y-1.5 max-w-[54ch]">
            <h2 className="type-h2 font-extrabold text-[#0F1D33] tracking-tight">
              Dua Rumpun Kurikulum Terpadu
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Materi disiapkan oleh pendidik spesialis dengan kurikulum terstruktur untuk memperkuat prestasi akademis sekolah dan pembinaan adab keagamaan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Akademik Umum */}
            <div className="taste-reveal bg-white p-4 sm:p-5 rounded-2xl space-y-3.5 flex flex-col justify-between border border-slate-200/60 shadow-xs">
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={subjectGeneralImg}
                    alt="Siswa mempelajari matematika dan sains"
                    className="w-full h-36 sm:h-40 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#0F1D33]">
                  Mata Pelajaran Akademik Umum
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  Bimbingan intensif matematika, fisika, kimia, biologi, dan bahasa. Guru privat mendampingi siswa membedah konsep dari dasar logika pemahaman hingga siap menghadapi asesmen sekolah dan persiapan ujian perguruan tinggi.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-[#0F1D33] block">
                  Mata Pelajaran
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs font-semibold text-[#1E293B]">
                  {['Matematika Dasar & Lanjut', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Bahasa Indonesia'].map((subj) => (
                    <span key={subj} className="px-2.5 py-1 rounded-md bg-[#F1F5F9]">
                      {subj}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Keagamaan & Al-Qur'an */}
            <div className="taste-reveal bg-white p-4 sm:p-5 rounded-2xl space-y-3.5 flex flex-col justify-between border border-slate-200/60 shadow-xs">
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={subjectQuranImg}
                    alt="Siswa mempelajari Al-Qur'an dan studi keagamaan"
                    className="w-full h-36 sm:h-40 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#0F1D33]">
                  Studi Keagamaan &amp; Al-Qur'an
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  Program talaqqi hafalan dan bimbingan adab dibimbing langsung oleh asatidzah berlatar belakang pesantren dan pendidikan Islam teruji. Sesi privat intensif menjamin ketepatan makharijul huruf dan kenyamanan belajar anak.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-emerald-800 block">
                  Cakupan Studi
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs font-semibold text-emerald-950">
                  {['Tahfidz Al-Qur\'an Mutqin', 'Tahsin & Tajwid Makhorijul Huruf', 'Bahasa Arab', 'Fiqih Ibadah', 'Hadits Pilihan'].map((subj) => (
                    <span key={subj} className="px-2.5 py-1 rounded-md bg-emerald-50">
                      {subj}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================================
            SECTION 4: TIGA LANGKAH MEMULAI (#alur)
            ======================================================================= */}
        <section id="alur" className="scroll-mt-20 max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="taste-reveal space-y-1.5 max-w-[54ch]">
            <h2 className="type-h2 font-extrabold text-[#0F1D33] tracking-tight">
              Tiga Langkah Memulai Bimbingan
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Alur pendaftaran teratur untuk memastikan kegiatan belajar mengajar berjalan transparan bagi siswa dan orang tua.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div className="taste-reveal bg-white p-4 rounded-xl space-y-3 border border-slate-200/60 shadow-xs">
              <div className="rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={stepRegisterImg}
                  alt="Langkah pendaftaran akun siswa"
                  className="w-full h-32 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-[#0F1D33]">
                  1. Pilih Jenjang &amp; Pelajaran
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Buat akun siswa secara gratis. Tentukan jenjang pendidikan (SD, SMP, atau SMA) dan mata pelajaran yang ingin dipelajari.
                </p>
              </div>
            </div>

            <div className="taste-reveal bg-white p-4 rounded-xl space-y-3 border border-slate-200/60 shadow-xs">
              <div className="rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={stepAssessmentImg}
                  alt="Langkah pengerjaan asesmen diagnostik gaya belajar"
                  className="w-full h-32 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-[#0F1D33]">
                  2. Ikuti Tes Diagnostik VAK
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Siswa mengisi kuesioner situasi belajar singkat (15 sampai 30 soal sesuai jenjang). Hasil pemetaan langsung keluar seketika.
                </p>
              </div>
            </div>

            <div className="taste-reveal bg-white p-4 rounded-xl space-y-3 border border-slate-200/60 shadow-xs">
              <div className="rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={stepTutoringImg}
                  alt="Langkah bimbingan privat bersama guru"
                  className="w-full h-32 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-[#0F1D33]">
                  3. Mulai Les Bersama Guru Privat
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Pilih guru privat yang cocok dengan karakter belajar anak. Tentukan jadwal les rutin dan pantau catatan progres di dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================================
            SECTION 5: FAQ TANYA JAWAB (#faq)
            ======================================================================= */}
        <section id="faq" className="scroll-mt-20 max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
          <div className="taste-reveal space-y-1.5 max-w-[54ch]">
            <h2 className="type-h2 font-extrabold text-[#0F1D33] tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Informasi lengkap untuk membantu orang tua dan siswa memahami sistem bimbingan belajar ZEINBOX.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div key={idx} className="taste-reveal bg-white rounded-xl overflow-hidden border border-slate-200/60 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleToggleFaq(idx)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-[#0F1D33] hover:bg-[#F8FAFD] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="w-6 h-6 rounded-md bg-[#F1F5F9] flex items-center justify-center shrink-0 text-[#0F1D33]">
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-3.5 pt-0.5 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* =======================================================================
            SECTION 6: CTA BAND
            ======================================================================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="taste-reveal bg-[#0F1D33] text-white p-6 sm:p-8 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-soft">
            <div className="md:col-span-8 space-y-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Mulai Bimbingan Sekarang
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-[50ch] font-normal">
                Daftarkan putra-putri Anda untuk mengikuti pemetaan gaya belajar VAK dan temukan guru privat yang tepat untuk kurikulum umum maupun tahfidz Al-Qur'an.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-stretch gap-2.5">
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-[#0F1D33] text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
              >
                <span>Daftar Akun Siswa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center min-h-[38px]"
              >
                <span>Masuk ke Akun Terdaftar</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer className="bg-[#0F1D33] text-[#CBD5E1] py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white p-1.5 flex items-center justify-center shrink-0">
              <img
                src="/logo-mark.png"
                alt="Logo ZEINBOX"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-sm leading-tight">
                ZEINBOX
              </span>
              <span className="text-xs text-[#94A3B8] font-medium mt-0.5">
                Where every mind grows
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[#CBD5E1] font-medium">
            <a href="#modalitas" className="hover:text-white transition-colors">
              Modalitas VAK
            </a>
            <a href="#kurikulum" className="hover:text-white transition-colors">
              Pilihan Kurikulum
            </a>
            <a href="#alur" className="hover:text-white transition-colors">
              Alur Belajar
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              Tanya Jawab
            </a>
            <Link to="/login" className="hover:text-white transition-colors">
              Portal Pengguna
            </Link>
          </div>

          <p className="text-xs text-[#94A3B8] text-center sm:text-right">
            (c) {new Date().getFullYear()} ZEINBOX. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  )
}
