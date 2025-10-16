-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the daily email function to run at 9 AM UTC every day
SELECT cron.schedule(
  'send-daily-emails',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://zqafrgxiaykuzqedfzao.supabase.co/functions/v1/send-daily-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYWZyZ3hpYXlrdXpxZWRmemFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDE3MTUsImV4cCI6MjA3NjE3NzcxNX0.UNQ4hJZOWJ_Tl_nASFnUvm6GYGzFgbkcLkA4_0gkWi8"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);