import { requireSupabase } from '@/lib/supabase'
import type {
  CreatePaymentInput,
  Payment,
  PaymentProof,
  Invoice,
  PaymentStatus,
  PaymentProofStatus,
  InvoiceStatus,
  PaymentMethod,
} from '@/types/payment'
import { toAppError } from '@/utils/errors'
import { logger } from '@/lib/logger'

interface RawPaymentRow {
  id: string
  booking_id: string
  student_id: string
  tutor_id: string
  amount: number
  currency: string
  payment_method: PaymentMethod
  provider: string
  provider_transaction_id: string | null
  status: PaymentStatus
  expires_at: string
  paid_at: string | null
  failed_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  booking?: {
    scheduled_start: string
    scheduled_end: string
    subject?: { name: string } | null
    tutor?: {
      profile?: { full_name: string; avatar_url: string | null } | null
    } | null
    student?: {
      full_name: string
      email: string
    } | null
  } | null
  proofs?: Array<{
    id: string
    file_path: string
    original_file_name: string
    mime_type: string
    file_size: number
    uploaded_at: string
    verified_at: string | null
    verified_by: string | null
    rejection_reason: string | null
    status: PaymentProofStatus
  }> | null
  invoices?: Array<{
    id: string
    invoice_number: string
    subtotal: number
    discount: number
    total: number
    currency: string
    status: InvoiceStatus
    issued_at: string
    due_at: string
    created_at: string
    updated_at: string
  }> | null
}

function formatPaymentRow(row: RawPaymentRow): Payment {
  const latestProof = row.proofs && row.proofs.length > 0 ? row.proofs[row.proofs.length - 1] : null
  const invoice = row.invoices && row.invoices.length > 0 ? row.invoices[0] : null

  let proofObj: PaymentProof | null = null
  if (latestProof) {
    proofObj = {
      id: latestProof.id,
      paymentId: row.id,
      studentId: row.student_id,
      filePath: latestProof.file_path,
      originalFileName: latestProof.original_file_name,
      mimeType: latestProof.mime_type,
      fileSize: latestProof.file_size,
      uploadedAt: latestProof.uploaded_at,
      verifiedAt: latestProof.verified_at,
      verifiedBy: latestProof.verified_by,
      rejectionReason: latestProof.rejection_reason,
      status: latestProof.status,
    }
  }

  let invoiceObj: Invoice | null = null
  if (invoice) {
    invoiceObj = {
      id: invoice.id,
      paymentId: row.id,
      invoiceNumber: invoice.invoice_number,
      studentId: row.student_id,
      bookingId: row.booking_id,
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      total: invoice.total,
      currency: invoice.currency,
      status: invoice.status,
      issuedAt: invoice.issued_at,
      dueAt: invoice.due_at,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
    }
  }

  return {
    id: row.id,
    bookingId: row.booking_id,
    studentId: row.student_id,
    studentName: row.booking?.student?.full_name || 'Siswa',
    studentEmail: row.booking?.student?.email,
    tutorId: row.tutor_id,
    tutorName: row.booking?.tutor?.profile?.full_name || 'Tutor',
    tutorAvatarUrl: row.booking?.tutor?.profile?.avatar_url || null,
    subjectName: row.booking?.subject?.name || 'Mata Pelajaran',
    amount: row.amount,
    currency: row.currency,
    paymentMethod: row.payment_method,
    provider: row.provider,
    providerTransactionId: row.provider_transaction_id,
    status: row.status,
    expiresAt: row.expires_at,
    paidAt: row.paid_at,
    failedAt: row.failed_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    proof: proofObj,
    invoice: invoiceObj,
    scheduledStart: row.booking?.scheduled_start,
    scheduledEnd: row.booking?.scheduled_end,
  }
}

