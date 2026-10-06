/**
 * Supabase database types for Phase 1 & Phase 2.
 *
 * Mirrors `supabase/migrations/*`.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          avatar_url: string | null
          role: Database['public']['Enums']['user_role']
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          email: string
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          id: string
          user_id: string
          date_of_birth: string | null
          gender: Database['public']['Enums']['gender_type'] | null
          school: string | null
          grade: string | null
          city: string | null
          parent_name: string | null
          parent_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date_of_birth?: string | null
          gender?: Database['public']['Enums']['gender_type'] | null
          school?: string | null
          grade?: string | null
          city?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date_of_birth?: string | null
          gender?: Database['public']['Enums']['gender_type'] | null
          school?: string | null
          grade?: string | null
          city?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tutor_profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          headline: string | null
          phone: string | null
          education_background: string | null
          experience: string | null
          experience_years: number
          teaching_style: string | null
          hourly_rate: number | null
          rating: number
          total_reviews: number
          is_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          headline?: string | null
          phone?: string | null
          education_background?: string | null
          experience?: string | null
          experience_years?: number
          teaching_style?: string | null
          hourly_rate?: number | null
          rating?: number
          total_reviews?: number
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          headline?: string | null
          phone?: string | null
          education_background?: string | null
          experience?: string | null
          experience_years?: number
          teaching_style?: string | null
          hourly_rate?: number | null
          rating?: number
          total_reviews?: number
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          id: string
          name: string
          category: Database['public']['Enums']['subject_category']
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: Database['public']['Enums']['subject_category']
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: Database['public']['Enums']['subject_category']
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          instructions: string
          estimated_minutes: number
          is_active: boolean
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          instructions?: string
          estimated_minutes?: number
          is_active?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          instructions?: string
          estimated_minutes?: number
          is_active?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_dimensions: {
        Row: {
          id: string
          assessment_id: string
          name: string
          code: string
          description: string
          min_score: number
          max_score: number
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          name: string
          code: string
          description?: string
          min_score?: number
          max_score?: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          name?: string
          code?: string
          description?: string
          min_score?: number
          max_score?: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_questions: {
        Row: {
          id: string
          assessment_id: string
          dimension_id: string
          question_text: string
          question_type: string
          display_order: number
          required: boolean
          weight: number
          reverse_score: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          dimension_id: string
          question_text: string
          question_type?: string
          display_order?: number
          required?: boolean
          weight?: number
          reverse_score?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          dimension_id?: string
          question_text?: string
          question_type?: string
          display_order?: number
          required?: boolean
          weight?: number
          reverse_score?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_options: {
        Row: {
          id: string
          question_id: string
          label: string
          value: number
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          label: string
          value: number
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          label?: string
          value?: number
          display_order?: number
          created_at?: string
        }
        Relationships: []
      }
      personality_types: {
        Row: {
          id: string
          assessment_id: string
          name: string
          code: string
          description: string
          strengths: Json
          challenges: Json
          learning_style: string
          communication_style: string
          motivation: string
          recommended_study_method: Json
          recommended_subjects: Json
          recommended_tutor_style: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          name: string
          code: string
          description?: string
          strengths?: Json
          challenges?: Json
          learning_style?: string
          communication_style?: string
          motivation?: string
          recommended_study_method?: Json
          recommended_subjects?: Json
          recommended_tutor_style?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          name?: string
          code?: string
          description?: string
          strengths?: Json
          challenges?: Json
          learning_style?: string
          communication_style?: string
          motivation?: string
          recommended_study_method?: Json
          recommended_subjects?: Json
          recommended_tutor_style?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      personality_type_rules: {
        Row: {
          id: string
          personality_type_id: string
          dimension_id: string
          operator: string
          threshold_value: number
          secondary_threshold: number | null
          priority: number
          created_at: string
        }
        Insert: {
          id?: string
          personality_type_id: string
          dimension_id: string
          operator: string
          threshold_value: number
          secondary_threshold?: number | null
          priority?: number
          created_at?: string
        }
        Update: {
          id?: string
          personality_type_id?: string
          dimension_id?: string
          operator?: string
          threshold_value?: number
          secondary_threshold?: number | null
          priority?: number
          created_at?: string
        }
        Relationships: []
      }
      assessment_sessions: {
        Row: {
          id: string
          assessment_id: string
          user_id: string
          status: string
          current_question_index: number
          consent_at: string
          started_at: string
          last_saved_at: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          user_id: string
          status?: string
          current_question_index?: number
          consent_at?: string
          started_at?: string
          last_saved_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          user_id?: string
          status?: string
          current_question_index?: number
          consent_at?: string
          started_at?: string
          last_saved_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_answers: {
        Row: {
          id: string
          session_id: string
          question_id: string
          option_id: string
          score: number | null
          answered_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: string
          option_id: string
          score?: number | null
          answered_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: string
          option_id?: string
          score?: number | null
          answered_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_results: {
        Row: {
          id: string
          session_id: string
          user_id: string
          assessment_id: string
          personality_type_id: string
          overall_score: number
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          assessment_id: string
          personality_type_id: string
          overall_score: number
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          assessment_id?: string
          personality_type_id?: string
          overall_score?: number
          completed_at?: string
          created_at?: string
        }
        Relationships: []
      }
      assessment_result_dimensions: {
        Row: {
          id: string
          result_id: string
          dimension_id: string
          raw_score: number
          normalized_score: number
          percentile: number | null
          created_at: string
        }
        Insert: {
          id?: string
          result_id: string
          dimension_id: string
          raw_score: number
          normalized_score: number
          percentile?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          result_id?: string
          dimension_id?: string
          raw_score?: number
          normalized_score?: number
          percentile?: number | null
          created_at?: string
        }
        Relationships: []
      }
      personality_reports: {
        Row: {
          id: string
          user_id: string
          assessment_result_id: string
          file_path: string
          file_name: string
          file_size: number
          mime_type: string
          report_version: string
          status: string
          generated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessment_result_id: string
          file_path: string
          file_name: string
          file_size?: number
          mime_type?: string
          report_version?: string
          status?: string
          generated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessment_result_id?: string
          file_path?: string
          file_name?: string
          file_size?: number
          mime_type?: string
          report_version?: string
          status?: string
          generated_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      personality_type_subjects: {
        Row: {
          id: string
          personality_type_id: string
          subject_id: string
          priority: number
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          personality_type_id: string
          subject_id: string
          priority?: number
          reason?: string
          created_at?: string
        }
        Update: {
          id?: string
          personality_type_id?: string
          subject_id?: string
          priority?: number
          reason?: string
          created_at?: string
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          thumbnail_url: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          thumbnail_url?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          thumbnail_url?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_path_subjects: {
        Row: {
          id: string
          learning_path_id: string
          subject_id: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          learning_path_id: string
          subject_id: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          learning_path_id?: string
          subject_id?: string
          display_order?: number
          created_at?: string
        }
        Relationships: []
      }
      personality_type_learning_paths: {
        Row: {
          id: string
          personality_type_id: string
          learning_path_id: string
          priority: number
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          personality_type_id: string
          learning_path_id: string
          priority?: number
          reason?: string
          created_at?: string
        }
        Update: {
          id?: string
          personality_type_id?: string
          learning_path_id?: string
          priority?: number
          reason?: string
          created_at?: string
        }
        Relationships: []
      }
      tutor_subjects: {
        Row: {
          id: string
          tutor_id: string
          subject_id: string
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          subject_id: string
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          subject_id?: string
          created_at?: string
        }
        Relationships: []
      }
      tutor_availability: {
        Row: {
          id: string
          tutor_id: string
          day_of_week: number
          start_time: string
          end_time: string
          timezone: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          day_of_week: number
          start_time: string
          end_time: string
          timezone?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          timezone?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          student_id: string
          tutor_id: string
          subject_id: string
          scheduled_start: string
          scheduled_end: string
          timezone: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected' | 'no_show'
          student_note: string | null
          tutor_note: string | null
          meeting_url: string | null
          agreed_hourly_rate: number | null
          total_amount: number | null
          created_at: string
          updated_at: string
          cancelled_at: string | null
          cancelled_by: string | null
          cancellation_reason: string | null
        }
        Insert: {
          id?: string
          student_id: string
          tutor_id: string
          subject_id: string
          scheduled_start: string
          scheduled_end: string
          timezone?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected' | 'no_show'
          student_note?: string | null
          tutor_note?: string | null
          meeting_url?: string | null
          agreed_hourly_rate?: number | null
          total_amount?: number | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          tutor_id?: string
          subject_id?: string
          scheduled_start?: string
          scheduled_end?: string
          timezone?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected' | 'no_show'
          student_note?: string | null
          tutor_note?: string | null
          meeting_url?: string | null
          agreed_hourly_rate?: number | null
          total_amount?: number | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          student_id: string
          tutor_id: string
          amount: number
          currency: string
          payment_method: 'manual_transfer' | 'payment_gateway'
          provider: string
          provider_transaction_id: string | null
          status: 'pending' | 'awaiting_payment' | 'awaiting_verification' | 'paid' | 'failed' | 'expired' | 'cancelled' | 'refunded' | 'partially_refunded'
          expires_at: string
          paid_at: string | null
          failed_at: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          student_id: string
          tutor_id: string
          amount: number
          currency?: string
          payment_method?: 'manual_transfer' | 'payment_gateway'
          provider?: string
          provider_transaction_id?: string | null
          status?: 'pending' | 'awaiting_payment' | 'awaiting_verification' | 'paid' | 'failed' | 'expired' | 'cancelled' | 'refunded' | 'partially_refunded'
          expires_at: string
          paid_at?: string | null
          failed_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          student_id?: string
          tutor_id?: string
          amount?: number
          currency?: string
          payment_method?: 'manual_transfer' | 'payment_gateway'
          provider?: string
          provider_transaction_id?: string | null
          status?: 'pending' | 'awaiting_payment' | 'awaiting_verification' | 'paid' | 'failed' | 'expired' | 'cancelled' | 'refunded' | 'partially_refunded'
          expires_at?: string
          paid_at?: string | null
          failed_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_proofs: {
        Row: {
          id: string
          payment_id: string
          student_id: string
          file_path: string
          original_file_name: string
          mime_type: string
          file_size: number
          uploaded_at: string
          verified_at: string | null
          verified_by: string | null
          rejection_reason: string | null
          status: 'pending' | 'approved' | 'rejected'
        }
        Insert: {
          id?: string
          payment_id: string
          student_id: string
          file_path: string
          original_file_name: string
          mime_type: string
          file_size: number
          uploaded_at?: string
          verified_at?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
        }
        Update: {
          id?: string
          payment_id?: string
          student_id?: string
          file_path?: string
          original_file_name?: string
          mime_type?: string
          file_size?: number
          uploaded_at?: string
          verified_at?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          payment_id: string
          invoice_number: string
          student_id: string
          booking_id: string
          subtotal: number
          discount: number
          total: number
          currency: string
          status: 'issued' | 'paid' | 'cancelled' | 'refunded'
          issued_at: string
          due_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          invoice_number: string
          student_id: string
          booking_id: string
          subtotal: number
          discount?: number
          total: number
          currency?: string
          status?: 'issued' | 'paid' | 'cancelled' | 'refunded'
          issued_at?: string
          due_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          payment_id?: string
          invoice_number?: string
          student_id?: string
          booking_id?: string
          subtotal?: number
          discount?: number
          total?: number
          currency?: string
          status?: 'issued' | 'paid' | 'cancelled' | 'refunded'
          issued_at?: string
          due_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          id: string
          payment_id: string
          event_type: string
          source: string
          payload_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          event_type: string
          source?: string
          payload_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          payment_id?: string
          event_type?: string
          source?: string
          payload_hash?: string | null
          created_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          student_id: string
          tutor_id: string
          rating: number
          review_text: string | null
          status: 'published' | 'hidden' | 'flagged'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          student_id: string
          tutor_id: string
          rating: number
          review_text?: string | null
          status?: 'published' | 'hidden' | 'flagged'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          student_id?: string
          tutor_id?: string
          rating?: number
          review_text?: string | null
          status?: 'published' | 'hidden' | 'flagged'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_learning_paths: {
        Row: {
          id: string
          student_id: string
          learning_path_id: string
          status: 'not_started' | 'in_progress' | 'completed' | 'paused'
          started_at: string
          completed_at: string | null
          progress_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          learning_path_id: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'paused'
          started_at?: string
          completed_at?: string | null
          progress_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          learning_path_id?: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'paused'
          started_at?: string
          completed_at?: string | null
          progress_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_path_progress: {
        Row: {
          id: string
          student_learning_path_id: string
          subject_id: string
          status: 'not_started' | 'in_progress' | 'completed'
          progress_percentage: number
          started_at: string | null
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          student_learning_path_id: string
          subject_id: string
          status?: 'not_started' | 'in_progress' | 'completed'
          progress_percentage?: number
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          student_learning_path_id?: string
          subject_id?: string
          status?: 'not_started' | 'in_progress' | 'completed'
          progress_percentage?: number
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_sessions: {
        Row: {
          id: string
          booking_id: string
          student_id: string
          tutor_id: string
          subject_id: string
          started_at: string
          ended_at: string
          duration_minutes: number
          student_notes: string | null
          tutor_notes: string | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          student_id: string
          tutor_id: string
          subject_id: string
          started_at: string
          ended_at: string
          duration_minutes: number
          student_notes?: string | null
          tutor_notes?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          student_id?: string
          tutor_id?: string
          subject_id?: string
          started_at?: string
          ended_at?: string
          duration_minutes?: number
          student_notes?: string | null
          tutor_notes?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          actor_user_id: string | null
          action: string
          entity_type: string
          entity_id: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          actor_user_id?: string | null
          action: string
          entity_type: string
          entity_id: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          actor_user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'booking' | 'payment' | 'report' | 'system'
          link_url: string | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'booking' | 'payment' | 'report' | 'system'
          link_url?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'booking' | 'payment' | 'report' | 'system'
          link_url?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      monthly_learning_reports: {
        Row: {
          id: string
          student_id: string
          period_month: number
          period_year: number
          total_sessions: number
          total_hours: number
          avg_progress_percentage: number
          summary: string
          status: 'generating' | 'ready' | 'failed'
          file_path: string | null
          generated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          period_month: number
          period_year: number
          total_sessions?: number
          total_hours?: number
          avg_progress_percentage?: number
          summary?: string
          status?: 'generating' | 'ready' | 'failed'
          file_path?: string | null
          generated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          period_month?: number
          period_year?: number
          total_sessions?: number
          total_hours?: number
          avg_progress_percentage?: number
          summary?: string
          status?: 'generating' | 'ready' | 'failed'
          file_path?: string | null
          generated_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_role: {
        Args: never
        Returns: Database['public']['Enums']['user_role']
      }
      is_admin: {
        Args: never
        Returns: boolean
      }
      is_super_admin: {
        Args: never
        Returns: boolean
      }
      ensure_profile: {
        Args: never
        Returns: Database['public']['Tables']['profiles']['Row']
      }
      admin_set_user_role: {
        Args: {
          target_user_id: string
          new_role: Database['public']['Enums']['user_role']
        }
        Returns: undefined
      }
      submit_and_score_assessment: {
        Args: {
          p_session_id: string
        }
        Returns: string
      }
      create_booking: {
        Args: {
          p_tutor_id: string
          p_subject_id: string
          p_scheduled_start: string
          p_scheduled_end: string
          p_timezone?: string
          p_student_note?: string
        }
        Returns: string
      }
      update_booking_status: {
        Args: {
          p_booking_id: string
          p_new_status: string
          p_reason?: string
          p_tutor_note?: string
          p_meeting_url?: string
        }
        Returns: undefined
      }
      create_payment: {
        Args: {
          p_booking_id: string
          p_payment_method?: string
        }
        Returns: string
      }
      submit_payment_proof: {
        Args: {
          p_payment_id: string
          p_file_path: string
          p_original_file_name: string
          p_mime_type: string
          p_file_size: number
        }
        Returns: string
      }
      admin_verify_payment: {
        Args: {
          p_payment_id: string
          p_decision: string
          p_rejection_reason?: string
        }
        Returns: undefined
      }
      complete_tutoring_session: {
        Args: {
          p_booking_id: string
          p_tutor_notes?: string
          p_student_notes?: string
        }
        Returns: undefined
      }
      submit_student_review: {
        Args: {
          p_booking_id: string
          p_rating: number
          p_review_text?: string
        }
        Returns: string
      }
      enroll_student_learning_path: {
        Args: {
          p_learning_path_id: string
        }
        Returns: string
      }
      update_learning_subject_progress: {
        Args: {
          p_student_learning_path_id: string
          p_subject_id: string
          p_progress_percentage: number
        }
        Returns: undefined
      }
      mark_notification_read: {
        Args: {
          p_notification_id: string
        }
        Returns: undefined
      }
      mark_all_notifications_read: {
        Args: never
        Returns: number
      }
      generate_monthly_learning_report: {
        Args: {
          p_student_id: string
          p_year: number
          p_month: number
        }
        Returns: string
      }
    }
    Enums: {
      user_role: 'student' | 'tutor' | 'admin' | 'super_admin'
      gender_type: 'male' | 'female'
      subject_category: 'general' | 'religious'
      booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected' | 'no_show'
      learning_path_difficulty: 'beginner' | 'intermediate' | 'advanced'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update']
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T]
