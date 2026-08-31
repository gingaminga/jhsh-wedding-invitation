alter table public.attendance_survey_responses
  add column if not exists side text;

alter table public.attendance_survey_responses
  drop constraint if exists attendance_survey_responses_side_check;

alter table public.attendance_survey_responses
  add constraint attendance_survey_responses_side_check
  check (side in ('groom', 'bride'));

comment on column public.attendance_survey_responses.side is
  '하객 구분: groom(신랑측), bride(신부측)';
