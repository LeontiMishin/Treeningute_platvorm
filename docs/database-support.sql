CREATE INDEX IF NOT EXISTS users_rolecode_idx
  ON treeningute_platvorm.users(rolecode);

CREATE INDEX IF NOT EXISTS users_accountstatus_idx
  ON treeningute_platvorm.users(accountstatus);

CREATE INDEX IF NOT EXISTS videos_trainerid_categoryid_idx
  ON treeningute_platvorm.videos(trainerid, categoryid);

CREATE INDEX IF NOT EXISTS videos_accesstier_publishedat_idx
  ON treeningute_platvorm.videos(accesstier, publishedat);

CREATE INDEX IF NOT EXISTS user_subscriptions_userid_status_idx
  ON treeningute_platvorm.user_subscriptions(userid, status);

CREATE INDEX IF NOT EXISTS workout_completions_userid_completedat_idx
  ON treeningute_platvorm.workout_completions(userid, completedat);

CREATE INDEX IF NOT EXISTS workout_completions_videoid_completedat_idx
  ON treeningute_platvorm.workout_completions(videoid, completedat);

CREATE OR REPLACE VIEW treeningute_platvorm.member_access_overview AS
SELECT
  u.userid,
  u.name,
  u.email,
  u.rolecode,
  us.usersubscriptionid,
  sp.planname,
  sp.accesstier,
  us.startdate,
  us.enddate,
  us.status
FROM treeningute_platvorm.users u
LEFT JOIN LATERAL (
  SELECT us_inner.*
  FROM treeningute_platvorm.user_subscriptions us_inner
  WHERE us_inner.userid = u.userid
    AND us_inner.status = 'ACTIVE'
  ORDER BY us_inner.startdate DESC, us_inner.usersubscriptionid DESC
  LIMIT 1
) us ON TRUE
LEFT JOIN treeningute_platvorm.subscription_plans sp ON sp.planid = us.planid;

CREATE OR REPLACE VIEW treeningute_platvorm.member_progress_snapshot AS
SELECT
  u.userid,
  u.name,
  COUNT(DISTINCT wc.videoid) AS workouts_completed,
  COALESCE(AVG(wc.rating::numeric), 0) AS avg_rating,
  MAX(wc.completedat) AS last_completed_at
FROM treeningute_platvorm.users u
LEFT JOIN treeningute_platvorm.workout_completions wc ON wc.userid = u.userid
GROUP BY u.userid, u.name;

CREATE OR REPLACE VIEW treeningute_platvorm.trainer_program_overview AS
SELECT
  t.trainerid,
  t.trainername,
  COUNT(DISTINCT v.videoid) AS video_count,
  COUNT(wc.workoutcompletionid) AS completion_count
FROM treeningute_platvorm.trainers t
LEFT JOIN treeningute_platvorm.videos v ON v.trainerid = t.trainerid
LEFT JOIN treeningute_platvorm.workout_completions wc ON wc.videoid = v.videoid
GROUP BY t.trainerid, t.trainername;

CREATE OR REPLACE VIEW treeningute_platvorm.trainer_video_catalog AS
SELECT
  t.trainerid,
  t.trainername,
  v.videoid,
  v.title,
  v.accesstier,
  c.categoryname
FROM treeningute_platvorm.trainers t
JOIN treeningute_platvorm.videos v ON v.trainerid = t.trainerid
LEFT JOIN treeningute_platvorm.categories c ON c.categoryid = v.categoryid;

CREATE OR REPLACE VIEW treeningute_platvorm.admin_revenue_summary AS
SELECT
  sp.planid,
  sp.planname,
  COUNT(us.usersubscriptionid) AS subscription_count,
  COALESCE(SUM(sp.price), 0) AS estimated_revenue
FROM treeningute_platvorm.subscription_plans sp
LEFT JOIN treeningute_platvorm.user_subscriptions us ON us.planid = sp.planid
GROUP BY sp.planid, sp.planname;

