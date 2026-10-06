import type { jsPDF } from 'jspdf'
import type { PersonalityReportData } from '@/types/report'
import { PDF_COLORS, PDF_LAYOUT } from '../pdfConstants'
import { drawPageHeader, drawPageFooter, drawSectionHeading, drawCard } from '../pdfHelpers'

export function renderTutorStylePage(
  doc: jsPDF,
  data: PersonalityReportData,
  pageNum: number,
  totalPages: number
) {
  const { marginLeft, contentWidth, marginTop } = PDF_LAYOUT

  drawPageHeader(doc, 'Ideal Learning Environment')

  let currentY = drawSectionHeading(
    doc,
    marginTop + 14,
    'Lingkungan Belajar',
    'Your Ideal Learning Environment',
    'Karakteristik pendampingan dan pendekatan tutor yang paling selaras dengan cara belajar dan interaksi siswa.'
  )

  // Context Guidance banner
  const introBoxY = currentY
  drawCard(doc, marginLeft, introBoxY, contentWidth, 42, PDF_COLORS.primaryLight, PDF_COLORS.primaryLight, 8)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('REKOMENDASI PENDEKATAN BIMBINGAN BELAJAR', marginLeft + 18, introBoxY + 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(
    'Anda berpotensi mendapatkan hasil belajar maksimal dengan tutor privat yang menerapkan prinsip berikut:',
    marginLeft + 18,
    introBoxY + 30
  )

  currentY = introBoxY + 54

  const tutorStyles = data.personality.recommendedTutorStyle || []
  const cardHeight = 78
  const cardGap = 14

  tutorStyles.forEach((style, idx) => {
    const cardY = currentY
    drawCard(doc, marginLeft, cardY, contentWidth, cardHeight, PDF_COLORS.white, PDF_COLORS.border, 8)

    // Check Icon Circle
    doc.setFillColor(...PDF_COLORS.emeraldBg)
    doc.roundedRect(marginLeft + 18, cardY + 18, 30, 30, 8, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...PDF_COLORS.emerald)
    doc.text('V', marginLeft + 28, cardY + 37)

    // Style Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...PDF_COLORS.dark)
    doc.text(`Karakteristik ${idx + 1}`, marginLeft + 58, cardY + 28)

    // Description text
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...PDF_COLORS.body)
    const styleLines = doc.splitTextToSize(style, contentWidth - 76)
    doc.text(styleLines, marginLeft + 58, cardY + 44)

    currentY += cardHeight + cardGap
  })

  // Bottom matching note
  const matchBoxY = currentY + 8
  drawCard(doc, marginLeft, matchBoxY, contentWidth, 54, PDF_COLORS.surface, PDF_COLORS.border, 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('INTEGRASI SISTEM LAITS LES PRIVAT', marginLeft + 18, matchBoxY + 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.muted)
  const matchLines = doc.splitTextToSize(
    'Profil ini otomatis dijadikan preferensi algoritma pencocokan saat Anda memilih tutor di platform Laits Edu Tech, sehingga sesi les privat dapat langsung berjalan secara efektif sejak pertemuan pertama.',
    contentWidth - 36
  )
  doc.text(matchLines, marginLeft + 18, matchBoxY + 34)

  drawPageFooter(doc, data.student.name, pageNum, totalPages, data.metadata.isDemo)
}
