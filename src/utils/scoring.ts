import type {
  StudentLevel,
  PersonaModalityResult,
  VakModuleResult,
  BrainDominanceModuleResult,
  HabitsModuleResult,
  HabitClusterResult,
} from '@/types/assessment'
import {
  getQuestionsForLevel,
  type PersonaQuestion,
} from '@/data/personaModalityData'

export interface QuestionScoringItem {
  value: number
  weight: number
  reverseScore: boolean
  minOptionValue?: number
  maxOptionValue?: number
}

export function calculateItemScore(
  value: number,
  reverseScore: boolean,
  minOption = 1,
  maxOption = 5
): number {
  if (reverseScore) {
    return maxOption + minOption - value
  }
  return value
}

export function calculateDimensionScore(
  items: QuestionScoringItem[],
  defaultMin = 1,
  defaultMax = 5
): { rawScore: number; normalizedScore: number } {
  let rawScore = 0
  let minPossible = 0
  let maxPossible = 0

  for (const item of items) {
    const minVal = item.minOptionValue ?? defaultMin
    const maxVal = item.maxOptionValue ?? defaultMax
    const effectiveValue = calculateItemScore(
      item.value,
      item.reverseScore,
      minVal,
      maxVal
    )

    rawScore += effectiveValue * item.weight
    minPossible += minVal * item.weight
    maxPossible += maxVal * item.weight
  }

  let normalizedScore = 50.0
  if (maxPossible - minPossible > 0) {
    normalizedScore = ((rawScore - minPossible) / (maxPossible - minPossible)) * 100
  }

  normalizedScore = Math.max(0, Math.min(100, normalizedScore))

  return {
    rawScore: Number(rawScore.toFixed(2)),
    normalizedScore: Number(normalizedScore.toFixed(1)),
  }
}

/**
 * 1. Perhitungan Skoring Sensory Modality (VAK)
 * Berdasarkan Bagian 3 Modul 1.1 di Soal.Md
 */
