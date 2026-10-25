import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import styles from "./styles.module.css";

type StoriesPageProps = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
  }>;
};

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const params = await searchParams;

  const keyword = params.q?.trim() ?? "";
  const selectedGenre = params.genre ?? "";

  const supabase = await createClient();

  // 作品一覧取得
  const { data: stories, error: storiesError } = await supabase
    .from("stories")
    .select(
      `
      id,
      title,
      synopsis,
      genre_slug,
      created_at,
      author:profiles (
        display_name
      ),
      genre:genres (
        name
      ),
      posts (
        id,
        body,
        position
      )
    `,
    )
    .order("created_at", {
      ascending: false,
    });

  // ジャンル一覧取得
  const { data: genres } = await supabase
    .from("genres")
    .select(
      `
      slug,
      name
    `,
    )
    .order("sort_order", {
      ascending: true,
    });

  if (storiesError) {
    console.error("Stories fetch error:", storiesError);
  }

  const normalizedKeyword = keyword.toLocaleLowerCase();

  const filteredStories = (stories ?? []).filter((story) => {
    // ジャンル
    const matchesGenre = !selectedGenre || story.genre_slug === selectedGenre;

    if (!matchesGenre) {
      return false;
    }

    // キーワードなしならジャンル判定だけ
    if (!normalizedKeyword) {
      return true;
    }

    const matchesTitle = story.title
      .toLocaleLowerCase()
      .includes(normalizedKeyword);

    const matchesSynopsis = (story.synopsis ?? "")
      .toLocaleLowerCase()
      .includes(normalizedKeyword);

    const matchesPost = story.posts.some((post) =>
      post.body.toLocaleLowerCase().includes(normalizedKeyword),
    );

    return matchesTitle || matchesSynopsis || matchesPost;
  });

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <section className={styles.heading}>
          <p className={styles.eyebrow}>FIND A STORY</p>

          <h1 className={styles.title}>物語を探す</h1>

          <p className={styles.description}>
            誰かが紡ぎ始めた物語を見つけて、その続きをつないでみませんか。
          </p>
        </section>

        <form className={styles.searchForm} method="get">
          <div className={styles.searchFields}>
            <div className={styles.field}>
              <label htmlFor="q" className={styles.label}>
                キーワード
              </label>

              <input
                id="q"
                name="q"
                type="search"
                defaultValue={keyword}
                placeholder="タイトル・あらすじ・本文から検索"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="genre" className={styles.label}>
                ジャンル
              </label>

              <select
                id="genre"
                name="genre"
                defaultValue={selectedGenre}
                className={styles.select}
              >
                <option value="">すべてのジャンル</option>

                {(genres ?? []).map((genre) => (
                  <option key={genre.slug} value={genre.slug}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.searchActions}>
            <button type="submit" className={styles.searchButton}>
              物語を探す
            </button>

            {(keyword || selectedGenre) && (
              <Link href="/stories" className={styles.clearLink}>
                条件をクリア
              </Link>
            )}
          </div>
        </form>

        <div className={styles.resultHeader}>
          <p>{filteredStories.length}件の物語</p>

          <Link href="/stories/new" className={styles.createLink}>
            新しい物語を書く
          </Link>
        </div>

        {filteredStories.length === 0 ? (
          <div className={styles.empty}>
            <p>条件に合う物語が見つかりませんでした。</p>
          </div>
        ) : (
          <div className={styles.storyList}>
            {filteredStories.map((story) => {
              const sortedPosts = [...story.posts].sort(
                (a, b) => a.position - b.position,
              );

              const latestPost = sortedPosts.at(-1);

              return (
                <article key={story.id} className={styles.storyCard}>
                  <div className={styles.cardTop}>
                    <span className={styles.genre}>
                      {story.genre?.name ?? "その他"}
                    </span>

                    <span className={styles.postCount}>
                      {story.posts.length}節
                    </span>
                  </div>

                  <Link
                    href={`/stories/${story.id}`}
                    className={styles.storyTitle}
                  >
                    {story.title}
                  </Link>

                  <p className={styles.author}>
                    {story.author?.display_name ?? "名前未設定"}
                  </p>

                  {story.synopsis && (
                    <p className={styles.synopsis}>{story.synopsis}</p>
                  )}

                  {latestPost && (
                    <div className={styles.latestPost}>
                      <p className={styles.latestPostLabel}>
                        最新・第
                        {latestPost.position}節
                      </p>

                      <p className={styles.latestPostBody}>{latestPost.body}</p>
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <Link
                      href={`/stories/${story.id}`}
                      className={styles.detailLink}
                    >
                      物語を読む →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
