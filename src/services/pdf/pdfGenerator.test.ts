import { describe, it, expect } from 'vitest'
import { generatePersonalityReportPdf, TOTAL_REPORT_PAGES } from './pdfGenerator'
import type { PersonalityReportData } from '@/types/report'

describe('generatePersonalityReportPdf', () => {
  const sampleData: PersonalityReportData = {
    student: {
      id: 'student-123',
      name: 'Ahmad Fulan',
      email: 'ahmad@example.com',
      grade: 'SMA Kelas 11',
      school: 'SMA Negeri 1',
    },
    assessment: {
      id: 'result-456',
      name: 'Learning Personality Assessment',
      completedAt: '2026-10-06T00:00:00Z',
    },
    personality: {
      name: 'Penjelajah Konseptual (Explorer)',
      code: 'EXPLORER',
      description:
        'Profil belajar Anda mengindikasikan rasa ingin tahu intelektual yang tinggi dan antusiasme dalam mengeksplorasi sudut pandang baru.',
      overallScore: 78.5,
      strengths: [
        'Cepat memahami konsep abstrak dan analogi baru',
        'Kreatif dalam mencari cara alternatif memecahkan masalah',
        'Memiliki antusiasme tinggi pada materi wawasan luas',
      ],
      challenges: [
        'Terkadang cepat merasa jenuh jika materi terlalu monoton',
        'Perlu perhatian ekstra untuk latihan soal rutin repetitif',
      ],
      learningStyle: 'Eksploratif dan Berbasis Masalah (Problem-Based Inquiry)',
      communicationStyle: 'Ekspresif, suka mengajukan pertanyaan mendalam',
      motivation: 'Termotivasi ketika memahami gambaran besar dan signifikansi nyata',
      recommendedStudyMethod: [
        'Diskusi konsep interaktif',
        'Pemetaan materi dengan diagram mind map',
        'Eksperimen studi kasus aplikasi nyata',
      ],
      recommendedSubjects: [
        'Fisika Konseptual',
        'Biologi & Ekosistem',
        'Bahasa Inggris Komunikatif',
        'Sejarah & Peradaban Islam',
      ],
      recommendedTutorStyle: [
        'Tutor yang dinamis dan terbuka untuk berdiskusi',
        'Memberikan analogi aplikatif daripada sekadar hafalan rumus',
        'Memberi keleluasaan dalam eksplorasi metode penyelesaian soal',
      ],
    },
    dimensions: [
      {
        name: 'Interaksi Sosial Belajar',
        code: 'EXTRAVERSION',
        score: 72,
        description: 'Menunjukkan kenyamanan berkolaborasi dan berdiskusi.',
      },
      {
        name: 'Eksplorasi Konseptual',
        code: 'OPENNESS',
        score: 86,
        description: 'Tinggi dalam eksplorasi ide baru dan rasa ingin tahu.',
      },
      {
        name: 'Keteraturan & Perencanaan',
        code: 'CONSCIENTIOUSNESS',
        score: 64,
        description: 'Memerlukan dukungan jadwal fleksibel namun terarah.',
      },
      {
        name: 'Kolaborasi & Resepsi Masukan',
        code: 'AGREEABLENESS',
        score: 78,
        description: 'Sangat kooperatif menerima feedback pembimbing.',
      },
      {
        name: 'Ketenangan Menghadapi Tantangan',
        code: 'EMOTIONAL_STABILITY',
        score: 69,
        description: 'Adaptif dan tenang menghadapi soal bervariasi.',
      },
    ],
    metadata: {
      reportVersion: '1.0',
      generatedAt: '2026-10-06T00:00:00Z',
      isDemo: false,
      title: 'Personality & Learning Profile Report',
      author: 'Laits Edu Tech LMS',
      subject: 'Student Personality Profile',
      keywords: ['Personality', 'Learning Profile', 'Education', 'Assessment'],
    },
  }

  it('generates a valid PDF blob with 9 pages', async () => {
    const blob = await generatePersonalityReportPdf(sampleData)

    expect(blob).toBeDefined()
    expect(blob.type).toBe('application/pdf')
    expect(blob.size).toBeGreaterThan(1000)
    expect(TOTAL_REPORT_PAGES).toBe(9)
  })

  it('generates a valid PDF blob for demo assessment', async () => {
    const demoData = {
      ...sampleData,
      metadata: {
        ...sampleData.metadata,
        isDemo: true,
      },
    }
    const blob = await generatePersonalityReportPdf(demoData)

    expect(blob).toBeDefined()
    expect(blob.size).toBeGreaterThan(1000)

    const text = await blob.text()
    expect(text).toContain('%PDF-')
    expect(text).toContain('/Count 9')
  })

  it('embeds correct metadata and 9-page catalog inside the PDF document', async () => {
    const blob = await generatePersonalityReportPdf(sampleData)
    const text = await blob.text()

    expect(text).toContain('%PDF-')
    expect(text).toContain('/Title (Personality & Learning Profile Report)')
    expect(text).toContain('/Author (Laits Edu Tech LMS)')
    expect(text).toContain('/Creator (Laits Edu Tech PDF Engine)')
    expect(text).toContain('/Count 9')
  })
})