export function calculateVakScore(
  vakQuestions: PersonaQuestion[],
  answers: Record<string, string>
): VakModuleResult {
  let vCount = 0
  let aCount = 0
  let kCount = 0

  for (const q of vakQuestions) {
    const selectedOptionId = answers[q.id]
    if (!selectedOptionId) continue

    const option = q.options.find(
      (opt) => opt.id === selectedOptionId || opt.indicator === selectedOptionId
    )
    if (option) {
      if (option.indicator === 'V') vCount++
      else if (option.indicator === 'A') aCount++
      else if (option.indicator === 'K') kCount++
    }
  }

  const total = vakQuestions.length
  const vPct = total > 0 ? Number(((vCount / total) * 100).toFixed(2)) : 0
  const aPct = total > 0 ? Number(((aCount / total) * 100).toFixed(2)) : 0
  const kPct = total > 0 ? Number(((kCount / total) * 100).toFixed(2)) : 0

  // Sorting skor untuk mencari S1, S2, S3
  const modalities: Array<{ code: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC'; score: number; pct: number }> = [
    { code: 'VISUAL', score: vCount, pct: vPct },
    { code: 'AUDITORY', score: aCount, pct: aPct },
    { code: 'KINESTHETIC', score: kCount, pct: kPct },
  ]

  modalities.sort((m1, m2) => m2.score - m1.score)

  const s1 = modalities[0] ?? { code: 'VISUAL' as const, score: 0, pct: 0 }
  const s2 = modalities[1] ?? { code: 'AUDITORY' as const, score: 0, pct: 0 }
  const s3 = modalities[2] ?? { code: 'KINESTHETIC' as const, score: 0, pct: 0 }

  let dominanceType: 'SINGLE_DOMINANCE' | 'BIMODAL' | 'MULTIMODAL' = 'SINGLE_DOMINANCE'
  let primaryModality: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'MULTIMODAL' = s1.code
  let secondaryModality: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | null = null

  // Kriteria 1: Multimodal (Seimbang)
  // Selisih antara ketiga skor modalitas sangat kecil (S1 - S3 <= 1 pada 15 soal SD, atau <= 2 pada 20-30 soal SMP/SMA)
  const multimodalThreshold = total <= 15 ? 1 : 2
  if (s1.score - s3.score <= multimodalThreshold) {
    dominanceType = 'MULTIMODAL'
    primaryModality = 'MULTIMODAL'
    secondaryModality = null
  }
  // Kriteria 2: Dominasi Tunggal
  // Skor tertinggi >= 53.3% dari total ATAU memiliki selisih >= 3 poin dari modalitas tertinggi kedua
  else if (s1.pct >= 53.3 || s1.score - s2.score >= 3) {
    dominanceType = 'SINGLE_DOMINANCE'
    primaryModality = s1.code
    secondaryModality = null
  }
  // Kriteria 3: Bimodal (Campuran Dua Jalur)
  // Selisih S1 - S2 <= 2 poin namun tidak memenuhi syarat multimodal
  else if (s1.score - s2.score <= 2) {
    dominanceType = 'BIMODAL'
    primaryModality = s1.code
    secondaryModality = s2.code
  }

  // Generate Title & Recommendations
  let title = ''
  let summary = ''
  const studyRecommendations: string[] = []
  let tutorSop = ''

  if (dominanceType === 'MULTIMODAL') {
    title = 'Multimodal (Pembelajar Fleksibel)'
    summary =
      'Siswa memiliki keseimbangan gerbang sensori yang prima dalam menyerap informasi baik secara visual, auditori, maupun kinestetik.'
    studyRecommendations.push(
      'Kombinasikan membaca ringkasan visual, mendengarkan penjelasan diskusi, dan praktik latihan soal aktif.',
      'Gunakan variasi media belajar agar sesi belajar tidak terasa monoton.'
    )
    tutorSop =
      'Gunakan metode campuran: buka materi dengan gambar/bagan, jelaskan intinya secara lisan, lalu berikan latihan langsung.'
  } else if (dominanceType === 'BIMODAL') {
    const pairName = `${s1.code === 'VISUAL' ? 'Visual' : s1.code === 'AUDITORY' ? 'Auditori' : 'Kinestetik'} - ${
      s2.code === 'VISUAL' ? 'Visual' : s2.code === 'AUDITORY' ? 'Auditori' : 'Kinestetik'
    }`
    title = `Bimodal (${pairName})`
    summary = `Siswa menggabungkan dua jalur sensori utama (${pairName}) untuk memproses materi secara optimal.`

    if (s1.code === 'VISUAL' || s2.code === 'VISUAL') {
      studyRecommendations.push('Gunakan warna penanda stabilo, grafik, atau rangkuman peta konsep.')
    }
    if (s1.code === 'AUDITORY' || s2.code === 'AUDITORY') {
      studyRecommendations.push('Ulas materi dengan tanya jawab lisan atau membacanya dengan suara bersuara.')
    }
    if (s1.code === 'KINESTHETIC' || s2.code === 'KINESTHETIC') {
      studyRecommendations.push('Sertakan aktivitas fisik ringan atau menuliskan rumus berulang kali.')
    }
    tutorSop =
      'Kombinasikan dua stimulus dominan siswa dalam setiap modul materi baru sebelum beralih ke soal latihan mandiri.'
  } else {
    // Dominasi Tunggal
    if (primaryModality === 'VISUAL') {
      title = 'Dominan Visual (Penglihatan & Spasial)'
      summary =
        'Siswa sangat mengandalkan representasi grafis, diagram, kode warna, teks tertulis, dan demonstrasi visual untuk mengonstruksi pemahaman.'
      studyRecommendations.push(
        'Buat catatan dengan peta pikiran (mind map) dan pulpen/stabilo aneka warna.',
        'Gunakan video ilustrasi, infografis, dan diagram alur ketika mempelajari bab baru.',
        'Jaga ruang belajar dan meja tetap rapi dari barang yang berserakan agar tidak mendistraksi pandangan.'
      )
      tutorSop =
        'Tutor wajib menyajikan tulisan rumus rapi, diagram alur konsep, dan peta pikiran di papan tulis/kertas catatan.'
    } else if (primaryModality === 'AUDITORY') {
      title = 'Dominan Auditori (Pendengaran & Verbal)'
      summary =
        'Siswa memproses konsep secara optimal melalui komunikasi lisan, ritme suara, diskusi aktif, dan tanya jawab bertahap.'
      studyRecommendations.push(
        'Bacakan rangkuman materi dengan suara pelan atau jelaskan kembali konsep ke orang lain.',
        'Gunakan rekaman suara materi atau podcast edukasi untuk memperkuat hafalan.',
        'Hindari ruangan yang bising dari suara televisi atau obrolan luar saat sedang menghafal.'
      )
      tutorSop =
        'Buka sesi dengan dialog dan jelaskan langkah rumus secara verbal pelan-pelan. Berikan kesempatan siswa menjelaskan kembali pemahamannya.'
    } else {
      title = 'Dominan Kinestetik (Sentuhan & Gerak Aktif)'
      summary =
        'Siswa mengandalkan sensasi taktil, memori motorik, dan keterlibatan fisik langsung saat belajar.'
      studyRecommendations.push(
        'Gunakan alat peraga nyata, eksperimen praktik, atau tulis ulang materi dengan tangan di atas kertas buram.',
        'Belajar sambil bergerak ringan atau berjalan santai di dalam kamar saat mengingat konsep hafalan.',
        'Bagi sesi belajar menjadi durasi yang lebih pendek dengan jeda peregangan tubuh secara berkala.'
      )
      tutorSop =
        'Sediakan alat peraga fisik atau ajak siswa langsung memegang pena untuk latihan soal bersama. Hindari ceramah diam terlalu lama.'
    }
  }

  return {
    total_questions: total,
    scores: { V: vCount, A: aCount, K: kCount },
    percentages: { V: vPct, A: aPct, K: kPct },
    dominance_type: dominanceType,
    primary_modality: primaryModality,
    secondary_modality: secondaryModality,
    title,
    summary,
    study_recommendations: studyRecommendations,
    tutor_sop: tutorSop,
  }
}

