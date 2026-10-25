export type RouteContext = {
  params: Promise<{
    storyId: string;
  }>;
};

export type StorySummary = {
  summary: string;
  summarized_until_position: number;
};

export type StoryPost = {
  body: string;
  position: number;
};
