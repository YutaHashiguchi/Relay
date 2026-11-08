-- 編集・削除で共通して使う
-- 「自分が投稿した最新Postか」を判定する関数に統合する

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