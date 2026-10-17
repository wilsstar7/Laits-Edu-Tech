/**
 * SPESIFIKASI DAN BANK SOAL LENGKAP - PAKET 2: PERSONA POTENTIAL
 * Sesuai dokumen soal-paket-2.md (Bebas tag referensi sitasi dan mematuhi aturan antislop tanpa em dash).
 */

import type { StudentLevel, AssessmentPackageCode } from './personaModalityData'
import {
  getQuestionsForLevel,
  type PersonaQuestion,
} from './personaModalityData'

export type MbtiDimensionKey = 'EI' | 'SN' | 'TF' | 'JP'

export interface MbtiQuestion {
  id: string
  number: number
  moduleCode: 'PP-MBTI-02'
  moduleName: string
  dimension: MbtiDimensionKey
  questionText: string
  optionA: {
    label: string
    indicator: 'E' | 'S' | 'T' | 'J'
  }
  optionB: {
    label: string
    indicator: 'I' | 'N' | 'F' | 'P'
  }
}

export type MiCategoryCode =
  | 'MI_LINGUISTIK'
  | 'MI_LOGIS'
  | 'MI_SPASIAL'
  | 'MI_KINESTETIK'
  | 'MI_MUSIKAL'
  | 'MI_INTERPERSONAL'
  | 'MI_INTRAPERSONAL'
  | 'MI_NATURALIS'

export interface MultipleIntelligencesQuestion {
  id: string
  number: number
  moduleCode: 'PP-MI-03'
  moduleName: string
  category: MiCategoryCode
  statement: string
}

/**
 * 20 Butir Soal PP-MBTI-02 (Opsi A/B)
 */