CREATE OR REPLACE VIEW treeningute_platvorm.admin_content_quality AS
SELECT
  v.videoid,
  v.title,
  c.categoryname,
  CASE
    WHEN COALESCE(NULLIF(BTRIM(v.equipment), ''), '') <> '' THEN TRUE
    ELSE FALSE
  END AS has_equipment_info,
  CHAR_LENGTH(COALESCE(v.shortdescription, '')) AS description_length
FROM treeningute_platvorm.videos v
LEFT JOIN treeningute_platvorm.categories c ON c.categoryid = v.categoryid;

CREATE OR REPLACE FUNCTION public.tr_subscription_startdate()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.startdate IS NULL THEN
    NEW.startdate := CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.tr_subscription_enddate()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  months_count integer;
BEGIN
  SELECT durationmonths
    INTO months_count
  FROM treeningute_platvorm.subscription_plans
  WHERE planid = NEW.planid;

  IF NEW.startdate IS NULL THEN
    NEW.startdate := CURRENT_DATE;
  END IF;

  IF NEW.enddate IS NULL AND months_count IS NOT NULL THEN
    NEW.enddate := (NEW.startdate + make_interval(months => months_count))::date;
  END IF;

  IF NEW.status IS NULL THEN
    NEW.status := 'ACTIVE';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_create_subscription(
  p_user_id integer,
  p_plan_id integer,
  p_start_date timestamptz DEFAULT NULL,
  p_auto_renew boolean DEFAULT false
)
RETURNS integer
LANGUAGE plpgsql
AS $function$
DECLARE
  v_subscription_id integer;
BEGIN
  UPDATE treeningute_platvorm.user_subscriptions
  SET status = 'SUPERSEDED',
      autorenew = false
  WHERE userid = p_user_id
    AND status = 'ACTIVE';

  INSERT INTO treeningute_platvorm.user_subscriptions(userid, planid, startdate, autorenew, status)
  VALUES (p_user_id, p_plan_id, p_start_date, COALESCE(p_auto_renew, false), 'ACTIVE')
  RETURNING usersubscriptionid INTO v_subscription_id;

  RETURN v_subscription_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_mark_workout_completed(
  p_user_id integer,
  p_video_id integer,
  p_seconds_watched integer DEFAULT NULL,
  p_rating integer DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
AS $function$
DECLARE
  v_completion_id integer;
BEGIN
  INSERT INTO treeningute_platvorm.workout_completions(userid, videoid, secondswatched, rating, note)
  VALUES (p_user_id, p_video_id, p_seconds_watched, p_rating, p_note)
  RETURNING workoutcompletionid INTO v_completion_id;

  RETURN v_completion_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_total_workouts_completed(
  p_user_id integer
)
RETURNS integer
LANGUAGE plpgsql
AS $function$
DECLARE
  v_total integer;
BEGIN
  SELECT COUNT(*)
  INTO v_total
  FROM treeningute_platvorm.workout_completions
  WHERE userid = p_user_id;

  RETURN COALESCE(v_total, 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_create_playlist(
  p_user_id integer,
  p_playlist_name text
)
RETURNS integer
LANGUAGE plpgsql
AS $function$
DECLARE
  v_playlist_id integer;
BEGIN
  IF TRIM(p_playlist_name) = '' THEN
    RAISE EXCEPTION 'Playlist name cannot be empty';
  END IF;

  INSERT INTO treeningute_platvorm.playlists(playlistname, userid)
  VALUES (p_playlist_name, p_user_id)
  RETURNING playlistid INTO v_playlist_id;

  RETURN v_playlist_id;
END;
$function$;

DROP TRIGGER IF EXISTS trg_subscription_startdate ON treeningute_platvorm.user_subscriptions;
CREATE TRIGGER trg_subscription_startdate
BEFORE INSERT ON treeningute_platvorm.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.tr_subscription_startdate();

DROP TRIGGER IF EXISTS trg_subscription_enddate ON treeningute_platvorm.user_subscriptions;
CREATE TRIGGER trg_subscription_enddate
BEFORE INSERT OR UPDATE ON treeningute_platvorm.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.tr_subscription_enddate();
