import { useState } from 'react'
import { Link } from 'react-router'
import {
  Layers,
  BookOpen,
  GraduationCap,
  Award,
  Check,
  ArrowRight,
  Eye,
  Headphones,
  Activity,
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

export function LandingPage() {
  const { session, role } = useAuth()
  const [selectedStyleAnswer, setSelectedStyleAnswer] = useState<number>(0)

  const dashboardUrl =
    role === 'admin' || role === 'super_admin'
      ? '/admin/dashboard'
      : role === 'tutor'
      ? '/tutor/dashboard'
      : '/student/dashboard'

  const sampleAssessmentOptions = [
    {
      id: 'visual',
      title: 'Melihat skema visual, bagan, dan rangkuman infografis',
      type: 'Tipe Visual',
      icon: Eye,
      image: styleVisualImg,
      imageCaption: 'Sesi Belajar Visual: Pemetaan Konsep & Infografis Rumus',
      desc: 'Lebih cepat menyerap konsep saat materi dipetakan secara visual dan terstruktur.',
      tagColor: 'bg-[#EFEDFD] text-[#6C5CE7]',
      focusPoint: 'Peta Konsep (Mind Map), Rangkuman Infografis, dan Visualisasi Rumus.',
      studentBenefit: 'Memudahkan memahami struktur besar materi sebelum membedah hitungan rumit.',
      interactiveSnippet: {
        type: 'diagram',
        title: 'Alur Pendekatan Visual:',
        steps: ['Peta Konsep Utama', 'Bagan Alur Rumus', 'Latihan Terstruktur'],
      },
      adaptation: {
        method: 'Mind Mapping & Visualisasi Terstruktur',
        desc: 'Tutor menyusun materi dengan bagan alur, skema konsep, dan ringkasan visual bertahap sebelum bedah rumus atau teori kompleks.',
      },
    },
    {
      id: 'auditory',
      title: 'Mendengarkan penjelasan tutor dan berdiskusi langsung',
      type: 'Tipe Auditori',
      icon: Headphones,
      image: styleAuditoryImg,
      imageCaption: 'Sesi Belajar Auditori: Dialog Sokratik & Diskusi Lisan',
      desc: 'Mudah menangkap esensi materi saat didiskusikan secara lisan dengan tanya-jawab interaktif.',
      tagColor: 'bg-[#E6F6EE] text-[#228653]',
      focusPoint: 'Komunikasi Dua Arah, Analogi Nyata, dan Tanya-Jawab Lisan.',
      studentBenefit: 'Materi menancap lebih kuat melalui dialog aktif dan penjelasan verbal terarah.',
      interactiveSnippet: {
        type: 'dialogue',
        title: 'Contoh Sesi Dialog Interaktif:',
        quote: 'Tutor mengajak siswa menguraikan konsep dengan bahasa sendiri agar pemahaman teruji tuntas.',
      },
      adaptation: {
        method: 'Dialog Sokratik & Analogi Verbal',
        desc: 'Tutor mengutamakan komunikasi dua arah, penjelasan lisan dengan analogi nyata, dan verifikasi pemahaman secara berkala.',
      },
    },
    {
      id: 'kinesthetic',
      title: 'Mengerjakan langsung latihan soal dan studi kasus nyata',
      type: 'Tipe Kinestetik & Praktis',
      icon: Activity,
      image: styleKinestheticImg,
      imageCaption: 'Sesi Belajar Praktis: Bedah Kasus & Eksperimen Soal',
      desc: 'Pemahaman terbentuk mantap lewat aksi langsung, eksperimen mandiri, dan evaluasi langkah.',
      tagColor: 'bg-[#FFF6E7] text-[#B45309]',
      focusPoint: 'Pembedahan Kasus Nyata, Latihan Berjenjang, dan Simulasi Mandiri.',
      studentBenefit: 'Mencegah lupa konsep dengan langsung mempraktikkan langkah penyelesaian ke soal.',
      interactiveSnippet: {
        type: 'checklist',
        title: 'Contoh Langkah Praktik Mandiri:',
        items: ['Bedah 1 contoh kasus bersama', 'Coba 1 soal variasi mandiri', 'Evaluasi per langkah solusi'],
      },
      adaptation: {
        method: 'Bedah Kasus & Latihan Bertahap',
        desc: 'Tutor memandu siswa memecahkan masalah langkah demi langkah secara aktif, diikuti simulasi soal mandiri yang terarah.',
      },
    },
  ]

  const activeOption = (sampleAssessmentOptions[selectedStyleAnswer] ?? sampleAssessmentOptions[0])!

  return (
    <div className="min-h-screen bg-[#F4F5FB] text-[#1D1D24] antialiased flex flex-col justify-between">
      {/* Top Navigation - M3 Top App Bar */}
      <header className="sticky top-0 z-50 bg-[#FDFBFE]/90 backdrop-blur-md border-b border-[#E0E2EC]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[#17181C] text-lg tracking-tight leading-none">
                LAITS <span className="text-[#6C5CE7]">EDU</span>
              </span>
              <span className="text-[11px] text-[#676A78] font-semibold mt-1">
                LMS & Les Privat Siswa
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2.5">
            {session ? (
              <Link
                to={dashboardUrl}
                className="px-6 py-2.5 rounded-full bg-[#6C5CE7] text-white text-xs font-bold shadow-xs hover:bg-[#5243D6] hover:shadow-sm transition-all min-h-[40px] flex items-center justify-center gap-2"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full text-xs font-bold text-[#17181C] hover:bg-[#6C5CE7]/8 transition-colors min-h-[40px] flex items-center"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 rounded-full bg-[#6C5CE7] text-white text-xs font-bold shadow-xs hover:bg-[#5243D6] hover:shadow-sm transition-all min-h-[40px] flex items-center gap-2"
                >
                  <span>Daftar Siswa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section - M3 Expressive Layout */}
        <section className="py-12 lg:py-16 border-b border-[#E0E2EC]/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Heading & Value Proposition */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#17181C] tracking-tight leading-[1.2]">
                    Les Privat Terarah dengan Pendekatan Karakter dan Tutor Pilihan
                  </h1>

                  <p className="text-base sm:text-lg text-[#676A78] leading-relaxed max-w-xl">
                    Setiap anak menyerap pelajaran dengan ritme berbeda. Laits Edu Tech memetakan cara belajar siswa sejak awal, lalu menghubungkan Anda dengan tutor privat terverifikasi untuk bimbingan kurikulum akademik dan keagamaan.
                  </p>
                </div>

                {/* M3 Action Buttons (Filled & Outlined) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <Link
                    to="/register"
                    className="px-7 py-3.5 rounded-full bg-[#6C5CE7] text-white text-sm font-bold shadow-xs hover:shadow-sm hover:bg-[#5243D6] transition-all flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    <span>Daftar Akun Siswa</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-7 py-3.5 rounded-full bg-white border border-[#79747E]/30 text-[#17181C] text-sm font-bold hover:bg-[#F3F4F9] transition-colors flex items-center justify-center min-h-[48px]"
                  >
                    Masuk ke Akun Terdaftar
                  </Link>
                </div>

                {/* M3 Assist Chips (replaces plain text list) */}
                <div className="pt-3 flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E0E2EC] shadow-2xs text-xs font-semibold text-[#17181C]">
                    <Check className="w-3.5 h-3.5 text-[#228653]" />
                    <span>Kurikulum Umum & Keagamaan</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E0E2EC] shadow-2xs text-xs font-semibold text-[#17181C]">
                    <Check className="w-3.5 h-3.5 text-[#228653]" />
                    <span>Diagnostik Gaya Belajar</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E0E2EC] shadow-2xs text-xs font-semibold text-[#17181C]">
                    <Check className="w-3.5 h-3.5 text-[#228653]" />
                    <span>Catatan Kemajuan di Dashboard</span>
                  </div>
                </div>
              </div>

              {/* Right Column: M3 Elevated Media Card */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl p-3 sm:p-4 bg-white border border-[#E0E2EC]/80 shadow-xs space-y-3">
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={heroStudentImg}
                      alt="Siswa sedang belajar dengan bimbingan tutor privat"
                      className="w-full h-72 sm:h-80 object-cover"
                    />
                  </div>
                  <div className="p-4 bg-[#F3F4F9] rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#17181C]">Fokus Belajar Individual</p>
                      <p className="text-[11px] text-[#676A78] mt-0.5">Jenjang SD, SMP, SMA, dan Persiapan Kuliah</p>
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white border border-[#E0E2EC] text-[#17181C] shrink-0">
                      Sistem Terpadu
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Interactive Assessment Preview - M3 Surface Container */}
        <section className="py-14 sm:py-16 bg-[#FDFBFE] border-b border-[#E0E2EC]/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Context, Animated Visual Environment, & Educational Value */}
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEDFD] text-[#6C5CE7] text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Diagnostik Karakter Belajar</span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17181C] tracking-tight leading-snug">
                    Contoh Asesmen: Mengenal Cara Belajar Anda
                  </h2>
                  <p className="text-sm text-[#676A78] leading-relaxed">
                    Sebelum sesi belajar dimulai, siswa mengisi kuesioner singkat. Hasilnya menjadi panduan tutor dalam menyelaraskan metode penjelasan, ritme bimbingan, dan bentuk latihan.
                  </p>
                </div>

                {/* Dynamic Animated Media Card with Synchronized Switcher */}
                <div className="rounded-3xl bg-white border border-[#E0E2EC] p-3 sm:p-4 shadow-xs space-y-3">
                  {/* Interactive Tab Switcher */}
                  <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F9] rounded-full">
                    {sampleAssessmentOptions.map((opt, idx) => {
                      const isActive = selectedStyleAnswer === idx
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedStyleAnswer(idx)}
                          className={`flex-1 py-1.5 px-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[36px] ${
                            isActive
                              ? 'bg-white text-[#17181C] shadow-2xs'
                              : 'text-[#676A78] hover:text-[#17181C]'
                          }`}
                        >
                          <opt.icon className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{opt.type}</span>
                          <span className="sm:hidden">
                            {opt.id === 'visual' ? 'Visual' : opt.id === 'auditory' ? 'Auditori' : 'Praktis'}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Smooth Cross-Fade Animated Photo Container */}
                  <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-[#ECEEF5]">
                    {sampleAssessmentOptions.map((opt, idx) => {
                      const isSelected = selectedStyleAnswer === idx
                      return (
                        <div
                          key={opt.id}
                          className={`absolute inset-0 transition-all duration-500 ease-out ${
                            isSelected
                              ? 'opacity-100 scale-100 pointer-events-auto'
                              : 'opacity-0 scale-105 pointer-events-none'
                          }`}
                        >
                          <img
                            src={opt.image}
                            alt={opt.imageCaption}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#17181C]/85 via-[#17181C]/25 to-transparent flex flex-col justify-end p-4 text-white">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold w-fit mb-1 border border-white/25">
                              <opt.icon className="w-3.5 h-3.5" />
                              <span>Pratinjau Suasana: {opt.type}</span>
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-white drop-shadow-xs">
                              {opt.imageCaption}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Dynamic Pedagogical Breakdown based on selection */}
                  <div className="p-3.5 bg-[#F7F8FC] rounded-2xl border border-[#E0E2EC]/70 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-white border border-[#E0E2EC] flex items-center justify-center shrink-0 mt-0.5 text-[#6C5CE7]">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#17181C]">Fokus Utama Pendekatan:</p>
                        <p className="text-[11px] text-[#676A78] leading-relaxed mt-0.5">
                          {activeOption.focusPoint}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-white border border-[#E0E2EC] flex items-center justify-center shrink-0 mt-0.5 text-[#228653]">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#17181C]">Manfaat Bagi Siswa:</p>
                        <p className="text-[11px] text-[#676A78] leading-relaxed mt-0.5">
                          {activeOption.studentBenefit}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#6C5CE7] text-white text-xs font-bold shadow-xs hover:bg-[#5243D6] hover:shadow-sm transition-all min-h-[44px]"
                  >
                    <span>Ikuti Asesmen Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[11px] text-[#676A78]">
                    Gratis saat pendaftaran akun siswa baru
                  </span>
                </div>
              </div>

              {/* Right Column: Interactive Diagnostic Simulator Card - M3 Outlined Card */}
              <div className="lg:col-span-7 rounded-3xl bg-white border border-[#E0E2EC] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="pb-4 border-b border-[#E0E2EC]/80 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C5CE7]">
                        Simulasi Pertanyaan Asesmen
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-[#17181C] mt-1 leading-snug">
                        "Saat menghadapi materi pelajaran baru yang sulit, cara mana yang paling membantu Anda memahaminya?"
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[#F3F4F9] border border-[#E0E2EC] text-[#676A78] shrink-0 whitespace-nowrap">
                      Contoh 1 Soal
                    </span>
                  </div>

                  {/* Radio Cards with Click Interaction */}
                  <div className="space-y-2.5 mt-4" role="radiogroup" aria-label="Pilihan simulasi asesmen">
                    {sampleAssessmentOptions.map((opt, idx) => {
                      const isSelected = selectedStyleAnswer === idx
                      return (
                        <button
                          key={idx}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedStyleAnswer(idx)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 min-h-[48px] ${
                            isSelected
                              ? 'bg-[#F9F8FE] border-[#6C5CE7] ring-1 ring-[#6C5CE7]/30 shadow-2xs'
                              : 'bg-white border-[#E0E2EC] hover:border-[#6C5CE7]/40 hover:bg-[#FAFBFD]'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                              isSelected
                                ? 'border-[#6C5CE7] bg-[#6C5CE7] text-white'
                                : 'border-[#C9CAD3] bg-white'
                            }`}
                          >
                            {isSelected ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs sm:text-sm font-bold text-[#17181C]">
                                {opt.title}
                              </span>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${opt.tagColor} shrink-0`}>
                                {opt.type}
                              </span>
                            </div>
                            <p className="text-xs text-[#676A78] mt-1 leading-relaxed">
                              {opt.desc}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Dynamic Tutor Adaptation Box & Interactive Snippet */}
                <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#F3F4F9] border border-[#E0E2EC]/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
                      <span className="text-[11px] font-bold text-[#17181C] uppercase tracking-wider">
                        Adaptasi Pendekatan Tutor:
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#6C5CE7]">
                      {activeOption.adaptation.method}
                    </span>
                  </div>

                  <p className="text-xs text-[#525562] leading-relaxed">
                    {activeOption.adaptation.desc}
                  </p>

                  {/* Interactive Snippet Preview */}
                  <div className="pt-2 border-t border-[#E0E2EC]/70">
                    <div className="text-[11px] font-bold text-[#17181C] mb-2">
                      {activeOption.interactiveSnippet.title}
                    </div>

                    {activeOption.interactiveSnippet.type === 'diagram' && (
                      <div className="flex flex-wrap items-center gap-2">
                        {activeOption.interactiveSnippet.steps?.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="px-3 py-1.5 rounded-full bg-white border border-[#E0E2EC] text-[11px] font-semibold text-[#17181C] shadow-2xs flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7]" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeOption.interactiveSnippet.type === 'dialogue' && (
                      <div className="p-3 rounded-xl bg-white border border-[#E0E2EC] text-xs text-[#17181C] italic leading-relaxed shadow-2xs">
                        "{activeOption.interactiveSnippet.quote}"
                      </div>
                    )}

                    {activeOption.interactiveSnippet.type === 'checklist' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {activeOption.interactiveSnippet.items?.map((item, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-2.5 rounded-xl bg-white border border-[#E0E2EC] text-[11px] font-medium text-[#17181C] flex items-center gap-2 shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                            <span className="leading-tight">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Pilihan Bidang Studi - M3 Cards with Filter Chips */}
        <section className="py-14 sm:py-16 bg-[#F7F8FC] border-b border-[#E0E2EC]/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17181C] tracking-tight">
                Pilihan Bidang Studi Terpadu
              </h2>
              <p className="text-sm text-[#676A78]">
                Materi disiapkan oleh pendidik spesialis dengan kurikulum terstruktur yang tersimpan langsung di basis data platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bidang Umum - M3 Outlined Card */}
              <div className="rounded-3xl p-6 bg-white border border-[#E0E2EC] shadow-2xs space-y-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
                <div>
                  <div className="overflow-hidden rounded-2xl mb-4">
                    <img
                      src={subjectGeneralImg}
                      alt="Siswa mempelajari materi pelajaran umum sains dan matematika"
                      className="w-full h-48 sm:h-52 object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex items-center gap-3 pb-3 border-b border-[#E0E2EC]/70">
                    <div className="w-11 h-11 rounded-2xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#17181C]">Mata Pelajaran Umum</h3>
                      <p className="text-xs text-[#676A78]">Penguatan fondasi sekolah dan persiapan ujian</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#676A78] leading-relaxed mt-3">
                    Bimbingan intensif untuk mata pelajaran sains dan bahasa. Tutor mendampingi pembedahan konsep dari dasar hingga pembahasan soal olimpiade dan seleksi masuk perguruan tinggi.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-[#E0E2EC]/60">
                  {['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'].map((subj) => (
                    <span
                      key={subj}
                      className="px-3 py-1 rounded-full bg-[#F3F4F9] border border-[#E0E2EC] text-xs font-semibold text-[#17181C]"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bidang Keagamaan - M3 Outlined Card */}
              <div className="rounded-3xl p-6 bg-white border border-[#E0E2EC] shadow-2xs space-y-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
                <div>
                  <div className="overflow-hidden rounded-2xl mb-4">
                    <img
                      src={subjectQuranImg}
                      alt="Siswa mempelajari Al-Qur'an dan studi keagamaan"
                      className="w-full h-48 sm:h-52 object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex items-center gap-3 pb-3 border-b border-[#E0E2EC]/70">
                    <div className="w-11 h-11 rounded-2xl bg-[#E6F6EE] text-[#228653] flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#17181C]">Studi Keagamaan & Al-Qur'an</h3>
                      <p className="text-xs text-[#676A78]">Tahfidz, tajwid, hadits, dan bahasa arab</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#676A78] leading-relaxed mt-3">
                    Program talaqqi dan setoran hafalan dibimbing langsung oleh ustadz dan asatidzah berlatar belakang pendidikan Islam teruji untuk anak-anak hingga dewasa.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-[#E0E2EC]/60">
                  {['Al-Qur\'an & Tajwid', 'Tahfidz Mutqin', 'Hadits Pilihan', 'Fiqih Ibadah', 'Bahasa Arab'].map((subj) => (
                    <span
                      key={subj}
                      className="px-3 py-1 rounded-full bg-[#F3F4F9] border border-[#E0E2EC] text-xs font-semibold text-[#17181C]"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Alur Bimbingan di Platform Laits Edu - M3 Step Cards */}
        <section className="py-14 sm:py-16 bg-[#FDFBFE]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17181C] tracking-tight">
                Alur Bimbingan di Platform Laits Edu
              </h2>
              <p className="text-sm text-[#676A78]">
                Langkah teratur untuk memastikan kegiatan belajar mengajar berjalan transparan bagi siswa dan orang tua.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-3xl p-5 bg-white border border-[#E0E2EC] shadow-2xs space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl mb-1">
                    <img
                      src={stepRegisterImg}
                      alt="Langkah pendaftaran akun dan kelengkapan profil siswa"
                      className="w-full h-40 sm:h-44 object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFEDFD] text-[#6C5CE7] inline-block">
                      Langkah 1
                    </span>
                    <h4 className="text-sm font-bold text-[#17181C]">Daftar & Lengkapi Data</h4>
                    <p className="text-xs text-[#676A78] leading-relaxed">
                      Buat akun siswa dan cantumkan jenjang kelas, mata pelajaran yang dituju, serta kontak orang tua untuk koordinasi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl p-5 bg-white border border-[#E0E2EC] shadow-2xs space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl mb-1">
                    <img
                      src={stepAssessmentImg}
                      alt="Langkah pengerjaan asesmen karakter dan gaya belajar"
                      className="w-full h-40 sm:h-44 object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFEDFD] text-[#6C5CE7] inline-block">
                      Langkah 2
                    </span>
                    <h4 className="text-sm font-bold text-[#17181C]">Isi Asesmen Karakter</h4>
                    <p className="text-xs text-[#676A78] leading-relaxed">
                      Kerjakan kuesioner singkat untuk memetakan kecenderungan belajar visual, auditori, atau kinestetik Anda.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl p-5 bg-white border border-[#E0E2EC] shadow-2xs space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl mb-1">
                    <img
                      src={stepTutoringImg}
                      alt="Langkah penjadwalan bimbingan privat bersama tutor"
                      className="w-full h-40 sm:h-44 object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFEDFD] text-[#6C5CE7] inline-block">
                      Langkah 3
                    </span>
                    <h4 className="text-sm font-bold text-[#17181C]">Jadwalkan Sesi Belajar</h4>
                    <p className="text-xs text-[#676A78] leading-relaxed">
                      Pilih tutor sesuai mata pelajaran dan tentukan jadwal bimbingan rutin dengan pantauan progres di dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 text-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#6C5CE7] text-white text-xs font-bold shadow-xs hover:bg-[#5243D6] hover:shadow-sm transition-all min-h-[44px]"
              >
                <span>Mulai Pendaftaran Akun Siswa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - M3 Surface Container */}
      <footer className="bg-[#1D1B20] text-[#E6E0E9] py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">LAITS EDU TECH</span>
          </div>

          <p className="text-xs text-[#CAC4D0] text-center sm:text-right">
            (c) {new Date().getFullYear()} Laits Edu Tech. Sistem Manajemen Belajar & Bimbingan Les Privat.
          </p>
        </div>
      </footer>
    </div>
  )
}

