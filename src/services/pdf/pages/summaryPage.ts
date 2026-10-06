import type { jsPDF } from 'jspdf'
import type { PersonalityReportData } from '@/types/report'
import { PDF_COLORS, PDF_LAYOUT } from '../pdfConstants'
import { drawPageHeader, drawPageFooter, drawSectionHeading, drawCard } from '../pdfHelpers'

export function renderSummaryPage(
  doc: jsPDF,
  data: PersonalityReportData,
  pageNum: number,
  totalPages: number
) {
  const { marginLeft, contentWidth, marginTop } = PDF_LAYOUT

  drawPageHeader(doc, 'Executive Summary')

  let currentY = drawSectionHeading(
    doc,
    marginTop + 14,
    'Ringkasan Profil',
    'Your Personality Profile',
    'Gambaran menyeluruh mengenai tipe kepribadian belajar, pola pendekatan kognitif, serta sintesis karakter unggul siswa.'
  )

  // 1. Primary Personality Card
  const heroCardY = currentY
  const heroCardHeight = 160
  drawCard(doc, marginLeft, heroCardY, contentWidth, heroCardHeight, PDF_COLORS.white, PDF_COLORS.border, 10)

  // Personality Title & Badge
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('TIPE UTAMA SISWA', marginLeft + 24, heroCardY + 28)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...PDF_COLORS.dark)
  doc.text(data.personality.name, marginLeft + 24, heroCardY + 48)

  // Overall Score Badge
  const scoreBoxX = marginLeft + contentWidth - 110
  drawCard(doc, scoreBoxX, heroCardY + 22, 86, 34, PDF_COLORS.primaryLight, PDF_COLORS.primaryLight, 6)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('SKOR PROFIL', scoreBoxX + 12, heroCardY + 34)
  doc.setFontSize(13)
  doc.text(`${Math.round(data.personality.overallScore)}%`, scoreBoxX + 12, heroCardY + 50)

  // Divider
  doc.setDrawColor(...PDF_COLORS.border)
  doc.setLineWidth(0.75)
  doc.line(marginLeft + 24, heroCardY + 64, marginLeft + contentWidth - 24, heroCardY + 64)

  // Description text
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...PDF_COLORS.body)
  const descLines = doc.splitTextToSize(data.personality.description, contentWidth - 48)
  doc.text(descLines, marginLeft + 24, heroCardY + 84)

  currentY = heroCardY + heroCardHeight + 20

  // 2. Two Columns: Key Strengths vs Development Areas
  const colWidth = (contentWidth - 16) / 2
  const colHeight = 220

  // Left Column: Key Characteristics (Strengths)
  const leftX = marginLeft
  drawCard(doc, leftX, currentY, colWidth, colHeight, PDF_COLORS.white, PDF_COLORS.border, 8)

  // Header pill
  doc.setFillColor(...PDF_COLORS.emeraldBg)
  doc.roundedRect(leftX + 16, currentY + 16, 24, 24, 6, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...PDF_COLORS.emerald)
  doc.text('V', leftX + 24, currentY + 32)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...PDF_COLORS.dark)
  doc.text('Karakter Belajar Unggul', leftX + 48, currentY + 27)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.muted)
  doc.text('Potensi bawaan yang menunjang prestasi', leftX + 48, currentY + 38)

  // Strengths list
  let sY = currentY + 56
  const strengths = data.personality.strengths || []
  strengths.slice(0, 4).forEach((str) => {
    doc.setFillColor(...PDF_COLORS.emerald)
    doc.circle(leftX + 22, sY - 3, 2, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...PDF_COLORS.body)
    const lines = doc.splitTextToSize(str, colWidth - 40)
    doc.text(lines, leftX + 30, sY)
    sY += lines.length * 11 + 7
  })

  // Right Column: Development Areas
  const rightX = marginLeft + colWidth + 16
  drawCard(doc, rightX, currentY, colWidth, colHeight, PDF_COLORS.white, PDF_COLORS.border, 8)

  // Header pill
  doc.setFillColor(...PDF_COLORS.amberBg)
  doc.roundedRect(rightX + 16, currentY + 16, 24, 24, 6, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...PDF_COLORS.amber)
  doc.text('!', rightX + 26, currentY + 32)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...PDF_COLORS.dark)
  doc.text('Area yang Perlu Diperhatikan', rightX + 48, currentY + 27)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.muted)
  doc.text('Peluang peningkatan strategi belajar', rightX + 48, currentY + 38)

  // Challenges list
  let cY = currentY + 56
  const challenges = data.personality.challenges || []
  challenges.slice(0, 4).forEach((ch) => {
    doc.setFillColor(...PDF_COLORS.amber)
    doc.circle(rightX + 22, cY - 3, 2, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...PDF_COLORS.body)
    const lines = doc.splitTextToSize(ch, colWidth - 40)
    doc.text(lines, rightX + 30, cY)
    cY += lines.length * 11 + 7
  })

  // 3. Bottom Educational Guidance Note
  const noteY = currentY + colHeight + 20
  drawCard(doc, marginLeft, noteY, contentWidth, 54, PDF_COLORS.surface, PDF_COLORS.border, 6)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('CATATAN PENGEMBANGAN DIRI', marginLeft + 16, noteY + 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.muted)
  const noteLines = doc.splitTextToSize(
    'Profil ini menggambarkan preferensi belajar alami Anda pada saat ini. Karakter dan strategi belajar bersifat dinamis serta dapat terus berkembang seiring pembiasaan dan bimbingan yang tepat.',
    contentWidth - 32
  )
  doc.text(noteLines, marginLeft + 16, noteY + 31)

  drawPageFooter(doc, data.student.name, pageNum, totalPages, data.metadata.isDemo)
}
