import { useState } from 'react'
import { Link } from 'react-router'
import {
  Layers,
  BookOpen,
  GraduationCap,
  Award,
  Check,
} from 'lucide-react'
import heroStudentImg from '@/assets/hero-student.jpg'
import assessmentStudentImg from '@/assets/assessment-student.jpg'
import subjectGeneralImg from '@/assets/subject-general.jpg'
import subjectQuranImg from '@/assets/subject-quran.jpg'
import stepRegisterImg from '@/assets/step-register.jpg'
import stepAssessmentImg from '@/assets/step-assessment.jpg'
import stepTutoringImg from '@/assets/step-tutoring.jpg'
import { useAuth } from '@/hooks/useAuth'

export function LandingPage() {
  const { session, role } = useAuth()
  const [selectedStyleAnswer, setSelectedStyleAnswer] = useState<number | null>(0)

  const dashboardUrl =
    role === 'admin' || role === 'super_admin'
      ? '/admin/dashboard'
      : role === 'tutor'
      ? '/tutor/dashboard'
      : '/student/dashboard'

  const sampleAssessmentOptions = [
    {
      title: 'Melihat diagram, bagan, dan visualisasi rumus',
      type: 'Tipe Visual',
      desc: 'Lebih mudah memahami konsep lewat skema dan warna.',
    },
    {
      title: 'Mendengarkan penjelasan tutor dan berdiskusi langsung',
      type: 'Tipe Auditori',
      desc: 'Cepat menangkap poin saat materi dibahasakan secara lisan.',
    },
    {
      title: 'Mengerjakan langsung latihan soal dan studi kasus',
      type: 'Tipe Kinestetik & Praktis',
      desc: 'Pemahaman terbentuk lewat tindakan dan eksperimen terarah.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F4F5FB] text-[#1D1D24] antialiased flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-border/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-sm">
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

          <nav className="flex items-center gap-3">
            {session ? (
              <Link
                to={dashboardUrl}
                className="px-5 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold shadow-sm hover:bg-[#5243D6] transition-colors min-h-[42px] flex items-center justify-center"
              >
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-[#EEF0F8] transition-colors min-h-[42px] flex items-center"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold shadow-sm hover:bg-[#5243D6] transition-colors min-h-[42px] flex items-center"
                >
                  Daftar Siswa
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-12 lg:py-16 border-b border-border/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Heading & Value Proposition */}
              <div className="lg:col-span-7 space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#17181C] tracking-tight leading-[1.2]">
                  Bimbingan Belajar Terarah Berbasis Karakter & Les Privat Berkualitas
                </h1>

                <p className="text-base sm:text-lg text-[#676A78] leading-relaxed max-w-xl">
                  Setiap siswa memiliki cara belajar yang berbeda. Laits Edu Tech membantu mengidentifikasi kecenderungan belajar Anda sebelum memulai bimbingan les privat dengan tutor terverifikasi.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <Link
                    to="/register"
                    className="px-6 py-3.5 rounded-xl bg-[#6C5CE7] text-white text-sm font-bold shadow-sm hover:bg-[#5243D6] transition-colors flex items-center justify-center min-h-[48px]"
                  >
                    Daftar Sebagai Siswa
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3.5 rounded-xl bg-white border border-border text-foreground text-sm font-bold hover:bg-[#EEF0F8] transition-colors flex items-center justify-center min-h-[48px]"
                  >
                    Masuk ke Akun Terdaftar
                  </Link>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#676A78] font-medium border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#45B97C]" />
                    <span>Kurikulum Umum & Keagamaan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#45B97C]" />
                    <span>Asesmen Karakter Belajar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#45B97C]" />
                    <span>Laporan Hasil Nyata Tanpa Rekayasa</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Real Context Illustration Card */}
              <div className="lg:col-span-5">
                <div className="surface-card p-3 bg-white border border-border shadow-sm">
                  <img
                    src={heroStudentImg}
                    alt="Siswa faceless sedang belajar dengan bimbingan terarah dan asesmen karakter"
                    className="w-full h-72 sm:h-80 object-cover rounded-2xl"
                  />
                  <div className="p-4 bg-[#F4F5FB] rounded-xl mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#17181C]">Fokus Belajar Individual</p>
                      <p className="text-[11px] text-[#676A78]">SD, SMP, SMA, dan Persiapan Kuliah</p>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-white border border-border text-[#17181C]">
                      Sistem Terintegrasi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content-Driven Section 1: Interactive Assessment Preview */}
        <section className="py-14 bg-white border-b border-border/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17181C] tracking-tight">
                  Contoh Asesmen: Mengenal Cara Belajar Anda
                </h2>
                <p className="text-sm text-[#676A78] leading-relaxed">
                  Sebelum memulai les privat, siswa mengisi kuesioner asesmen. Hasilnya menjadi acuan tutor dalam menentukan metode penyampaian materi, tempo belajar, dan variasi latihan.
                </p>

                <div className="overflow-hidden rounded-2xl bg-[#F4F5FB] border border-border/70 p-2 shadow-xs">
                  <img
                    src={assessmentStudentImg}
                    alt="Ilustrasi faceless pemetaan asesmen gaya belajar visual, auditori, dan kinestetik"
                    className="w-full h-44 sm:h-48 object-cover rounded-xl"
                    loading="lazy"
                  />
                </div>

                <div className="pt-1">
                  <Link
                    to="/register"
                    className="inline-block text-xs font-bold text-[#6C5CE7] hover:underline"
                  >
                    Ikuti Asesmen Lengkap Setelah Registrasi
                  </Link>
                </div>
              </div>

              {/* Interactive Assessment Widget */}
              <div className="lg:col-span-7 surface-card p-6 bg-[#F4F5FB] border border-border">
                <div className="pb-3 border-b border-border/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#676A78]">
                    Simulasi Pertanyaan Asesmen
                  </span>
                  <p className="text-sm font-bold text-[#17181C] mt-1">
                    "Saat menghadapi materi pelajaran yang baru dan sulit, cara mana yang paling membantu Anda memahaminya?"
                  </p>
                </div>

                <div className="space-y-2.5 mt-4">
                  {sampleAssessmentOptions.map((opt, idx) => {
                    const isSelected = selectedStyleAnswer === idx
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedStyleAnswer(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 min-h-[44px] ${
                          isSelected
                            ? 'bg-white border-[#6C5CE7] ring-1 ring-[#6C5CE7] shadow-xs'
                            : 'bg-white/80 border-border hover:bg-white'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                            isSelected
                              ? 'border-[#6C5CE7] bg-[#6C5CE7] text-white'
                              : 'border-border bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#17181C]">
                              {opt.title}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EFEDFD] text-[#6C5CE7] shrink-0">
                              {opt.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#676A78] mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content-Driven Section 2: Dua Jalur Pembelajaran Riil */}
        <section className="py-14 bg-[#F4F5FB] border-b border-border/70">
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
              {/* Bidang Umum */}
              <div className="surface-card p-6 bg-white border border-border space-y-4 flex flex-col justify-between">
                <div>
                  <div className="overflow-hidden rounded-xl bg-[#F4F5FB] border border-border/60 mb-4">
                    <img
                      src={subjectGeneralImg}
                      alt="Ilustrasi siswa faceless mempelajari materi pelajaran umum sains dan matematika"
                      className="w-full h-48 sm:h-52 object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                    <div className="w-10 h-10 rounded-xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#17181C]">Mata Pelajaran Umum</h3>
                      <p className="text-xs text-[#676A78]">Penguatan fondasi sekolah & persiapan ujian</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#676A78] leading-relaxed mt-3">
                    Bimbingan intensif untuk mata pelajaran sains dan bahasa. Tutor mendampingi pembedahan konsep dari dasar hingga pembahasan soal olimpiade dan seleksi masuk perguruan tinggi.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                  {['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris'].map((subj) => (
                    <span
                      key={subj}
                      className="px-2.5 py-1 rounded-md bg-[#F4F5FB] border border-border text-xs font-semibold text-[#17181C]"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bidang Keagamaan */}
              <div className="surface-card p-6 bg-white border border-border space-y-4 flex flex-col justify-between">
                <div>
                  <div className="overflow-hidden rounded-xl bg-[#F4F5FB] border border-border/60 mb-4">
                    <img
                      src={subjectQuranImg}
                      alt="Ilustrasi siswa faceless mempelajari Al-Qur'an dan studi keagamaan"
                      className="w-full h-48 sm:h-52 object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F6EE] text-[#45B97C] flex items-center justify-center">
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

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                  {['Al-Qur\'an & Tajwid', 'Tahfidz Mutqin', 'Hadits', 'Fiqih Ibadah', 'Bahasa Arab'].map((subj) => (
                    <span
                      key={subj}
                      className="px-2.5 py-1 rounded-md bg-[#F4F5FB] border border-border text-xs font-semibold text-[#17181C]"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content-Driven Section 3: Alur Belajar Siswa */}
        <section className="py-14 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17181C] tracking-tight">
                Alur Bimbingan di Platform Laits Edu
              </h2>
              <p className="text-sm text-[#676A78]">
                Langkah teratur untuk memastikan kegiatan belajar mengajar berjalan transparan bagi siswa dan wali murid.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="surface-card p-5 rounded-2xl bg-white border border-border space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl bg-[#F4F5FB] border border-border/60">
                    <img
                      src={stepRegisterImg}
                      alt="Ilustrasi faceless langkah pendaftaran akun dan kelengkapan profil siswa"
                      className="w-full h-40 sm:h-44 object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#6C5CE7]">Langkah 1</span>
                    <h4 className="text-sm font-bold text-[#17181C]">Daftar & Lengkapi Data</h4>
                    <p className="text-xs text-[#676A78] leading-relaxed">
                      Buat akun siswa dan lengkapi data jenjang kelas, asal sekolah, serta nomor kontak wali murid untuk koordinasi jadwal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="surface-card p-5 rounded-2xl bg-white border border-border space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl bg-[#F4F5FB] border border-border/60">
                    <img
                      src={stepAssessmentImg}
                      alt="Ilustrasi faceless langkah pengerjaan asesmen karakter dan gaya belajar"
                      className="w-full h-40 sm:h-44 object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#6C5CE7]">Langkah 2</span>
                    <h4 className="text-sm font-bold text-[#17181C]">Isi Asesmen Karakter</h4>
                    <p className="text-xs text-[#676A78] leading-relaxed">
                      Kerjakan kuesioner singkat untuk memetakan kecenderungan belajar visual, auditori, atau kinestetik Anda.
                    </p>
                  </div>
                </div>
              </div>

              <div className="surface-card p-5 rounded-2xl bg-white border border-border space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl bg-[#F4F5FB] border border-border/60">
                    <img
                      src={stepTutoringImg}
                      alt="Ilustrasi faceless langkah penjadwalan bimbingan privat bersama tutor terverifikasi"
                      className="w-full h-40 sm:h-44 object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#6C5CE7]">Langkah 3</span>
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
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold shadow-sm hover:bg-[#5243D6] transition-colors min-h-[44px]"
              >
                Mulai Pendaftaran Akun Siswa
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#17181C] text-[#C9CAD3] py-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C5CE7] flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">LAITS EDU TECH</span>
          </div>

          <p className="text-xs text-[#8A8D9A] text-center sm:text-right">
            (c) {new Date().getFullYear()} Laits Edu Tech. Sistem Manajemen Belajar & Bimbingan Les Privat.
          </p>
        </div>
      </footer>
    </div>
  )
}

