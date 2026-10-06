import { Link } from 'react-router'
import {
  Brain,
  Compass,
  BookOpen,
  GraduationCap,
  Calendar,
  TrendingUp,
  FileText,
  MessageSquare,
  Bell,
  HelpCircle,
  Construction,
  type LucideIcon,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'

interface FeatureConfig {
  title: string
  subtitle: string
  icon: LucideIcon
  phaseText: string
  description: string
}

const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  assessment: {
    title: 'Asesmen Kepribadian Belajar',
    subtitle: 'Pemetaan minat, gaya belajar, dan kecenderungan pedagogis siswa.',
    icon: Brain,
    phaseText: 'Pengembangan Phase 2',
    description:
      'Engine asesmen kepribadian belajar sedang dirancang untuk Phase 2. Setelah selesai, siswa dapat mengerjakan tes kuesioner dan menerima rekomendasi metode belajar yang dipersonalisasi.',
  },
  personality: {
    title: 'Hasil Kepribadian & Gaya Belajar',
    subtitle: 'Laporan tipe kepribadian belajar dan rekomendasi pedagogis.',
    icon: Compass,
    phaseText: 'Pengembangan Phase 2',
    description:
      'Halaman ini akan menampilkan profil kepribadian belajar Anda secara komprehensif setelah Anda menyelesaikan sesi asesmen.',
  },
  learning: {
    title: 'Modul & Materi Belajar',
    subtitle: 'Katalog kurikulum pembelajaran terarah untuk setiap mata pelajaran.',
    icon: BookOpen,
    phaseText: 'Pengembangan Phase 2',
    description:
      'Akses materi terstruktur, video pembelajaran, dan latihan soal yang disesuaikan dengan kurikulum nasional dan keagamaan.',
  },
  tutors: {
    title: 'Marketplace Tutor Privat',
    subtitle: 'Temukan pendidik privat terbaik dan terverifikasi untuk kebutuhan Anda.',
    icon: GraduationCap,
    phaseText: 'Pengembangan Phase 2',
    description:
      'Fitur tutor marketplace akan segera tersedia pada Phase 2. Anda dapat melihat portofolio guru, ulasan murid, dan memesan jadwal les privat secara langsung.',
  },
  schedule: {
    title: 'Jadwal Les & Bimbingan',
    subtitle: 'Kalender sesi belajar interaktif bersama tutor pilihan.',
    icon: Calendar,
    phaseText: 'Pengembangan Phase 2',
    description:
      'Sistem booking dan manajemen jadwal les privat terintegrasi dengan kalender digital akan aktif setelah modul booking dirilis pada Phase 2.',
  },
  progress: {
    title: 'Analitika Perkembangan Belajar',
    subtitle: 'Pantau peningkatan pemahaman materi secara berkala.',
    icon: TrendingUp,
    phaseText: 'Pengembangan Phase 2',
    description:
      'Grafik analitik dan skor pemahaman materi akan dikalkulasi secara otomatis dari setiap evaluasi pembelajaran yang telah diselesaikan.',
  },
  reports: {
    title: 'Laporan Perkembangan Bulanan',
    subtitle: 'Ringkasan performa belajar resmi untuk siswa dan orang tua.',
    icon: FileText,
    phaseText: 'Pengembangan Phase 2',
    description:
      'Laporan perkembangan bulanan komprehensif yang dapat diunduh dalam format PDF akan tersedia setelah Anda mengikuti sesi pembelajaran teratur.',
  },
  messages: {
    title: 'Pesan & Konsultasi Tutor',
    subtitle: 'Komunikasi langsung antara siswa, orang tua, dan pengajar.',
    icon: MessageSquare,
    phaseText: 'Pengembangan Phase 2',
    description:
      'Fitur perpesanan aman untuk berkonsultasi mengenai materi pembelajaran dan pengaturan jadwal les privat.',
  },
  notifications: {
    title: 'Pemberitahuan Sistem',
    subtitle: 'Arsip pengumuman, pengingat jadwal, dan informasi penting.',
    icon: Bell,
    phaseText: 'Pengembangan Phase 1 / 2',
    description:
      'Pemberitahuan otomatis terkait jadwal bimbingan dan pembaruan materi belajar akan ditampilkan di halaman ini.',
  },
  help: {
    title: 'Pusat Bantuan & Panduan Siswa',
    subtitle: 'Pertanyaan yang sering diajukan dan kontak bantuan operasional.',
    icon: HelpCircle,
    phaseText: 'Panduan Informasi',
    description:
      'Jika Anda memerlukan bantuan terkait registrasi akun, pemilihan jenjang kelas, atau bantuan teknis, silakan hubungi tim dukungan Laits Edu Tech.',
  },
}

interface PlaceholderPageProps {
  featureKey: keyof typeof FEATURE_CONFIGS
}

export function PlaceholderPage({ featureKey }: PlaceholderPageProps) {
  const config = FEATURE_CONFIGS[featureKey] || {
    title: 'Fitur Sedang Dalam Pengembangan',
    subtitle: 'Fungsionalitas ini akan segera hadir pada tahap pengembangan berikutnya.',
    icon: Construction,
    phaseText: 'Dalam Pengembangan',
    description: 'Kami sedang membangun fitur ini dengan standar kualitas dan keamanan terbaik.',
  }

  const Icon = config.icon

  return (
    <AppShell>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        badge={config.phaseText}
      />

      <div className="surface-card p-8 sm:p-12 text-center max-w-2xl mx-auto my-6 space-y-6 bg-white border border-border">
        <div className="w-14 h-14 rounded-2xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center mx-auto">
          <Icon className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#17181C]">
            {config.title}
          </h2>
          <p className="text-sm text-[#676A78] leading-relaxed max-w-lg mx-auto">
            {config.description}
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/student/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold shadow-sm hover:bg-[#5243D6] transition-colors min-h-[42px]"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
