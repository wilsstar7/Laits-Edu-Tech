import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fileToBase64 } from './imageCompression'

describe('imageCompression Utility (Base64 zero-storage)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('reads a PDF file directly as Base64 data URL', async () => {
    const pdfBlob = new Blob(['%PDF-1.4 test dummy content'], { type: 'application/pdf' })
    const pdfFile = new File([pdfBlob], 'receipt.pdf', { type: 'application/pdf' })

    const result = await fileToBase64(pdfFile)
    expect(result.dataUrl).toMatch(/^data:application\/pdf;base64,/)
    expect(result.mimeType).toBe('application/pdf')
    expect(result.size).toBe(pdfFile.size)
  })

  it('reads an image file and converts to Base64 data URL', async () => {
    const imgBlob = new Blob(['fake image data bytes'], { type: 'image/png' })
    const imgFile = new File([imgBlob], 'transfer.png', { type: 'image/png' })

    const result = await fileToBase64(imgFile)
    expect(result.dataUrl).toMatch(/^data:/)
    expect(result.size).toBeGreaterThan(0)
  })

  it('respects custom quality and dimension options without crashing', async () => {
    const imgBlob = new Blob(['fake image bytes'], { type: 'image/jpeg' })
    const imgFile = new File([imgBlob], 'receipt.jpg', { type: 'image/jpeg' })

    const result = await fileToBase64(imgFile, { maxDimension: 800, quality: 0.7 })
    expect(result.dataUrl).toMatch(/^data:/)
  })
})
