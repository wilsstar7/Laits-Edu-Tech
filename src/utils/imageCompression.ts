export interface CompressImageOptions {
  maxDimension?: number
  quality?: number
}

export interface Base64FileResult {
  dataUrl: string
  mimeType: string
  size: number
}

/**
 * Converts a File (image or document) to a Base64 data URL string.
 * For images (JPG, PNG, WebP), scales down to maxDimension (default 1200px)
 * and encodes as JPEG with quality (default 0.8) to minimize payload
 * and eliminate Supabase storage/egress usage completely.
 * For PDFs and non-image files, reads the file directly as a Base64 Data URL.
 */
export async function fileToBase64(
  file: File,
  options: CompressImageOptions = {}
): Promise<Base64FileResult> {
  const maxDimension = options.maxDimension ?? 1200
  const quality = options.quality ?? 0.8

  // Non-image files (e.g. PDF) or environment without DOM canvas support: read directly
  if (!file.type.startsWith('image/') || typeof window === 'undefined' || !window.HTMLCanvasElement) {
    return readFileAsDataUrl(file)
  }

  return new Promise((resolve) => {
    // If URL.createObjectURL is not available (e.g. in test environments)
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      readFileAsDataUrl(file).then(resolve)
      return
    }

    try {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(objectUrl)

        let { width, height } = img
        if (width <= 0 || height <= 0) {
          readFileAsDataUrl(file).then(resolve)
          return
        }

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          readFileAsDataUrl(file).then(resolve)
          return
        }

        // Draw white background in case source image contains transparent pixels
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        const approxSize = Math.round((dataUrl.length * 3) / 4)

        resolve({
          dataUrl,
          mimeType: 'image/jpeg',
          size: approxSize,
        })
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        readFileAsDataUrl(file).then(resolve)
      }

      img.src = objectUrl
    } catch {
      readFileAsDataUrl(file).then(resolve)
    }
  })
}

async function readFileAsDataUrl(file: File): Promise<Base64FileResult> {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        resolve({
          dataUrl,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
        })
      }
      reader.onerror = () => reject(new Error('Gagal membaca berkas file.'))
      reader.readAsDataURL(file)
    })
  }

  // Universal fallback for Node.js / worker / Vitest environments
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    const code = bytes[i] ?? 0
    binary += String.fromCharCode(code)
  }
  const base64 =
    typeof btoa !== 'undefined'
      ? btoa(binary)
      : (globalThis as unknown as { Buffer?: { from: (buf: ArrayBuffer) => { toString: (enc: string) => string } } }).Buffer
          ?.from(buffer)
          ?.toString('base64') ?? ''
  const mime = file.type || 'application/octet-stream'

  return {
    dataUrl: `data:${mime};base64,${base64}`,
    mimeType: mime,
    size: file.size,
  }
}
