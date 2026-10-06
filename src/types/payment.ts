export type PaymentStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'awaiting_verification'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'

export type PaymentMethod = 'manual_transfer' | 'payment_gateway'

export type InvoiceStatus = 'issued' | 'paid' | 'cancelled' | 'refunded'

export type PaymentProofStatus = 'pending' | 'approved' | 'rejected'

export interface PaymentProof {
  id: string
  paymentId: string
  studentId: string
  filePath: string
  originalFileName: string
  mimeType: string
  fileSize: number
  uploadedAt: string
  verifiedAt?: string | null
  verifiedBy?: string | null
  rejectionReason?: string | null
  status: PaymentProofStatus
  signedUrl?: string
}

export interface Invoice {
  id: string
  paymentId: string
  invoiceNumber: string
  studentId: string
  bookingId: string
  subtotal: number
  discount: number
  total: number
  currency: string
  status: InvoiceStatus
  issuedAt: string
  dueAt: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  bookingId: string
  studentId: string
  studentName?: string
  studentEmail?: string
  tutorId: string
  tutorName?: string
  tutorAvatarUrl?: string | null
  subjectName?: string
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  provider: string
  providerTransactionId?: string | null
  status: PaymentStatus
  expiresAt: string
  paidAt?: string | null
  failedAt?: string | null
  cancelledAt?: string | null
  createdAt: string
  updatedAt: string
  proof?: PaymentProof | null
  invoice?: Invoice | null
  scheduledStart?: string
  scheduledEnd?: string
}

export interface PaymentEvent {
  id: string
  paymentId: string
  eventType: string
  source: string
  payloadHash?: string | null
  createdAt: string
}

export interface CreatePaymentInput {
  bookingId: string
  paymentMethod?: PaymentMethod
}

export interface ManualBankTransferInstruction {
  bankName: string
  accountNumber: string
  accountHolder: string
  instructions: string[]
}

export const MANUAL_TRANSFER_INSTRUCTIONS: ManualBankTransferInstruction = {
  bankName: 'Bank Syariah Indonesia (BSI)',
  accountNumber: '7148-9920-11',
  accountHolder: 'Yayasan Laits Edu Tech Indonesia',
  instructions: [
    'Transfer sesuai nominal tepat hingga digit terakhir.',
    'Sertakan nomor invoice pada berita transfer jika memungkinkan.',
    'Simpan bukti transfer berupa foto / tangkapan layar (JPG, PNG, atau PDF).',
    'Unggah bukti transfer sebelum batas waktu berakhir.',
    'Admin akan memverifikasi bukti dalam waktu maksimal 1x24 jam kerja.',
  ],
}
