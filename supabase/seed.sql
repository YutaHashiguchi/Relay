INSERT INTO public.genres (
  name,
  slug,
  sort_order,
  is_active
)
VALUES
  ('ファンタジー', 'fantasy', 1, true),
  ('恋愛', 'romance', 2, true),
  ('ミステリー', 'mystery', 3, true),
  ('SF', 'science-fiction', 4, true),
  ('ホラー', 'horror', 5, true),
  ('青春', 'youth', 6, true),
  ('日常', 'daily-life', 7, true),
  ('その他', 'other', 8, true)
ON CONFLICT (slug) DO NOTHING;