export const MBTI_QUESTIONS: MbtiQuestion[] = [
  // Dimensi 1: Cara Memulihkan Energi (E vs I - Soal 1-5)
  {
    id: 'PP-MBTI-01',
    number: 1,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'EI',
    questionText:
      'Setelah melewati hari yang sangat padat dan melelahkan di sekolah, cara terbaikmu kembali bersemangat adalah...',
    optionA: {
      label: 'Berkumpul, bercerita, atau bermain bersama teman-teman sebaya.',
      indicator: 'E',
    },
    optionB: {
      label: 'Menikmati waktu sendirian di kamar (membaca, main game, atau rebahan).',
      indicator: 'I',
    },
  },
  {
    id: 'PP-MBTI-02',
    number: 2,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'EI',
    questionText:
      'Ketika kamu sedang berusaha memahami sebuah ide atau pelajaran yang rumit...',
    optionA: {
      label:
        'Pikiranku jadi lebih jernih jika aku mendiskusikannya atau mengucapkannya keras-keras bersama orang lain.',
      indicator: 'E',
    },
    optionB: {
      label:
        'Pikiranku jadi lebih jernih jika aku diberi waktu hening untuk merenungkannya sendirian dulu.',
      indicator: 'I',
    },
  },
  {
    id: 'PP-MBTI-03',
    number: 3,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'EI',
    questionText: 'Jika disuruh memilih format belajar, kamu lebih merasa nyaman jika...',
    optionA: {
      label:
        'Belajar dalam kelompok di mana kita bisa saling bertukar pikiran dengan aktif.',
      indicator: 'E',
    },
    optionB: {
      label: 'Belajar mandiri atau satu-lawan-satu secara mendalam dan tenang.',
      indicator: 'I',
    },
  },
  {
    id: 'PP-MBTI-04',
    number: 4,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'EI',
    questionText: 'Saat bertemu dengan lingkungan pergaulan atau teman-teman baru...',
    optionA: {
      label: 'Aku mudah memulai obrolan dan merasa energiku bertambah di tengah keramaian.',
      indicator: 'E',
    },
    optionB: {
      label:
        'Aku lebih suka mengamati dulu dan merasa energiku terkuras jika terlalu lama di keramaian.',
      indicator: 'I',
    },
  },
  {
    id: 'PP-MBTI-05',
    number: 5,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'EI',
    questionText: 'Ketika guru menanyakan pendapatmu tentang suatu hal secara mendadak...',
    optionA: {
      label: 'Aku bisa langsung merangkai kata-kata dan berpikir sambil berbicara.',
      indicator: 'E',
    },
    optionB: {
      label: 'Aku butuh jeda waktu sejenak untuk memikirkan jawaban yang tepat sebelum berbicara.',
      indicator: 'I',
    },
  },

  // Dimensi 2: Cara Menerima Informasi (S vs N - Soal 6-10)
  {
    id: 'PP-MBTI-06',
    number: 6,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'SN',
    questionText:
      'Jika kamu harus membaca sebuah buku atau artikel, kamu lebih suka topik tentang...',
    optionA: {
      label:
        'Fakta nyata, sejarah, biografi tokoh, atau hal-hal praktis yang benar-benar ada di dunia.',
      indicator: 'S',
    },
    optionB: {
      label:
        'Fiksi fantasi, misteri, masa depan, atau ide-ide baru yang membutuhkan daya khayal.',
      indicator: 'N',
    },
  },
  {
    id: 'PP-MBTI-07',
    number: 7,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'SN',
    questionText:
      'Ketika guru memberikan tugas kelompok, instruksi seperti apa yang kamu harapkan?',
    optionA: {
      label: '"Ini contoh hasilnya, kerjakan urutannya dari nomor 1 sampai 5 secara persis."',
      indicator: 'S',
    },
    optionB: {
      label:
        '"Ini tema besarnya, silakan gunakan cara dan kreativitas kalian sendiri untuk menyelesaikannya."',
      indicator: 'N',
    },
  },
  {
    id: 'PP-MBTI-08',
    number: 8,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'SN',
    questionText:
      'Dalam belajar Matematika atau Sains, hal yang paling mudah kamu pahami adalah...',
    optionA: {
      label: 'Cara menggunakan rumus tersebut dengan tepat ke dalam soal ujian dan benda nyata.',
      indicator: 'S',
    },
    optionB: {
      label: 'Konsep atau teori besar tentang "mengapa alam semesta bekerja seperti itu".',
      indicator: 'N',
    },
  },
  {
    id: 'PP-MBTI-09',
    number: 9,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'SN',
    questionText: 'Coba perhatikan caramu berbicara atau bercerita sehari-hari. Kamu cenderung...',
    optionA: {
      label: 'Bercerita secara detail, berurutan kejadiannya (kronologis), dan sesuai fakta.',
      indicator: 'S',
    },
    optionB: {
      label:
        'Bercerita melompat-lompat, sering menggunakan perumpamaan, dan fokus pada intinya saja.',
      indicator: 'N',
    },
  },
  {
    id: 'PP-MBTI-10',
    number: 10,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'SN',
    questionText:
      'Ketika kamu memikirkan tentang masa depanmu, pikiranmu biasanya berfokus pada...',
    optionA: {
      label: 'Langkah konkret yang harus kulakukan besok atau minggu depan agar tugasku beres.',
      indicator: 'S',
    },
    optionB: {
      label: 'Cita-cita besarku 10 tahun lagi dan berbagai kemungkinan seru yang bisa terjadi nanti.',
      indicator: 'N',
    },
  },

  // Dimensi 3: Cara Mengambil Keputusan (T vs F - Soal 11-15)
  {
    id: 'PP-MBTI-11',
    number: 11,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'TF',
    questionText:
      'Jika teman dekatmu berkeluh kesah (curhat) sedang memiliki masalah, reaksi alamimu adalah...',
    optionA: {
      label: 'Membantunya menganalisis masalah tersebut dan memberikan jalan keluar yang paling logis.',
      indicator: 'T',
    },
    optionB: {
      label: 'Menjadi pendengar yang baik, menghibur perasaannya, dan menunjukkan rasa pedulimu.',
      indicator: 'F',
    },
  },
  {
    id: 'PP-MBTI-12',
    number: 12,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'TF',
    questionText: 'Dalam kerja kelompok, mana yang menurutmu menjadi prinsip paling penting?',
    optionA: {
      label: 'Semua anggota kelompok bekerja sama rata secara adil dan jujur.',
      indicator: 'T',
    },
    optionB: {
      label: 'Semua anggota kelompok merasa rukun, nyaman, dan tidak ada yang bertengkar.',
      indicator: 'F',
    },
  },
  {
    id: 'PP-MBTI-13',
    number: 13,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'TF',
    questionText: 'Ketika kamu melakukan kesalahan dan ditegur oleh guru/tutor...',
    optionA: {
      label: 'Aku bisa menerimanya asal gurunya objektif, masuk akal, dan menunjukkan bukti kesalahanku.',
      indicator: 'T',
    },
    optionB: {
      label:
        'Aku bisa sangat sedih, merasa bersalah, atau kehilangan motivasi jika gurunya menegur dengan nada kasar.',
      indicator: 'F',
    },
  },
  {
    id: 'PP-MBTI-14',
    number: 14,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'TF',
    questionText: 'Bagaimana pandanganmu tentang aturan atau hukuman di sekolah?',
    optionA: {
      label: 'Aturan harus ditegakkan secara adil kepada siapa pun tanpa pandang bulu.',
      indicator: 'T',
    },
    optionB: {
      label: 'Aturan harus fleksibel, melihat dulu apa alasan (niat di balik tindakan) orang tersebut.',
      indicator: 'F',
    },
  },
  {
    id: 'PP-MBTI-15',
    number: 15,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'TF',
    questionText: 'Kamu merasa lebih diakui dan dihargai ketika seseorang memujimu karena...',
    optionA: {
      label: '"Kamu sangat cerdas, logis, dan tugasmu sangat kompeten."',
      indicator: 'T',
    },
    optionB: {
      label: '"Kamu sangat baik hati, perhatian, dan menjadi teman yang menyenangkan."',
      indicator: 'F',
    },
  },

  // Dimensi 4: Cara Merespons Aturan & Jadwal (J vs P - Soal 16-20)
  {
    id: 'PP-MBTI-16',
    number: 16,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'JP',
    questionText: 'Menghadapi tugas atau PR sekolah, kebiasaan kerjamu biasanya adalah...',
    optionA: {
      label:
        'Mengerjakannya sesegera mungkin secara terencana, aku tidak tenang kalau tugas belum selesai.',
      indicator: 'J',
    },
    optionB: {
      label:
        'Mengerjakannya nanti-nanti saja, aku baru mendapat dorongan semangat saat batas waktu sudah dekat.',
      indicator: 'P',
    },
  },
  {
    id: 'PP-MBTI-17',
    number: 17,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'JP',
    questionText: 'Jika kamu akan pergi liburan akhir pekan bersama keluarga...',
    optionA: {
      label:
        'Aku lebih suka jika jadwalnya sudah pasti, kita tahu mau ke mana saja dari pagi sampai sore.',
      indicator: 'J',
    },
    optionB: {
      label: 'Aku lebih suka jika kita berangkat saja dulu, lalu spontan menentukan arah saat di jalan.',
      indicator: 'P',
    },
  },
  {
    id: 'PP-MBTI-18',
    number: 18,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'JP',
    questionText:
      'Saat sedang mengerjakan satu PR, tiba-tiba ada tugas lain yang masuk. Apa yang kamu rasakan?',
    optionA: {
      label: 'Terganggu, karena rencanaku yang sudah rapi menjadi berantakan.',
      indicator: 'J',
    },
    optionB: {
      label: 'Biasa saja, aku bisa beralih mengerjakan hal lain dengan mudah tanpa merasa stres.',
      indicator: 'P',
    },
  },
  {
    id: 'PP-MBTI-19',
    number: 19,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'JP',
    questionText: 'Kondisi ruang belajar atau tas sekolahmu...',
    optionA: {
      label: 'Tertata rapi, teratur, dan aku tahu persis di mana meletakkan setiap barang.',
      indicator: 'J',
    },
    optionB: {
      label: 'Kadang berantakan atau acak-acakan, tapi anehnya aku tetap tahu di mana letak barangku.',
      indicator: 'P',
    },
  },
  {
    id: 'PP-MBTI-20',
    number: 20,
    moduleCode: 'PP-MBTI-02',
    moduleName: 'Tipologi Kepribadian Belajar (MBTI)',
    dimension: 'JP',
    questionText: 'Pendapatmu tentang jadwal harian (rutinitas) adalah...',
    optionA: {
      label: 'Rutinitas memberiku rasa aman, pasti, dan membantuku mencapai target.',
      indicator: 'J',
    },
    optionB: {
      label: 'Rutinitas yang terlalu sama setiap hari membuatku merasa bosan dan terkekang.',
      indicator: 'P',
    },
  },
]

