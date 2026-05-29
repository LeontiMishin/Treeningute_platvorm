export type UserRole = "ADMIN" | "USER";

export type User = {
  userId: number;
  name: string;
  email: string;
  registerDate: string | null;
  role: UserRole;
  accountStatus?: string;
  preferredLanguage?: string | null;
};

export type Category = {
  categoryId: number;
  categoryName: string;
};

export type Trainer = {
  trainerId: number;
  trainerName: string;
  bio: string | null;
  startDate: string | null;
};

export type Video = {
  videoId: number;
  duration: number | null;
  title: string;
  videoURL: string | null;
  language: string | null;
  equipment: string | null;
  shortDescription: string | null;
  trainerId: number | null;
  categoryId: number | null;
  accessTier?: string;
  publishedAt?: string | null;
  isFeatured?: boolean;
  trainer?: Trainer | null;
  category?: Category | null;
};

export type SubscriptionPlan = {
  planId: number;
  planName: string;
  price: number | string;
  durationMonths: number;
  accessTier?: string;
  isActive?: boolean;
  maxActivePrograms?: number | null;
};

export type PlaylistVideo = {
  playlistVideoId: number;
  playlistId: number | null;
  videoId: number | null;
  video?: Video | null;
};

export type Playlist = {
  playlistId: number;
  playlistName: string;
  userId: number | null;
  playlistVideos: PlaylistVideo[];
};

export type UserSubscription = {
  userSubscriptionId: number;
  startDate: string | null;
  endDate?: string | null;
  status?: string;
  autoRenew?: boolean;
  userId: number | null;
  planId: number | null;
  plan?: SubscriptionPlan | null;
  user?: User | null;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: User;
};

export type VideoQuery = {
  trainerId?: number;
  categoryId?: number;
  search?: string;
};
