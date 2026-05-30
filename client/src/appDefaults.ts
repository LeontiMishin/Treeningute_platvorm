import type {
  CategoryFormState,
  PageId,
  PaymentFormState,
  TrainerFormState,
  PackageFormState,
  UserFormState,
  VideoFormState,
} from "./appTypes";

export const pageIds: PageId[] = ["overview", "library", "playlists", "membership", "admin"];

export const initialCategoryForm: CategoryFormState = {
  categoryName: "",
};

export const initialTrainerForm: TrainerFormState = {
  trainerName: "",
  bio: "",
  startDate: "",
};

export const initialPackageForm: PackageFormState = {
  planName: "",
  price: "",
  durationMonths: "1",
};

export const initialVideoForm: VideoFormState = {
  title: "",
  duration: "",
  videoURL: "",
  language: "",
  equipment: "",
  shortDescription: "",
  trainerId: "",
  categoryId: "",
};

export const initialUserForm: UserFormState = {
  name: "",
  email: "",
  password: "",
  roleCode: "USER",
  accountStatus: "ACTIVE",
  subscriptionPlanId: "",
  autoRenew: false,
};

export const initialPaymentForm: PaymentFormState = {
  email: "",
  cardholder: "",
  cardNumber: "4242 4242 4242 4242",
};
