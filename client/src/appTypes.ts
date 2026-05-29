export type Language = "en" | "et";
export type PageId = "overview" | "library" | "playlists" | "membership" | "admin";
export type AuthMode = "login" | "register";
export type AdminSection = "categories" | "trainers" | "packages" | "videos" | "users";
export type Banner = { type: "success" | "error"; text: string } | null;
export type AccessTier = "none" | "starter" | "plus" | "full";

export type CategoryFormState = {
  categoryName: string;
};

export type TrainerFormState = {
  trainerName: string;
  bio: string;
  startDate: string;
};

export type PackageFormState = {
  planName: string;
  price: string;
  durationMonths: string;
};

export type VideoFormState = {
  title: string;
  duration: string;
  videoURL: string;
  language: string;
  equipment: string;
  shortDescription: string;
  trainerId: string;
  categoryId: string;
};

export type UserFormState = {
  name: string;
  email: string;
  password: string;
  roleCode: "ADMIN" | "USER";
  accountStatus: "ACTIVE" | "BLOCKED";
  subscriptionPlanId: string;
  autoRenew: boolean;
};

export type PaymentFormState = {
  email: string;
  cardholder: string;
  cardNumber: string;
};
