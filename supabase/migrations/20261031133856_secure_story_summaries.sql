-- =============================================================================
-- story_summaries の書き込みをサーバー側だけに制限する
-- =============================================================================

-- 一般ユーザー向けの書き込みポリシーを削除
DROP POLICY IF EXISTS
  "Authenticated users can insert story summaries"
  ON public.story_summaries;

DROP POLICY IF EXISTS
  "Authenticated users can update story summaries"
  ON public.story_summaries;

DROP POLICY IF EXISTS
  "Authenticated users can delete story summaries"
  ON public.story_summaries;

-- RLSだけでなく、テーブル権限自体も読み取りのみに絞る
REVOKE INSERT, UPDATE, DELETE
ON TABLE public.story_summaries
FROM anon, authenticated;

GRANT SELECT
ON TABLE public.story_summaries
TO anon, authenticated;

-- サーバー専用のsecret/service_roleは書き込み可能
GRANT ALL
ON TABLE public.story_summaries
TO service_role;


-- =============================================================================
-- 節を削除した際、整合性が崩れるAI要約をDB側で自動削除する
-- =============================================================================

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