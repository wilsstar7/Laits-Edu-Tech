import type { jsPDF } from 'jspdf'
import type { PersonalityReportData } from '@/types/report'
import { PDF_COLORS, PDF_LAYOUT } from '../pdfConstants'
import { drawPageHeader, drawPageFooter, drawSectionHeading, drawCard } from '../pdfHelpers'

export function renderStrengthsPage(
  doc: jsPDF,
  data: PersonalityReportData,
  pageNum: number,
  totalPages: number
) {
  const { marginLeft, contentWidth, marginTop } = PDF_LAYOUT

  drawPageHeader(doc, 'Your Strengths')

  let currentY = drawSectionHeading(
    doc,
    marginTop + 14,
    'Keunggulan Alami',
    'Your Strengths',
    'Kekuatan utama yang menjadi modalitas kognitif dan sosial siswa dalam menuntaskan materi belajar dengan efektif.'
  )

  const strengths = data.personality.strengths || []
  const cardHeight = 84
  const cardGap = 16

  strengths.forEach((strengthText, idx) => {
    const cardY = currentY
    drawCard(doc, marginLeft, cardY, contentWidth, cardHeight, PDF_COLORS.white, PDF_COLORS.border, 10)

    // Number Badge (01, 02, ...)
    const numStr = (idx + 1).toString().padStart(2, '0')
    doc.setFillColor(...PDF_COLORS.emeraldBg)
    doc.roundedRect(marginLeft + 18, cardY + 18, 36, 36, 8, 8, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...PDF_COLORS.emerald)
    doc.text(numStr, marginLeft + 36, cardY + 41, { align: 'center' })

    // Strength Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11.5)
    doc.setTextColor(...PDF_COLORS.dark)

    // Split text into title and description if contains colon, otherwise use full text
    let title = `Keunggulan ${idx + 1}`
    let bodyText = strengthText

    if (strengthText.includes(':')) {
      const parts = strengthText.split(':')
      title = parts[0]?.trim() || `Keunggulan ${idx + 1}`
      bodyText = parts.slice(1).join(':').trim() || strengthText
    } else if (strengthText.length <= 40) {
      title = strengthText
      bodyText = `Siswa menunjukkan kecenderungan kuat pada aspek ini, memberikan keunggulan tersendiri dalam memproses topik pelajaran.`
    }

    doc.text(title, marginLeft + 66, cardY + 28)

    // Strength Body Text
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...PDF_COLORS.body)
    const bodyLines = doc.splitTextToSize(bodyText, contentWidth - 84)
    doc.text(bodyLines, marginLeft + 66, cardY + 44)

    currentY += cardHeight + cardGap
  })

  // Actionable Advice Box
  const tipBoxY = currentY + 8
  drawCard(doc, marginLeft, tipBoxY, contentWidth, 54, PDF_COLORS.surface, PDF_COLORS.border, 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('TIPS OPTIMALISASI KEKUATAN', marginLeft + 18, tipBoxY + 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.muted)
  const tipLines = doc.splitTextToSize(
    'Gunakan keunggulan ini sebagai fondasi utama saat memulai materi pelajaran baru yang menantang. Menghubungkan topik sulit dengan cara belajar yang Anda kuasai akan melipatgandakan retensi ingatan.',
    contentWidth - 36
  )
  doc.text(tipLines, marginLeft + 18, tipBoxY + 34)

  drawPageFooter(doc, data.student.name, pageNum, totalPages, data.metadata.isDemo)
}