/**
 * 40 Butir Pernyataan PP-MI-03 (Skala Likert 1-4)
 */
export const MULTIPLE_INTELLIGENCES_QUESTIONS: MultipleIntelligencesQuestion[] = [
  // Klaster 1: Kecerdasan Linguistik-Verbal (Soal 1-5)
  {
    id: 'PP-MI-01',
    number: 1,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_LINGUISTIK',
    statement:
      'Aku sangat suka membaca buku cerita, membaca novel, membaca artikel di internet, atau rajin menulis di buku catatan harian.',
  },
  {
    id: 'PP-MI-02',
    number: 2,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_LINGUISTIK',
    statement:
      'Aku menikmati permainan kata seperti teka-teki silang, scrabble, mencari sinonim kata, atau membuat pelesetan kata yang lucu.',
  },
  {
    id: 'PP-MI-03',
    number: 3,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_LINGUISTIK',
    statement:
      'Aku lebih mudah mengingat pelajaran jika aku menuliskannya kembali dalam bentuk karangan atau menceritakannya secara lisan ke orang lain.',
  },
  {
    id: 'PP-MI-04',
    number: 4,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_LINGUISTIK',
    statement:
      'Aku suka mengekspresikan perasaanku atau menceritakan ide-ideku melalui tulisan (seperti menulis puisi, cerpen, atau caption panjang di media sosial).',
  },
  {
    id: 'PP-MI-05',
    number: 5,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_LINGUISTIK',
    statement:
      'Aku sangat mudah mengingat nama orang, nama tempat, tanggal kejadian, atau informasi detail yang pernah kudengar/kubaca.',
  },

  // Klaster 2: Kecerdasan Logis-Matematis (Soal 6-10)
  {
    id: 'PP-MI-06',
    number: 6,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_LOGIS',
    statement:
      'Aku sangat suka memecahkan teka-teki logika, bermain catur, atau bermain game yang menuntut strategi pikiran yang matang.',
  },
  {
    id: 'PP-MI-07',
    number: 7,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_LOGIS',
    statement:
      'Aku sering bertanya "mengapa" dan selalu menuntut alasan yang logis (sebab-akibat yang jelas) dari setiap aturan atau peristiwa di sekitarku.',
  },
  {
    id: 'PP-MI-08',
    number: 8,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_LOGIS',
    statement:
      'Aku sangat menikmati pelajaran atau kegiatan yang berhubungan dengan hitungan angka pasti, rumus, atau eksperimen sains.',
  },
  {
    id: 'PP-MI-09',
    number: 9,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_LOGIS',
    statement:
      'Aku punya kebiasaan suka mengurutkan barang, membuat kategori benda, atau melihat pola dan keteraturan dari hal-hal yang berantakan.',
  },
  {
    id: 'PP-MI-10',
    number: 10,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_LOGIS',
    statement:
      'Ketika menghadapi masalah, aku cenderung memecahkannya dengan cara yang sistematis dan terencana (mulai dari langkah 1, 2, lalu 3).',
  },

  // Klaster 3: Kecerdasan Visual-Spasial (Soal 11-15)
  {
    id: 'PP-MI-11',
    number: 11,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_SPASIAL',
    statement:
      'Saat membaca buku pelajaran, aku lebih sering memperhatikan ilustrasi, bagan, grafik, atau gambarnya terlebih dahulu daripada teks tulisannya.',
  },
  {
    id: 'PP-MI-12',
    number: 12,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_SPASIAL',
    statement:
      'Aku jarang tersesat di tempat baru, sangat mudah membaca peta jalan, atau mudah membayangkan letak suatu ruang di dalam kepala.',
  },
  {
    id: 'PP-MI-13',
    number: 13,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_SPASIAL',
    statement:
      'Aku sangat suka menggambar, mencoret-coret buku saat bosan (doodling), merancang desain, atau mewarnai.',
  },
  {
    id: 'PP-MI-14',
    number: 14,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_SPASIAL',
    statement:
      'Aku jauh lebih mudah paham jika guru mengajar menggunakan Peta Pikiran (Mind Map), spidol warna-warni, atau presentasi visual yang menarik.',
  },
  {
    id: 'PP-MI-15',
    number: 15,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_SPASIAL',
    statement:
      'Aku suka membongkar pasang barang (seperti mainan balok/Lego atau mesin sederhana) untuk melihat bagaimana bentuk dan strukturnya menyatu.',
  },

  // Klaster 4: Kecerdasan Kinestetik-Jasmani (Soal 16-20)
  {
    id: 'PP-MI-16',
    number: 16,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_KINESTETIK',
    statement:
      'Tubuhku rasanya tidak bisa diam; aku sangat kesulitan jika harus duduk tegak di kursi belajar tanpa bergerak sedikit pun selama lebih dari 30 menit.',
  },
  {
    id: 'PP-MI-17',
    number: 17,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_KINESTETIK',
    statement:
      'Aku bisa memahami hal baru dengan jauh lebih cepat jika aku diizinkan untuk mempraktikkannya langsung dengan tanganku sendiri.',
  },
  {
    id: 'PP-MI-18',
    number: 18,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_KINESTETIK',
    statement:
      'Aku sangat menikmati kegiatan olahraga, senam/menari, bela diri, atau membuat karya kerajinan fisik dan prakarya.',
  },
  {
    id: 'PP-MI-19',
    number: 19,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_KINESTETIK',
    statement:
      'Saat berbicara atau bercerita, aku selalu menggunakan banyak gerakan tangan (gestur) atau bahasa tubuh secara tidak sadar.',
  },
  {
    id: 'PP-MI-20',
    number: 20,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_KINESTETIK',
    statement:
      'Aku merasa lebih mudah menghafalkan materi pelajaran jika sambil berjalan mondar-mandir atau sambil memainkan benda di tanganku.',
  },

  // Klaster 5: Kecerdasan Musikal (Soal 21-25)
  {
    id: 'PP-MI-21',
    number: 21,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_MUSIKAL',
    statement:
      'Aku sering secara tidak sadar mengetuk-ngetuk jari ke meja, bersenandung, atau menggerakkan kaki mengikuti irama saat sedang berpikir.',
  },
  {
    id: 'PP-MI-22',
    number: 22,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_MUSIKAL',
    statement:
      'Aku sangat mudah dan cepat menghafalkan lirik lagu baru atau mengingat nada musik iklan yang sekilas kudengar dari televisi/internet.',
  },
  {
    id: 'PP-MI-23',
    number: 23,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_MUSIKAL',
    statement:
      'Suara obrolan orang di sekitarku sering mengganggu fokusku, namun mendengarkan musik instrumental justru membantuku belajar lebih konsentrasi.',
  },
  {
    id: 'PP-MI-24',
    number: 24,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_MUSIKAL',
    statement:
      'Aku bisa dengan mudah membedakan suara berbagai alat musik, atau sadar ketika ada orang yang menyanyi dengan nada sumbang (fals).',
  },
  {
    id: 'PP-MI-25',
    number: 25,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_MUSIKAL',
    statement:
      'Mengerjakan PR atau merapikan kamar terasa jauh lebih ringan dan menyenangkan jika dilakukan sambil memutar daftar lagu favoritku.',
  },

  // Klaster 6: Kecerdasan Interpersonal (Soal 26-30)
  {
    id: 'PP-MI-26',
    number: 26,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_INTERPERSONAL',
    statement:
      'Aku punya banyak teman, suka mengobrol, dan merasa sangat nyaman serta berani ketika harus masuk ke lingkungan pergaulan yang baru.',
  },
  {
    id: 'PP-MI-27',
    number: 27,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_INTERPERSONAL',
    statement:
      'Teman-temanku sering datang kepadaku untuk curhat (bercerita masalah pribadi) atau meminta pendapat/saranku atas masalah mereka.',
  },
  {
    id: 'PP-MI-28',
    number: 28,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_INTERPERSONAL',
    statement:
      'Aku merasa lebih bersemangat, tidak mudah bosan, dan ideku lebih banyak keluar jika mengerjakan tugas sekolah secara berkelompok.',
  },
  {
    id: 'PP-MI-29',
    number: 29,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_INTERPERSONAL',
    statement:
      'Aku bisa dengan mudah menebak perasaan orang lain (tahu kapan temanku sedang sedih, marah, atau bad mood) hanya dari melihat ekspresi wajahnya.',
  },
  {
    id: 'PP-MI-30',
    number: 30,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_INTERPERSONAL',
    statement:
      'Aku sering mengambil peran sebagai penengah, pendamai, atau pemberi solusi saat ada teman-teman sekelompokku yang sedang berselisih.',
  },

  // Klaster 7: Kecerdasan Intrapersonal (Soal 31-35)
  {
    id: 'PP-MI-31',
    number: 31,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_INTRAPERSONAL',
    statement:
      'Aku tahu pasti apa yang menjadi cita-citaku, apa saja yang menjadi kelebihanku, dan apa saja yang menjadi kelemahan terbesarku.',
  },
  {
    id: 'PP-MI-32',
    number: 32,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_INTRAPERSONAL',
    statement:
      'Aku merasa lebih tenang dan bisa berkonsentrasi belajar dengan sangat maksimal jika aku bekerja sendirian di tempat yang sepi.',
  },
  {
    id: 'PP-MI-33',
    number: 33,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_INTRAPERSONAL',
    statement:
      'Aku punya pendirian yang kuat dan tidak mudah ikut-ikutan tren/gaya teman-temanku jika aku memang dari awal tidak menyukainya.',
  },
  {
    id: 'PP-MI-34',
    number: 34,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_INTRAPERSONAL',
    statement:
      'Aku memiliki hobi, proyek, atau minat khusus yang tekun aku kerjakan sendiri, meskipun tidak ada temanku yang ikut melakukannya.',
  },
  {
    id: 'PP-MI-35',
    number: 35,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_INTRAPERSONAL',
    statement:
      'Aku sering menyediakan waktu untuk merenung sendiri, memikirkan masa depanku, atau mengevaluasi kesalahan yang baru saja kulakukan hari ini.',
  },

  // Klaster 8: Kecerdasan Naturalis (Soal 36-40)
  {
    id: 'PP-MI-36',
    number: 36,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_NATURALIS',
    statement:
      'Aku sangat menyukai interaksi dengan hewan peliharaan, rajin merawat tanaman, atau senang melakukan hal-hal yang berkaitan dengan makhluk hidup.',
  },
  {
    id: 'PP-MI-37',
    number: 37,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_NATURALIS',
    statement:
      'Jika disuruh memilih, liburan yang paling menyenangkan bagiku adalah pergi ke tempat terbuka seperti taman alam, laut, gunung, atau kebun binatang.',
  },
  {
    id: 'PP-MI-38',
    number: 38,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_NATURALIS',
    statement:
      'Aku sangat tertarik membaca atau menonton tayangan tentang jenis-jenis hewan, tumbuhan, fenomena cuaca, atau dokumenter alam semesta.',
  },
  {
    id: 'PP-MI-39',
    number: 39,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_NATURALIS',
    statement:
      'Aku memiliki kepedulian yang tinggi terhadap kebersihan lingkungan (seperti membuang sampah pada tempatnya, hemat air, atau suka menanam pohon).',
  },
  {
    id: 'PP-MI-40',
    number: 40,
    moduleCode: 'PP-MI-03',
    moduleName: 'Kecerdasan Majemuk (Multiple Intelligences)',
    category: 'MI_NATURALIS',
    statement:
      'Aku merasa pikiranku jauh lebih jernih, segar, dan tidak stres jika aku berada di luar ruangan (ruang terbuka/alam) dibandingkan di dalam gedung.',
  },
]

