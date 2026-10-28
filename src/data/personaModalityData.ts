/**
 * SPESIFIKASI DAN BANK SOAL LENGKAP - PERSONA ACADEMY (Single Source of Truth)
 * Sesuai dokumen Soal.Md (Bebas tag referensi kutipan dan mematuhi aturan antislop tanpa em dash).
 */

export type StudentLevel = 'SD' | 'SMP' | 'SMA'

export type AssessmentPackageCode =
  | 'PAKET_1_PERSONA_MODALITY'
  | 'PAKET_2_PERSONA_POTENTIAL'
  | 'PAKET_3_PERSONA_MASTERY'

export type AssessmentModuleCode =
  | 'PM-VAK-01'
  | 'PM-HEM-02'
  | 'PM-SKB-03'
  | 'PP-MBTI-02'
  | 'PP-MI-03'

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
      'Memetakan gerbang sensori penerimaan informasi (Visual, Auditory, Kinesthetic) untuk menentukan metode belajar optimal.',
    deliverables: [
      'Hasil Asesmen Profil Belajar VAK Lengkap',
      'Rekomendasi Penataan Gaya & Media Belajar di Rumah',
      'Instruksi Khusus untuk Guru Privat (SOP Intervensi VAK)',
    ],
    operationalRole:
      'Produk pembuka (entry-level) untuk mengatasi hambatan belajar sensori teknis harian siswa dan panduan tutor.',
    modules: [
      {
        code: 'PM-VAK-01',
        name: 'Sensory Modality (VAK)',
        shortDesc: 'Penerimaan dan pemrosesan informasi (Visual, Auditory, Kinesthetic).',
      },
    ],
  },
  {
    code: 'PAKET_2_PERSONA_POTENTIAL',
    name: 'Persona Potential',
    subtitle: 'Eksplorasi Karakter & Kecerdasan',
    status: 'upcoming',
    badgeText: 'Segera Hadir (Tahap 2)',
    targetAge: 'SD, SMP, SMA',
    description:
      'Mendalami tipologi kepribadian kognitif siswa (adaptasi MBTI) dan 8 kecerdasan majemuk (Multiple Intelligences) untuk memetakan bakat sejati serta mencegah bentrok emosional.',
    deliverables: [
      'Seluruh Deliverables Paket Persona Modality',
      'Profil Tipologi Kepribadian 4 Huruf (MBTI Edukatif)',
      'Peta 8 Kecerdasan Majemuk & Top 3 Gateway Belajar',
      'Sesi Konsultasi Edukatif Bersama Konselor (45 menit)',
    ],
    operationalRole:
      'Produk utama untuk mengungkap pintu gerbang belajar terkuat anak dan menyelaraskan komunikasi guru privat serta orang tua.',
    modules: [
      {
        code: 'PP-MBTI-02',
        name: 'Tipologi Kepribadian (MBTI)',
        shortDesc: 'Pemrosesan energi, informasi, keputusan, dan orientasi jadwal (20 soal A/B).',
      },
      {
        code: 'PP-MI-03',
        name: 'Kecerdasan Majemuk',
        shortDesc: 'Pemetaan 8 kecerdasan dasar Gardner (40 pernyataan skala 1-4).',
      },
    ],
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
]
export interface LevelConfigItem {
  vakCount: number
  hemCount: number
  skbCount: number
  totalCount: number
  estimatedMinutes: number
  label: string
  desc: string
}

export const BASE_LEVEL_CONFIG: Record<StudentLevel, LevelConfigItem> = {
  SD: {
    vakCount: 15,
    hemCount: 0,
    skbCount: 0,
    totalCount: 15,
    estimatedMinutes: 5,
    label: 'SD (Kelas 3 - 6)',
    desc: '15 butir pertanyaan modalitas sensori belajar (Visual, Auditory, Kinesthetic).',
  },
  SMP: {
    vakCount: 20,
    hemCount: 0,
    skbCount: 0,
    totalCount: 20,
    estimatedMinutes: 7,
    label: 'SMP (Kelas 7 - 9)',
    desc: '20 butir pertanyaan modalitas sensori belajar mencakup situasi kelas dan belajar mandiri.',
  },
  SMA: {
    vakCount: 30,
    hemCount: 0,
    skbCount: 0,
    totalCount: 30,
    estimatedMinutes: 10,
    label: 'SMA / SMK (Kelas 10 - 12)',
    desc: '30 butir pertanyaan komprehensif modalitas sensori belajar hingga situasi sosial dan preferensi keseharian.',
  },
}

