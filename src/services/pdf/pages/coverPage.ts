import type { jsPDF } from 'jspdf'
import type { PersonalityReportData } from '@/types/report'
import { PDF_COLORS, PDF_LAYOUT } from '../pdfConstants'
import { formatReportDate } from '@/utils/format'

export function renderCoverPage(doc: jsPDF, data: PersonalityReportData) {
  const { pageWidth, pageHeight, marginLeft, contentWidth } = PDF_LAYOUT

  // 1. Subtle background canvas
  doc.setFillColor(...PDF_COLORS.surface)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // 2. Decorative geometric accents (top-right modern card layer)
  doc.setFillColor(...PDF_COLORS.white)
  doc.roundedRect(pageWidth - 190, -40, 240, 240, 24, 24, 'F')

  doc.setFillColor(...PDF_COLORS.primaryLight)
  doc.roundedRect(pageWidth - 140, 20, 180, 180, 20, 20, 'F')

  // 3. LMS Logo & Product Branding
  const startY = 64
  // Logo Mark (Icon Box with clean geometric symbol)
  doc.setFillColor(...PDF_COLORS.primary)
  doc.roundedRect(marginLeft, startY, 36, 36, 8, 8, 'F')

  // Vector geometric layers inside mark
  doc.setFillColor(...PDF_COLORS.white)
  doc.roundedRect(marginLeft + 9, startY + 9, 18, 6, 2, 2, 'F')
  doc.roundedRect(marginLeft + 9, startY + 18, 18, 9, 2, 2, 'F')

  // Product Name & Platform
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...PDF_COLORS.dark)
  doc.text('LAITS EDU TECH', marginLeft + 48, startY + 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.muted)
  doc.text('Learning Management & Personality Diagnostic System', marginLeft + 48, startY + 28)

  // 4. Hero Content Card
  const heroCardY = 140
  const heroCardHeight = 440
  doc.setFillColor(...PDF_COLORS.white)
  doc.setDrawColor(...PDF_COLORS.border)
  doc.setLineWidth(1)
  doc.roundedRect(marginLeft, heroCardY, contentWidth, heroCardHeight, 14, 14, 'FD')

  // Internal padding
  const padX = marginLeft + 32
  let textY = heroCardY + 44

  // Demo Assessment Badge (if applicable)
  if (data.metadata.isDemo) {
    doc.setFillColor(...PDF_COLORS.amberBg)
    doc.roundedRect(padX, textY - 14, 150, 20, 4, 4, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...PDF_COLORS.amber)
    doc.text('SIMULASI / DEMO ASSESSMENT', padX + 8, textY)
    textY += 32
  }

  // Report Category Label
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('LAPORAN RESMI ASESMEN BELAJAR', padX, textY)
  textY += 24

  // Main Report Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(...PDF_COLORS.dark)
  doc.text('PERSONALITY & LEARNING', padX, textY)
  textY += 32
  doc.text('PROFILE REPORT', padX, textY)
  textY += 36

  // Subtitle / Intro phrase
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.setTextColor(...PDF_COLORS.muted)
  const introLines = doc.splitTextToSize(
    'Analisis komprehensif profil karakter belajar, preferensi kognitif, rekomendasi strategi belajar, dan panduan tutor yang dirancang untuk mendukung perkembangan akademik optimal.',
    contentWidth - 64
  )
  doc.text(introLines, padX, textY)
  textY += introLines.length * 15 + 24

  // Divider Line
  doc.setDrawColor(...PDF_COLORS.border)
  doc.setLineWidth(1)
  doc.line(padX, textY, padX + contentWidth - 64, textY)
  textY += 28

  // Student Profile Snapshot Box
  doc.setFillColor(...PDF_COLORS.surface)
  doc.roundedRect(padX, textY, contentWidth - 64, 110, 8, 8, 'F')

  // Metadata Columns inside Snapshot Box
  const col1X = padX + 18
  const col2X = padX + (contentWidth - 64) / 2 + 10
  let metaY = textY + 22

  // Row 1
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.muted)
  doc.text('NAMA SISWA', col1X, metaY)
  doc.text('TIPE KARAKTER BELAJAR', col2X, metaY)
  metaY += 14

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...PDF_COLORS.dark)
  doc.text(data.student.name || 'Siswa Laits Edu Tech', col1X, metaY)

  doc.setFontSize(11)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text(data.personality.name, col2X, metaY)
  metaY += 26

  // Row 2
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.muted)
  doc.text('NAMA ASESMEN', col1X, metaY)
  doc.text('TANGGAL PENYELESAIAN', col2X, metaY)
  metaY += 14

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...PDF_COLORS.body)
  doc.text(data.assessment.name, col1X, metaY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(formatReportDate(data.assessment.completedAt), col2X, metaY)

  // 5. Bottom Document Notice / Safe Framing
  const footerNoticeY = pageHeight - 64
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...PDF_COLORS.muted)
  doc.text('Diterbitkan oleh Sistem Laits Edu Tech - Versi Laporan 1.0', marginLeft, footerNoticeY)

  const disclaimerShort = data.metadata.isDemo
    ? 'Hasil ini merupakan hasil simulasi/demo dan tidak dimaksudkan sebagai penilaian psikologis yang tervalidasi.'
    : 'Hasil assessment ini ditujukan untuk membantu pengenalan diri dan strategi belajar, bukan diagnosis medis atau psikologis.'

  doc.text(disclaimerShort, marginLeft, footerNoticeY + 11)
}
