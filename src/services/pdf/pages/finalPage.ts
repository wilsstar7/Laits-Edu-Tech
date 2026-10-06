import type { jsPDF } from 'jspdf'
import type { PersonalityReportData } from '@/types/report'
import { PDF_COLORS, PDF_LAYOUT } from '../pdfConstants'
import { drawPageHeader, drawPageFooter, drawSectionHeading, drawCard } from '../pdfHelpers'

export function renderFinalPage(
  doc: jsPDF,
  data: PersonalityReportData,
  pageNum: number,
  totalPages: number
) {
  const { marginLeft, contentWidth, marginTop } = PDF_LAYOUT

  drawPageHeader(doc, 'Action Plan & Disclaimer')

  let currentY = drawSectionHeading(
    doc,
    marginTop + 14,
    'Langkah Tindak Lanjut',
    'How to Use Your Profile',
    'Langkah terstruktur untuk mengaplikasikan wawasan profil karakter belajar ke dalam rutinitas harian dan sesi bimbingan belajar.'
  )

  // 4 Action Steps (2x2 Grid)
  const steps = [
    {
      num: '01',
      title: 'Kenali Preferensi Belajar',
      desc: 'Pahami gaya kognitif Anda saat menghadapi materi baru. Jangan memaksakan metode yang bertentangan dengan karakter alami Anda.',
    },
    {
      num: '02',
      title: 'Eksperimen Strategi Baru',
      desc: 'Coba metode belajar yang direkomendasikan dalam laporan ini (mind mapping, diskusi aktif, atau penyelesaian soal bertahap).',
    },
    {
      num: '03',
      title: 'Bangun Rutinitas Konsisten',
      desc: 'Ubah strategi yang berhasil menjadi jadwal belajar yang teratur. Konsistensi kecil setiap hari jauh lebih berdampak daripada belajar sistem kebut semalam.',
    },
    {
      num: '04',
      title: 'Evaluasi & Pantau Progres',
      desc: 'Gunakan fitur pelaporan berkala di platform Laits Edu Tech untuk mengukur peningkatan pemahaman dan efektivitas sesi les privat Anda.',
    },
  ]

  const colWidth = (contentWidth - 14) / 2
  const cardHeight = 78

  const step0 = steps[0] ?? { num: '01', title: 'Kenali Preferensi Belajar', desc: '' }
  const step1 = steps[1] ?? { num: '02', title: 'Eksperimen Strategi Baru', desc: '' }
  const step2 = steps[2] ?? { num: '03', title: 'Bangun Rutinitas Konsisten', desc: '' }
  const step3 = steps[3] ?? { num: '04', title: 'Evaluasi & Pantau Progres', desc: '' }

  // Row 1 (Step 1 & 2)
  const r1Y = currentY
  // Col 1
  drawCard(doc, marginLeft, r1Y, colWidth, cardHeight, PDF_COLORS.white, PDF_COLORS.border, 8)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text(step0.num, marginLeft + 16, r1Y + 24)
  doc.setFontSize(10.5)
  doc.setTextColor(...PDF_COLORS.dark)
  doc.text(step0.title, marginLeft + 42, r1Y + 22)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.body)
  const s0Lines = doc.splitTextToSize(step0.desc, colWidth - 32)
  doc.text(s0Lines, marginLeft + 16, r1Y + 38)

  // Col 2
  const c2X = marginLeft + colWidth + 14
  drawCard(doc, c2X, r1Y, colWidth, cardHeight, PDF_COLORS.white, PDF_COLORS.border, 8)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text(step1.num, c2X + 16, r1Y + 24)
  doc.setFontSize(10.5)
  doc.setTextColor(...PDF_COLORS.dark)
  doc.text(step1.title, c2X + 42, r1Y + 22)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.body)
  const s1Lines = doc.splitTextToSize(step1.desc, colWidth - 32)
  doc.text(s1Lines, c2X + 16, r1Y + 38)

  // Row 2 (Step 3 & 4)
  const r2Y = r1Y + cardHeight + 12
  // Col 1
  drawCard(doc, marginLeft, r2Y, colWidth, cardHeight, PDF_COLORS.white, PDF_COLORS.border, 8)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text(step2.num, marginLeft + 16, r2Y + 24)
  doc.setFontSize(10.5)
  doc.setTextColor(...PDF_COLORS.dark)
  doc.text(step2.title, marginLeft + 42, r2Y + 22)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.body)
  const s2Lines = doc.splitTextToSize(step2.desc, colWidth - 32)
  doc.text(s2Lines, marginLeft + 16, r2Y + 38)

  // Col 2
  drawCard(doc, c2X, r2Y, colWidth, cardHeight, PDF_COLORS.white, PDF_COLORS.border, 8)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text(step3.num, c2X + 16, r2Y + 24)
  doc.setFontSize(10.5)
  doc.setTextColor(...PDF_COLORS.dark)
  doc.text(step3.title, c2X + 42, r2Y + 22)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.body)
  const s3Lines = doc.splitTextToSize(step3.desc, colWidth - 32)
  doc.text(s3Lines, c2X + 16, r2Y + 38)

  currentY = r2Y + cardHeight + 20

  // Disclaimer Section (Psychological Safety)
  const disclaimerHeight = data.metadata.isDemo ? 130 : 100
  drawCard(doc, marginLeft, currentY, contentWidth, disclaimerHeight, PDF_COLORS.surface, PDF_COLORS.border, 10)

  // Left caution marker
  doc.setFillColor(...PDF_COLORS.amber)
  doc.roundedRect(marginLeft, currentY, 4, disclaimerHeight, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...PDF_COLORS.dark)
  doc.text('CATATAN PENTING & DISCLAIMER PENGGUNAAN', marginLeft + 18, currentY + 22)

  let textPointerY = currentY + 36
  if (data.metadata.isDemo) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...PDF_COLORS.amber)
    doc.text('DEMO ASSESSMENT NOTICE', marginLeft + 18, textPointerY)
    textPointerY += 12

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...PDF_COLORS.body)
    const demoNotice = doc.splitTextToSize(
      'Laporan ini dihasilkan dari modul asesmen simulasi (demo). Hasil ini merupakan hasil simulasi/demo dan tidak dimaksudkan sebagai penilaian psikologis yang tervalidasi.',
      contentWidth - 36
    )
    doc.text(demoNotice, marginLeft + 18, textPointerY)
    textPointerY += demoNotice.length * 11 + 8
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.muted)
  const disclaimerBody = doc.splitTextToSize(
    'Hasil assessment ini ditujukan untuk membantu pengenalan diri dan pengembangan strategi belajar. Assessment ini bukan diagnosis medis atau psikologis dan tidak menggantikan evaluasi profesional. Hasil asesmen hendaknya dimaknai sebagai panduan edukasi untuk merancang pengalaman belajar yang menyenangkan dan efektif.',
    contentWidth - 36
  )
  doc.text(disclaimerBody, marginLeft + 18, textPointerY)

  // Verification & Seal Box
  const sealY = currentY + disclaimerHeight + 14
  drawCard(doc, marginLeft, sealY, contentWidth, 48, PDF_COLORS.white, PDF_COLORS.border, 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.dark)
  doc.text('LAITS EDU TECH - ACADEMIC ASSESSMENT DIVISION', marginLeft + 18, sealY + 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...PDF_COLORS.muted)
  doc.text(
    `Dokumen verifikasi digital ID: ${data.assessment.id.slice(0, 16)}... | Versi Template: ${data.metadata.reportVersion}`,
    marginLeft + 18,
    sealY + 34
  )

  drawPageFooter(doc, data.student.name, pageNum, totalPages, data.metadata.isDemo)
}
