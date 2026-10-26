-- posts の追加・削除に合わせて stories の集計情報を自動更新する

CREATE OR REPLACE FUNCTION public.sync_story_post_aggregates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  target_story_id bigint;
  new_posts_count integer;
  new_latest_post_id bigint;
  new_last_posted_at timestamptz;
BEGIN
  target_story_id := COALESCE(NEW.story_id, OLD.story_id);

  SELECT COUNT(*)::integer
  INTO new_posts_count
  FROM public.posts
  WHERE story_id = target_story_id;

  SELECT id, created_at
  INTO new_latest_post_id, new_last_posted_at
  FROM public.posts
  WHERE story_id = target_story_id
  ORDER BY sequence_no DESC
  LIMIT 1;

  UPDATE public.stories
  SET
    posts_count = new_posts_count,
    latest_post_id = new_latest_post_id,
    last_posted_at = new_last_posted_at,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = target_story_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS sync_story_post_aggregates_trigger
ON public.posts;

CREATE TRIGGER sync_story_post_aggregates_trigger
AFTER INSERT OR DELETE
ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.sync_story_post_aggregates();