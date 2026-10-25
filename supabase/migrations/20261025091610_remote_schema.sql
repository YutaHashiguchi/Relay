


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."acquire_story_writing_lock"("p_story_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if auth.uid() is null then
    return false;
  end if;

  insert into public.story_writing_locks (
    story_id,
    user_id,
    expires_at
  )
  values (
    p_story_id,
    auth.uid(),
    now() + interval '10 minutes'
  )
  on conflict (story_id)
  do update
  set
    user_id = excluded.user_id,
    expires_at = excluded.expires_at
  where
    public.story_writing_locks.expires_at < now()
    or public.story_writing_locks.user_id = auth.uid();

  return found;
end;
$$;


ALTER FUNCTION "public"."acquire_story_writing_lock"("p_story_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_delete_post"("p_post_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.posts p
    where p.id = p_post_id
      and p.author_id = auth.uid()
      and not exists (
        select 1
        from public.posts later_post
        where later_post.story_id = p.story_id
          and later_post.position > p.position
      )
  );
$$;


ALTER FUNCTION "public"."can_delete_post"("p_post_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_edit_post"("p_post_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.posts p
    where p.id = p_post_id
      and p.author_id = auth.uid()
      and not exists (
        select 1
        from public.posts later_post
        where later_post.story_id = p.story_id
          and later_post.position > p.position
      )
  );
$$;


ALTER FUNCTION "public"."can_edit_post"("p_post_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (
    id,
    display_name
  )
  values (
    new.id,
    coalesce(
      nullif(
        left(
          trim(
            new.raw_user_meta_data ->> 'display_name'
          ),
          30
        ),
        ''
      ),
      '名無し'
    )
  );

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."genres" (
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."genres" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "position" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "posts_body_check" CHECK ((("char_length"(TRIM(BOTH FROM "body")) >= 1) AND ("char_length"(TRIM(BOTH FROM "body")) <= 400))),
    CONSTRAINT "posts_position_check" CHECK (("position" >= 1))
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "display_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "profiles_display_name_check" CHECK ((("char_length"(TRIM(BOTH FROM "display_name")) >= 1) AND ("char_length"(TRIM(BOTH FROM "display_name")) <= 30)))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "synopsis" "text",
    "genre_slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "stories_synopsis_check" CHECK ((("synopsis" IS NULL) OR ("char_length"("synopsis") <= 200))),
    CONSTRAINT "stories_title_check" CHECK ((("char_length"(TRIM(BOTH FROM "title")) >= 1) AND ("char_length"(TRIM(BOTH FROM "title")) <= 80)))
);


ALTER TABLE "public"."stories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."story_summaries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "summary" "text" NOT NULL,
    "summarized_until_position" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."story_summaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."story_writing_locks" (
    "story_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."story_writing_locks" OWNER TO "postgres";


ALTER TABLE ONLY "public"."genres"
    ADD CONSTRAINT "genres_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."genres"
    ADD CONSTRAINT "genres_pkey" PRIMARY KEY ("slug");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_story_id_position_key" UNIQUE ("story_id", "position");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_summaries"
    ADD CONSTRAINT "story_summaries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_summaries"
    ADD CONSTRAINT "story_summaries_story_id_key" UNIQUE ("story_id");



ALTER TABLE ONLY "public"."story_writing_locks"
    ADD CONSTRAINT "story_writing_locks_pkey" PRIMARY KEY ("story_id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_genre_slug_fkey" FOREIGN KEY ("genre_slug") REFERENCES "public"."genres"("slug");



ALTER TABLE ONLY "public"."story_summaries"
    ADD CONSTRAINT "story_summaries_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_writing_locks"
    ADD CONSTRAINT "story_writing_locks_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_writing_locks"
    ADD CONSTRAINT "story_writing_locks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can read story summaries" ON "public"."story_summaries" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create own writing lock" ON "public"."story_writing_locks" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can create posts" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "author_id"));



CREATE POLICY "Authenticated users can create stories" ON "public"."stories" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "author_id"));



CREATE POLICY "Authenticated users can delete story summaries" ON "public"."story_summaries" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert story summaries" ON "public"."story_summaries" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can update story summaries" ON "public"."story_summaries" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authors can delete latest own post" ON "public"."posts" FOR DELETE TO "authenticated" USING ("public"."can_delete_post"("id"));



CREATE POLICY "Authors can delete own stories" ON "public"."stories" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "author_id"));



CREATE POLICY "Authors can update latest own post" ON "public"."posts" FOR UPDATE TO "authenticated" USING ("public"."can_edit_post"("id")) WITH CHECK ("public"."can_edit_post"("id"));



CREATE POLICY "Authors can update own stories" ON "public"."stories" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "author_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "author_id"));



CREATE POLICY "Genres are viewable by everyone" ON "public"."genres" FOR SELECT USING (true);



CREATE POLICY "Posts are viewable by everyone" ON "public"."posts" FOR SELECT USING (true);



CREATE POLICY "Profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Stories are viewable by everyone" ON "public"."stories" FOR SELECT USING (true);



CREATE POLICY "Users can delete own writing lock" ON "public"."story_writing_locks" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own writing lock" ON "public"."story_writing_locks" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Writing locks are viewable by everyone" ON "public"."story_writing_locks" FOR SELECT USING (true);



ALTER TABLE "public"."genres" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_summaries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_writing_locks" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































REVOKE ALL ON FUNCTION "public"."acquire_story_writing_lock"("p_story_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."acquire_story_writing_lock"("p_story_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."acquire_story_writing_lock"("p_story_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."acquire_story_writing_lock"("p_story_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_delete_post"("p_post_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_delete_post"("p_post_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_delete_post"("p_post_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_delete_post"("p_post_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_edit_post"("p_post_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_edit_post"("p_post_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_edit_post"("p_post_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_edit_post"("p_post_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."genres" TO "anon";
GRANT ALL ON TABLE "public"."genres" TO "authenticated";
GRANT ALL ON TABLE "public"."genres" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."stories" TO "anon";
GRANT ALL ON TABLE "public"."stories" TO "authenticated";
GRANT ALL ON TABLE "public"."stories" TO "service_role";



GRANT ALL ON TABLE "public"."story_summaries" TO "anon";
GRANT ALL ON TABLE "public"."story_summaries" TO "authenticated";
GRANT ALL ON TABLE "public"."story_summaries" TO "service_role";



GRANT ALL ON TABLE "public"."story_writing_locks" TO "anon";
GRANT ALL ON TABLE "public"."story_writing_locks" TO "authenticated";
GRANT ALL ON TABLE "public"."story_writing_locks" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