/**
 * SOP Intervensi Guru Privat untuk Tiap Huruf MBTI
 */
export const MBTI_TUTOR_SOPS: Record<
  'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P',
  { rule: string; instruction: string }
> = {
  E: {
    rule: 'Rasio Bicara 40:60 (Interactive Resitation)',
    instruction:
      'Guru dilarang mendominasi pembicaraan. Gunakan rasio bicara 40% guru dan 60% siswa. Siswa belajar melalui verbalisasi, gunakan metode resitasi atau presentasi balik untuk menstrukturkan pemikirannya.',
  },
  I: {
    rule: 'Jeda Kontemplasi & Hening (Internal Reflection)',
    instruction:
      'Guru dilarang memaksa siswa menjawab langsung secara spontan ("Ayo, masa gitu aja nggak bisa jawab?"). Berikan waktu hening sejenak agar siswa dapat merenungkan jawaban di kepala, atau izinkan mereka menuliskan coretan di kertas terlebih dahulu.',
  },
  S: {
    rule: 'Contoh Konkret Bertahap (Step-by-Step Reality)',
    instruction:
      'Guru wajib mengawali materi dengan contoh konkret di kehidupan nyata. Hindari langsung melompat ke rumus abstrak sebelum siswa memahami instruksi operasional urut dari nomor 1 sampai 10 secara teratur.',
  },
  N: {
    rule: 'Gambaran Besar (Helicopter View & Meaning)',
    instruction:
      'Guru wajib menjelaskan peta besar dan makna konseptual sebelum detail teknis. Siswa N mudah jenuh jika disuruh menghafal tabel tanpa memahami relevansi konsep tersebut di masa depan.',
  },
  T: {
    rule: 'Kompetensi Logis & Alasan Sebab-Akibat',
    instruction:
      'Guru wajib tampil logis dan siap berdiskusi secara analitis. Siswa T menghargai kebenaran objektif dan pembuktian rasional. Jika siswa mendebat, mereka sedang menguji konsistensi materi, bukan membantah otoritas guru.',
  },
  F: {
    rule: 'Ikatan Batin (Rapport First, Lesson Second)',
    instruction:
      'Guru wajib meluangkan 5 menit pertama untuk membangun ikatan emosional dan menanyakan kabar siswa secara hangat. Siswa F belajar atas dasar rasa aman dan dihargai; jika guru bersikap dingin atau kasar, pintu kognitif siswa akan tertutup rapat.',
  },
  J: {
    rule: 'Struktur Jadwal Pasti (Agenda & Predictability)',
    instruction:
      'Guru wajib memaparkan silabus dan target belajar di awal sesi. Mulai dan akhiri sesi tepat waktu, serta hindari mengubah jadwal atau rencana pelajaran secara mendadak.',
  },
  P: {
    rule: 'Fleksibilitas Belajar (Spontaneity & Room to Explore)',
    instruction:
      'Guru dilarang terlalu kaku terhadap silabus harian. Jika siswa sedang antusias mendalami satu topik tertentu, sesuaikan alur belajar secara luwes dan izinkan mereka bereksplorasi dengan cara berpikir mereka sendiri asalkan target akhir tercapai.',
  },
}

