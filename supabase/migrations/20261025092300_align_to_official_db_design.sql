  -- =============================================================================
  -- Re:lay: 現行スキーマ → Issue #1「DB設計（Re:lay）」への移行
  --
  -- このファイルは作成のみ。supabase db push / migration up は実行しないこと。
  -- _old テーブルと対応表は確認が終わるまで DROP しない。
  -- auth.users の id は変更しない。
  --
  -- トランザクションについて:
  --   supabase CLI は migration をファイル全体で1トランザクション実行する。
  --   途中 COMMIT すると保護が外れるため、このファイルには BEGIN/COMMIT を書かない。
  --   使う文はすべてトランザクション可能な DDL/DML のみ。
  --   SQL Editor で手動実行する場合のみ、先頭に BEGIN; 末尾に COMMIT; を付ける。
  -- =============================================================================

  -- -----------------------------------------------------------------------------
  -- 1. 依存している RLS と旧シグネチャの RPC を外す
  --    （テーブルリネーム後も関数が旧 posts を参照し続けないようにする）
  -- -----------------------------------------------------------------------------
  DROP POLICY IF EXISTS "Anyone can read story summaries" ON public.story_summaries;
  DROP POLICY IF EXISTS "Authenticated users can create own writing lock" ON public.story_writing_locks;
  DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
  DROP POLICY IF EXISTS "Authenticated users can create stories" ON public.stories;
  DROP POLICY IF EXISTS "Authenticated users can delete story summaries" ON public.story_summaries;
  DROP POLICY IF EXISTS "Authenticated users can insert story summaries" ON public.story_summaries;
  DROP POLICY IF EXISTS "Authenticated users can update story summaries" ON public.story_summaries;
  DROP POLICY IF EXISTS "Authors can delete latest own post" ON public.posts;
  DROP POLICY IF EXISTS "Authors can delete own stories" ON public.stories;
  DROP POLICY IF EXISTS "Authors can update latest own post" ON public.posts;
  DROP POLICY IF EXISTS "Authors can update own stories" ON public.stories;
  DROP POLICY IF EXISTS "Genres are viewable by everyone" ON public.genres;
  DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
  DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
  DROP POLICY IF EXISTS "Stories are viewable by everyone" ON public.stories;
  DROP POLICY IF EXISTS "Users can delete own writing lock" ON public.story_writing_locks;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own writing lock" ON public.story_writing_locks;
  DROP POLICY IF EXISTS "Writing locks are viewable by everyone" ON public.story_writing_locks;

  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

  DROP FUNCTION IF EXISTS public.acquire_story_writing_lock(uuid);
  DROP FUNCTION IF EXISTS public.can_delete_post(uuid);
  DROP FUNCTION IF EXISTS public.can_edit_post(uuid);
  DROP FUNCTION IF EXISTS public.handle_new_user();

  -- -----------------------------------------------------------------------------
  -- 2. 現行テーブルを _old へ退避（データは削除しない）
  -- -----------------------------------------------------------------------------
  ALTER TABLE public.story_writing_locks RENAME TO story_writing_locks_old;
  ALTER TABLE public.story_summaries RENAME TO story_summaries_old;
  ALTER TABLE public.posts RENAME TO posts_old;
  ALTER TABLE public.stories RENAME TO stories_old;
  ALTER TABLE public.profiles RENAME TO profiles_old;
  ALTER TABLE public.genres RENAME TO genres_old;

  -- 退避した旧テーブルは一般ユーザーからアクセスできないようにする
