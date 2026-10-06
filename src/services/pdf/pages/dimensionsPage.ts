import type { jsPDF } from 'jspdf'
import type { PersonalityReportData } from '@/types/report'
import { PDF_COLORS, PDF_LAYOUT } from '../pdfConstants'
import { drawPageHeader, drawPageFooter, drawSectionHeading, drawCard, drawProgressBar } from '../pdfHelpers'

export function renderDimensionsPage(
  doc: jsPDF,
  data: PersonalityReportData,
  pageNum: number,
  totalPages: number
) {
  const { marginLeft, contentWidth, marginTop } = PDF_LAYOUT

  drawPageHeader(doc, 'Personality Dimensions')

  let currentY = drawSectionHeading(
    doc,
    marginTop + 14,
    'Spektrum Kognitif',
    'Your Personality Dimensions',
    'Hasil pengukuran 5 dimensi spektrum belajar siswa yang menunjukkan keseimbangan cara memproses informasi, berinteraksi, dan mengelola ritme belajar.'
  )

  const dimensions = data.dimensions || []
  const cardHeight = 78
  const cardGap = 12

  dimensions.forEach((dim) => {
    const cardY = currentY
    drawCard(doc, marginLeft, cardY, contentWidth, cardHeight, PDF_COLORS.white, PDF_COLORS.border, 8)

    // Left Accent Bar
    doc.setFillColor(...PDF_COLORS.primary)
    doc.roundedRect(marginLeft, cardY, 4, cardHeight, 2, 2, 'F')

    // Dimension Title & Code
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...PDF_COLORS.dark)
    doc.text(dim.name, marginLeft + 18, cardY + 22)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...PDF_COLORS.muted)
    doc.text(`Kode Dimensi: ${dim.code}`, marginLeft + 18, cardY + 34)

    // Score on the right
    const scoreVal = Math.round(dim.score)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...PDF_COLORS.primary)
    doc.text(`${scoreVal}%`, marginLeft + contentWidth - 20, cardY + 24, { align: 'right' })

    // Progress Bar
    const progressWidth = 140
    const progressX = marginLeft + contentWidth - progressWidth - 20
    drawProgressBar(doc, progressX, cardY + 32, progressWidth, 6, scoreVal, PDF_COLORS.primary)

    // Divider inside card
    doc.setDrawColor(...PDF_COLORS.border)
    doc.setLineWidth(0.5)
    doc.line(marginLeft + 18, cardY + 44, marginLeft + contentWidth - 18, cardY + 44)

    // Description text
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...PDF_COLORS.body)
    const descLines = doc.splitTextToSize(
      dim.description ||
        'Dimensi ini menggambarkan bagaimana siswa merespons lingkungan belajar dan mengoptimalkan strategi penyerapan konsep.',
      contentWidth - 36
    )
    doc.text(descLines, marginLeft + 18, cardY + 56)

    currentY += cardHeight + cardGap
  })

  // Bottom Context Note
  const bottomBoxY = currentY + 4
  drawCard(doc, marginLeft, bottomBoxY, contentWidth, 42, PDF_COLORS.surface, PDF_COLORS.border, 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...PDF_COLORS.muted)
  const bottomLines = doc.splitTextToSize(
    'Skor pada setiap dimensi merupakan gambaran preferensi relatif, bukan indikator kecerdasan absolut. Tidak ada skor yang "buruk"; setiap titik spektrum memiliki keunggulan spesifik dalam proses belajar.',
    contentWidth - 32
  )
  doc.text(bottomLines, marginLeft + 16, bottomBoxY + 18)

  drawPageFooter(doc, data.student.name, pageNum, totalPages, data.metadata.isDemo)
}