/**
 * Metadata 16 Tipe Kepribadian MBTI untuk Siswa
 */
export const MBTI_PROFILES: Record<
  string,
  {
    title: string
    nickname: string
    description: string
  }
> = {
  INTJ: {
    title: 'Strategis & Mandiri',
    nickname: 'Sang Arsitek Pemikir',
    description:
      'Siswa yang memiliki visi masa depan yang jelas, menyukai teori mendalam, mandiri, dan terstruktur dalam merencanakan tugas-tugas akademiknya.',
  },
  INTP: {
    title: 'Analitis & Konseptual',
    nickname: 'Sang Penjelajah Logika',
    description:
      'Siswa yang haus akan rasa ingin tahu intelektual, ahli membedah pola rumit, dan menikmati pemecahan masalah teoritis secara mandiri.',
  },
  ENTJ: {
    title: 'Pemimpin Alami & Tegas',
    nickname: 'Sang Komandan Inisiatif',
    description:
      'Siswa yang terorganisasi, vokal, menyukai tantangan target tinggi, dan secara alami mampu menggerakkan kelompok belajarnya.',
  },
  ENTP: {
    title: 'Kreatif & Inovatif',
    nickname: 'Sang Penemu Cerdas',
    description:
      'Siswa yang cepat menangkap ide baru, pandai berdebat logis, menyukai brainstorming dinamis, dan fleksibel menghadapi perubahan.',
  },
  INFJ: {
    title: 'Visioner & Penuh Empati',
    nickname: 'Sang Pembimbing Berjiwa Luhur',
    description:
      'Siswa yang reflektif, memiliki intuisi kuat terhadap motivasi orang lain, dan belajar paling baik ketika materi memiliki nilai humanis yang bermakna.',
  },
  INFP: {
    title: 'Idealis & Penuh Makna',
    nickname: 'Sang Mediator Kreatif',
    description:
      'Siswa yang peka, menghargai orisinalitas diri, memiliki imajinasi kaya, dan bersemangat jika diberi kebebasan mengekspresikan ide pribadi.',
  },
  ENFJ: {
    title: 'Inspiratif & Kolaboratif',
    nickname: 'Sang Penggerak Harmonis',
    description:
      'Siswa yang ramah, pandai merangkul teman, mudah memahami dinamika kelompok, dan bersemangat saat belajar lewat diskusi interaktif.',
  },
  ENFP: {
    title: 'Antusias & Berdaya Cipta',
    nickname: 'Sang Juara Eksplorasi',
    description:
      'Siswa yang ceria, penuh energi, cepat melihat peluang menarik dari berbagai topik, dan optimal belajar dalam suasana menyenangkan yang tidak monoton.',
  },
  ISTJ: {
    title: 'Teliti & Bertanggung Jawab',
    nickname: 'Sang Penjaga Keteraturan',
    description:
      'Siswa yang metodis, cermat mengikuti petunjuk urut, konsisten menyelesaikan tugas tepat waktu, dan sangat menghargai keakuratan fakta.',
  },
  ISFJ: {
    title: 'Setia & Berdedikasi',
    nickname: 'Sang Pendukung Berhati Hangat',
    description:
      'Siswa yang tekun, penuh perhatian pada detail praktis, senang membantu sesama, dan membutuhkan suasana belajar yang tenang serta apresiatif.',
  },
  ESTJ: {
    title: 'Disiplin & Berorientasi Hasil',
    nickname: 'Sang Pengorganisir Andal',
    description:
      'Siswa yang menyukai kejelasan aturan, lugas, disiplin terhadap tenggat waktu, dan unggul dalam mengerjakan proyek dengan panduan operasional nyata.',
  },
  ESFJ: {
    title: 'Hangat & Kooperatif',
    nickname: 'Sang Fasilitator Ramah',
    description:
      'Siswa yang suka berinteraksi sosial, peka terhadap perasaan lingkungan sekitar, dan sangat termotivasi jika mendapatkan bimbingan yang bersahabat.',
  },
  ISTP: {
    title: 'Praktis & Problem Solver',
    nickname: 'Sang Pengrajin Logis',
    description:
      'Siswa yang tenang, analitis, menyukai eksperimen langsung dengan alat nyata, dan lebih cepat paham lewat demonstrasi praktik dibandingkan teori panjang.',
  },
  ISFP: {
    title: 'Artistik & Santun',
    nickname: 'Sang Seniman Perseptif',
    description:
      'Siswa yang tenang, menghargai keindahan estetika, rendah hati, dan menyukai pengalaman belajar langsung dengan ritme santai tanpa tekanan terburu-buru.',
  },
  ESTP: {
    title: 'Dinamis & Spontan',
    nickname: 'Sang Pelaku Aksi',
    description:
      'Siswa yang berenergi tinggi, sigap merespons lingkungan fisik, menyukai simulasi interaktif, dan paling cepat belajar melalui aksi nyata langsung di lapangan.',
  },
  ESFP: {
    title: 'Sosial & Penuh Semangat',
    nickname: 'Sang Penampil Menghibur',
    description:
      'Siswa yang supel, menyukai keceriaan belajar bersama, peka indrawi, dan cepat menyerap materi melalui media audio-visual yang hidup dan interaktif.',
  },
}

