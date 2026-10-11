export type StorySummaryProps = {
  storyId: string;
  isLoggedIn: boolean;
};

export type SummaryResponse = {
  summary?: string;
  error?: string;
};
