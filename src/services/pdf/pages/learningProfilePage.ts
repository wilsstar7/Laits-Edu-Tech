import type { jsPDF } from 'jspdf'
import type { PersonalityReportData } from '@/types/report'
import { PDF_COLORS, PDF_LAYOUT } from '../pdfConstants'
import { drawPageHeader, drawPageFooter, drawSectionHeading, drawCard } from '../pdfHelpers'

export function renderLearningProfilePage(
  doc: jsPDF,
  data: PersonalityReportData,
  pageNum: number,
  totalPages: number
) {
  const { marginLeft, contentWidth, marginTop } = PDF_LAYOUT

  drawPageHeader(doc, 'Your Learning Profile')

  let currentY = drawSectionHeading(
    doc,
    marginTop + 14,
    'Preferensi Kognitif',
    'Your Learning Profile',
    'Rincian gaya belajar dominan, metode studi yang disarankan, pemicu motivasi intrinsik, serta cara berkomunikasi dalam pembelajaran.'
  )

  const cardHeight = 84
  const cardGap = 14

  // Section 1: Learning Style
  drawCard(doc, marginLeft, currentY, contentWidth, cardHeight, PDF_COLORS.white, PDF_COLORS.border, 8)
  doc.setFillColor(...PDF_COLORS.primaryLight)
  doc.roundedRect(marginLeft, currentY, 4, cardHeight, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('GAYA BELAJAR UTAMA (LEARNING STYLE)', marginLeft + 18, currentY + 20)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...PDF_COLORS.dark)
  const lStyleTitle = data.personality.learningStyle || 'Eksploratif dan Praktis'
  doc.text(lStyleTitle, marginLeft + 18, currentY + 36)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.body)
  const lStyleDesc = doc.splitTextToSize(
    'Pendekatan kognitif Anda sangat efektif ketika materi disajikan dengan penjelasan alur konseptual yang runtut sebelum masuk ke latihan teknis.',
    contentWidth - 36
  )
  doc.text(lStyleDesc, marginLeft + 18, currentY + 52)
  currentY += cardHeight + cardGap

  // Section 2: Recommended Study Method
  const studyMethods = data.personality.recommendedStudyMethod || []
  const methodCardHeight = 96
  drawCard(doc, marginLeft, currentY, contentWidth, methodCardHeight, PDF_COLORS.white, PDF_COLORS.border, 8)
  doc.setFillColor(...PDF_COLORS.primaryLight)
  doc.roundedRect(marginLeft, currentY, 4, methodCardHeight, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('METODE STUDI YANG DIREKOMENDASIKAN', marginLeft + 18, currentY + 20)

  let methodY = currentY + 38
  studyMethods.slice(0, 3).forEach((method) => {
    doc.setFillColor(...PDF_COLORS.primary)
    doc.circle(marginLeft + 24, methodY - 3, 2, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...PDF_COLORS.body)
    const mLines = doc.splitTextToSize(method, contentWidth - 48)
    doc.text(mLines, marginLeft + 32, methodY)
    methodY += mLines.length * 11 + 6
  })
  currentY += methodCardHeight + cardGap

  // Section 3: Motivation Factor
  drawCard(doc, marginLeft, currentY, contentWidth, cardHeight, PDF_COLORS.white, PDF_COLORS.border, 8)
  doc.setFillColor(...PDF_COLORS.primaryLight)
  doc.roundedRect(marginLeft, currentY, 4, cardHeight, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('FAKTOR MOTIVASI (MOTIVATION)', marginLeft + 18, currentY + 20)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...PDF_COLORS.dark)
  const motText = data.personality.motivation || 'Tantangan intelektual dan pemahaman manfaat praktis'
  const motLines = doc.splitTextToSize(motText, contentWidth - 36)
  doc.text(motLines, marginLeft + 18, currentY + 36)
  currentY += cardHeight + cardGap

  // Section 4: Communication Style
  drawCard(doc, marginLeft, currentY, contentWidth, cardHeight, PDF_COLORS.white, PDF_COLORS.border, 8)
  doc.setFillColor(...PDF_COLORS.primaryLight)
  doc.roundedRect(marginLeft, currentY, 4, cardHeight, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('GAYA KOMUNIKASI (COMMUNICATION STYLE)', marginLeft + 18, currentY + 20)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...PDF_COLORS.dark)
  const commText = data.personality.communicationStyle || 'Komunikasi terbuka, berorientasi dialog, dan senang bertanya'
  const commLines = doc.splitTextToSize(commText, contentWidth - 36)
  doc.text(commLines, marginLeft + 18, currentY + 36)

  drawPageFooter(doc, data.student.name, pageNum, totalPages, data.metadata.isDemo)
}