export const paymentService = {
  /**
   * Creates a payment intent & invoice via atomic PostgreSQL RPC `create_payment`.
   * Server calculates the price strictly from the booking duration and tutor hourly rate.
   */
  async createPayment(input: CreatePaymentInput): Promise<string> {
    const supabase = requireSupabase()

    try {
      const { data, error } = await supabase.rpc('create_payment', {
        p_booking_id: input.bookingId,
        p_payment_method: input.paymentMethod || 'manual_transfer',
      })

      if (error) throw error
      if (!data) throw new Error('ID pembayaran tidak dihasilkan.')

      return data
    } catch (err) {
      logger.error('Failed to create payment:', err)
      throw toAppError(err, 'Gagal membuat tagihan pembayaran.')
    }
  },

  /**
   * Fetches payment details including invoice and payment proof by payment ID.
   */
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    const supabase = requireSupabase()

    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          booking_id,
          student_id,
          tutor_id,
          amount,
          currency,
          payment_method,
          provider,
          provider_transaction_id,
          status,
          expires_at,
          paid_at,
          failed_at,
          cancelled_at,
          created_at,
          updated_at,
          booking:bookings!payments_booking_id_fkey (
            scheduled_start,
            scheduled_end,
            subject:subjects ( name ),
            tutor:tutor_profiles (
              profile:profiles ( full_name, avatar_url )
            ),
            student:profiles!bookings_student_id_fkey ( full_name, email )
          ),
          proofs:payment_proofs (
            id,
            file_path,
            original_file_name,
            mime_type,
            file_size,
            uploaded_at,
            verified_at,
            verified_by,
            rejection_reason,
            status
          ),
          invoices:invoices (
            id,
            invoice_number,
            subtotal,
            discount,
            total,
            currency,
            status,
            issued_at,
            due_at,
            created_at,
            updated_at
          )
        `)
        .eq('id', paymentId)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      const payment = formatPaymentRow(data as unknown as RawPaymentRow)

      // If proof exists, generate temporary signed download URL for secure display
      if (payment.proof && payment.proof.filePath) {
        try {
          const { data: signed } = await supabase.storage
            .from('payment-proofs')
            .createSignedUrl(payment.proof.filePath, 3600)
          if (signed?.signedUrl) {
            payment.proof.signedUrl = signed.signedUrl
          }
        } catch (storageErr) {
          logger.warn('Failed to generate signed URL for proof:', storageErr)
        }
      }

      return payment
    } catch (err) {
      logger.error('Failed to get payment:', err)
      throw toAppError(err, 'Gagal memuat detail pembayaran.')
    }
  },

  /**
   * Fetches payment for a specific booking.
   */
  async getPaymentByBookingId(bookingId: string): Promise<Payment | null> {
    const supabase = requireSupabase()

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('id')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      return this.getPaymentById(data.id)
    } catch (err) {
      logger.error('Failed to get payment by booking ID:', err)
      return null
    }
  },

  /**
   * Fetches all payments belonging to a student.
   */
  async getStudentPayments(studentId?: string): Promise<Payment[]> {
    const supabase = requireSupabase()

    try {
      let targetStudentId = studentId
      if (!targetStudentId) {
        const { data: authData } = await supabase.auth.getUser()
        targetStudentId = authData.user?.id
      }
      if (!targetStudentId) return []

      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          booking_id,
          student_id,
          tutor_id,
          amount,
          currency,
          payment_method,
          provider,
          provider_transaction_id,
          status,
          expires_at,
          paid_at,
          failed_at,
          cancelled_at,
          created_at,
          updated_at,
          booking:bookings!payments_booking_id_fkey (
            scheduled_start,
            scheduled_end,
            subject:subjects ( name ),
            tutor:tutor_profiles (
              profile:profiles ( full_name, avatar_url )
            )
          ),
          proofs:payment_proofs (
            id,
            file_path,
            original_file_name,
            mime_type,
            file_size,
            uploaded_at,
            verified_at,
            verified_by,
            rejection_reason,
            status
          ),
          invoices:invoices (
            id,
            invoice_number,
            subtotal,
            discount,
            total,
            currency,
            status,
            issued_at,
            due_at,
            created_at,
            updated_at
          )
        `)
        .eq('student_id', targetStudentId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return (data || []).map((row) => formatPaymentRow(row as unknown as RawPaymentRow))
    } catch (err) {
      logger.error('Failed to get student payments:', err)
      throw toAppError(err, 'Gagal memuat riwayat transaksi pembayaran.')
    }
  },

  /**
   * Uploads payment proof file to private storage bucket `payment-proofs` and submits record via RPC.
   */
  async uploadPaymentProof(paymentId: string, file: File): Promise<string> {
    const supabase = requireSupabase()

    try {
      // 1. Client-side file validation (max 5MB, jpeg/png/pdf)
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Format file tidak didukung. Harap unggah format JPG, PNG, atau PDF.')
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Ukuran file melebihi batas maksimal 5 MB.')
      }

      const { data: authData } = await supabase.auth.getUser()
      const studentId = authData.user?.id
      if (!studentId) throw new Error('Autentikasi diperlukan.')

      // Path format: {student_id}/{payment_id}/{timestamp}_{filename}
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const storagePath = `${studentId}/${paymentId}/${Date.now()}_${safeFileName}`

      // 2. Upload file to Supabase private storage
      const { error: uploadErr } = await supabase.storage
        .from('payment-proofs')
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: true,
        })

      if (uploadErr) throw uploadErr

      // 3. Atomically record proof and update payment status to awaiting_verification
      const { data: proofId, error: rpcErr } = await supabase.rpc('submit_payment_proof', {
        p_payment_id: paymentId,
        p_file_path: storagePath,
        p_original_file_name: file.name,
        p_mime_type: file.type,
        p_file_size: file.size,
      })

      if (rpcErr) throw rpcErr
      if (!proofId) throw new Error('ID bukti pembayaran tidak dihasilkan.')

      return proofId
    } catch (err) {
      logger.error('Failed to upload payment proof:', err)
      throw toAppError(err, 'Gagal mengunggah bukti pembayaran.')
    }
  },

  /**
   * Admin: Fetches list of payments awaiting manual verification.
   */
  async getPendingVerifications(): Promise<Payment[]> {
    const supabase = requireSupabase()

    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          booking_id,
          student_id,
          tutor_id,
          amount,
          currency,
          payment_method,
          provider,
          provider_transaction_id,
          status,
          expires_at,
          paid_at,
          failed_at,
          cancelled_at,
          created_at,
          updated_at,
          booking:bookings!payments_booking_id_fkey (
            scheduled_start,
            scheduled_end,
            subject:subjects ( name ),
            tutor:tutor_profiles (
              profile:profiles ( full_name, avatar_url )
            ),
            student:profiles!bookings_student_id_fkey ( full_name, email )
          ),
          proofs:payment_proofs (
            id,
            file_path,
            original_file_name,
            mime_type,
            file_size,
            uploaded_at,
            verified_at,
            verified_by,
            rejection_reason,
            status
          ),
          invoices:invoices (
            id,
            invoice_number,
            subtotal,
            discount,
            total,
            currency,
            status,
            issued_at,
            due_at,
            created_at,
            updated_at
          )
        `)
        .eq('status', 'awaiting_verification')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return (data || []).map((row) => formatPaymentRow(row as unknown as RawPaymentRow))
    } catch (err) {
      logger.error('Failed to get pending verifications:', err)
      throw toAppError(err, 'Gagal memuat antrean verifikasi pembayaran.')
    }
  },

  /**
   * Admin: Verifies or rejects manual payment proof via RPC `admin_verify_payment`.
   */
  async verifyPayment(
    paymentId: string,
    decision: 'approve' | 'reject',
    rejectionReason?: string
  ): Promise<void> {
    const supabase = requireSupabase()

    try {
      const { error } = await supabase.rpc('admin_verify_payment', {
        p_payment_id: paymentId,
        p_decision: decision,
        p_rejection_reason: rejectionReason || undefined,
      })

      if (error) throw error
    } catch (err) {
      logger.error('Failed to verify payment:', err)
      throw toAppError(err, 'Gagal memverifikasi status pembayaran.')
    }
  },
}
