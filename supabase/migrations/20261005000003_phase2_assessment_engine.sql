-- =============================================================================
-- PHASE 2 : PERSONALITY ASSESSMENT ENGINE, QUESTIONNAIRE, SCORING & RESULTS
-- =============================================================================
-- Tables:
--   1. assessments
--   2. assessment_dimensions
--   3. assessment_questions
--   4. assessment_options
--   5. assessment_sessions
--   6. assessment_answers
--   7. personality_types
--   8. personality_type_rules
--   9. assessment_results
--  10. assessment_result_dimensions
--
-- Security & Integrity:
--   - RLS on every table
--   - Zero client trust: scoring is computed inside secure PostgreSQL RPC
--   - Strict session ownership
--   - Idempotent submission
--   - ACID transaction safety
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. assessments
-- -----------------------------------------------------------------------------
create table if not exists public.assessments (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (char_length(name) <= 150),
  slug              text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description       text not null default '',
  instructions      text not null default '',
  estimated_minutes integer not null default 15 check (estimated_minutes > 0),
  is_active         boolean not null default false,
  version           integer not null default 1 check (version >= 1),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger trg_assessments_updated_at
  before update on public.assessments
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. assessment_dimensions
-- -----------------------------------------------------------------------------
create table if not exists public.assessment_dimensions (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  name          text not null check (char_length(name) <= 100),
  code          text not null check (code ~ '^[A-Z0-9_]+$'),
  description   text not null default '',
  min_score     numeric not null default 0,
  max_score     numeric not null default 100,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (assessment_id, code)
);

create trigger trg_assessment_dimensions_updated_at
  before update on public.assessment_dimensions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. assessment_questions
-- -----------------------------------------------------------------------------
create table if not exists public.assessment_questions (
  id              uuid primary key default gen_random_uuid(),
  assessment_id   uuid not null references public.assessments(id) on delete cascade,
  dimension_id    uuid not null references public.assessment_dimensions(id) on delete restrict,
  question_text   text not null check (char_length(question_text) > 0),
  question_type   text not null default 'likert' check (question_type in ('likert', 'multiple_choice', 'yes_no', 'scale', 'text')),
  display_order   integer not null default 0,
  required        boolean not null default true,
  weight          numeric not null default 1 check (weight > 0),
  reverse_score   boolean not null default false,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_assessment_questions_updated_at
  before update on public.assessment_questions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. assessment_options
-- -----------------------------------------------------------------------------
create table if not exists public.assessment_options (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null references public.assessment_questions(id) on delete cascade,
  label         text not null check (char_length(label) > 0),
  value         integer not null check (value between 1 and 10),
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (question_id, value)
);

-- -----------------------------------------------------------------------------
-- 5. personality_types
-- -----------------------------------------------------------------------------
create table if not exists public.personality_types (
  id                        uuid primary key default gen_random_uuid(),
  assessment_id             uuid not null references public.assessments(id) on delete cascade,
  name                      text not null check (char_length(name) <= 100),
  code                      text not null check (code ~ '^[A-Z0-9_]+$'),
  description               text not null default '',
  strengths                 jsonb not null default '[]'::jsonb,
  challenges                jsonb not null default '[]'::jsonb,
  learning_style            text not null default '',
  communication_style       text not null default '',
  motivation                text not null default '',
  recommended_study_method  jsonb not null default '[]'::jsonb,
  recommended_subjects      jsonb not null default '[]'::jsonb,
  recommended_tutor_style   jsonb not null default '[]'::jsonb,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  unique (assessment_id, code)
);

create trigger trg_personality_types_updated_at
  before update on public.personality_types
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. personality_type_rules
-- -----------------------------------------------------------------------------
create table if not exists public.personality_type_rules (
  id                  uuid primary key default gen_random_uuid(),
  personality_type_id uuid not null references public.personality_types(id) on delete cascade,
  dimension_id        uuid not null references public.assessment_dimensions(id) on delete cascade,
  operator            text not null check (operator in ('gte', 'gt', 'lte', 'lt', 'between')),
  threshold_value     numeric not null,
  secondary_threshold numeric null,
  priority            integer not null default 10,
  created_at          timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 7. assessment_sessions
-- -----------------------------------------------------------------------------
create table if not exists public.assessment_sessions (
  id                      uuid primary key default gen_random_uuid(),
  assessment_id           uuid not null references public.assessments(id) on delete cascade,
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  status                  text not null default 'in_progress' check (status in ('not_started', 'in_progress', 'submitted', 'scored', 'abandoned')),
  current_question_index  integer not null default 0 check (current_question_index >= 0),
  consent_at              timestamptz not null default now(),
  started_at              timestamptz not null default now(),
  last_saved_at           timestamptz not null default now(),
  completed_at            timestamptz null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create trigger trg_assessment_sessions_updated_at
  before update on public.assessment_sessions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 8. assessment_answers
-- -----------------------------------------------------------------------------
create table if not exists public.assessment_answers (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.assessment_sessions(id) on delete cascade,
  question_id   uuid not null references public.assessment_questions(id) on delete cascade,
  option_id     uuid not null references public.assessment_options(id) on delete cascade,
  score         integer null,
  answered_at   timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (session_id, question_id)
);

create trigger trg_assessment_answers_updated_at
  before update on public.assessment_answers
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 9. assessment_results
-- -----------------------------------------------------------------------------
create table if not exists public.assessment_results (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null unique references public.assessment_sessions(id) on delete cascade,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  assessment_id       uuid not null references public.assessments(id) on delete cascade,
  personality_type_id uuid not null references public.personality_types(id) on delete restrict,
  overall_score       numeric not null check (overall_score between 0 and 100),
  completed_at        timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 10. assessment_result_dimensions
-- -----------------------------------------------------------------------------
create table if not exists public.assessment_result_dimensions (
  id                uuid primary key default gen_random_uuid(),
  result_id         uuid not null references public.assessment_results(id) on delete cascade,
  dimension_id      uuid not null references public.assessment_dimensions(id) on delete restrict,
  raw_score         numeric not null,
  normalized_score  numeric not null check (normalized_score between 0 and 100),
  percentile        numeric null,
  created_at        timestamptz not null default now(),
  unique (result_id, dimension_id)
);

-- -----------------------------------------------------------------------------
-- Performance Indexes
-- -----------------------------------------------------------------------------
create index if not exists idx_assessment_questions_assessment on public.assessment_questions(assessment_id, is_active, display_order);
create index if not exists idx_assessment_questions_dimension on public.assessment_questions(dimension_id);
create index if not exists idx_assessment_options_question on public.assessment_options(question_id, display_order);
create index if not exists idx_assessment_sessions_user on public.assessment_sessions(user_id, status);
create index if not exists idx_assessment_answers_session on public.assessment_answers(session_id);
create index if not exists idx_assessment_results_user on public.assessment_results(user_id, completed_at desc);
create index if not exists idx_assessment_result_dims_result on public.assessment_result_dimensions(result_id);
create index if not exists idx_personality_rules_type on public.personality_type_rules(personality_type_id, priority desc);

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS) Setup
-- -----------------------------------------------------------------------------
alter table public.assessments enable row level security;
alter table public.assessment_dimensions enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_options enable row level security;
alter table public.personality_types enable row level security;
alter table public.personality_type_rules enable row level security;
alter table public.assessment_sessions enable row level security;
alter table public.assessment_answers enable row level security;
alter table public.assessment_results enable row level security;
alter table public.assessment_result_dimensions enable row level security;

-- Assessments: Anyone authenticated can read active assessments; admin can manage all
create policy "assessments_read_active"
  on public.assessments for select
  to authenticated
  using (is_active = true or public.is_admin());

create policy "assessments_admin_all"
  on public.assessments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Assessment Dimensions: Read if assessment is readable
create policy "dimensions_read_active"
  on public.assessment_dimensions for select
  to authenticated
  using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_dimensions.assessment_id
        and (a.is_active = true or public.is_admin())
    )
  );

create policy "dimensions_admin_all"
  on public.assessment_dimensions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Assessment Questions: Read active questions for active assessments
create policy "questions_read_active"
  on public.assessment_questions for select
  to authenticated
  using (
    (is_active = true and exists (
      select 1 from public.assessments a
      where a.id = assessment_questions.assessment_id
        and a.is_active = true
    ))
    or public.is_admin()
  );

create policy "questions_admin_all"
  on public.assessment_questions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Assessment Options: Read options for readable questions
create policy "options_read_all"
  on public.assessment_options for select
  to authenticated
  using (
    exists (
      select 1 from public.assessment_questions q
      where q.id = assessment_options.question_id
        and (q.is_active = true or public.is_admin())
    )
  );

create policy "options_admin_all"
  on public.assessment_options for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Personality Types: Readable by authenticated users
create policy "personality_types_read"
  on public.personality_types for select
  to authenticated
  using (true);

create policy "personality_types_admin_all"
  on public.personality_types for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Personality Type Rules: Readable by admin or security functions
create policy "personality_rules_read"
  on public.personality_type_rules for select
  to authenticated
  using (public.is_admin());

create policy "personality_rules_admin_all"
  on public.personality_type_rules for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Assessment Sessions: Users can select, insert, and update their own sessions
create policy "sessions_select_own"
  on public.assessment_sessions for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy "sessions_insert_own"
  on public.assessment_sessions for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "sessions_update_own"
  on public.assessment_sessions for update
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin())
  with check (user_id = (select auth.uid()) or public.is_admin());

-- Assessment Answers: Users can select and upsert answers only for their own in_progress sessions
create policy "answers_select_own"
  on public.assessment_answers for select
  to authenticated
  using (
    exists (
      select 1 from public.assessment_sessions s
      where s.id = assessment_answers.session_id
        and (s.user_id = (select auth.uid()) or public.is_admin())
    )
  );

create policy "answers_insert_own"
  on public.assessment_answers for insert
  to authenticated
  with check (
    exists (
      select 1 from public.assessment_sessions s
      where s.id = assessment_answers.session_id
        and s.user_id = (select auth.uid())
        and s.status = 'in_progress'
    )
  );

create policy "answers_update_own"
  on public.assessment_answers for update
  to authenticated
  using (
    exists (
      select 1 from public.assessment_sessions s
      where s.id = assessment_answers.session_id
        and s.user_id = (select auth.uid())
        and s.status = 'in_progress'
    )
  )
  with check (
    exists (
      select 1 from public.assessment_sessions s
      where s.id = assessment_answers.session_id
        and s.user_id = (select auth.uid())
        and s.status = 'in_progress'
    )
  );

-- Assessment Results: Users can select only their own results
create policy "results_select_own"
  on public.assessment_results for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- Assessment Result Dimensions: Users can select dimensions for their own results
create policy "result_dimensions_select_own"
  on public.assessment_result_dimensions for select
  to authenticated
  using (
    exists (
      select 1 from public.assessment_results r
      where r.id = assessment_result_dimensions.result_id
        and (r.user_id = (select auth.uid()) or public.is_admin())
    )
  );

-- -----------------------------------------------------------------------------
-- SECURE SCORING RPC : submit_and_score_assessment
-- -----------------------------------------------------------------------------
-- Zero trust on frontend:
-- 1. Verifies session belongs to calling user auth.uid()
-- 2. Checks session is currently 'in_progress'
-- 3. Idempotent: If already scored, returns existing result id
-- 4. Verifies all required questions for the assessment have valid answers
-- 5. Calculates raw, min, max, and normalized scores per dimension
-- 6. Determines personality type by matching rules in database order
-- 7. Atomically creates assessment_results and assessment_result_dimensions
-- 8. Updates session to 'scored' and completed_at = now()
-- -----------------------------------------------------------------------------
create or replace function public.submit_and_score_assessment(p_session_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id             uuid := (select auth.uid());
  v_session             public.assessment_sessions%rowtype;
  v_assessment          public.assessments%rowtype;
  v_existing_result_id  uuid;
  v_unanswered_count    integer;
  v_result_id           uuid;
  v_overall_score       numeric := 0;
  v_dim_count           integer := 0;
  v_chosen_type_id      uuid;
  v_default_type_id     uuid;

  v_dim record;
  v_rule record;
  v_rule_matches boolean;
begin
  -- 1. Caller authentication
  if v_user_id is null then
    raise exception 'Unauthorized: caller must be authenticated' using errcode = '42501';
  end if;

  -- 2. Lock and retrieve session
  select * into v_session
  from public.assessment_sessions
  where id = p_session_id
  for update;

  if not found then
    raise exception 'Assessment session not found' using errcode = 'P0002';
  end if;

  if v_session.user_id <> v_user_id and not public.is_admin() then
    raise exception 'Forbidden: session does not belong to caller' using errcode = '42501';
  end if;

  -- 3. Idempotency check: if already scored, return existing result ID
  if v_session.status = 'scored' then
    select id into v_existing_result_id
    from public.assessment_results
    where session_id = p_session_id;
    if v_existing_result_id is not null then
      return v_existing_result_id;
    end if;
  end if;

  if v_session.status <> 'in_progress' then
    raise exception 'Session cannot be submitted in status: %', v_session.status;
  end if;

  -- 4. Check assessment validity
  select * into v_assessment
  from public.assessments
  where id = v_session.assessment_id;

  if not found or not v_assessment.is_active then
    raise exception 'Assessment is not active or not found';
  end if;

  -- 5. Verify all required questions have answers
  select count(*) into v_unanswered_count
  from public.assessment_questions q
  where q.assessment_id = v_session.assessment_id
    and q.is_active = true
    and q.required = true
    and not exists (
      select 1 from public.assessment_answers a
      where a.session_id = p_session_id
        and a.question_id = q.id
    );

  if v_unanswered_count > 0 then
    raise exception 'Cannot submit: % required question(s) are unanswered', v_unanswered_count;
  end if;

  -- 6. Temporary table to hold dimension score calculations
  create temporary table temp_dim_scores (
    dimension_id      uuid primary key,
    raw_score         numeric not null,
    normalized_score  numeric not null
  ) on commit drop;

  -- Loop through all dimensions configured for this assessment
  for v_dim in
    select d.id as dimension_id, d.code
    from public.assessment_dimensions d
    where d.assessment_id = v_session.assessment_id
    order by d.display_order
  loop
    declare
      v_raw_score     numeric := 0;
      v_min_possible  numeric := 0;
      v_max_possible  numeric := 0;
      v_normalized    numeric := 0;
      v_q record;
    begin
      -- Aggregate answers for this dimension
      for v_q in
        select
          q.id as question_id,
          q.weight,
          q.reverse_score,
          o.value as answer_value,
          (select min(val.value) from public.assessment_options val where val.question_id = q.id) as min_val,
          (select max(val.value) from public.assessment_options val where val.question_id = q.id) as max_val
        from public.assessment_questions q
        join public.assessment_answers a on a.question_id = q.id and a.session_id = p_session_id
        join public.assessment_options o on o.id = a.option_id
        where q.dimension_id = v_dim.dimension_id
          and q.is_active = true
      loop
        declare
          v_effective_value numeric;
        begin
          -- Standard Likert 1-5 reverse scoring formula: 6 - value
          if v_q.reverse_score then
            v_effective_value := (coalesce(v_q.max_val, 5) + coalesce(v_q.min_val, 1)) - v_q.answer_value;
          else
            v_effective_value := v_q.answer_value;
          end if;

          v_raw_score := v_raw_score + (v_effective_value * v_q.weight);
          v_min_possible := v_min_possible + (coalesce(v_q.min_val, 1) * v_q.weight);
          v_max_possible := v_max_possible + (coalesce(v_q.max_val, 5) * v_q.weight);
        end;
      end loop;

      -- Normalize to 0-100 scale: (raw - min) / (max - min) * 100
      if (v_max_possible - v_min_possible) > 0 then
        v_normalized := ((v_raw_score - v_min_possible) / (v_max_possible - v_min_possible)) * 100;
      else
        v_normalized := 50; -- Default middle if no range
      end if;

      -- Clamp to 0-100
      if v_normalized < 0 then v_normalized := 0; end if;
      if v_normalized > 100 then v_normalized := 100; end if;

      insert into temp_dim_scores (dimension_id, raw_score, normalized_score)
      values (v_dim.dimension_id, round(v_raw_score, 2), round(v_normalized, 1));

      v_overall_score := v_overall_score + v_normalized;
      v_dim_count := v_dim_count + 1;
    end;
  end loop;

  -- Overall score is the mean of normalized dimension scores
  if v_dim_count > 0 then
    v_overall_score := round(v_overall_score / v_dim_count, 1);
  else
    v_overall_score := 50.0;
  end if;

  -- 7. Determine personality type based on database-driven rules
  -- Default type fallback (first configured personality type for this assessment)
  select id into v_default_type_id
  from public.personality_types
  where assessment_id = v_session.assessment_id
  order by created_at
  limit 1;

  v_chosen_type_id := null;

  -- Check rules grouped by personality_type ordered by priority desc
  for v_rule in
    select
      r.personality_type_id,
      r.priority,
      count(*) as total_rules,
      count(*) filter (
        where
          (r.operator = 'gte' and tds.normalized_score >= r.threshold_value) or
          (r.operator = 'gt'  and tds.normalized_score >  r.threshold_value) or
          (r.operator = 'lte' and tds.normalized_score <= r.threshold_value) or
          (r.operator = 'lt'  and tds.normalized_score <  r.threshold_value) or
          (r.operator = 'between' and tds.normalized_score between r.threshold_value and coalesce(r.secondary_threshold, 100))
      ) as matched_rules
    from public.personality_type_rules r
    join temp_dim_scores tds on tds.dimension_id = r.dimension_id
    join public.personality_types pt on pt.id = r.personality_type_id
    where pt.assessment_id = v_session.assessment_id
    group by r.personality_type_id, r.priority
    having count(*) = count(*) filter (
      where
        (r.operator = 'gte' and tds.normalized_score >= r.threshold_value) or
        (r.operator = 'gt'  and tds.normalized_score >  r.threshold_value) or
        (r.operator = 'lte' and tds.normalized_score <= r.threshold_value) or
        (r.operator = 'lt'  and tds.normalized_score <  r.threshold_value) or
        (r.operator = 'between' and tds.normalized_score between r.threshold_value and coalesce(r.secondary_threshold, 100))
    )
    order by r.priority desc
    limit 1
  loop
    v_chosen_type_id := v_rule.personality_type_id;
  end loop;

  -- Fallback if no specific rule met
  if v_chosen_type_id is null then
    v_chosen_type_id := v_default_type_id;
  end if;

  if v_chosen_type_id is null then
    raise exception 'No valid personality type found for assessment %', v_session.assessment_id;
  end if;

  -- 8. Atomic insertion of result
  v_result_id := gen_random_uuid();

  insert into public.assessment_results (
    id,
    session_id,
    user_id,
    assessment_id,
    personality_type_id,
    overall_score,
    completed_at
  ) values (
    v_result_id,
    p_session_id,
    v_session.user_id,
    v_session.assessment_id,
    v_chosen_type_id,
    v_overall_score,
    now()
  );

  -- 9. Insert dimension scores
  insert into public.assessment_result_dimensions (
    result_id,
    dimension_id,
    raw_score,
    normalized_score,
    percentile
  )
  select
    v_result_id,
    dimension_id,
    raw_score,
    normalized_score,
    null
  from temp_dim_scores;

  -- 10. Mark session completed & scored
  update public.assessment_sessions
  set
    status = 'scored',
    completed_at = now(),
    last_saved_at = now()
  where id = p_session_id;

  return v_result_id;
end;
$$;

-- Grant execution to authenticated users
grant execute on function public.submit_and_score_assessment(uuid) to authenticated;
