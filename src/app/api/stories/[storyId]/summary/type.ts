export type RouteContext = {
  params: Promise<{
    storyId: string;
  }>;
};

export type StoryPost = {
  body: string;
  sequence_no: number;
};
