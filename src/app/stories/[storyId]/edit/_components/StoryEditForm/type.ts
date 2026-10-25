export type StoryEditFormProps = {
  story: {
    id: number;
    title: string;
    summary: string | null;
    genreSlug: string;
  };
};