REVOKE ALL PRIVILEGES ON TABLE public.profiles_old FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.stories_old FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.posts_old FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.genres_old FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.story_writing_locks_old FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.story_summaries_old FROM anon, authenticated;

  -- 旧制約名が新しい同名テーブルと衝突しないようにリネーム
  ALTER TABLE public.genres_old RENAME CONSTRAINT genres_pkey TO genres_old_pkey;
  ALTER TABLE public.genres_old RENAME CONSTRAINT genres_name_key TO genres_old_name_key;
  ALTER TABLE public.posts_old RENAME CONSTRAINT posts_pkey TO posts_old_pkey;
  ALTER TABLE public.posts_old RENAME CONSTRAINT posts_story_id_position_key TO posts_old_story_id_position_key;
  ALTER TABLE public.posts_old
  RENAME CONSTRAINT posts_story_id_fkey
  TO posts_old_story_id_fkey;
  ALTER TABLE public.profiles_old RENAME CONSTRAINT profiles_pkey TO profiles_old_pkey;
  ALTER TABLE public.stories_old RENAME CONSTRAINT stories_pkey TO stories_old_pkey;
  ALTER TABLE public.story_summaries_old RENAME CONSTRAINT story_summaries_pkey TO story_summaries_old_pkey;
  ALTER TABLE public.story_summaries_old RENAME CONSTRAINT story_summaries_story_id_key TO story_summaries_old_story_id_key;
  ALTER TABLE public.story_writing_locks_old RENAME CONSTRAINT story_writing_locks_pkey TO story_writing_locks_old_pkey;

  -- -----------------------------------------------------------------------------
  -- 3. UUID → bigint / slug → genre id の対応表（確認完了まで残す）
  -- -----------------------------------------------------------------------------
  CREATE TABLE public.genre_id_map (
    old_slug text PRIMARY KEY,
    new_id bigint UNIQUE NOT NULL
  );

  CREATE TABLE public.story_id_map (
    old_id uuid PRIMARY KEY,
    new_id bigint UNIQUE NOT NULL
  );

  CREATE TABLE public.post_id_map (
    old_id uuid PRIMARY KEY,
    new_id bigint UNIQUE NOT NULL
  );

  COMMENT ON TABLE public.genre_id_map IS '移行用: 旧 genres.slug → 新 genres.id';
  COMMENT ON TABLE public.story_id_map IS '移行用: 旧 stories.id (uuid) → 新 stories.id (bigint)';
  COMMENT ON TABLE public.post_id_map IS '移行用: 旧 posts.id (uuid) → 新 posts.id (bigint)';

  -- -----------------------------------------------------------------------------
  -- 4. 正式設計のテーブルを作成（latest_post_id の FK は posts 作成後に張る）
  -- -----------------------------------------------------------------------------
  CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    name varchar(50) NOT NULL,
    email varchar(255) NOT NULL,
    icon_url text,
    bio text,
    role varchar(20) NOT NULL DEFAULT 'user',
    status varchar(20) NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_name_check CHECK (
      char_length(trim(both from name)) >= 1
      AND char_length(trim(both from name)) <= 50
    ),
    CONSTRAINT users_role_check CHECK (role IN ('user', 'admin')),
    CONSTRAINT users_status_check CHECK (status IN ('active', 'suspended', 'deleted'))
  );

  CREATE TABLE public.genres (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name varchar(50) NOT NULL,
    slug varchar(50) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT genres_name_key UNIQUE (name),
    CONSTRAINT genres_slug_key UNIQUE (slug)
  );

  CREATE TABLE public.stories (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    summary text,
    cover_image_url text,
    status varchar(20) NOT NULL DEFAULT 'published',
    latest_post_id bigint,
    posts_count integer NOT NULL DEFAULT 0,
    likes_count integer NOT NULL DEFAULT 0,
    bookmarks_count integer NOT NULL DEFAULT 0,
    last_posted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT stories_title_check CHECK (char_length(trim(both from title)) >= 1),
    CONSTRAINT stories_status_check CHECK (status IN ('draft', 'published', 'private', 'deleted')),
    CONSTRAINT stories_posts_count_check CHECK (posts_count >= 0),
    CONSTRAINT stories_likes_count_check CHECK (likes_count >= 0),
    CONSTRAINT stories_bookmarks_count_check CHECK (bookmarks_count >= 0)
  );

  CREATE TABLE public.posts (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    story_id bigint NOT NULL REFERENCES public.stories (id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    sequence_no integer NOT NULL,
    body text NOT NULL,
    image_url text,
    ai_prompt text,
    is_ai_assisted boolean NOT NULL DEFAULT false,
    status varchar(20) NOT NULL DEFAULT 'published',
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT posts_body_check CHECK (
      char_length(trim(both from body)) >= 1
      AND char_length(trim(both from body)) <= 400
    ),
    CONSTRAINT posts_sequence_no_check CHECK (sequence_no >= 1),
    CONSTRAINT posts_status_check CHECK (status IN ('published', 'hidden', 'deleted')),
    CONSTRAINT posts_story_id_sequence_no_key UNIQUE (story_id, sequence_no)
  );

  ALTER TABLE public.stories
    ADD CONSTRAINT stories_latest_post_id_fkey
    FOREIGN KEY (latest_post_id) REFERENCES public.posts (id) ON DELETE SET NULL;

  CREATE TABLE public.story_genres (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    story_id bigint NOT NULL REFERENCES public.stories (id) ON DELETE CASCADE,
    genre_id bigint NOT NULL REFERENCES public.genres (id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT story_genres_story_id_genre_id_key UNIQUE (story_id, genre_id)
  );

  CREATE TABLE public.story_likes (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    story_id bigint NOT NULL REFERENCES public.stories (id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT story_likes_user_id_story_id_key UNIQUE (user_id, story_id)
  );

  CREATE TABLE public.bookmarks (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    story_id bigint NOT NULL REFERENCES public.stories (id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bookmarks_user_id_story_id_key UNIQUE (user_id, story_id)
  );

  CREATE TABLE public.comments (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    story_id bigint NOT NULL REFERENCES public.stories (id) ON DELETE CASCADE,
    post_id bigint REFERENCES public.posts (id) ON DELETE SET NULL,
    user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    body text NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'published',
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT comments_body_check CHECK (char_length(trim(both from body)) >= 1),
    CONSTRAINT comments_status_check CHECK (status IN ('published', 'hidden', 'deleted'))
  );

  CREATE TABLE public.notifications (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    actor_user_id uuid REFERENCES public.users (id) ON DELETE SET NULL,
    type varchar(50) NOT NULL,
    story_id bigint REFERENCES public.stories (id) ON DELETE SET NULL,
    post_id bigint REFERENCES public.posts (id) ON DELETE SET NULL,
    comment_id bigint REFERENCES public.comments (id) ON DELETE SET NULL,
    message varchar(255),
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  
-- TODO:
-- Issue #1 の正式設計では reports.target_id は bigint だが、
-- target_type には 'user' も含まれている。
-- users.id は uuid のため、user 通報だけ target_id に格納できない。
-- 今回は正式設計を優先して bigint のまま維持し、
-- 通報機能を実装する際に設計を見直す。
  CREATE TABLE public.reports (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    reporter_user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    target_type varchar(20) NOT NULL,
    target_id bigint NOT NULL,
    reason varchar(255) NOT NULL,
    detail text,
    status varchar(20) NOT NULL DEFAULT 'open',
    handled_by uuid REFERENCES public.users (id) ON DELETE SET NULL,
    handled_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reports_target_type_check CHECK (target_type IN ('story', 'post', 'comment', 'user')),
    CONSTRAINT reports_status_check CHECK (status IN ('open', 'reviewing', 'resolved', 'rejected'))
  );

  -- 正式設計にないが必要な機能として維持
  CREATE TABLE public.story_writing_locks (
    story_id bigint PRIMARY KEY REFERENCES public.stories (id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE public.story_summaries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id bigint NOT NULL UNIQUE REFERENCES public.stories (id) ON DELETE CASCADE,
    summary text NOT NULL,
    summarized_until_position integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT story_summaries_summarized_until_position_check CHECK (summarized_until_position >= 1)
  );

  CREATE INDEX stories_user_id_idx ON public.stories (user_id);
  CREATE INDEX stories_status_idx ON public.stories (status);
  CREATE INDEX stories_last_posted_at_idx ON public.stories (last_posted_at);
  CREATE INDEX posts_story_id_idx ON public.posts (story_id);
  CREATE INDEX posts_user_id_idx ON public.posts (user_id);
  CREATE INDEX story_genres_genre_id_idx ON public.story_genres (genre_id);
  CREATE INDEX comments_story_id_idx ON public.comments (story_id);
  CREATE INDEX notifications_user_id_idx ON public.notifications (user_id, is_read);
  CREATE INDEX reports_status_idx ON public.reports (status);

  -- -----------------------------------------------------------------------------
  -- 5. データ移行（対応表を使って UUID / slug を新 ID に付け替える）
  -- -----------------------------------------------------------------------------

  -- 5-1. profiles → users（id は auth.users と同じ UUID のまま）
  INSERT INTO public.users (
    id,
    name,
    email,
    icon_url,
    bio,
    role,
    status,
    created_at,
    updated_at
  )
  SELECT
    p.id,
   coalesce(
  nullif(left(trim(p.display_name), 50), ''),
  '名無し'
),
    coalesce(nullif(au.email, ''), 'unknown+' || p.id::text || '@local'),
    NULL,
    NULL,
    'user',
    'active',
    p.created_at,
    p.created_at
  FROM public.profiles_old p
  INNER JOIN auth.users au ON au.id = p.id;

  -- プロフィール行が無い auth ユーザーも users に載せる
  INSERT INTO public.users (
    id,
    name,
    email,
    role,
    status,
    created_at,
    updated_at
  )
  SELECT
    au.id,
    coalesce(
      nullif(
        left(trim(au.raw_user_meta_data ->> 'display_name'), 50),
        ''
      ),
      '名無し'
    ),
    coalesce(nullif(au.email, ''), 'unknown+' || au.id::text || '@local'),
    'user',
    'active',
    coalesce(au.created_at, CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = au.id
  );

  -- 5-2. genres（slug を保持しつつ新しい bigint id を採番）
  INSERT INTO public.genres (
    name,
    slug,
    sort_order,
    is_active,
    created_at,
    updated_at
  )
  SELECT
    g.name,
    g.slug,
    g.sort_order,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  FROM public.genres_old g
  ORDER BY g.sort_order, g.slug;

  INSERT INTO public.genre_id_map (old_slug, new_id)
  SELECT
    g_old.slug,
    g_new.id
  FROM public.genres_old g_old
  INNER JOIN public.genres g_new ON g_new.slug = g_old.slug;

  -- 5-3. stories（1行ずつ入れて old uuid と new bigint を対応表へ）
  DO $$
  DECLARE
    story_row public.stories_old%ROWTYPE;
    new_story_id bigint;
  BEGIN
    FOR story_row IN
      SELECT *
      FROM public.stories_old
      ORDER BY created_at, id
    LOOP
      INSERT INTO public.stories (
        user_id,
        title,
        summary,
        cover_image_url,
        status,
        latest_post_id,
        posts_count,
        likes_count,
        bookmarks_count,
        last_posted_at,
        created_at,
        updated_at
      )
      VALUES (
        story_row.author_id,
        story_row.title,
        story_row.synopsis,
        NULL,
        'published',
        NULL,
        0,
        0,
        0,
        NULL,
        story_row.created_at,
        story_row.created_at
      )
      RETURNING id INTO new_story_id;

      INSERT INTO public.story_id_map (old_id, new_id)
      VALUES (story_row.id, new_story_id);
    END LOOP;
  END
  $$;

  -- 5-4. posts
  DO $$
  DECLARE
    post_row public.posts_old%ROWTYPE;
    new_post_id bigint;
    new_story_id bigint;
  BEGIN
    FOR post_row IN
      SELECT *
      FROM public.posts_old
      ORDER BY created_at, id
    LOOP
      SELECT m.new_id
      INTO STRICT new_story_id
      FROM public.story_id_map m
      WHERE m.old_id = post_row.story_id;

      INSERT INTO public.posts (
        story_id,
        user_id,
        sequence_no,
        body,
        image_url,
        ai_prompt,
        is_ai_assisted,
        status,
        created_at,
        updated_at
      )
      VALUES (
        new_story_id,
        post_row.author_id,
        post_row.position,
        post_row.body,
        NULL,
        NULL,
        false,
        'published',
        post_row.created_at,
        post_row.created_at
      )
      RETURNING id INTO new_post_id;

      INSERT INTO public.post_id_map (old_id, new_id)
      VALUES (post_row.id, new_post_id);
    END LOOP;
  END
  $$;

  -- 5-5. 旧 genre_slug → story_genres
  INSERT INTO public.story_genres (story_id, genre_id, created_at)
  SELECT
    sm.new_id,
    gm.new_id,
    so.created_at
  FROM public.stories_old so
  INNER JOIN public.story_id_map sm ON sm.old_id = so.id
  INNER JOIN public.genre_id_map gm ON gm.old_slug = so.genre_slug;

  -- 5-6. 集計列（posts_count / latest_post_id / last_posted_at）
  UPDATE public.stories s
  SET
    posts_count = agg.posts_count,
    latest_post_id = agg.latest_post_id,
    last_posted_at = agg.last_posted_at,
    updated_at = s.updated_at
  FROM (
    SELECT
      p.story_id,
      count(*)::integer AS posts_count,
      max(p.created_at) AS last_posted_at,
      (
        SELECT p2.id
        FROM public.posts p2
        WHERE p2.story_id = p.story_id
        ORDER BY p2.sequence_no DESC
        LIMIT 1
      ) AS latest_post_id
    FROM public.posts p
    GROUP BY p.story_id
  ) agg
  WHERE s.id = agg.story_id;

  -- 5-7. 執筆ロック（story_id を新 bigint へ）
  INSERT INTO public.story_writing_locks (
    story_id,
    user_id,
    expires_at,
    created_at
  )
  SELECT
    sm.new_id,
    l.user_id,
    l.expires_at,
    l.created_at
  FROM public.story_writing_locks_old l
  INNER JOIN public.story_id_map sm ON sm.old_id = l.story_id;

  -- 5-8. 要約（id は uuid のまま、story_id だけ付け替え）
  INSERT INTO public.story_summaries (
    id,
    story_id,
    summary,
    summarized_until_position,
    created_at,
    updated_at
  )
  SELECT
    ss.id,
    sm.new_id,
    ss.summary,
    ss.summarized_until_position,
    ss.created_at,
    ss.updated_at
  FROM public.story_summaries_old ss
  INNER JOIN public.story_id_map sm ON sm.old_id = ss.story_id;

  -- -----------------------------------------------------------------------------
  -- 6. RPC（bigint / user_id / sequence_no）
  -- -----------------------------------------------------------------------------
  CREATE FUNCTION public.acquire_story_writing_lock(p_story_id bigint)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $$
  BEGIN
    IF auth.uid() IS NULL THEN
      RETURN false;
    END IF;

    INSERT INTO public.story_writing_locks (
      story_id,
      user_id,
      expires_at
    )
    VALUES (
      p_story_id,
      auth.uid(),
      now() + interval '10 minutes'
    )
    ON CONFLICT (story_id)
    DO UPDATE
    SET
      user_id = excluded.user_id,
      expires_at = excluded.expires_at
    WHERE
      public.story_writing_locks.expires_at < now()
      OR public.story_writing_locks.user_id = auth.uid();

    RETURN found;
  END;
  $$;

  CREATE FUNCTION public.can_edit_post(p_post_id bigint)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
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

  CREATE FUNCTION public.can_delete_post(p_post_id bigint)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
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

  -- -----------------------------------------------------------------------------
  -- 7. 新規登録トリガー（public.users を作成）
  --    アプリ移行期間中は name / display_name の両方のメタデータを受け付ける
  -- -----------------------------------------------------------------------------
  CREATE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $$
  BEGIN
    INSERT INTO public.users (
      id,
      name,
      email,
      role,
      status
    )
    VALUES (
      NEW.id,
      coalesce(
        nullif(left(trim(NEW.raw_user_meta_data ->> 'name'), 50), ''),
        nullif(left(trim(NEW.raw_user_meta_data ->> 'display_name'), 50), ''),
        '名無し'
      ),
      coalesce(nullif(NEW.email, ''), 'unknown+' || NEW.id::text || '@local'),
      'user',
      'active'
    );

    RETURN NEW;
  END;
  $$;

  CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

  -- -----------------------------------------------------------------------------
  -- 8. 権限
  -- -----------------------------------------------------------------------------
  GRANT ALL ON FUNCTION public.acquire_story_writing_lock(bigint) TO anon, authenticated, service_role;
  GRANT ALL ON FUNCTION public.can_delete_post(bigint) TO anon, authenticated, service_role;
  GRANT ALL ON FUNCTION public.can_edit_post(bigint) TO anon, authenticated, service_role;
  GRANT ALL ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;

  -- users:
-- 一般ユーザーには公開プロフィール情報だけ見せる
REVOKE ALL PRIVILEGES ON TABLE public.users FROM anon, authenticated;

GRANT SELECT (
  id,
  name,
  icon_url,
  bio,
  created_at,
  updated_at
) ON TABLE public.users TO anon, authenticated;

-- ログインユーザーが変更できるのはプロフィール項目だけ
GRANT UPDATE (
  name,
  icon_url,
  bio,
  updated_at
) ON TABLE public.users TO authenticated;

-- service_role はサーバー側処理用なので全権限
GRANT ALL PRIVILEGES ON TABLE public.users TO service_role;
  GRANT ALL ON TABLE public.genres TO anon, authenticated, service_role;
  GRANT ALL ON TABLE public.stories TO anon, authenticated, service_role;
  GRANT ALL ON TABLE public.posts TO anon, authenticated, service_role;
  GRANT ALL ON TABLE public.story_genres TO anon, authenticated, service_role;
  GRANT ALL ON TABLE public.story_likes TO anon, authenticated, service_role;
  GRANT ALL ON TABLE public.bookmarks TO anon, authenticated, service_role;
  GRANT ALL ON TABLE public.comments TO anon, authenticated, service_role;
  GRANT ALL ON TABLE public.notifications TO anon, authenticated, service_role;
  GRANT ALL ON TABLE public.reports TO anon, authenticated, service_role;
  GRANT ALL ON TABLE public.story_writing_locks TO anon, authenticated, service_role;
  GRANT ALL ON TABLE public.story_summaries TO anon, authenticated, service_role;

  GRANT ALL ON TABLE public.genre_id_map TO postgres, service_role;
  GRANT ALL ON TABLE public.story_id_map TO postgres, service_role;
  GRANT ALL ON TABLE public.post_id_map TO postgres, service_role;
  REVOKE ALL ON TABLE public.genre_id_map FROM anon, authenticated;
  REVOKE ALL ON TABLE public.story_id_map FROM anon, authenticated;
  REVOKE ALL ON TABLE public.post_id_map FROM anon, authenticated;

  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

  -- -----------------------------------------------------------------------------
  -- 9. RLS（新しいテーブル名・カラム名に合わせる）
  -- -----------------------------------------------------------------------------
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.story_genres ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.story_writing_locks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.story_summaries ENABLE ROW LEVEL SECURITY;

  ALTER TABLE public.genre_id_map ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.story_id_map ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.post_id_map ENABLE ROW LEVEL SECURITY;

  -- users
  CREATE POLICY "Users are viewable by everyone"
    ON public.users
    FOR SELECT
    USING (true);

  CREATE POLICY "Users can update own row"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

  -- genres
  CREATE POLICY "Genres are viewable by everyone"
    ON public.genres
    FOR SELECT
    USING (true);

  -- stories
  CREATE POLICY "Stories are viewable by everyone"
  ON public.stories
  FOR SELECT
  USING (
    status = 'published'
    OR user_id = (SELECT auth.uid())
  );

  CREATE POLICY "Authenticated users can create stories"
    ON public.stories
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

  CREATE POLICY "Authors can update own stories"
    ON public.stories
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

  CREATE POLICY "Authors can delete own stories"
    ON public.stories
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

  -- posts
  CREATE POLICY "Posts are viewable by everyone"
  ON public.posts
  FOR SELECT
  USING (
    (
      status = 'published'
      AND EXISTS (
        SELECT 1
        FROM public.stories s
        WHERE s.id = story_id
          AND s.status = 'published'
      )
    )
    OR user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.stories s
      WHERE s.id = story_id
        AND s.user_id = (SELECT auth.uid())
    )
  );

  CREATE POLICY "Authenticated users can create posts"
    ON public.posts
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

  CREATE POLICY "Authors can update latest own post"
    ON public.posts
    FOR UPDATE
    TO authenticated
    USING (public.can_edit_post(id))
    WITH CHECK (public.can_edit_post(id));

  CREATE POLICY "Authors can delete latest own post"
    ON public.posts
    FOR DELETE
    TO authenticated
    USING (public.can_delete_post(id));

  -- story_genres
  CREATE POLICY "Story genres are viewable by everyone"
    ON public.story_genres
    FOR SELECT
    USING (true);

  CREATE POLICY "Story owners can insert story genres"
    ON public.story_genres
    FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.stories s
        WHERE s.id = story_id
          AND s.user_id = (SELECT auth.uid())
      )
    );

  CREATE POLICY "Story owners can delete story genres"
    ON public.story_genres
    FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.stories s
        WHERE s.id = story_id
          AND s.user_id = (SELECT auth.uid())
      )
    );

  -- story_likes
  CREATE POLICY "Story likes are viewable by everyone"
    ON public.story_likes
    FOR SELECT
    USING (true);

  CREATE POLICY "Users can insert own story likes"
    ON public.story_likes
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

  CREATE POLICY "Users can delete own story likes"
    ON public.story_likes
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

  -- bookmarks
  CREATE POLICY "Users can view own bookmarks"
    ON public.bookmarks
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

  CREATE POLICY "Users can insert own bookmarks"
    ON public.bookmarks
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

  CREATE POLICY "Users can delete own bookmarks"
    ON public.bookmarks
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

  -- comments
  CREATE POLICY "Comments are viewable by everyone"
  ON public.comments
  FOR SELECT
  USING (
    (
      status = 'published'
      AND EXISTS (
        SELECT 1
        FROM public.stories s
        WHERE s.id = story_id
          AND s.status = 'published'
      )
    )
    OR user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.stories s
      WHERE s.id = story_id
        AND s.user_id = (SELECT auth.uid())
    )
  );

  CREATE POLICY "Authenticated users can create comments"
    ON public.comments
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

  CREATE POLICY "Users can update own comments"
    ON public.comments
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

  CREATE POLICY "Users can delete own comments"
    ON public.comments
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

  -- notifications
  CREATE POLICY "Users can view own notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

  CREATE POLICY "Users can update own notifications"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

  -- reports
  CREATE POLICY "Users can insert own reports"
    ON public.reports
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = reporter_user_id);

 CREATE POLICY "Users can view own reports"
  ON public.reports
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = reporter_user_id
  );

  -- story_writing_locks
  CREATE POLICY "Writing locks are viewable by everyone"
    ON public.story_writing_locks
    FOR SELECT
    USING (true);

  CREATE POLICY "Authenticated users can create own writing lock"
    ON public.story_writing_locks
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

  CREATE POLICY "Users can update own writing lock"
    ON public.story_writing_locks
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

  CREATE POLICY "Users can delete own writing lock"
    ON public.story_writing_locks
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

  -- story_summaries（現行と同じくログインユーザーなら要約の作成・更新・削除可）
  CREATE POLICY "Story summaries follow story visibility"
  ON public.story_summaries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.stories s
      WHERE s.id = story_id
        AND (
          s.status = 'published'
          OR s.user_id = (SELECT auth.uid())
        )
    )
  );

  CREATE POLICY "Authenticated users can insert story summaries"
    ON public.story_summaries
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Authenticated users can update story summaries"
    ON public.story_summaries
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "Authenticated users can delete story summaries"
    ON public.story_summaries
    FOR DELETE
    TO authenticated
    USING (true);