/**
 * Mengambil konfigurasi kuota dan durasi aktif per jenjang yang dapat diubah oleh Super Admin.
 */
export function getActiveLevelConfig(): Record<StudentLevel, LevelConfigItem> {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      const configRaw = window.localStorage.getItem('laits_assessment_level_config_v1')
      if (configRaw) {
        const parsed = JSON.parse(configRaw)
        return {
          SD: {
            ...BASE_LEVEL_CONFIG.SD,
            ...parsed.SD,
            totalCount: parsed.SD?.totalCount ?? BASE_LEVEL_CONFIG.SD.totalCount,
            vakCount: parsed.SD?.totalCount ?? BASE_LEVEL_CONFIG.SD.totalCount,
            estimatedMinutes: parsed.SD?.estimatedMinutes ?? BASE_LEVEL_CONFIG.SD.estimatedMinutes,
          },
          SMP: {
            ...BASE_LEVEL_CONFIG.SMP,
            ...parsed.SMP,
            totalCount: parsed.SMP?.totalCount ?? BASE_LEVEL_CONFIG.SMP.totalCount,
            vakCount: parsed.SMP?.totalCount ?? BASE_LEVEL_CONFIG.SMP.totalCount,
            estimatedMinutes: parsed.SMP?.estimatedMinutes ?? BASE_LEVEL_CONFIG.SMP.estimatedMinutes,
          },
          SMA: {
            ...BASE_LEVEL_CONFIG.SMA,
            ...parsed.SMA,
            totalCount: parsed.SMA?.totalCount ?? BASE_LEVEL_CONFIG.SMA.totalCount,
            vakCount: parsed.SMA?.totalCount ?? BASE_LEVEL_CONFIG.SMA.totalCount,
            estimatedMinutes: parsed.SMA?.estimatedMinutes ?? BASE_LEVEL_CONFIG.SMA.estimatedMinutes,
          },
        }
      }
    } catch {
      // fallback to BASE_LEVEL_CONFIG
    }
  }
  return BASE_LEVEL_CONFIG
}

/**
 * Filter soal Paket 1 berdasarkan jenjang siswa dengan kuota dinamis yang dapat diatur oleh Super Admin.
 * Default: SD = 15, SMP = 20, SMA = 30.
 */
export function getQuestionsForLevel(level: StudentLevel): PersonaQuestion[] {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      const configRaw = window.localStorage.getItem('laits_assessment_level_config_v1')
      const questionsRaw = window.localStorage.getItem('laits_assessment_questions_v1')

      const config = configRaw ? JSON.parse(configRaw) : null
      const quota: number =
        config?.[level]?.totalCount ?? BASE_LEVEL_CONFIG[level].totalCount

      const questionsList: PersonaQuestion[] = questionsRaw
        ? JSON.parse(questionsRaw)
        : PERSONA_MODALITY_QUESTIONS

      const matching = questionsList.filter((q) => q.levels.includes(level))
      if (matching.length >= quota) {
        return matching.slice(0, quota)
      }
      const extras = questionsList.filter((q) => !matching.some((m) => m.id === q.id))
      return [...matching, ...extras.slice(0, quota - matching.length)].slice(0, quota)
    } catch {
      // fallback
    }
  }

  return PERSONA_MODALITY_QUESTIONS.filter((q) => q.levels.includes(level))
}

/**
 * Konfigurasi kuota soal per jenjang untuk validasi dan penunjuk UI.
 * Menggunakan Proxy agar selalu merefleksikan perubahan pengaturan dari dashboard Super Admin.
 */
export const LEVEL_CONFIG: Record<StudentLevel, LevelConfigItem> = new Proxy(
  BASE_LEVEL_CONFIG,
  {
    get(target, prop: string) {
      const active = getActiveLevelConfig()
      if (prop in active) {
        return active[prop as StudentLevel]
      }
      return Reflect.get(target, prop)
    },
  }
)