/**
 * 2. Perhitungan Skoring Dominasi Hemisfer Otak (Kiri vs Kanan)
 * Berdasarkan Bagian 3 Modul 1.2 di Soal.Md
 */
export function calculateBrainDominanceScore(
  hemQuestions: PersonaQuestion[],
  answers: Record<string, string>
): BrainDominanceModuleResult {
  let leftCount = 0
  let rightCount = 0

  for (const q of hemQuestions) {
    const selectedOptionId = answers[q.id]
    if (!selectedOptionId) continue

    const option = q.options.find(
      (opt) => opt.id === selectedOptionId || opt.indicator === selectedOptionId
    )
    if (option) {
      if (option.indicator === 'LEFT_BRAIN') leftCount++
      else if (option.indicator === 'RIGHT_BRAIN') rightCount++
    }
  }

  const total = hemQuestions.length
  const leftPct = total > 0 ? Number(((leftCount / total) * 100).toFixed(2)) : 0
  const rightPct = total > 0 ? Number(((rightCount / total) * 100).toFixed(2)) : 0

  let dominanceCategory: 'LEFT_DOMINANT' | 'RIGHT_DOMINANT' | 'WHOLE_BRAIN' = 'WHOLE_BRAIN'
  let tutorSopKey: 'SOP_HEM_LEFT' | 'SOP_HEM_RIGHT' | 'SOP_HEM_WHOLE_BRAIN' =
    'SOP_HEM_WHOLE_BRAIN'
  let title = ''
  let summary = ''
  let tutorSop = ''

  // Kriteria:
  // Dominan Kiri jika Persentase Kiri > 65%
  // Dominan Kanan jika Persentase Kanan > 65%
  // Seimbang (Whole-Brain) jika kedua sisi <= 65%
  if (leftPct > 65) {
    dominanceCategory = 'LEFT_DOMINANT'
    tutorSopKey = 'SOP_HEM_LEFT'
    title = 'Dominan Otak Kiri (Analitis & Terstruktur)'
    summary =
      'Siswa memproses informasi secara sekuensial, rasional, dan logis. Menyukai instruksi langkah demi langkah dan kepastian target.'
    tutorSop =
      'Guru privat wajib memberikan silabus atau target harian di awal sesi ("Hari ini kita akan belajar 3 rumus ini"). Anak otak kiri benci disuruh menebak-nebak tujuan belajar. Jika hasil ujiannya salah, guru harus menunjukkan secara pasti di langkah nomor berapa ia keliru. Jangan berikan tugas terbuka yang instruksinya mengambang.'
  } else if (rightPct > 65) {
    dominanceCategory = 'RIGHT_DOMINANT'
    tutorSopKey = 'SOP_HEM_RIGHT'
    title = 'Dominan Otak Kanan (Holistik & Intuitif)'
    summary =
      'Siswa memproses gambaran besar terlebih dahulu sebelum masuk ke detail. Memiliki imajinasi kuat dan menyukai pendekatan pemecahan masalah kreatif.'
    tutorSop =
      'Guru privat dilarang langsung menyuruh anak mengerjakan 10 soal hitungan berturut-turut tanpa menjelaskan konsep besarnya. Guru wajib menceritakan fungsi materi tersebut di dunia nyata ("Kenapa kita belajar gravitasi?"). Berikan keleluasaan jika anak ini menemukan cara cepat (shortcut) sendiri dalam memecahkan soal, jangan dimarahi hanya karena caranya berbeda dengan buku cetak asalkan logikanya benar.'
  } else {
    dominanceCategory = 'WHOLE_BRAIN'
    tutorSopKey = 'SOP_HEM_WHOLE_BRAIN'
    title = 'Seimbang / Whole-Brain (Adaptif & Fleksibel)'
    summary =
      'Siswa mampu memanfaatkan belahan otak analitis dan kreatif secara seimbang tergantung konteks mata pelajaran dan situasi tantangan.'
    tutorSop =
      'Guru privat dapat menggunakan metode kombinasi. Buka sesi dengan cerita/visual (untuk otak kanan), lalu masuk ke pengerjaan soal presisi langkah demi langkah (untuk otak kiri). Anak tipe ini adalah pembelajar yang paling adaptif.'
  }

  return {
    total_questions: total,
    scores: { LEFT_BRAIN: leftCount, RIGHT_BRAIN: rightCount },
    percentages: { LEFT_BRAIN: leftPct, RIGHT_BRAIN: rightPct },
    dominance_category: dominanceCategory,
    tutor_sop_key: tutorSopKey,
    title,
    summary,
    tutor_sop: tutorSop,
  }
}