/**
 * Metadata 8 Klaster Kecerdasan Majemuk (Multiple Intelligences)
 */
export const MULTIPLE_INTELLIGENCES_METADATA: Record<
  MiCategoryCode,
  {
    name: string
    alias: string
    description: string
    gatewayStrategy: string
  }
> = {
  MI_LINGUISTIK: {
    name: 'Linguistik-Verbal',
    alias: 'Word Smart',
    description:
      'Kepekaan terhadap makna kata, struktur bahasa, pengolahan narasi, dan komunikasi lisan/tulisan.',
    gatewayStrategy:
      'Gunakan teknik merangkum, bercerita, menulis esai reflektif, atau berdebat lisan untuk memahami topik rumit.',
  },
  MI_LOGIS: {
    name: 'Logis-Matematis',
    alias: 'Number / Reasoning Smart',
    description:
      'Kemampuan penalaran logis, analisis pola sebab-akibat, dan pemecahan masalah komputasi terstruktur.',
    gatewayStrategy:
      'Gunakan urutan alur silogisme sebab-akibat, diagram pohon keputusan, serta pembuktian sistematis langkah demi langkah.',
  },
  MI_SPASIAL: {
    name: 'Visual-Spasial',
    alias: 'Picture Smart',
    description:
      'Kemampuan berpikir dalam bentuk visual, ruang, bagan, warna, dan imajinasi grafis multidimensi.',
    gatewayStrategy:
      'Gunakan Mind Map, spidol kode warna, diagram visual, animasi grafis, atau pemetaan ruang konsep.',
  },
  MI_KINESTETIK: {
    name: 'Kinestetik-Jasmani',
    alias: 'Body Smart',
    description:
      'Kemampuan koordinasi gerak tubuh secara presisi, keterampilan motorik fisik, dan manipulasi benda konkret.',
    gatewayStrategy:
      'Gunakan peraga fisik/props, simulasi gerak tubuh, role-playing, atau jeda belajar aktif sambil berdiri/berjalan santai.',
  },
  MI_MUSIKAL: {
    name: 'Musikal',
    alias: 'Music Smart',
    description:
      'Kepekaan terhadap ritme suara, tempo, melodi, intonasi berbicara, dan pola frekuensi audio.',
    gatewayStrategy:
      'Gunakan mnemonik berirama, iringan musik instrumental latar untuk fokus, atau asosiasi materi ke dalam melodi lagu.',
  },
  MI_INTERPERSONAL: {
    name: 'Interpersonal',
    alias: 'People Smart',
    description:
      'Kemampuan memahami emosi, motivasi, dan niat orang lain; unggul dalam kerja tim, empati, dan komunikasi sosial.',
    gatewayStrategy:
      'Gunakan format diskusi kelompok kecil, teknik peer-tutoring (saling mengajar antar teman), dan studi kasus interaksi sosial.',
  },
  MI_INTRAPERSONAL: {
    name: 'Intrapersonal',
    alias: 'Self Smart',
    description:
      'Kemampuan mengenali diri sendiri secara mendalam, sadar akan kelebihan dan kelemahan pribadi, mandiri, dan reflektif.',
    gatewayStrategy:
      'Berikan waktu hening untuk belajar mandiri, penetapan target belajar personal (self-pacing), dan jurnal evaluasi harian.',
  },
  MI_NATURALIS: {
    name: 'Naturalis',
    alias: 'Nature Smart',
    description:
      'Kepekaan terhadap lingkungan alam luar ruangan, klasifikasi flora/fauna, ekosistem hidup, dan fenomena semesta.',
    gatewayStrategy:
      'Gunakan analogi siklus ekosistem alam, materi berbasis studi kasus lingkungan nyata, atau sesekali belajar di ruang terbuka.',
  },
}

