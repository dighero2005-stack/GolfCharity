-- Lottery MVP: subscription lottery core (apply in Supabase SQL editor or CLI)
-- Run after your existing tables: draws, scores, user_subscription, charities, user_charity
--
-- Requires `draws.id` to be uuid (Supabase default). If your draws.id is bigint, change
-- `p_draw_id` / `winnings.draw_id` types to match before running.

-- ── user_subscription: renewal tracking ─────────────────────────────────────
ALTER TABLE user_subscription
  ADD COLUMN IF NOT EXISTS renewal_date timestamptz;

COMMENT ON COLUMN user_subscription.renewal_date IS 'Next renewal / access valid until (end of day semantics in app)';

-- ── draws: month, type, publish state ─────────────────────────────────────
ALTER TABLE draws
  ADD COLUMN IF NOT EXISTS draw_month text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS draw_type text DEFAULT 'random';

COMMENT ON COLUMN draws.draw_month IS 'YYYY-MM for current cycle';
COMMENT ON COLUMN draws.draw_type IS 'random | algorithmic';

-- ── scores: optional play date (defaults to created_at in app if null) ─────
ALTER TABLE scores
  ADD COLUMN IF NOT EXISTS score_date date DEFAULT CURRENT_DATE;

-- ── jackpot rollover (singleton row id = 1) ───────────────────────────────
CREATE TABLE IF NOT EXISTS jackpot_pool (
  id int PRIMARY KEY CHECK (id = 1),
  amount numeric(14, 2) NOT NULL DEFAULT 0
);

INSERT INTO jackpot_pool (id, amount) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- ── winnings per draw / user ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS winnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  draw_id uuid,
  draw_month text NOT NULL,
  tier int NOT NULL CHECK (tier IN (3, 4, 5)),
  match_count int NOT NULL,
  amount numeric(14, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS winnings_user_idx ON winnings (user_id);
CREATE INDEX IF NOT EXISTS winnings_draw_idx ON winnings (draw_id);

ALTER TABLE winnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own winnings" ON winnings;
CREATE POLICY "Users read own winnings" ON winnings
  FOR SELECT USING (auth.uid() = user_id);

-- ── win claims (proof upload — extend later) ─────────────────────────────
CREATE TABLE IF NOT EXISTS win_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  winning_id uuid REFERENCES winnings (id) ON DELETE CASCADE,
  proof_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE win_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own claims" ON win_claims;
CREATE POLICY "Users read own claims" ON win_claims
  FOR SELECT USING (auth.uid() = user_id);

-- ── Calculate winners after a draw (SECURITY DEFINER bypasses RLS for inserts) ─
CREATE OR REPLACE FUNCTION public.calculate_draw_winners(p_draw_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d RECORD;
  draw_nums int[];
  total_pool numeric;
  active_count int;
  pool_5 numeric;
  pool_4 numeric;
  pool_3 numeric;
  current_jackpot numeric;
  cnt_5 int := 0;
  cnt_4 int := 0;
  cnt_3 int := 0;
  prize5 numeric := 0;
  prize4 numeric := 0;
  prize3 numeric := 0;
  uid uuid;
  match_cnt int;
  dm text;
BEGIN
  SELECT * INTO d FROM draws WHERE id = p_draw_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'draw not found';
  END IF;

  SELECT ARRAY(
    SELECT (jsonb_array_elements_text(d.numbers))::int
  ) INTO draw_nums;

  SELECT COUNT(*)::int INTO active_count
  FROM user_subscription us
  WHERE us.status = 'active'
    AND (us.renewal_date IS NULL OR us.renewal_date >= CURRENT_DATE);

  IF active_count < 1 THEN
    active_count := 1;
  END IF;

  total_pool := active_count * 5.0;
  pool_5 := total_pool * 0.40;
  pool_4 := total_pool * 0.35;
  pool_3 := total_pool * 0.25;

  SELECT amount INTO current_jackpot FROM jackpot_pool WHERE id = 1 FOR UPDATE;
  IF current_jackpot IS NULL THEN
    current_jackpot := 0;
  END IF;

  DELETE FROM winnings WHERE draw_id = p_draw_id;

  -- Count eligible winners per tier
  FOR uid IN
    SELECT us.user_id
    FROM user_subscription us
    WHERE us.status = 'active'
      AND (us.renewal_date IS NULL OR us.renewal_date >= CURRENT_DATE)
  LOOP
    IF (SELECT COUNT(*) FROM scores WHERE user_id = uid) < 5 THEN
      CONTINUE;
    END IF;

    SELECT COUNT(*)::int INTO match_cnt
    FROM unnest(draw_nums) AS n
    WHERE EXISTS (
      SELECT 1 FROM scores s WHERE s.user_id = uid AND s.score = n
    );

    IF match_cnt = 5 THEN
      cnt_5 := cnt_5 + 1;
    ELSIF match_cnt = 4 THEN
      cnt_4 := cnt_4 + 1;
    ELSIF match_cnt = 3 THEN
      cnt_3 := cnt_3 + 1;
    END IF;
  END LOOP;

  IF cnt_5 > 0 THEN
    prize5 := (pool_5 + current_jackpot) / cnt_5;
    UPDATE jackpot_pool SET amount = 0 WHERE id = 1;
  ELSE
    UPDATE jackpot_pool SET amount = amount + pool_5 WHERE id = 1;
  END IF;

  IF cnt_4 > 0 THEN
    prize4 := pool_4 / cnt_4;
  END IF;
  IF cnt_3 > 0 THEN
    prize3 := pool_3 / cnt_3;
  END IF;

  dm := COALESCE(d.draw_month, to_char(now(), 'YYYY-MM'));

  FOR uid IN
    SELECT us.user_id
    FROM user_subscription us
    WHERE us.status = 'active'
      AND (us.renewal_date IS NULL OR us.renewal_date >= CURRENT_DATE)
  LOOP
    IF (SELECT COUNT(*) FROM scores WHERE user_id = uid) < 5 THEN
      CONTINUE;
    END IF;

    SELECT COUNT(*)::int INTO match_cnt
    FROM unnest(draw_nums) AS n
    WHERE EXISTS (
      SELECT 1 FROM scores s WHERE s.user_id = uid AND s.score = n
    );

    IF match_cnt = 5 AND prize5 > 0 THEN
      INSERT INTO winnings (user_id, draw_id, draw_month, tier, match_count, amount, status)
      VALUES (uid, p_draw_id, dm, 5, match_cnt, prize5, 'pending');
    ELSIF match_cnt = 4 AND prize4 > 0 THEN
      INSERT INTO winnings (user_id, draw_id, draw_month, tier, match_count, amount, status)
      VALUES (uid, p_draw_id, dm, 4, match_cnt, prize4, 'pending');
    ELSIF match_cnt = 3 AND prize3 > 0 THEN
      INSERT INTO winnings (user_id, draw_id, draw_month, tier, match_count, amount, status)
      VALUES (uid, p_draw_id, dm, 3, match_cnt, prize3, 'pending');
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.calculate_draw_winners(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_draw_winners(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_draw_winners(uuid) TO service_role;
