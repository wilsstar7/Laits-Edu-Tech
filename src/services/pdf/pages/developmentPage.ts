import type { jsPDF } from 'jspdf'
import type { PersonalityReportData } from '@/types/report'
import { PDF_COLORS, PDF_LAYOUT } from '../pdfConstants'
import { drawPageHeader, drawPageFooter, drawSectionHeading, drawCard } from '../pdfHelpers'

export function renderDevelopmentPage(
  doc: jsPDF,
  data: PersonalityReportData,
  pageNum: number,
  totalPages: number
) {
  const { marginLeft, contentWidth, marginTop } = PDF_LAYOUT

  drawPageHeader(doc, 'Areas for Development')

  let currentY = drawSectionHeading(
    doc,
    marginTop + 14,
    'Peluang Peningkatan',
    'Areas for Development',
    'Titik perhatian belajar yang dapat dioptimalkan melalui pembiasaan strategi baru, bimbingan tutor, dan pengelolaan waktu yang adaptif.'
  )

  const challenges = data.personality.challenges || []
  const cardHeight = 90
  const cardGap = 16

  challenges.forEach((challengeText, idx) => {
    const cardY = currentY
    drawCard(doc, marginLeft, cardY, contentWidth, cardHeight, PDF_COLORS.white, PDF_COLORS.border, 10)

    // Number Badge (01, 02, ...)
    const numStr = (idx + 1).toString().padStart(2, '0')
    doc.setFillColor(...PDF_COLORS.amberBg)
    doc.roundedRect(marginLeft + 18, cardY + 20, 36, 36, 8, 8, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...PDF_COLORS.amber)
    doc.text(numStr, marginLeft + 36, cardY + 43, { align: 'center' })

    // Challenge Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11.5)
    doc.setTextColor(...PDF_COLORS.dark)

    let title = `Peluang Peningkatan ${idx + 1}`
    let bodyText = challengeText

    if (challengeText.includes(':')) {
      const parts = challengeText.split(':')
      title = parts[0]?.trim() || `Peluang Peningkatan ${idx + 1}`
      bodyText = parts.slice(1).join(':').trim() || challengeText
    } else if (challengeText.length <= 40) {
      title = challengeText
      bodyText = `Aspek ini membutuhkan perhatian khusus dan pembiasaan bertahap agar tidak menghambat ritme belajar Anda.`
    }

    doc.text(title, marginLeft + 66, cardY + 30)

    // Challenge Body Text
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...PDF_COLORS.body)
    const bodyLines = doc.splitTextToSize(bodyText, contentWidth - 84)
    doc.text(bodyLines, marginLeft + 66, cardY + 46)

    currentY += cardHeight + cardGap
  })

  // Growth Mindset Box
  const growthBoxY = currentY + 10
  drawCard(doc, marginLeft, growthBoxY, contentWidth, 68, PDF_COLORS.surface, PDF_COLORS.border, 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('PENDEKATAN GROWTH MINDSET', marginLeft + 18, growthBoxY + 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.muted)
  const growthLines = doc.splitTextToSize(
    'Tantangan dalam belajar bukan merupakan batasan kemampuan intelegensi Anda. Mengetahui area pengembangan sejak dini memungkinkan Anda memilih strategi pendampingan dan manajemen rutinitas belajar yang lebih terarah.',
    contentWidth - 36
  )
  doc.text(growthLines, marginLeft + 18, growthBoxY + 34)

  drawPageFooter(doc, data.student.name, pageNum, totalPages, data.metadata.isDemo)
}
