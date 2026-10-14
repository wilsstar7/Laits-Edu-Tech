/**
 * SPESIFIKASI DAN BANK SOAL LENGKAP - PERSONA ACADEMY (Single Source of Truth)
 * Sesuai dokumen Soal.Md (Bebas tag referensi kutipan dan mematuhi aturan antislop tanpa em dash).
 */

export type StudentLevel = 'SD' | 'SMP' | 'SMA'

export type AssessmentPackageCode =
  | 'PAKET_1_PERSONA_MODALITY'
  | 'PAKET_2_PERSONA_POTENTIAL'
  | 'PAKET_3_PERSONA_MASTERY'

export type AssessmentModuleCode = 'PM-VAK-01' | 'PM-HEM-02' | 'PM-SKB-03'

export interface AssessmentPackage {
  code: AssessmentPackageCode
  name: string
  subtitle: string
  status: 'active' | 'upcoming'
  badgeText: string
  targetAge: string
  description: string
  deliverables: string[]
  operationalRole: string
  modules?: Array<{
    code: AssessmentModuleCode
    name: string
    shortDesc: string
  }>
}

export interface QuestionOption {
  id: string
  label: string
  indicator: 'V' | 'A' | 'K' | 'LEFT_BRAIN' | 'RIGHT_BRAIN' | 'A' | 'B' | 'C'
  scoreKey?: string
}

export interface PersonaQuestion {
  id: string
  number: number
  moduleCode: AssessmentModuleCode
  moduleName: string
  cluster: 'VAK' | 'HEM' | 'BIO' | 'ENV' | 'FOCUS'
  levels: StudentLevel[]
  questionText: string
  options: QuestionOption[]
  isAnchor?: boolean
  anchorCluster?: 'BIO' | 'ENV' | 'FOCUS'
}

/**
 * 3 Katalog Paket Asesmen sesuai Bagian 2 di Soal.Md
 */
export const ASSESSMENT_PACKAGES: AssessmentPackage[] = [
  {
    code: 'PAKET_1_PERSONA_MODALITY',
    name: 'Persona Modality',
    subtitle: 'Fondasi Teknis & Cara Belajar',
    status: 'active',
    badgeText: 'Aktif (Tahap 1)',
    targetAge: 'SD, SMP, SMA',
    description:
      'Memetakan gerbang sensori penerimaan informasi (VAK), dominasi belahan otak berpikir, dan screening kebiasaan lingkungan belajar.',
    deliverables: [
      'Hasil Asesmen Profil Belajar Lengkap',
      'Rekomendasi Penataan Lingkungan Belajar di Rumah',
      'Instruksi Khusus untuk Guru Privat (SOP Intervensi)',
    ],
    operationalRole:
      'Produk pembuka (entry-level) untuk mengatasi hambatan belajar teknis harian siswa dan panduan tutor.',
    modules: [
      {
        code: 'PM-VAK-01',
        name: 'Sensory Modality (VAK)',
        shortDesc: 'Penerimaan dan pemrosesan informasi (Visual, Auditory, Kinesthetic).',
      },
      {
        code: 'PM-HEM-02',
        name: 'Dominasi Hemisfer Otak',
        shortDesc: 'Gaya berpikir analitis sekuensial (Kiri) vs holistik kreatif (Kanan).',
      },
      {
        code: 'PM-SKB-03',
        name: 'Screening Kebiasaan Belajar',
        shortDesc: 'Jam biologis kognitif, toleransi lingkungan fisik, dan rentang fokus.',
      },
    ],
  },
  {
    code: 'PAKET_2_PERSONA_POTENTIAL',
    name: 'Persona Potential',
    subtitle: 'Eksplorasi Karakter & Kecerdasan',
    status: 'upcoming',
    badgeText: 'Segera Hadir (Tahap 2)',
    targetAge: 'SD hingga SMP',
    description:
      'Mendalami tipologi kepribadian belajar siswa (adaptasi MBTI) dan 8 kecerdasan majemuk (Multiple Intelligences).',
    deliverables: [
      'Seluruh Deliverables Paket Persona Modality',
      'Sesi Konsultasi Edukatif Bersama Konselor (45 menit)',
      'Peta Bakat & Pencegahan Hambatan Emosional Siswa',
    ],
    operationalRole:
      'Produk utama untuk mengungkap potensi bakat sejati dan menyelaraskan komunikasi orang tua/guru.',
  },
  {
    code: 'PAKET_3_PERSONA_MASTERY',
    name: 'Persona Mastery',
    subtitle: 'Spesialisasi & Peta Jalan Karier',
    status: 'upcoming',
    badgeText: 'Segera Hadir (Tahap 3)',
    targetAge: 'SMP Akhir & SMA',
    description:
      'Penetapan target jurusan masa depan, Holland RIASEC, dan analisis kesenjangan akademik menuju kampus impian.',
    deliverables: [
      'Master Learning & Pathway Portfolio (10-12 halaman)',
      'Sesi Konsultasi Mendalam (60 menit)',
      'Akses Prioritas Pencocokan Senior Tutor Match',
    ],
    operationalRole:
      'Paket premium berorientasi strategi jangka panjang dan bimbingan privat semesteran/tahunan.',
  },
]

/**
 * 65 Butir Soal Lengkap Paket 1 (Persona Modality)
 * Bersih dari tag cite, tanda em dash, dan teks singkatan.
 */
