export type StoriesPageProps = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
  }>;
};
