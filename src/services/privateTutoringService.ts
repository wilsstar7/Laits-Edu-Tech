import { requireSupabase } from '@/lib/supabase'
import type { PrivateTutoringSettings } from '@/types/payment'
import { toAppError } from '@/utils/errors'

interface MonthlyTutoringPayment {
  id: string
  amount: number
  monthly_session_count: number
  monthly_subject_name: string | null
  requested_tutor_name: string | null
  assigned_tutor_id: string | null
  student: { full_name: string } | null
  assignedTutor: { profile: { full_name: string } | null } | null
}

export const privateTutoringService = {
  async getSettings(): Promise<PrivateTutoringSettings> {
    const { data, error } = await requireSupabase().from('private_tutoring_settings')
      .select('rate_per_session, bank_name, account_number, account_holder').eq('id', true).single()
    if (error) throw toAppError(error, 'Gagal memuat tarif dan rekening perusahaan.')
    return {
      ratePerSession: data.rate_per_session,
      bankName: data.bank_name,
      accountNumber: data.account_number,
      accountHolder: data.account_holder,
    }
  },

  async saveSettings(settings: PrivateTutoringSettings) {
    const { error } = await requireSupabase().from('private_tutoring_settings').update({
      rate_per_session: settings.ratePerSession,
      bank_name: settings.bankName.trim(),
      account_number: settings.accountNumber.replace(/[\s-]/g, ''),
      account_holder: settings.accountHolder.trim(),
    }).eq('id', true).select('id').single()
    if (error) throw toAppError(error, 'Gagal menyimpan pengaturan program.')
  },

  async createPayment(sessionCount: number, tutorName: string, requestId: string, expectedRate: number, subjectId: string) {
    const { data, error } = await requireSupabase().rpc('create_monthly_tutoring_payment', {
      p_session_count: sessionCount,
      p_requested_tutor_name: tutorName.trim(),
      p_request_id: requestId,
      p_expected_rate: expectedRate,
      p_subject_id: subjectId,
    })
    if (error) throw toAppError(error, 'Gagal membuat tagihan les privat.')
    return data
  },

  async listPaidPayments(page: number) {
    const pageSize = 25
    const { data, count, error } = await requireSupabase().from('payments')
      .select(`
        id, amount, monthly_session_count, monthly_subject_name, requested_tutor_name, assigned_tutor_id,
        student:profiles!payments_student_id_fkey ( full_name ),
        assignedTutor:tutor_profiles!payments_assigned_tutor_id_fkey ( profile:profiles ( full_name ) )
      `, { count: 'exact' })
      .not('monthly_session_count', 'is', null).eq('status', 'paid')
      .order('assigned_tutor_id', { nullsFirst: true })
      .order('created_at', { ascending: false }).order('id')
      .range((page - 1) * pageSize, page * pageSize - 1)
    if (error) throw toAppError(error, 'Gagal memuat tagihan lunas.')
    return { payments: data as unknown as MonthlyTutoringPayment[], pageCount: Math.ceil((count ?? 0) / pageSize) }
  },

  async assignTutor(paymentId: string, tutorId: string) {
    const { error } = await requireSupabase().rpc('assign_monthly_tutor', {
      p_payment_id: paymentId,
      p_tutor_id: tutorId,
    })
    if (error) throw toAppError(error, 'Gagal menetapkan tutor.')
  },
}
