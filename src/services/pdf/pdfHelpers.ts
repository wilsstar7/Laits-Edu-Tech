import type { jsPDF } from 'jspdf'
import { PDF_COLORS, PDF_LAYOUT } from './pdfConstants'

/**
 * Draws the top running header on content pages.
 */
export function drawPageHeader(doc: jsPDF, currentSection: string) {
  const { marginLeft, contentWidth, marginTop } = PDF_LAYOUT

  // Category & Section Name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text('LAITS EDU TECH', marginLeft, marginTop - 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.muted)
  doc.text(`|  ${currentSection}`, marginLeft + 75, marginTop - 16)

  // Right-aligned report title
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...PDF_COLORS.muted)
  doc.text('Personality & Learning Profile Report', marginLeft + contentWidth, marginTop - 16, { align: 'right' })

  // Subtle separator line
  doc.setDrawColor(...PDF_COLORS.border)
  doc.setLineWidth(0.75)
  doc.line(marginLeft, marginTop - 10, marginLeft + contentWidth, marginTop - 10)
}

/**
 * Draws running footer with page count, student name, and disclaimer notice.
 */
export function drawPageFooter(
  doc: jsPDF,
  studentName: string,
  pageNumber: number,
  totalPages: number,
  isDemo: boolean
) {
  const { marginLeft, contentWidth, pageHeight, marginBottom } = PDF_LAYOUT
  const y = pageHeight - marginBottom + 16

  // Top separator
  doc.setDrawColor(...PDF_COLORS.border)
  doc.setLineWidth(0.75)
  doc.line(marginLeft, y - 8, marginLeft + contentWidth, y - 8)

  // Left: Student & Document type
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...PDF_COLORS.muted)
  doc.text(`${studentName} - Dokumen Pembelajaran Resmi`, marginLeft, y)

  // Center: Notice / Demo warning
  if (isDemo) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...PDF_COLORS.amber)
    doc.text('SIMULASI / DEMO ASSESSMENT', marginLeft + contentWidth / 2, y, { align: 'center' })
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...PDF_COLORS.muted)
    doc.text('Panduan Edukasi & Pengenalan Diri', marginLeft + contentWidth / 2, y, { align: 'center' })
  }

  // Right: Page counter
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...PDF_COLORS.body)
  doc.text(`Halaman ${pageNumber} dari ${totalPages}`, marginLeft + contentWidth, y, { align: 'right' })
}

/**
 * Draws a standardized section header with category tag, title, and optional description.
 * Returns the bottom Y coordinate.
 */
export function drawSectionHeading(
  doc: jsPDF,
  startY: number,
  category: string,
  title: string,
  description?: string
): number {
  const { marginLeft, contentWidth } = PDF_LAYOUT
  let currentY = startY

  // Category Tag
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text(category.toUpperCase(), marginLeft, currentY)
  currentY += 14

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...PDF_COLORS.dark)
  doc.text(title, marginLeft, currentY)
  currentY += 16

  // Description
  if (description) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...PDF_COLORS.muted)
    const lines = doc.splitTextToSize(description, contentWidth)
    doc.text(lines, marginLeft, currentY)
    currentY += lines.length * 13 + 8
  }

  return currentY
}

/**
 * Draws a styled card container.
 */
export function drawCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  bg: [number, number, number] = PDF_COLORS.white,
  border: [number, number, number] = PDF_COLORS.border,
  radius = 6
) {
  doc.setFillColor(...bg)
  doc.setDrawColor(...border)
  doc.setLineWidth(0.75)
  doc.roundedRect(x, y, w, h, radius, radius, 'FD')
}

/**
 * Draws a horizontal progress bar for dimension scores.
 */
export function drawProgressBar(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  percentage: number,
  barColor: [number, number, number] = PDF_COLORS.primary
) {
  const clamped = Math.max(0, Math.min(100, percentage))
  // Track
  doc.setFillColor(...PDF_COLORS.surface)
  doc.setDrawColor(...PDF_COLORS.border)
  doc.setLineWidth(0.5)
  doc.roundedRect(x, y, w, h, 2, 2, 'FD')

  // Fill
  if (clamped > 0) {
    const fillWidth = (w * clamped) / 100
    doc.setFillColor(...barColor)
    doc.roundedRect(x, y, fillWidth, h, 2, 2, 'F')
  }
}

/**
 * Draws a badge / pill tag.
 */
export function drawBadge(
  doc: jsPDF,
  x: number,
  y: number,
  text: string,
  bg: [number, number, number] = PDF_COLORS.primaryLight,
  fg: [number, number, number] = PDF_COLORS.primary
): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  const textWidth = doc.getTextWidth(text)
  const paddingX = 8
  const height = 16
  const width = textWidth + paddingX * 2

  doc.setFillColor(...bg)
  doc.roundedRect(x, y, width, height, 4, 4, 'F')

  doc.setTextColor(...fg)
  doc.text(text, x + paddingX, y + 11)

  return width
}
