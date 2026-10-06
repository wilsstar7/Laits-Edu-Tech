import type { jsPDF } from 'jspdf'
import type { PersonalityReportData } from '@/types/report'
import { PDF_COLORS, PDF_LAYOUT } from '../pdfConstants'
import { drawPageHeader, drawPageFooter, drawSectionHeading, drawCard } from '../pdfHelpers'

export function renderSubjectsPage(
  doc: jsPDF,
  data: PersonalityReportData,
  pageNum: number,
  totalPages: number
) {
  const { marginLeft, contentWidth, marginTop } = PDF_LAYOUT

  drawPageHeader(doc, 'Recommended Learning Areas')

  let currentY = drawSectionHeading(
    doc,
    marginTop + 14,
    'Eksplorasi Kurikulum',
    'Recommended Learning Areas',
    'Bidang studi yang memiliki keselarasan kuat dengan cara berpikir dan profil kognitif alami Anda.'
  )

  const subjects = data.personality.recommendedSubjects || []

  // Subject Grid (2 Columns)
  const colWidth = (contentWidth - 14) / 2
  const cardHeight = 72
  const cardGap = 12

  for (let i = 0; i < subjects.length; i += 2) {
    const s1 = subjects[i]
    const s2 = subjects[i + 1]

    // Col 1
    const x1 = marginLeft
    drawCard(doc, x1, currentY, colWidth, cardHeight, PDF_COLORS.white, PDF_COLORS.border, 8)
    doc.setFillColor(...PDF_COLORS.primaryLight)
    doc.roundedRect(x1 + 14, currentY + 14, 28, 28, 6, 6, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...PDF_COLORS.primary)
    doc.text(`#${i + 1}`, x1 + 28, currentY + 31, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...PDF_COLORS.dark)
    if (s1) {
      doc.text(s1, x1 + 50, currentY + 28)
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...PDF_COLORS.muted)
    doc.text('Kesesuaian pola penalaran tinggi', x1 + 50, currentY + 42)

    // Col 2
    if (s2) {
      const x2 = marginLeft + colWidth + 14
      drawCard(doc, x2, currentY, colWidth, cardHeight, PDF_COLORS.white, PDF_COLORS.border, 8)
      doc.setFillColor(...PDF_COLORS.primaryLight)
      doc.roundedRect(x2 + 14, currentY + 14, 28, 28, 6, 6, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...PDF_COLORS.primary)
      doc.text(`#${i + 2}`, x2 + 28, currentY + 31, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...PDF_COLORS.dark)
      doc.text(s2, x2 + 50, currentY + 28)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...PDF_COLORS.muted)
      doc.text('Kesesuaian pola penalaran tinggi', x2 + 50, currentY + 42)
    }

    currentY += cardHeight + cardGap
  }

  // Guidance Disclaimer Box (Crucial safe framing)
  const disclaimerBoxY = currentY + 16
  drawCard(doc, marginLeft, disclaimerBoxY, contentWidth, 80, PDF_COLORS.surface, PDF_COLORS.border, 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('PENTING: REKOMENDASI BUKAN BATASAN', marginLeft + 18, disclaimerBoxY + 22)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.body)
  const discLines = doc.splitTextToSize(
    'Rekomendasi mata pelajaran di atas ditujukan sebagai panduan pengenalan potensi belajar, bukan sebagai batasan terhadap materi atau bidang studi yang ingin Anda pelajari.\n\nSetiap siswa memiliki kapasitas untuk menguasai mata pelajaran apa pun dengan strategi belajar yang dipersonalisasi dan konsistensi latihan yang baik.',
    contentWidth - 36
  )
  doc.text(discLines, marginLeft + 18, disclaimerBoxY + 38)

  drawPageFooter(doc, data.student.name, pageNum, totalPages, data.metadata.isDemo)
}
