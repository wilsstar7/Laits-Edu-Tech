// =============================================================================
// SUPABASE EDGE FUNCTION: generate-personality-report
// Phase 3 — Personality PDF Report & Report Management
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Client with user JWT for auth check
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { assessmentResultId, reportVersion = '1.0' } = await req.json()
    if (!assessmentResultId) {
      return new Response(JSON.stringify({ error: 'assessmentResultId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Service client for privileged queries & storage
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Check idempotency: Return existing ready report if found
    const { data: existingReport } = await serviceClient
      .from('personality_reports')
      .select('*')
      .eq('assessment_result_id', assessmentResultId)
      .eq('report_version', reportVersion)
      .eq('status', 'ready')
      .maybeSingle()

    if (existingReport) {
      // Create signed URL for download/preview
      const { data: signedData } = await serviceClient.storage
        .from('personality-reports')
        .createSignedUrl(existingReport.file_path, 600)

      return new Response(
        JSON.stringify({
          success: true,
          report: { ...existingReport, signedUrl: signedData?.signedUrl },
          isNew: false,
          message: 'Laporan yang telah digenerate sebelumnya ditemukan.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Validate ownership & result status
    const { data: result, error: resultError } = await serviceClient
      .from('assessment_results')
      .select(`
        *,
        personality_types (*),
        assessments (*),
        assessment_result_dimensions (
          raw_score,
          normalized_score,
          assessment_dimensions (*)
        )
      `)
      .eq('id', assessmentResultId)
      .single()

    if (resultError || !result) {
      return new Response(JSON.stringify({ error: 'Hasil asesmen tidak ditemukan' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (result.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Akses ditolak: Hasil bukan milik Anda' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!result.personality_types || !result.assessment_result_dimensions?.length) {
      return new Response(
        JSON.stringify({ error: 'REPORT_DATA_INCOMPLETE: Data profil asesmen belum lengkap' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Endpoint siap digunakan untuk delegasi backend generation.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
