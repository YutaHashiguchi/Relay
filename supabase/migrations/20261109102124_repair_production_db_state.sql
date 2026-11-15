-- =========================================================
-- posts: 編集・削除権限関数を is_latest_own_post に統一
-- =========================================================

DROP POLICY IF EXISTS
  "Authors can update latest own post"
  ON public.posts;

DROP POLICY IF EXISTS
  "Authors can delete latest own post"
  ON public.posts;

CREATE OR REPLACE FUNCTION public.is_latest_own_post(p_post_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = p_post_id
      AND p.user_id = auth.uid()
      AND NOT EXISTS (
        SELECT 1
        FROM public.posts later_post
        WHERE later_post.story_id = p.story_id
          AND later_post.sequence_no > p.sequence_no
      )
  );
$$;

REVOKE ALL
ON FUNCTION public.is_latest_own_post(bigint)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.is_latest_own_post(bigint)
TO authenticated, service_role;

CREATE POLICY "Authors can update latest own post"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (public.is_latest_own_post(id))
  WITH CHECK (public.is_latest_own_post(id));

CREATE POLICY "Authors can delete latest own post"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (public.is_latest_own_post(id));

DROP FUNCTION IF EXISTS public.can_edit_post(bigint);
DROP FUNCTION IF EXISTS public.can_delete_post(bigint);


-- =========================================================
-- story_summaries: 一般ユーザーの書き込みを禁止
-- =========================================================

DROP POLICY IF EXISTS
  "Authenticated users can insert story summaries"
  ON public.story_summaries;

DROP POLICY IF EXISTS
  "Authenticated users can update story summaries"
  ON public.story_summaries;

DROP POLICY IF EXISTS
  "Authenticated users can delete story summaries"
  ON public.story_summaries;

REVOKE INSERT, UPDATE, DELETE
ON TABLE public.story_summaries
FROM anon, authenticated;

GRANT SELECT
ON TABLE public.story_summaries
TO anon, authenticated;

GRANT ALL
ON TABLE public.story_summaries
TO service_role;


-- =========================================================
-- Post削除時に古いAI要約を自動削除
-- =========================================================

CREATE OR REPLACE FUNCTION public.delete_stale_story_summary_after_post_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.story_summaries
  WHERE story_id = OLD.story_id
    AND summarized_until_position >= OLD.sequence_no;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS
  delete_stale_story_summary_after_post_delete_trigger
  ON public.posts;

CREATE TRIGGER delete_stale_story_summary_after_post_delete_trigger
AFTER DELETE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.delete_stale_story_summary_after_post_delete();