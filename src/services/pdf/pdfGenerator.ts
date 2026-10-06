import { jsPDF } from 'jspdf'
import type { PersonalityReportData } from '@/types/report'
import { renderCoverPage } from './pages/coverPage'
import { renderSummaryPage } from './pages/summaryPage'
import { renderDimensionsPage } from './pages/dimensionsPage'
import { renderStrengthsPage } from './pages/strengthsPage'
import { renderDevelopmentPage } from './pages/developmentPage'
import { renderLearningProfilePage } from './pages/learningProfilePage'
import { renderSubjectsPage } from './pages/subjectsPage'
import { renderTutorStylePage } from './pages/tutorStylePage'
import { renderFinalPage } from './pages/finalPage'

export const TOTAL_REPORT_PAGES = 9

/**
 * Generates a professional multi-page Personality & Learning Profile PDF document.
 * Returns a standard Blob ready for upload or preview.
 */
export async function generatePersonalityReportPdf(data: PersonalityReportData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true,
  })

  // Set document metadata
  doc.setProperties({
    title: data.metadata?.title || 'Personality & Learning Profile Report',
    author: data.metadata?.author || 'Laits Edu Tech LMS',
    subject: data.metadata?.subject || 'Student Personality Profile',
    keywords: (data.metadata?.keywords || ['Personality', 'Learning Profile', 'Education']).join(', '),
    creator: 'Laits Edu Tech PDF Engine',
  })

  const totalPages = TOTAL_REPORT_PAGES

  // Page 1: Cover Page
  renderCoverPage(doc, data)

  // Page 2: Executive Summary
  doc.addPage()
  renderSummaryPage(doc, data, 2, totalPages)

  // Page 3: Personality Dimensions
  doc.addPage()
  renderDimensionsPage(doc, data, 3, totalPages)

  // Page 4: Strengths
  doc.addPage()
  renderStrengthsPage(doc, data, 4, totalPages)

  // Page 5: Areas for Development
  doc.addPage()
  renderDevelopmentPage(doc, data, 5, totalPages)

  // Page 6: Learning Profile
  doc.addPage()
  renderLearningProfilePage(doc, data, 6, totalPages)

  // Page 7: Recommended Subjects
  doc.addPage()
  renderSubjectsPage(doc, data, 7, totalPages)

  // Page 8: Ideal Learning Environment / Tutor Style
  doc.addPage()
  renderTutorStylePage(doc, data, 8, totalPages)

  // Page 9: Action Plan & Disclaimer
  doc.addPage()
  renderFinalPage(doc, data, 9, totalPages)

  return doc.output('blob')
}