/**
 * Konfigurasi Beban Soal dan Estimasi Waktu per Paket & Jenjang
 */
export const PACKAGE_LEVEL_CONFIG = {
  PAKET_1_PERSONA_MODALITY: {
    SD: {
      totalQuestions: 40,
      estimatedMinutes: 10,
      breakdown: '20 VAK + 10 Belahan Otak + 10 Kebiasaan Belajar',
    },
    SMP: {
      totalQuestions: 50,
      estimatedMinutes: 12,
      breakdown: '24 VAK + 12 Belahan Otak + 14 Kebiasaan Belajar',
    },
    SMA: {
      totalQuestions: 65,
      estimatedMinutes: 15,
      breakdown: '30 VAK + 15 Belahan Otak + 20 Kebiasaan Belajar',
    },
  },
  PAKET_2_PERSONA_POTENTIAL: {
    SD: {
      totalQuestions: 60,
      estimatedMinutes: 15,
      breakdown: '20 Soal MBTI + 40 Soal Kecerdasan Majemuk',
    },
    SMP: {
      totalQuestions: 60,
      estimatedMinutes: 18,
      breakdown: '20 Soal MBTI + 40 Soal Kecerdasan Majemuk',
    },
    SMA: {
      totalQuestions: 60,
      estimatedMinutes: 20,
      breakdown: '20 Soal MBTI + 40 Soal Kecerdasan Majemuk',
    },
  },
} as const