/**
 * 3. Perhitungan Skoring Screening Kebiasaan Belajar
 * Berdasarkan Bagian 3 Modul 1.3 di Soal.Md (3 Klaster Independen + Tie Breaker)
 */
export function calculateHabitsScore(
  skbQuestions: PersonaQuestion[],
  answers: Record<string, string>
): HabitsModuleResult {
  // Helper untuk skoring 1 klaster (5 butir)
  function scoreCluster(
    clusterQuestions: PersonaQuestion[],
    anchorQuestionId: string,
    clusterType: 'BIO' | 'ENV' | 'FOCUS'
  ): HabitClusterResult {
    const scores = { A: 0, B: 0, C: 0 }

    for (const q of clusterQuestions) {
      const selectedOptionId = answers[q.id]
      if (!selectedOptionId) continue

      const option = q.options.find(
        (opt) => opt.id === selectedOptionId || opt.indicator === selectedOptionId
      )
      if (option) {
        if (option.indicator === 'A') scores.A++
        else if (option.indicator === 'B') scores.B++
        else if (option.indicator === 'C') scores.C++
      }
    }

    // Penentuan mayoritas & tie-breaker
    const counts = [
      { key: 'A' as const, count: scores.A },
      { key: 'B' as const, count: scores.B },
      { key: 'C' as const, count: scores.C },
    ]
    counts.sort((c1, c2) => c2.count - c1.count)

    const firstCount = counts[0] ?? { key: 'A' as const, count: 0 }
    const secondCount = counts[1] ?? { key: 'B' as const, count: 0 }
    let winningChoice: 'A' | 'B' | 'C' = firstCount.key

    // Jika terjadi nilai seri pada skor tertinggi (misal: 2A, 2B, 1C)
    if (firstCount.count === secondCount.count) {
      const anchorAnswerId = answers[anchorQuestionId]
      const anchorQ = clusterQuestions.find((q) => q.id === anchorQuestionId)
      const anchorOption = anchorQ?.options.find(
        (opt) => opt.id === anchorAnswerId || opt.indicator === anchorAnswerId
      )
      if (anchorOption && (anchorOption.indicator === 'A' || anchorOption.indicator === 'B' || anchorOption.indicator === 'C')) {
        winningChoice = anchorOption.indicator as 'A' | 'B' | 'C'
      }
    }

    // Mapping output klaster
    if (clusterType === 'BIO') {
      if (winningChoice === 'A') {
        return {
          scores,
          result: 'MORNING_PERSON',
          title: 'Morning Person',
          description: 'Puncak kesiagaan dan daya tangkap otak berada di pagi hari.',
          tutor_sop_key: 'SOP_BIO_A',
          tutor_sop:
            'Guru privat disarankan menjadwalkan les di pagi/siang hari, terutama akhir pekan. Jika les terpaksa malam hari, berikan materi hafalan/review ringan saja, jangan berikan konsep rumit yang baru.',
        }
      } else if (winningChoice === 'B') {
        return {
          scores,
          result: 'AFTERNOON_PERSON',
          title: 'Afternoon Person',
          description: 'Fokus dan stamina belajar paling stabil di sore hari setelah jeda istirahat.',
          tutor_sop_key: 'SOP_BIO_B',
          tutor_sop:
            'Performa otak stabil di sore hari sepulang sekolah. Cocok untuk sesi bimbingan belajar reguler harian.',
        }
      } else {
        return {
          scores,
          result: 'NIGHT_OWL',
          title: 'Night Owl',
          description: 'Daya konsentrasi dan pemikiran tajam justru aktif ketika suasana tenang di malam hari.',
          tutor_sop_key: 'SOP_BIO_C',
          tutor_sop:
            'Anak ini baru memiliki mood dan fokus tajam di malam hari. Penjadwalan les privat jam 18.30 ke atas sangat direkomendasikan.',
        }
      }
    } else if (clusterType === 'ENV') {
      if (winningChoice === 'A') {
        return {
          scores,
          result: 'FORMAL_AND_SENSITIVE',
          title: 'Formal & Sensitive',
          description: 'Sensitif terhadap kebisingan dan membutuhkan ruang yang hening serta meja tertata rapi.',
          tutor_sop_key: 'SOP_ENV_A',
          tutor_sop:
            'Guru les wajib menjaga keheningan, dilarang mengajak ngobrol di luar konteks pelajaran saat anak sedang fokus, dan pastikan meja bersih.',
        }
      } else if (winningChoice === 'B') {
        return {
          scores,
          result: 'MODERATE_FLEXIBLE',
          title: 'Moderate / Flexible',
          description: 'Adaptif dengan lingkungan sekitar dan mampu berkonsentrasi dalam kondisi wajar.',
          tutor_sop_key: 'SOP_ENV_B',
          tutor_sop:
            'Anak adaptif, guru les bisa mengajar di ruang tamu keluarga tanpa masalah selama suara tidak terlalu bising.',
        }
      } else {
        return {
          scores,
          result: 'CASUAL_STIMULATED',
          title: 'Casual & Stimulated',
          description: 'Lebih nyaman dalam posisi duduk santai/lesehan dan terbantu oleh alunan musik latar lembut atau camilan.',
          tutor_sop_key: 'SOP_ENV_C',
          tutor_sop:
            'Guru les dilarang kaku. Izinkan anak belajar sambil makan camilan, lesehan di karpet, atau pasang lagu instrumental dengan volume pelan agar anak tidak mengantuk atau bosan.',
        }
      }
    } else {
      // FOCUS
      if (winningChoice === 'A') {
        return {
          scores,
          result: 'TIPE_MARATON',
          title: 'Tipe Maraton',
          description: 'Memiliki daya tahan konsentrasi mendalam yang panjang dalam 1 sesi pembelajaran.',
          tutor_sop_key: 'SOP_FOCUS_A',
          tutor_sop:
            'Guru les bisa langsung memberikan ujian simulasi atau menerangkan bab panjang tanpa henti. Anak ini benci diganggu jika sedang asyik belajar.',
        }
      } else if (winningChoice === 'B') {
        return {
          scores,
          result: 'TIPE_POMODORO',
          title: 'Tipe Pomodoro',
          description: 'Optimal dengan ritme belajar 30-45 menit yang diselingi istirahat sejenak.',
          tutor_sop_key: 'SOP_FOCUS_B',
          tutor_sop:
            'Terapkan jeda 5 menit setiap 30 menit. Izinkan anak ke toilet atau sekadar minum air putih agar stamina kognitif terjaga.',
        }
      } else {
        return {
          scores,
          result: 'TIPE_SPRINT',
          title: 'Tipe Sprint',
          description: 'Rentang fokus pendek namun cepat mencerna konsep jika variasi aktivitas disesuaikan berkala.',
          tutor_sop_key: 'SOP_FOCUS_C',
          tutor_sop:
            'Rentang fokus sangat pendek. Guru les wajib mengganti metode setiap 15 menit (15 menit teori, 15 menit tanya jawab, 15 menit games soal). Jangan pernah ceramah lebih dari 15 menit.',
        }
      }
    }
  }

  const bioQuestions = skbQuestions.filter((q) => q.cluster === 'BIO')
  const envQuestions = skbQuestions.filter((q) => q.cluster === 'ENV')
  const focusQuestions = skbQuestions.filter((q) => q.cluster === 'FOCUS')

  return {
    total_questions: skbQuestions.length,
    clusters: {
      chronobiology: scoreCluster(bioQuestions, 'pm-skb-01', 'BIO'),
      environment: scoreCluster(envQuestions, 'pm-skb-06', 'ENV'),
      attention_span: scoreCluster(focusQuestions, 'pm-skb-11', 'FOCUS'),
    },
  }
}

/**
 * 4. Fungsi Utama Perhitungan Hasil Asesmen Lengkap Paket 1 (Persona Modality)
 */
export function calculatePersonaModalityResult(
  level: StudentLevel,
  answers: Record<string, string>
): PersonaModalityResult {
  const allLevelQuestions = getQuestionsForLevel(level)

  const vakQuestions = allLevelQuestions.filter((q) => q.moduleCode === 'PM-VAK-01')
  const hemQuestions = allLevelQuestions.filter((q) => q.moduleCode === 'PM-HEM-02')
  const skbQuestions = allLevelQuestions.filter((q) => q.moduleCode === 'PM-SKB-03')

  const vakResult = calculateVakScore(vakQuestions, answers)
  const brainResult = calculateBrainDominanceScore(hemQuestions, answers)
  const habitsResult = calculateHabitsScore(skbQuestions, answers)

  return {
    package_code: 'PAKET_1_PERSONA_MODALITY',
    student_level: level,
    modules: {
      PM_VAK_01: vakResult,
      PM_HEM_02: brainResult,
      PM_SKB_03: habitsResult,
    },
  }
}