export const PERSONA_MODALITY_QUESTIONS: PersonaQuestion[] = [
  // =========================================================================
  // MODUL 1.1: SENSORY MODALITY (VAK) - PM-VAK-01 (Soal 1 - 30)
  // =========================================================================
  {
    id: 'pm-vak-01',
    number: 1,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Ketika kamu belajar materi baru di kelas, hal apa yang membuatmu paling cepat mengerti?',
    options: [
      {
        id: 'vak-01-a',
        label: 'Memperhatikan tulisan, gambar, atau video yang ditunjukkan guru',
        indicator: 'V',
      },
      {
        id: 'vak-01-b',
        label: 'Mendengarkan suara penjelasan guru dengan saksama',
        indicator: 'A',
      },
      {
        id: 'vak-01-c',
        label: 'Mencoba langsung mempraktikkan atau mengerjakan contoh soalnya',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-02',
    number: 2,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Jika kamu harus merakit mainan baru atau menggunakan barang yang belum pernah kamu pakai, apa yang kamu lakukan?',
    options: [
      {
        id: 'vak-02-a',
        label: 'Melihat gambar petunjuk atau menonton video tutorialnya',
        indicator: 'V',
      },
      {
        id: 'vak-02-b',
        label: 'Meminta orang lain membacakan petunjuknya atau bertanya cara pakainya',
        indicator: 'A',
      },
      {
        id: 'vak-02-c',
        label: 'Langsung membongkar dan mencoba-coba memainkannya dengan tangan',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-03',
    number: 3,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Saat kamu mencoba mengingat cara mengeja atau menulis kata bahasa Inggris yang sulit, caramu mengingatnya adalah...',
    options: [
      {
        id: 'vak-03-a',
        label: 'Membayangkan bentuk tulisan kata tersebut di dalam kepalamu',
        indicator: 'V',
      },
      {
        id: 'vak-03-b',
        label: 'Mengeja huruf-hurufnya dengan suara pelan atau membacanya keras-keras',
        indicator: 'A',
      },
      {
        id: 'vak-03-c',
        label: 'Menuliskan kata itu di atas kertas berkali-kali sampai tanganmu terbiasa',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-04',
    number: 4,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Jika kamu harus menghafal banyak materi untuk ulangan besok, caramu belajar adalah...',
    options: [
      {
        id: 'vak-04-a',
        label: 'Membaca catatan sambil memberi garis bawah atau stabilo warna-warni',
        indicator: 'V',
      },
      {
        id: 'vak-04-b',
        label: 'Menghafal sambil bersuara atau meminta orang tua/teman memberikan tanya jawab lisan',
        indicator: 'A',
      },
      {
        id: 'vak-04-c',
        label: 'Menghafal sambil berjalan mondar-mandir di kamar atau memainkan pena di tangan',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-05',
    number: 5,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Apa hal yang paling sering membuat konsentrasimu langsung buyar saat sedang serius belajar?',
    options: [
      {
        id: 'vak-05-a',
        label: 'Meja yang sangat berantakan atau ada orang yang mondar-mandir di depanmu',
        indicator: 'V',
      },
      {
        id: 'vak-05-b',
        label: 'Suara TV, obrolan orang, atau suara bising dari luar rumah',
        indicator: 'A',
      },
      {
        id: 'vak-05-c',
        label: 'Kursi yang tidak nyaman atau dilarang bergerak sama sekali dalam waktu lama',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-06',
    number: 6,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Ketika temanmu bertanya jalan menuju suatu tempat, bagaimana caramu menjelaskannya?',
    options: [
      {
        id: 'vak-06-a',
        label: 'Menggambarkan peta di kertas atau mencontohkan denahnya pakai tangan',
        indicator: 'V',
      },
      {
        id: 'vak-06-b',
        label: 'Memberitahu arahnya lewat ucapan secara detail (misal: "nanti belok kanan di lampu merah")',
        indicator: 'A',
      },
      {
        id: 'vak-06-c',
        label: 'Menunjuk arahnya dengan gerakan tubuh atau mengajaknya jalan bersama',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-07',
    number: 7,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Setelah pulang dari jalan-jalan atau liburan sekolah, hal apa yang paling kamu ingat dari tempat tersebut?',
    options: [
      {
        id: 'vak-07-a',
        label: 'Pemandangannya, warna bangunannya, atau foto-foto yang diambil',
        indicator: 'V',
      },
      {
        id: 'vak-07-b',
        label: 'Suara suasananya, lagu yang diputar, atau obrolan seru selama di jalan',
        indicator: 'A',
      },
      {
        id: 'vak-07-c',
        label: 'Aktivitas yang dilakukan, makanan yang dicoba, atau rasa lelah/senangnya',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-08',
    number: 8,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Jika disuruh memilih tugas atau PR dari sekolah, mana yang paling kamu sukai?',
    options: [
      {
        id: 'vak-08-a',
        label: 'Membuat poster, peta pikiran (mind map), atau presentasi bergambar',
        indicator: 'V',
      },
      {
        id: 'vak-08-b',
        label: 'Membuat rekaman suara, mengikuti debat, atau presentasi berbicara',
        indicator: 'A',
      },
      {
        id: 'vak-08-c',
        label: 'Membuat kerajinan tangan, eksperimen sains, atau tugas olahraga',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-09',
    number: 9,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Saat kamu sedang membaca buku cerita atau novel, apa yang terjadi saat kamu membacanya?',
    options: [
      {
        id: 'vak-09-a',
        label: 'Kamu membayangkan adegan ceritanya seperti menonton film di dalam pikiran',
        indicator: 'V',
      },
      {
        id: 'vak-09-b',
        label: 'Kamu seolah-olah mendengar suara tokoh-tokohnya berbicara di kepalamu',
        indicator: 'A',
      },
      {
        id: 'vak-09-c',
        label: 'Kamu ikut merasa tegang, sering mengubah posisi duduk, atau ikut menggerakkan tangan saat adegan seru',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-10',
    number: 10,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Jika ada dua temanmu yang sedang bertengkar di kelas, hal apa yang pertama kali kamu perhatikan?',
    options: [
      {
        id: 'vak-10-a',
        label: 'Ekspresi wajah marah mereka atau gerakan tubuh mereka',
        indicator: 'V',
      },
      {
        id: 'vak-10-b',
        label: 'Nada suara mereka yang meninggi atau kata-kata yang mereka ucapkan',
        indicator: 'A',
      },
      {
        id: 'vak-10-c',
        label: 'Suasana kelas yang jadi tegang atau dorong-dorongan fisik yang terjadi',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-11',
    number: 11,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Saat kamu ingin membantu menjelaskan pelajaran matematika yang sulit kepada temanmu, kamu biasanya...',
    options: [
      {
        id: 'vak-11-a',
        label: 'Menuliskan cara hitungnya di kertas agar temanmu bisa melihat rumusnya',
        indicator: 'V',
      },
      {
        id: 'vak-11-b',
        label: 'Menjelaskan langkah-langkah hitungannya secara lisan pelan-pelan',
        indicator: 'A',
      },
      {
        id: 'vak-11-c',
        label: 'Memberikan contoh benda nyata atau meminta temanmu memegang pensil untuk ikut menghitung bersamamu',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-12',
    number: 12,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Ketika kamu harus fokus mengerjakan PR matematika yang susah, apa kebiasaan yang tidak sadar sering kamu lakukan?',
    options: [
      {
        id: 'vak-12-a',
        label: 'Mencoret-coret kertas buram di bagian pinggirnya',
        indicator: 'V',
      },
      {
        id: 'vak-12-b',
        label: 'Berbicara atau bergumam pada diri sendiri saat menghitung',
        indicator: 'A',
      },
      {
        id: 'vak-12-c',
        label: 'Menggigit ujung pensil, mengetuk meja, atau menggoyang-goyangkan kaki',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-13',
    number: 13,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Kalau kamu harus belajar permainan baru (seperti permainan papan atau kartu), kamu paling suka jika...',
    options: [
      {
        id: 'vak-13-a',
        label: 'Melihat orang lain memainkannya terlebih dahulu sampai selesai',
        indicator: 'V',
      },
      {
        id: 'vak-13-b',
        label: 'Mendengarkan temanmu membacakan peraturan permainannya',
        indicator: 'A',
      },
      {
        id: 'vak-13-c',
        label: 'Langsung ikut bermain sambil perlahan-lahan memahami aturannya di tengah jalan',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-14',
    number: 14,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Bagaimana caramu mengecek apakah jawaban di lembar ujianmu sudah benar atau belum?',
    options: [
      {
        id: 'vak-14-a',
        label: 'Membaca ulang bentuk tulisan jawabannya secara keseluruhan untuk mencari yang aneh',
        indicator: 'V',
      },
      {
        id: 'vak-14-b',
        label: 'Membaca jawabannya dengan suara berbisik untuk mendengar apakah kalimatnya sudah pas',
        indicator: 'A',
      },
      {
        id: 'vak-14-c',
        label: 'Menghitung ulang dengan jari atau mengecek ulang coretan perhitunganmu di kertas buram',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-15',
    number: 15,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Pujian seperti apa dari guru atau orang tua yang paling membuatmu merasa usahamu dihargai?',
    options: [
      {
        id: 'vak-15-a',
        label: 'Mendapat nilai bagus yang tertulis di kertas atau diberi stiker/bintang',
        indicator: 'V',
      },
      {
        id: 'vak-15-b',
        label: 'Mendengar ucapan "Kerja bagus, kamu hebat!" langsung di depanmu',
        indicator: 'A',
      },
      {
        id: 'vak-15-c',
        label: 'Mendapat tepukan bangga di pundak atau ajakan tos tangan',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-16',
    number: 16,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMP', 'SMA'],
    questionText:
      'Saat mendapat tugas kelompok dari guru, peran apa yang paling kamu sukai?',
    options: [
      {
        id: 'vak-16-a',
        label: 'Bagian membuat desain presentasi, poster, atau merangkum tulisan',
        indicator: 'V',
      },
      {
        id: 'vak-16-b',
        label: 'Bagian menjadi pembicara yang mempresentasikan tugas di depan kelas',
        indicator: 'A',
      },
      {
        id: 'vak-16-c',
        label: 'Bagian mencari bahan, merakit alat, atau memperagakan hasilnya',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-17',
    number: 17,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMP', 'SMA'],
    questionText:
      'Pada pelajaran Sejarah atau IPS, cara belajar mana yang paling membuatmu tidak mudah mengantuk?',
    options: [
      {
        id: 'vak-17-a',
        label: 'Menonton film dokumenter atau melihat foto-foto sejarah di buku',
        indicator: 'V',
      },
      {
        id: 'vak-17-b',
        label: 'Mendengarkan guru bercerita atau mengadakan sesi debat di kelas',
        indicator: 'A',
      },
      {
        id: 'vak-17-c',
        label: 'Melakukan drama/sosiodrama di kelas atau kunjungan langsung ke museum',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-18',
    number: 18,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMP', 'SMA'],
    questionText:
      'Saat berkenalan dengan teman baru di sekolah, hal apa yang biasanya paling mudah kamu ingat dari mereka?',
    options: [
      {
        id: 'vak-18-a',
        label: 'Wajahnya, gaya rambutnya, atau barang yang dia pakai',
        indicator: 'V',
      },
      {
        id: 'vak-18-b',
        label: 'Nama panggilannya atau cara nada suaranya berbicara',
        indicator: 'A',
      },
      {
        id: 'vak-18-c',
        label: 'Hal yang kalian lakukan bersama saat pertama kali bertemu atau cara dia berjabat tangan',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-19',
    number: 19,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMP', 'SMA'],
    questionText:
      'Jika kamu harus presentasi di depan kelas, apa yang kamu lakukan agar tidak lupa?',
    options: [
      {
        id: 'vak-19-a',
        label: 'Membuat slide yang bagus dan membaca kartu catatan kecil bergaris bawah',
        indicator: 'V',
      },
      {
        id: 'vak-19-b',
        label: 'Menghafalkan kalimat pembukanya dengan membacanya keras-keras sebelum maju',
        indicator: 'A',
      },
      {
        id: 'vak-19-c',
        label: 'Latihan presentasi sambil menggerakkan tangan atau berlatih sambil berjalan-jalan',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-20',
    number: 20,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMP', 'SMA'],
    questionText:
      'Ketika kamu belajar sesuatu yang baru dari internet, apa yang pertama kali kamu cari?',
    options: [
      {
        id: 'vak-20-a',
        label: 'Infografis, gambar ringkasan, atau artikel dengan banyak ilustrasi',
        indicator: 'V',
      },
      {
        id: 'vak-20-b',
        label: 'Siniar (podcast) atau video penjelasan (meskipun kamu hanya mendengarkan suaranya)',
        indicator: 'A',
      },
      {
        id: 'vak-20-c',
        label: 'Video tutorial interaktif di mana kamu bisa langsung ikut mempraktikkannya',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-21',
    number: 21,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMA'],
    questionText:
      'Jika kamu mendapat tugas membuat karangan cerita atau esai yang panjang, bagaimana caramu memulainya?',
    options: [
      {
        id: 'vak-21-a',
        label: 'Membuat kerangka tulisan atau peta konsep (mind map) di kertas terlebih dahulu',
        indicator: 'V',
      },
      {
        id: 'vak-21-b',
        label: 'Mengucapkan ide-ide ceritamu sendiri secara lisan sebelum mulai menuliskannya',
        indicator: 'A',
      },
      {
        id: 'vak-21-c',
        label: 'Langsung mengetik/menulis saja apa yang ada di pikiran, nanti baru diperbaiki sambil jalan',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-22',
    number: 22,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMA'],
    questionText:
      'Saat kamu benar-benar kesulitan mengingat rumus fisika atau matematika, trik apa yang sering berhasil membantumu?',
    options: [
      {
        id: 'vak-22-a',
        label: 'Menulis rumus tersebut besar-besar dengan spidol warna dan menempelkannya di dinding kamar',
        indicator: 'V',
      },
      {
        id: 'vak-22-b',
        label: 'Membuat singkatan kata yang lucu atau melagukan rumus tersebut',
        indicator: 'A',
      },
      {
        id: 'vak-22-c',
        label: 'Mencoret-coret udara dengan jari seolah sedang menulis, atau menggunakan alat peraga sederhana',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-23',
    number: 23,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMA'],
    questionText:
      'Bagaimana caramu mengingat tugas harian atau PR agar tidak lupa dikerjakan?',
    options: [
      {
        id: 'vak-23-a',
        label: 'Menulisnya dengan rapi di buku agenda khusus atau menandai kalender',
        indicator: 'V',
      },
      {
        id: 'vak-23-b',
        label: 'Memasang alarm suara di HP atau meminta orang tua/teman untuk mengingatkan',
        indicator: 'A',
      },
      {
        id: 'vak-23-c',
        label: 'Menulis di secarik kertas kecil yang selalu kamu bawa di saku atau tas',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-24',
    number: 24,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMA'],
    questionText:
      'Lima menit sebelum ujian dimulai dan kamu sedang menunggu di luar kelas, apa yang kamu lakukan?',
    options: [
      {
        id: 'vak-24-a',
        label: 'Membaca cepat buku catatan atau melihat-lihat kembali rangkuman berwarnamu',
        indicator: 'V',
      },
      {
        id: 'vak-24-b',
        label: 'Saling melempar pertanyaan dan tanya jawab lisan dengan teman di sebelahmu',
        indicator: 'A',
      },
      {
        id: 'vak-24-c',
        label: 'Berdiri, berjalan mondar-mandir sebentar, atau melakukan peregangan untuk menghilangkan grogi',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-25',
    number: 25,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMA'],
    questionText:
      'Di tengah ujian, kamu tiba-tiba lupa jawaban dari satu soal. Apa refleks spontan yang kamu lakukan?',
    options: [
      {
        id: 'vak-25-a',
        label: 'Memejamkan mata dan mencoba membayangkan letak tulisan tersebut di halaman bukumu',
        indicator: 'V',
      },
      {
        id: 'vak-25-b',
        label: 'Mengingat-ingat kembali suara guru saat menjelaskan materi tersebut di kelas',
        indicator: 'A',
      },
      {
        id: 'vak-25-c',
        label: 'Memutar-mutar pulpen di jari, mengetuk meja, atau memijat pelipis/dahi',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-26',
    number: 26,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMA'],
    questionText:
      'Ketika kamu mendapatkan nilai ulangan yang jelek, apa reaksi fisik pertamamu?',
    options: [
      {
        id: 'vak-26-a',
        label: 'Menatap kertas ulangan itu lama-lama dengan ekspresi kesal',
        indicator: 'V',
      },
      {
        id: 'vak-26-b',
        label: 'Mengeluh, menggerutu, atau langsung ingin menceritakan kekesalan itu pada teman',
        indicator: 'A',
      },
      {
        id: 'vak-26-c',
        label: 'Secara refleks ingin meremas kertasnya, melempar alat tulis, atau membanting tas',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-27',
    number: 27,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMA'],
    questionText:
      'Jika ada soal ujian cerita yang instruksinya sangat panjang, bagaimana caramu memahaminya?',
    options: [
      {
        id: 'vak-27-a',
        label: 'Membaca soalnya sambil menggarisbawahi atau melingkari kata-kata yang penting',
        indicator: 'V',
      },
      {
        id: 'vak-27-b',
        label: 'Membaca soal tersebut dalam hati dengan bibir yang ikut bergerak mengeja',
        indicator: 'A',
      },
      {
        id: 'vak-27-c',
        label: 'Langsung melihat ke pilihan jawabannya dulu atau mencoret-coret kertas buram',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-28',
    number: 28,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMA'],
    questionText:
      'Ketika kamu pergi ke mal untuk membeli sepatu atau tas baru, apa yang paling memengaruhi keputusanmu?',
    options: [
      {
        id: 'vak-28-a',
        label: 'Warna, model, dan desain barangnya terlihat sangat keren',
        indicator: 'V',
      },
      {
        id: 'vak-28-b',
        label: 'Rekomendasi dari teman atau penjelasan dari penjual tokonya',
        indicator: 'A',
      },
      {
        id: 'vak-28-c',
        label: 'Saat barang itu dicoba terasa sangat nyaman dan pas di badan/kaki',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-29',
    number: 29,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMA'],
    questionText:
      'Saat sedang bersantai menggunakan media sosial atau gawai, konten apa yang paling sering kamu nikmati?',
    options: [
      {
        id: 'vak-29-a',
        label: 'Melihat-lihat foto yang bagus di Instagram, Pinterest, atau membaca komik web',
        indicator: 'V',
      },
      {
        id: 'vak-29-b',
        label: 'Mendengarkan musik, mendengarkan orang bercerita, atau bergabung di forum diskusi suara',
        indicator: 'A',
      },
      {
        id: 'vak-29-c',
        label: 'Bermain game yang butuh kecepatan tangan atau mencoba tren tarian/gerakan di TikTok',
        indicator: 'K',
      },
    ],
  },
  {
    id: 'pm-vak-30',
    number: 30,
    moduleCode: 'PM-VAK-01',
    moduleName: 'Sensory Modality (VAK)',
    cluster: 'VAK',
    levels: ['SMA'],
    questionText:
      'Jika kamu diberi hadiah liburan akhir pekan ke mana saja, aktivitas liburan seperti apa yang kamu pilih?',
    options: [
      {
        id: 'vak-30-a',
        label: 'Pergi ke tempat dengan pemandangan alam yang indah untuk berfoto',
        indicator: 'V',
      },
      {
        id: 'vak-30-b',
        label: 'Pergi menonton konser musik atau pertunjukan hiburan bersama teman-teman',
        indicator: 'A',
      },
      {
        id: 'vak-30-c',
        label: 'Pergi ke taman hiburan untuk naik wahana ekstrem, berenang, atau mendaki',
        indicator: 'K',
      },
    ],
  },

  // =========================================================================
  // MODUL 1.2: DOMINASI HEMISFER OTAK - PM-HEM-02 (Soal 1 - 20)
  // Posisi indikator LEFT_BRAIN dan RIGHT_BRAIN diacak presisi sesuai naskah
  // =========================================================================
  {
    id: 'pm-hem-01',
    number: 1,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Saat kamu mulai belajar bab baru di sekolah, mana yang lebih kamu sukai?',
    options: [
      {
        id: 'hem-01-a',
        label:
          'Membuka-buka seluruh halaman bab tersebut dengan cepat untuk melihat gambar dan ringkasan akhirnya terlebih dahulu.',
        indicator: 'RIGHT_BRAIN',
      },
      {
        id: 'hem-01-b',
        label:
          'Membaca materinya pelan-pelan dari halaman pertama sampai akhir secara berurutan.',
        indicator: 'LEFT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-02',
    number: 2,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SD', 'SMP', 'SMA'],
    questionText: 'Kondisi meja belajar atau kamarmu biasanya...',
    options: [
      {
        id: 'hem-02-a',
        label:
          'Rapi, barang-barang tertata pada tempatnya, dan kamu tahu persis di mana meletakkan alat tulismu.',
        indicator: 'LEFT_BRAIN',
      },
      {
        id: 'hem-02-b',
        label:
          'Sering berantakan atau penuh dengan barang, tetapi anehnya kamu tahu di mana letak barang yang kamu cari.',
        indicator: 'RIGHT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-03',
    number: 3,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Ketika kamu harus menyelesaikan tugas atau PR, bagaimana caramu mengatur waktu?',
    options: [
      {
        id: 'hem-03-a',
        label:
          'Sering menunda-nunda di awal, lalu mengebut mengerjakannya saat sudah sangat mepet waktu (Sistem SKS).',
        indicator: 'RIGHT_BRAIN',
      },
      {
        id: 'hem-03-b',
        label:
          'Membuat jadwal yang jelas, mengerjakannya dicicil, dan selesai jauh sebelum tenggat waktu.',
        indicator: 'LEFT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-04',
    number: 4,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Jika kamu diminta memberikan petunjuk arah jalan ke sebuah tempat, kamu akan...',
    options: [
      {
        id: 'hem-04-a',
        label:
          'Memberikan petunjuk arah yang pasti seperti nama jalan, belok kanan/kiri, dan jarak meternya.',
        indicator: 'LEFT_BRAIN',
      },
      {
        id: 'hem-04-b',
        label:
          'Memberikan petunjuk menggunakan patokan tempat (misalnya: "nanti di sebelah minimarket warna biru, kamu belok ke arah gedung tinggi").',
        indicator: 'RIGHT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-05',
    number: 5,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Saat kamu bertemu dengan orang baru, hal apa yang lebih mudah kamu ingat darinya?',
    options: [
      {
        id: 'hem-05-a',
        label:
          'Wajah orang tersebut atau perasaannya saat mengobrol denganmu (meskipun kamu lupa namanya).',
        indicator: 'RIGHT_BRAIN',
      },
      {
        id: 'hem-05-b',
        label: 'Nama orang tersebut atau asal sekolah/rumahnya.',
        indicator: 'LEFT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-06',
    number: 6,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Dalam pelajaran Matematika atau Eksakta, mana yang paling sering terjadi padamu?',
    options: [
      {
        id: 'hem-06-a',
        label:
          'Sangat teliti mengikuti rumus langkah demi langkah untuk mendapatkan jawaban pasti.',
        indicator: 'LEFT_BRAIN',
      },
      {
        id: 'hem-06-b',
        label:
          'Sering menemukan jawaban akhirnya dengan caramu sendiri (menebak logikanya), tapi bingung kalau disuruh menuliskan langkah-langkah rumusnya.',
        indicator: 'RIGHT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-07',
    number: 7,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Ketika kamu berdebat atau berdiskusi dengan teman, kamu lebih sering...',
    options: [
      {
        id: 'hem-07-a',
        label:
          'Menggunakan perasaan, intuisi, dan mencoba menjaga agar temanmu tidak terlalu sakit hati.',
        indicator: 'RIGHT_BRAIN',
      },
      {
        id: 'hem-07-b',
        label:
          'Menggunakan fakta, data, atau aturan yang ada untuk membuktikan bahwa kamu benar.',
        indicator: 'LEFT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-08',
    number: 8,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Jika kamu merakit barang baru seperti mainan LEGO atau perabotan, kamu akan...',
    options: [
      {
        id: 'hem-08-a',
        label:
          'Membaca buku panduannya dari langkah 1, 2, 3 sampai selesai tanpa terlewat.',
        indicator: 'LEFT_BRAIN',
      },
      {
        id: 'hem-08-b',
        label:
          'Melihat gambar hasil akhirnya di kotak, lalu langsung mencoba merakitnya sendiri tanpa banyak membaca buku panduan.',
        indicator: 'RIGHT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-09',
    number: 9,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Saat mencatat pelajaran di kelas, bentuk catatanmu biasanya...',
    options: [
      {
        id: 'hem-09-a',
        label:
          'Penuh coretan, menggunakan peta pikiran (mind map), anak panah ke mana-mana, atau ada gambar di pinggir buku.',
        indicator: 'RIGHT_BRAIN',
      },
      {
        id: 'hem-09-b',
        label:
          'Rapi, terstruktur ke bawah, menggunakan nomor (1, 2, 3), atau bullet points.',
        indicator: 'LEFT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-10',
    number: 10,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Menghadapi aturan di sekolah atau di rumah, sikap aslimu adalah...',
    options: [
      {
        id: 'hem-10-a',
        label:
          'Aturan itu ada untuk ditaati agar semuanya berjalan tertib dan aman.',
        indicator: 'LEFT_BRAIN',
      },
      {
        id: 'hem-10-b',
        label:
          'Aturan itu kadang terlalu kaku, ada kalanya kita bisa mencari celah jika tujuannya baik.',
        indicator: 'RIGHT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-11',
    number: 11,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SMP', 'SMA'],
    questionText:
      'Saat sedang melamun atau membayangkan masa depan, apa yang ada di pikiranmu?',
    options: [
      {
        id: 'hem-11-a',
        label:
          'Cita-cita yang sangat besar, imajinasi yang liar, atau petualangan yang tidak terduga.',
        indicator: 'RIGHT_BRAIN',
      },
      {
        id: 'hem-11-b',
        label:
          'Target yang realistis, rencana sekolah, atau hal-hal yang pasti bisa kamu capai.',
        indicator: 'LEFT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-12',
    number: 12,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SMP', 'SMA'],
    questionText:
      'Jika kamu sedang mengerjakan soal pilihan ganda dan tidak tahu jawabannya, kamu biasanya...',
    options: [
      {
        id: 'hem-12-a',
        label:
          'Menganalisis pilihan jawabannya dan mencoret opsi yang sudah pasti salah satu per satu secara logis.',
        indicator: 'LEFT_BRAIN',
      },
      {
        id: 'hem-12-b',
        label:
          'Mengandalkan feeling atau insting batinmu untuk memilih jawaban yang "terasa" paling benar.',
        indicator: 'RIGHT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-13',
    number: 13,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SMP', 'SMA'],
    questionText:
      'Saat kamu menonton film, bagian mana yang paling menarik perhatianmu?',
    options: [
      {
        id: 'hem-13-a',
        label: 'Efek visualnya, musiknya, dan emosi para pemainnya.',
        indicator: 'RIGHT_BRAIN',
      },
      {
        id: 'hem-13-b',
        label: 'Alur ceritanya yang masuk akal dan urutan kejadiannya yang jelas.',
        indicator: 'LEFT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-14',
    number: 14,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SMP', 'SMA'],
    questionText:
      'Jika kamu diberi tugas kelompok, kamu lebih suka mengambil peran sebagai...',
    options: [
      {
        id: 'hem-14-a',
        label:
          'Ketua yang membagi tugas, menyusun jadwal pengerjaan, dan memastikan semua selesai tepat waktu.',
        indicator: 'LEFT_BRAIN',
      },
      {
        id: 'hem-14-b',
        label:
          'Pemikir ide, pendesain presentasi, atau orang yang mencairkan suasana saat kelompok mulai stres.',
        indicator: 'RIGHT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-15',
    number: 15,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SMP', 'SMA'],
    questionText:
      'Mana pernyataan yang paling cocok dengan caramu mengekspresikan diri?',
    options: [
      {
        id: 'hem-15-a',
        label:
          'Saya berbicara menggunakan banyak gerakan tangan, ekspresi wajah, dan kadang melompat-lompat antar topik.',
        indicator: 'RIGHT_BRAIN',
      },
      {
        id: 'hem-15-b',
        label:
          'Saya berbicara dengan kata-kata yang jelas, tepat, dan langsung pada intinya (to the point).',
        indicator: 'LEFT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-16',
    number: 16,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SMA'],
    questionText:
      'Dalam hal bermain musik atau kesenian, kamu lebih mengutamakan...',
    options: [
      {
        id: 'hem-16-a',
        label:
          'Teknik yang benar, membaca partitur nada dengan tepat, atau presisi proporsi gambar.',
        indicator: 'LEFT_BRAIN',
      },
      {
        id: 'hem-16-b',
        label:
          'Penghayatan lagu, improvisasi, atau memadukan warna-warna unik secara bebas.',
        indicator: 'RIGHT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-17',
    number: 17,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SMA'],
    questionText:
      'Kalau kamu menulis karangan cerita, masalah yang paling sering kamu alami adalah...',
    options: [
      {
        id: 'hem-17-a',
        label:
          'Ide ceritanya banyak sekali sampai bingung cara menyusunnya menjadi kalimat yang rapi.',
        indicator: 'RIGHT_BRAIN',
      },
      {
        id: 'hem-17-b',
        label: 'Tulisannya terlalu kaku dan kurang ekspresif/kurang berimajinasi.',
        indicator: 'LEFT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-18',
    number: 18,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SMA'],
    questionText: 'Menurutmu, hal apa yang paling membuatmu merasa nyaman?',
    options: [
      {
        id: 'hem-18-a',
        label: 'Kepastian, jadwal yang terencana, dan rutinitas yang teratur.',
        indicator: 'LEFT_BRAIN',
      },
      {
        id: 'hem-18-b',
        label: 'Kejutan, fleksibilitas, dan hal-hal baru yang spontan.',
        indicator: 'RIGHT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-19',
    number: 19,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SMA'],
    questionText:
      'Ketika kamu menyusun barang di lemari atau koper, caramu adalah...',
    options: [
      {
        id: 'hem-19-a',
        label:
          'Menjejalkannya asalkan semuanya muat, tidak terlalu peduli dengan kategori barangnya.',
        indicator: 'RIGHT_BRAIN',
      },
      {
        id: 'hem-19-b',
        label:
          'Mengelompokkannya secara sistematis (baju dengan baju, buku dengan buku) dengan sangat presisi.',
        indicator: 'LEFT_BRAIN',
      },
    ],
  },
  {
    id: 'pm-hem-20',
    number: 20,
    moduleCode: 'PM-HEM-02',
    moduleName: 'Dominasi Hemisfer Otak',
    cluster: 'HEM',
    levels: ['SMA'],
    questionText:
      'Jika kamu sedang bermain puzzle, cara yang paling sering kamu lakukan adalah...',
    options: [
      {
        id: 'hem-20-a',
        label:
          'Menyortir dulu kepingan yang ujungnya lurus (bingkainya) lalu memisahkan berdasarkan warnanya.',
        indicator: 'LEFT_BRAIN',
      },
      {
        id: 'hem-20-b',
        label:
          'Mengambil kepingan secara acak dan langsung mencoba mencocokkan mana yang terlihat pas.',
        indicator: 'RIGHT_BRAIN',
      },
    ],
  },

  // =========================================================================
  // MODUL 1.3: SCREENING KEBIASAAN BELAJAR - PM-SKB-03 (15 Butir Universal)
  // Terbagi 3 Klaster (BIO: Jam Biologis, ENV: Lingkungan, FOCUS: Fokus)
  // Anchor: Soal 1 (BIO), Soal 6 (ENV), Soal 11 (FOCUS)
  // =========================================================================
  {
    id: 'pm-skb-01',
    number: 1,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'BIO',
    levels: ['SD', 'SMP', 'SMA'],
    isAnchor: true,
    anchorCluster: 'BIO',
    questionText:
      'Kapan kamu merasa paling mudah menghafal atau memahami pelajaran yang sulit?',
    options: [
      {
        id: 'skb-01-a',
        label: 'Pagi hari atau sebelum berangkat sekolah.',
        indicator: 'A',
      },
      {
        id: 'skb-01-b',
        label: 'Siang atau sore hari setelah pulang sekolah.',
        indicator: 'B',
      },
      {
        id: 'skb-01-c',
        label: 'Malam hari atau saat hari sudah gelap dan tenang.',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-02',
    number: 2,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'BIO',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Saat bangun tidur di pagi hari untuk bersiap sekolah, apa yang biasanya kamu rasakan?',
    options: [
      {
        id: 'skb-02-a',
        label: 'Langsung merasa segar, sadar penuh, dan siap beraktivitas.',
        indicator: 'A',
      },
      {
        id: 'skb-02-b',
        label: 'Butuh waktu pemanasan sebentar (mandi/sarapan) baru bisa berpikir jernih.',
        indicator: 'B',
      },
      {
        id: 'skb-02-c',
        label: 'Terasa sangat berat, mengantuk, dan malas berbicara di pagi hari.',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-03',
    number: 3,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'BIO',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Jika kamu memiliki PR Matematika yang cukup rumit, kapan waktu terbaikmu untuk menyelesaikannya?',
    options: [
      {
        id: 'skb-03-a',
        label: 'Langsung dikerjakan di pagi hari saat akhir pekan.',
        indicator: 'A',
      },
      {
        id: 'skb-03-b',
        label: 'Dikerjakan sore hari setelah istirahat siang.',
        indicator: 'B',
      },
      {
        id: 'skb-03-c',
        label: 'Dikerjakan malam hari menjelang tidur.',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-04',
    number: 4,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'BIO',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Kapan ide-ide paling cemerlang atau keinginan alamimu untuk membaca buku/belajar biasanya muncul?',
    options: [
      {
        id: 'skb-04-a',
        label: 'Pagi hari (jam 05.00-09.00).',
        indicator: 'A',
      },
      {
        id: 'skb-04-b',
        label: 'Siang/Sore hari (jam 13.00-17.00).',
        indicator: 'B',
      },
      {
        id: 'skb-04-c',
        label: 'Malam hari (jam 19.00 ke atas).',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-05',
    number: 5,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'BIO',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Saat masa libur sekolah dan tidak ada jadwal pasti, jam berapa kamu lebih suka mulai mengerjakan tugas yang tertunda?',
    options: [
      {
        id: 'skb-05-a',
        label: 'Tetap di pagi hari agar cepat selesai.',
        indicator: 'A',
      },
      {
        id: 'skb-05-b',
        label: 'Agak santai di siang atau sore hari.',
        indicator: 'B',
      },
      {
        id: 'skb-05-c',
        label: 'Menunggu malam hari karena terasa lebih sunyi.',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-06',
    number: 6,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'ENV',
    levels: ['SD', 'SMP', 'SMA'],
    isAnchor: true,
    anchorCluster: 'ENV',
    questionText:
      'Kondisi suara seperti apa yang paling membantumu untuk fokus?',
    options: [
      {
        id: 'skb-06-a',
        label: 'Sangat sunyi dan hening mutlak (kamar tertutup rapat).',
        indicator: 'A',
      },
      {
        id: 'skb-06-b',
        label: 'Ada sedikit suara aktivitas orang di rumah atau suara alam, tapi tidak berisik.',
        indicator: 'B',
      },
      {
        id: 'skb-06-c',
        label: 'Harus ada suara latar seperti musik, lagu favorit, atau suara TV dari kejauhan.',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-07',
    number: 7,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'ENV',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Jika sedang ada orang yang mengobrol di ruangan sebelah saat kamu belajar, apa reaksimu?',
    options: [
      {
        id: 'skb-07-a',
        label: 'Sangat terganggu, marah, atau tidak bisa konsentrasi sama sekali.',
        indicator: 'A',
      },
      {
        id: 'skb-07-b',
        label: 'Bisa mengabaikannya selama suaranya tidak terlalu keras.',
        indicator: 'B',
      },
      {
        id: 'skb-07-c',
        label: 'Tidak terlalu peduli, atau malah kadang ikut mendengarkan obrolan mereka.',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-08',
    number: 8,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'ENV',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Posisi fisik seperti apa yang paling sering kamu lakukan saat mengerjakan tugas berjam-jam?',
    options: [
      {
        id: 'skb-08-a',
        label: 'Duduk tegak di kursi belajar dengan meja yang rapi.',
        indicator: 'A',
      },
      {
        id: 'skb-08-b',
        label: 'Duduk santai/lesehan di karpet dengan meja lipat.',
        indicator: 'B',
      },
      {
        id: 'skb-08-c',
        label: 'Berpindah-pindah (kadang di kasur, kadang di lantai, kadang tengkurap).',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-09',
    number: 9,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'ENV',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Bagaimana kebiasaanmu dengan makanan atau minuman saat sedang fokus belajar?',
    options: [
      {
        id: 'skb-09-a',
        label: 'Tidak suka makan atau minum sama sekali karena takut mengotori buku/bikin tidak fokus.',
        indicator: 'A',
      },
      {
        id: 'skb-09-b',
        label: 'Menyiapkan segelas air putih atau minuman segar di dekat meja.',
        indicator: 'B',
      },
      {
        id: 'skb-09-c',
        label: 'Wajib ada camilan, permen, atau makanan ringan yang bisa dikunyah selama belajar.',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-10',
    number: 10,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'ENV',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Kondisi pencahayaan ruangan seperti apa yang membuat matamu tidak cepat lelah?',
    options: [
      {
        id: 'skb-10-a',
        label: 'Lampu ruangan yang sangat terang benderang.',
        indicator: 'A',
      },
      {
        id: 'skb-10-b',
        label: 'Cahaya alami dari jendela di siang hari atau lampu ruangan standar.',
        indicator: 'B',
      },
      {
        id: 'skb-10-c',
        label: 'Agak redup, misalnya hanya menyalakan lampu belajar kecil di atas meja.',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-11',
    number: 11,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'FOCUS',
    levels: ['SD', 'SMP', 'SMA'],
    isAnchor: true,
    anchorCluster: 'FOCUS',
    questionText:
      'Biasanya, berapa lama kamu bisa benar-benar fokus membaca atau menghitung sebelum merasa ingin berhenti/bosan?',
    options: [
      {
        id: 'skb-11-a',
        label: 'Sangat lama, bisa lebih dari 1 jam penuh tanpa henti.',
        indicator: 'A',
      },
      {
        id: 'skb-11-b',
        label: 'Sekitar 30 hingga 45 menit.',
        indicator: 'B',
      },
      {
        id: 'skb-11-c',
        label: 'Sangat sebentar, kurang dari 20 menit sudah ingin melakukan hal lain.',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-12',
    number: 12,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'FOCUS',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Jika kamu dihadapkan pada tugas yang sangat banyak, bagaimana caramu menyelesaikannya?',
    options: [
      {
        id: 'skb-12-a',
        label: 'Duduk dan tidak akan beranjak sampai 100% tugas itu selesai (sistem maraton).',
        indicator: 'A',
      },
      {
        id: 'skb-12-b',
        label: 'Mengerjakan setengahnya, istirahat sebentar, lalu lanjut lagi (dibagi 2-3 sesi).',
        indicator: 'B',
      },
      {
        id: 'skb-12-c',
        label: 'Mengerjakan sedikit-sedikit, diselingi main gawai atau mengobrol, lalu dikerjakan lagi (sistem cicil).',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-13',
    number: 13,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'FOCUS',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Saat kamu mengambil waktu istirahat (jeda) di tengah belajar, apa yang biasanya kamu lakukan?',
    options: [
      {
        id: 'skb-13-a',
        label: 'Tetap di kursi, hanya meregangkan badan atau memejamkan mata sebentar.',
        indicator: 'A',
      },
      {
        id: 'skb-13-b',
        label: 'Bangun dari kursi, berjalan ke dapur ambil minum atau pergi ke toilet.',
        indicator: 'B',
      },
      {
        id: 'skb-13-c',
        label: 'Langsung mengecek gawai, bermain game, atau tiduran (dan kadang jadi malas lanjut belajar).',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-14',
    number: 14,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'FOCUS',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Jika kamu sudah "buntu" atau stuck saat memecahkan satu soal yang susah, apa yang kamu lakukan?',
    options: [
      {
        id: 'skb-14-a',
        label: 'Terus memaksa memikirkannya sampai jawabannya ketemu, pantang menyerah.',
        indicator: 'A',
      },
      {
        id: 'skb-14-b',
        label: 'Bertanya kepada teman, guru, atau mencari rumus di internet.',
        indicator: 'B',
      },
      {
        id: 'skb-14-c',
        label: 'Menutup buku, meninggalkan soal itu dulu, atau ganti mengerjakan pelajaran lain yang lebih mudah.',
        indicator: 'C',
      },
    ],
  },
  {
    id: 'pm-skb-15',
    number: 15,
    moduleCode: 'PM-SKB-03',
    moduleName: 'Screening Kebiasaan Belajar',
    cluster: 'FOCUS',
    levels: ['SD', 'SMP', 'SMA'],
    questionText:
      'Mana pernyataan yang paling menggambarkan dirimu saat akhir pekan tiba?',
    options: [
      {
        id: 'skb-15-a',
        label: 'Saya membuat daftar rencana kegiatan apa saja yang akan saya lakukan hari ini.',
        indicator: 'A',
      },
      {
        id: 'skb-15-b',
        label: 'Saya punya gambaran kasar mau ngapain, tapi kalau berubah tidak apa-apa.',
        indicator: 'B',
      },
      {
        id: 'skb-15-c',
        label: 'Saya jalani saja hari ini mengalir tanpa rencana sama sekali.',
        indicator: 'C',
      },
    ],
  },
]

/**
 * Filter soal Paket 1 berdasarkan jenjang siswa:
 * - SD:  15 VAK (No 1-15) + 10 HEM (No 1-10) + 15 SKB (No 1-15) = 40 soal
 * - SMP: 20 VAK (No 1-20) + 15 HEM (No 1-15) + 15 SKB (No 1-15) = 50 soal
 * - SMA: 30 VAK (No 1-30) + 20 HEM (No 1-20) + 15 SKB (No 1-15) = 65 soal
 */
export function getQuestionsForLevel(level: StudentLevel): PersonaQuestion[] {
  const vakQuestions = PERSONA_MODALITY_QUESTIONS.filter(
    (q) => q.moduleCode === 'PM-VAK-01' && q.levels.includes(level)
  )
  const hemQuestions = PERSONA_MODALITY_QUESTIONS.filter(
    (q) => q.moduleCode === 'PM-HEM-02' && q.levels.includes(level)
  )
  const skbQuestions = PERSONA_MODALITY_QUESTIONS.filter(
    (q) => q.moduleCode === 'PM-SKB-03' && q.levels.includes(level)
  )

  return [...vakQuestions, ...hemQuestions, ...skbQuestions]
}

/**
 * Konfigurasi kuota soal per jenjang untuk validasi dan penunjuk UI
 */
export const LEVEL_CONFIG = {
  SD: {
    vakCount: 15,
    hemCount: 10,
    skbCount: 15,
    totalCount: 40,
    estimatedMinutes: 10,
    label: 'SD (Kelas 3 - 6)',
    desc: '40 butir pertanyaan terarah dengan bahasa yang mudah dipahami anak.',
  },
  SMP: {
    vakCount: 20,
    hemCount: 15,
    skbCount: 15,
    totalCount: 50,
    estimatedMinutes: 12,
    label: 'SMP (Kelas 7 - 9)',
    desc: '50 butir pertanyaan mencakup situasi akademik kelas dan belajar mandiri.',
  },
  SMA: {
    vakCount: 30,
    hemCount: 20,
    skbCount: 15,
    totalCount: 65,
    estimatedMinutes: 15,
    label: 'SMA / SMK (Kelas 10 - 12)',
    desc: '65 butir pertanyaan komprehensif termasuk situasi ujian dan simulasi tekanan belajar.',
  },
} as const