/**
 * Helper untuk mengambil daftar pertanyaan per paket secara terpisah sesuai jenjang:
 * - Paket 1 (PAKET_1_PERSONA_MODALITY): SD = 40 soal, SMP = 50 soal, SMA = 65 soal
 * - Paket 2 (PAKET_2_PERSONA_POTENTIAL): 20 soal MBTI + 40 soal MI = 60 soal (terpisah dari Paket 1)
 */
export function getQuestionsForPackageAndLevel(
  packageCode: AssessmentPackageCode,
  level: StudentLevel = 'SMA'
): Array<
  | (PersonaQuestion & { questionType: 'multiple_choice' })
  | {
      id: string
      number: number
      moduleCode: 'PP-MBTI-02'
      moduleName: string
      cluster: 'MBTI'
      questionText: string
      questionType: 'multiple_choice'
      levels: StudentLevel[]
      options: Array<{
        id: string
        label: string
        indicator: string
      }>
    }
  | {
      id: string
      number: number
      moduleCode: 'PP-MI-03'
      moduleName: string
      cluster: MiCategoryCode
      questionText: string
      questionType: 'likert'
      levels: StudentLevel[]
      options: Array<{
        id: string
        label: string
        indicator: string
        scoreValue: number
      }>
    }
> {
  if (packageCode === 'PAKET_1_PERSONA_MODALITY') {
    return getQuestionsForLevel(level).map((q) => ({
      ...q,
      questionType: 'multiple_choice' as const,
    }))
  }

  if (packageCode !== 'PAKET_2_PERSONA_POTENTIAL') {
    return []
  }

  // Paket 2 hanya berisi soal khusus Paket 2: 20 Soal MBTI + 40 Soal Kecerdasan Majemuk (total 60 soal)
  const mbtiFormatted = MBTI_QUESTIONS.map((q, idx) => ({
    id: q.id,
    number: idx + 1,
    moduleCode: 'PP-MBTI-02' as const,
    moduleName: q.moduleName,
    cluster: 'MBTI' as const,
    questionText: q.questionText,
    questionType: 'multiple_choice' as const,
    levels: ['SD', 'SMP', 'SMA'] as StudentLevel[],
    options: [
      {
        id: `${q.id}-opt-a`,
        label: q.optionA.label,
        indicator: q.optionA.indicator,
      },
      {
        id: `${q.id}-opt-b`,
        label: q.optionB.label,
        indicator: q.optionB.indicator,
      },
    ],
  }))

  const likertScaleOptions = [
    { label: 'Sangat Tidak Sesuai', value: 1 },
    { label: 'Kurang Sesuai', value: 2 },
    { label: 'Sesuai', value: 3 },
    { label: 'Sangat Sesuai', value: 4 },
  ]

  const miFormatted = MULTIPLE_INTELLIGENCES_QUESTIONS.map((q, idx) => ({
    id: q.id,
    number: mbtiFormatted.length + idx + 1,
    moduleCode: 'PP-MI-03' as const,
    moduleName: q.moduleName,
    cluster: q.category,
    questionText: q.statement,
    questionType: 'likert' as const,
    levels: ['SD', 'SMP', 'SMA'] as StudentLevel[],
    options: likertScaleOptions.map((scale, optIdx) => ({
      id: `${q.id}-opt-${optIdx + 1}`,
      label: scale.label,
      indicator: String(scale.value),
      scoreValue: scale.value,
    })),
  }))

  return [...mbtiFormatted, ...miFormatted]
}
