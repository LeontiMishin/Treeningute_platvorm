import { FormEvent, ReactNode, useEffect, useState } from "react";
import { api, clearStoredToken, getStoredToken, setStoredToken } from "./api";
import type {
  Category,
  Playlist,
  SubscriptionPlan,
  Trainer,
  User,
  UserSubscription,
  Video,
} from "./types";

type Language = "en" | "et";
type PageId = "overview" | "library" | "playlists" | "membership" | "admin";
type AuthMode = "login" | "register";
type AdminSection = "categories" | "trainers" | "packages" | "videos" | "users";
type Banner = { type: "success" | "error"; text: string } | null;

type CategoryFormState = {
  categoryName: string;
};

type TrainerFormState = {
  trainerName: string;
  bio: string;
  startDate: string;
};

type PackageFormState = {
  planName: string;
  price: string;
  durationMonths: string;
};

type VideoFormState = {
  title: string;
  duration: string;
  videoURL: string;
  language: string;
  equipment: string;
  shortDescription: string;
  trainerId: string;
  categoryId: string;
};

type UserFormState = {
  name: string;
  email: string;
  password: string;
  roleCode: "ADMIN" | "USER";
  accountStatus: "ACTIVE" | "SUSPENDED";
  subscriptionPlanId: string;
  autoRenew: boolean;
};

type AccessTier = "none" | "starter" | "active" | "full";

type PaymentFormState = {
  email: string;
  cardholder: string;
  cardNumber: string;
};

const pageIds: PageId[] = ["overview", "library", "playlists", "membership", "admin"];

const initialCategoryForm: CategoryFormState = {
  categoryName: "",
};

const initialTrainerForm: TrainerFormState = {
  trainerName: "",
  bio: "",
  startDate: "",
};

const initialPackageForm: PackageFormState = {
  planName: "",
  price: "",
  durationMonths: "1",
};

const initialVideoForm: VideoFormState = {
  title: "",
  duration: "",
  videoURL: "",
  language: "",
  equipment: "",
  shortDescription: "",
  trainerId: "",
  categoryId: "",
};

const initialUserForm: UserFormState = {
  name: "",
  email: "",
  password: "",
  roleCode: "USER",
  accountStatus: "ACTIVE",
  subscriptionPlanId: "",
  autoRenew: false,
};

const initialPaymentForm: PaymentFormState = {
  email: "",
  cardholder: "",
  cardNumber: "4242 4242 4242 4242",
};

const copy = {
  en: {
    brand: "FitNest",
    tagline: "Strength, mobility, and calm routines for every day.",
    nav: {
      overview: "Overview",
      library: "Library",
      playlists: "Playlists",
      membership: "Plans",
      admin: "Admin",
    },
    heroEyebrow: "Daily movement",
    heroTitle: "Build a home routine that feels focused, warm, and easy to return to.",
    heroText:
      "Explore guided strength, mobility, recovery, and yoga sessions. Save playlists, choose a plan, and unlock the training pace that fits your week.",
    authTitle: "Account",
    login: "Log in",
    register: "Register",
    logout: "Log out",
    refresh: "Refresh data",
    guestTitle: "Join FitNest",
    guestText:
      "Create an account to save playlists, unlock classes through plans, and keep your access in one place.",
    authName: "Name",
    authEmail: "Email",
    authPassword: "Password",
    authSubmitLogin: "Enter FitNest",
    authSubmitRegister: "Create account",
    overviewTitle: "Your training space",
    overviewText: "See your access level, current plan, and the sessions that are ready for you right now.",
    libraryTitle: "Workout library",
    libraryText: "Browse classes by trainer, category, and the access level included in your plan.",
    searchLabel: "Search",
    searchPlaceholder: "Search by title or description",
    trainerFilter: "Trainer",
    categoryFilter: "Category",
    allTrainers: "All trainers",
    allCategories: "All categories",
    noVideos: "No videos found for the current filters.",
    playlistsTitle: "Your playlists",
    playlistsText: "Build simple weekly collections, rename them anytime, and keep favourite sessions together.",
    createPlaylist: "Create playlist",
    playlistName: "Playlist name",
    selectedVideos: "Selected videos for new playlist",
    noPlaylists: "You do not have any playlists yet.",
    membershipTitle: "Plans and checkout",
    membershipText: "Choose a plan, simulate payment, and unlock the classes included in your access level.",
    subscribe: "Confirm payment",
    activeSubscriptions: "Active subscriptions",
    noSubscriptions: "No subscriptions yet.",
    adminTitle: "Studio admin",
    adminText: "Manage categories, trainers, plans, videos, and members from one calm control room.",
    categoryManager: "Category manager",
    trainerManager: "Trainer manager",
    packageManager: "Package manager",
    videoManager: "Video manager",
    userManager: "User manager",
    adminWorkspaceHint: "Choose a resource and manage it from one focused control panel.",
    adminSearchPlaceholder: "Search in the current admin section",
    adminResetPanel: "Reset panel",
    adminNoMatches: "No records match the current search.",
    adminSelfDeleteBlocked: "Use the logout button instead of deleting the current admin account.",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    duration: "Duration",
    equipment: "Equipment",
    language: "Language",
    description: "Description",
    videoUrl: "Video URL",
    startDate: "Start date",
    price: "Price",
    durationMonths: "Duration months",
    trainerBio: "Bio",
    role: "Role",
    accountStatus: "Account status",
    registerDate: "Registered",
    currentUser: "Current user",
    roleAdmin: "Admin",
    roleUser: "User",
    statusActive: "Active",
    statusSuspended: "Suspended",
    assignPlan: "Add subscription",
    currentPlan: "Current plan",
    dashboardGuestCta: "Sign in to open your library, playlists, and paid access inside FitNest.",
    adminOnly: "Admin tools are visible only for the admin account.",
    choosePlaylist: "Active playlist",
    addToPlaylist: "Add to active playlist",
    removeFromPlaylist: "Remove from active playlist",
    renamePlaylist: "Rename playlist",
    videosInPlaylist: "Videos in playlist",
    emptySelection: "No selected videos",
    statsVideos: "Videos",
    statsTrainers: "Trainers",
    statsCategories: "Categories",
    statsPackages: "Packages",
    statsPlaylists: "Playlists",
    statsSubscriptions: "Subscriptions",
    watchNow: "Watch workout",
    unlockThisVideo: "Unlock this workout",
    simulatedCheckoutTitle: "Simulated checkout",
    simulatedCheckoutText: "Use the demo payment form below to unlock the selected plan and show access changes inside the app.",
    paymentEmail: "Payment email",
    paymentCardholder: "Cardholder",
    paymentCardNumber: "Card number",
    selectPlan: "Choose plan",
    selectedPlan: "Selected plan",
    packageIncludes: "Includes",
    accessLabel: "Current access",
    accessNone: "No active plan",
    accessStarter: "Starter access",
    accessActive: "Active access",
    accessFull: "Full access",
    availableNow: "Available now",
    accessNeeded: "Requires",
    openMembership: "View plans",
    closeVideo: "Close video",
    noCategory: "No category",
    noTrainer: "No trainer",
    noLanguage: "No language",
    noEquipment: "No equipment",
    profileFocus: "Member focus",
    nextBestPlan: "Recommended next step",
    paymentSuccess: "Payment simulated and access updated.",
    paymentHint: "This payment form is a safe demo used to show package access inside FitNest.",
    paymentIncomplete: "Complete the simulated payment form first.",
    lockedCount: "locked",
    sessionDetailsSoon: "Session details coming soon.",
    loadingApp: "Opening FitNest…",
    signedOut: "You have been signed out.",
    refreshSuccess: "Your FitNest content has been refreshed.",
    loginSuccess: "Welcome back to FitNest.",
    registerSuccess: "Your FitNest account is ready.",
  },
  et: {
    brand: "FitNest",
    tagline: "Jõud, liikuvus ja rahulik treeningurütm igaks päevaks.",
    nav: {
      overview: "Ülevaade",
      library: "Videoteek",
      playlists: "Pleilistid",
      membership: "Paketid",
      admin: "Admin",
    },
    heroEyebrow: "Igapäevane liikumine",
    heroTitle: "Loo kodune treeningurutiin, kuhu on lihtne tagasi tulla.",
    heroText:
      "Avasta juhendatud jõu-, liikuvus-, taastumis- ja joogatunnid. Salvesta pleiliste, vali pakett ja ava just sinu nädalaga sobiv treeningutempo.",
    authTitle: "Konto",
    login: "Logi sisse",
    register: "Registreeri",
    logout: "Logi välja",
    refresh: "Värskenda andmeid",
    guestTitle: "Liitu FitNestiga",
    guestText:
      "Loo konto, et salvestada pleiliste, avada paketiga treeningud ja hoida kogu ligipääs ühes kohas.",
    authName: "Nimi",
    authEmail: "E-post",
    authPassword: "Parool",
    authSubmitLogin: "Sisene FitNesti",
    authSubmitRegister: "Loo konto",
    overviewTitle: "Sinu treeninguruum",
    overviewText: "Vaata oma ligipääsutaset, aktiivset paketti ja treeninguid, mis on sulle praegu avatud.",
    libraryTitle: "Treeningute videoteek",
    libraryText: "Sirvi treeninguid treeneri, kategooria ja sinu paketis sisalduva ligipääsu järgi.",
    searchLabel: "Otsing",
    searchPlaceholder: "Otsi pealkirja või kirjelduse järgi",
    trainerFilter: "Treener",
    categoryFilter: "Kategooria",
    allTrainers: "Kõik treenerid",
    allCategories: "Kõik kategooriad",
    noVideos: "Praeguste filtritega videoid ei leitud.",
    playlistsTitle: "Sinu pleilistid",
    playlistsText: "Koosta lihtsad nädalaplaanid, nimeta need ümber ja hoia lemmiktreeningud koos.",
    createPlaylist: "Loo pleilist",
    playlistName: "Pleilisti nimi",
    selectedVideos: "Valitud videod uue pleilisti jaoks",
    noPlaylists: "Sul ei ole veel ühtegi pleilisti.",
    membershipTitle: "Paketid ja makse",
    membershipText: "Vali pakett, tee demomakse ja ava selle ligipääsutasemega treeningud.",
    subscribe: "Kinnita makse",
    activeSubscriptions: "Aktiivsed tellimused",
    noSubscriptions: "Tellimusi veel ei ole.",
    adminTitle: "Stuudio admin",
    adminText: "Halda kategooriaid, treenereid, pakette, videoid ja liikmeid ühest rahulikust juhtpaneelist.",
    categoryManager: "Kategooriate haldus",
    trainerManager: "Treenerite haldus",
    packageManager: "Pakettide haldus",
    videoManager: "Videote haldus",
    userManager: "Kasutajate haldus",
    adminWorkspaceHint: "Vali andmetüüp ja halda seda ühest keskendunud admin-paneelist.",
    adminSearchPlaceholder: "Otsi aktiivsest admin-sektsioonist",
    adminResetPanel: "Lähtesta paneel",
    adminNoMatches: "Praeguse otsinguga sobivaid kirjeid ei leitud.",
    adminSelfDeleteBlocked: "Kasuta väljalogimise nuppu, mitte ära kustuta aktiivset admin-kontot.",
    save: "Salvesta",
    edit: "Muuda",
    delete: "Kustuta",
    cancel: "Tühista",
    duration: "Kestus",
    equipment: "Varustus",
    language: "Keel",
    description: "Kirjeldus",
    videoUrl: "Video URL",
    startDate: "Alguskuupäev",
    price: "Hind",
    durationMonths: "Kuude arv",
    trainerBio: "Tutvustus",
    role: "Roll",
    accountStatus: "Konto staatus",
    registerDate: "Registreeritud",
    currentUser: "Praegune kasutaja",
    roleAdmin: "Admin",
    roleUser: "Kasutaja",
    statusActive: "Aktiivne",
    statusSuspended: "Peatatud",
    assignPlan: "Lisa tellimus",
    currentPlan: "Praegune pakett",
    dashboardGuestCta: "Logi sisse, et avada oma videoteek, pleilistid ja tasuline ligipääs FitNestis.",
    adminOnly: "Admin tööriistad on nähtavad ainult admin-kontole.",
    choosePlaylist: "Aktiivne pleilist",
    addToPlaylist: "Lisa aktiivsesse pleilisti",
    removeFromPlaylist: "Eemalda aktiivsest pleilistist",
    renamePlaylist: "Muuda pleilisti nime",
    videosInPlaylist: "Pleilistis olevad videod",
    emptySelection: "Valitud videosid ei ole",
    statsVideos: "Videod",
    statsTrainers: "Treenerid",
    statsCategories: "Kategooriad",
    statsPackages: "Paketid",
    statsPlaylists: "Pleilistid",
    statsSubscriptions: "Tellimused",
    watchNow: "Ava treening",
    unlockThisVideo: "Ava see treening",
    simulatedCheckoutTitle: "Demomakse",
    simulatedCheckoutText: "Kasuta allolevat demo maksevormi, et avada valitud pakett ja näidata rakenduses ligipääsu muutust.",
    paymentEmail: "Makse e-post",
    paymentCardholder: "Kaardi omanik",
    paymentCardNumber: "Kaardi number",
    selectPlan: "Vali pakett",
    selectedPlan: "Valitud pakett",
    packageIncludes: "Sisaldab",
    accessLabel: "Praegune ligipääs",
    accessNone: "Aktiivne pakett puudub",
    accessStarter: "Starter ligipääs",
    accessActive: "Active ligipääs",
    accessFull: "Täisligipääs",
    availableNow: "Praegu saadaval",
    accessNeeded: "Vajab",
    openMembership: "Vaata pakette",
    closeVideo: "Sulge video",
    noCategory: "Kategooria puudub",
    noTrainer: "Treener puudub",
    noLanguage: "Keel puudub",
    noEquipment: "Varustus puudub",
    profileFocus: "Kasutaja fookus",
    nextBestPlan: "Soovitatud järgmine samm",
    paymentSuccess: "Demomakse tehtud ja ligipääs uuendatud.",
    paymentHint: "See maksevorm on turvaline demo, mida kasutatakse pakettide ligipääsu näitamiseks FitNestis.",
    paymentIncomplete: "Täida enne demomakse vorm.",
    lockedCount: "lukus",
    sessionDetailsSoon: "Treeningu kirjeldus lisandub peagi.",
    loadingApp: "FitNest avaneb…",
    signedOut: "Oled välja logitud.",
    refreshSuccess: "Sinu FitNesti sisu on värskendatud.",
    loginSuccess: "Tere tagasi FitNesti.",
    registerSuccess: "Sinu FitNesti konto on valmis.",
  },
};

function numberValue(value: string) {
  return value ? Number(value) : undefined;
}

function isoDateValue(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatPrice(value: number | string) {
  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-EE", {
    style: "currency",
    currency: "EUR",
  }).format(numeric);
}

function matchesQuery(values: Array<string | number | null | undefined>, normalizedQuery: string) {
  if (!normalizedQuery) {
    return true;
  }

  return values.some((value) => String(value ?? "").toLowerCase().includes(normalizedQuery));
}

function extractYouTubeId(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const watchMatch = url.match(/[?&]v=([^?&/]+)/i);
  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/i);
  const embedMatch = url.match(/embed\/([^?&/]+)/i);
  const shortsMatch = url.match(/shorts\/([^?&/]+)/i);

  return watchMatch?.[1] ?? shortMatch?.[1] ?? embedMatch?.[1] ?? shortsMatch?.[1] ?? null;
}

function getYouTubeThumbnail(url: string | null | undefined) {
  const videoId = extractYouTubeId(url);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}

function getAccessTierFromPlanName(planName: string | null | undefined): AccessTier {
  const normalized = (planName ?? "").toLowerCase();

  if (normalized.includes("full")) {
    return "full";
  }

  if (normalized.includes("active")) {
    return "active";
  }

  if (normalized.includes("starter")) {
    return "starter";
  }

  return "starter";
}

function getAccessRank(tier: AccessTier) {
  return {
    none: 0,
    starter: 1,
    active: 2,
    full: 3,
  }[tier];
}

function getVideoAccessTier(video: Video): AccessTier {
  const categoryName = video.category?.categoryName?.toLowerCase() ?? "";

  if (categoryName.includes("strength")) {
    return "full";
  }

  if (categoryName.includes("cardio") || categoryName.includes("mobility")) {
    return "active";
  }

  return "starter";
}

function canAccessTier(currentTier: AccessTier, requiredTier: AccessTier) {
  return getAccessRank(currentTier) >= getAccessRank(requiredTier);
}

function getAccessTierLabel(tier: AccessTier, copySet: (typeof copy)["en"]) {
  if (tier === "starter") {
    return copySet.accessStarter;
  }

  if (tier === "active") {
    return copySet.accessActive;
  }

  if (tier === "full") {
    return copySet.accessFull;
  }

  return copySet.accessNone;
}

function getPlanHighlights(tier: AccessTier, language: Language) {
  if (language === "et") {
    if (tier === "starter") {
      return ["Taastumine ja jooga", "Rahulik algus nädalasse", "Põhiline videoteek"];
    }

    if (tier === "active") {
      return ["Kõik Starter treeningud", "Cardio ja liikuvus", "Tõhusamad nädalaplaanid"];
    }

    return ["Kõik treeningud", "Jõutreeningud ja täielik ligipääs", "Piiramatu FitNest kogemus"];
  }

  if (tier === "starter") {
    return ["Recovery and yoga", "Gentle start to the week", "Core video access"];
  }

  if (tier === "active") {
    return ["Everything in Starter", "Cardio and mobility", "Stronger weekly routine"];
  }

  return ["All workouts", "Strength sessions and full access", "Unlimited FitNest experience"];
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function SectionHeader({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <span className="section-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {text ? <p>{text}</p> : null}
      </div>
      {action}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = window.localStorage.getItem("trainflow_language");
    return saved === "en" || saved === "et" ? saved : "et";
  });
  const [currentPage, setCurrentPage] = useState<PageId>("overview");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [adminSection, setAdminSection] = useState<AdminSection>("categories");
  const [adminSearch, setAdminSearch] = useState("");
  const [banner, setBanner] = useState<Banner>(null);
  const [booting, setBooting] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [packages, setPackages] = useState<SubscriptionPlan[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState<number[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<number | null>(null);
  const [playlistNameEdits, setPlaylistNameEdits] = useState<Record<number, string>>({});
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [libraryFilters, setLibraryFilters] = useState({
    search: "",
    trainerId: "",
    categoryId: "",
  });
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingTrainerId, setEditingTrainerId] = useState<number | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(initialCategoryForm);
  const [trainerForm, setTrainerForm] = useState<TrainerFormState>(initialTrainerForm);
  const [packageForm, setPackageForm] = useState<PackageFormState>(initialPackageForm);
  const [videoForm, setVideoForm] = useState<VideoFormState>(initialVideoForm);
  const [userForm, setUserForm] = useState<UserFormState>(initialUserForm);
  const [checkoutPlanId, setCheckoutPlanId] = useState<number | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(initialPaymentForm);

  const t = copy[language];
  const isAdmin = user?.role === "ADMIN";
  const activePlaylist = playlists.find((playlist) => playlist.playlistId === activePlaylistId) ?? null;
  const userSubscriptions = user
    ? subscriptions.filter((subscription) => subscription.userId === user.userId)
    : [];
  const currentAccessTier = isAdmin
    ? "full"
    : userSubscriptions.reduce<AccessTier>((highestTier, subscription) => {
        const planTier = getAccessTierFromPlanName(subscription.plan?.planName);
        return getAccessRank(planTier) > getAccessRank(highestTier) ? planTier : highestTier;
      }, "none");
  const currentAccessPlan =
    currentAccessTier === "none"
      ? null
      : userSubscriptions
          .map((subscription) => subscription.plan)
          .filter((plan): plan is SubscriptionPlan => Boolean(plan))
          .sort(
            (left, right) =>
              getAccessRank(getAccessTierFromPlanName(right.planName)) -
              getAccessRank(getAccessTierFromPlanName(left.planName)),
          )[0] ?? null;
  const currentPageLabel = t.nav[currentPage as keyof typeof t.nav];
  const normalizedAdminSearch = adminSearch.trim().toLowerCase();
  const selectedPlan = packages.find((subscriptionPlan) => subscriptionPlan.planId === checkoutPlanId) ?? null;
  const availableVideosCount = videos.filter((video) => canAccessTier(currentAccessTier, getVideoAccessTier(video))).length;
  const activeVideoId = extractYouTubeId(activeVideo?.videoURL);
  const adminSections: Array<{
    id: AdminSection;
    title: string;
    count: number;
  }> = [
    { id: "categories", title: t.categoryManager, count: categories.length },
    { id: "trainers", title: t.trainerManager, count: trainers.length },
    { id: "packages", title: t.packageManager, count: packages.length },
    { id: "videos", title: t.videoManager, count: videos.length },
    { id: "users", title: t.userManager, count: users.length },
  ];
  const activeAdminSection = adminSections.find((section) => section.id === adminSection) ?? adminSections[0];
  const filteredCategories = categories.filter((category) =>
    matchesQuery([category.categoryName], normalizedAdminSearch),
  );
  const filteredTrainers = trainers.filter((trainer) =>
    matchesQuery([trainer.trainerName, trainer.bio, trainer.startDate], normalizedAdminSearch),
  );
  const filteredPackages = packages.filter((subscriptionPlan) =>
    matchesQuery(
      [subscriptionPlan.planName, subscriptionPlan.durationMonths, subscriptionPlan.price],
      normalizedAdminSearch,
    ),
  );
  const filteredVideos = videos.filter((video) =>
    matchesQuery(
      [
        video.title,
        video.shortDescription,
        video.language,
        video.equipment,
        video.trainer?.trainerName,
        video.category?.categoryName,
      ],
      normalizedAdminSearch,
    ),
  );
  const filteredUsers = users.filter((listedUser) =>
    matchesQuery([listedUser.name, listedUser.email, listedUser.role], normalizedAdminSearch),
  );
  const editingUserSubscriptions = editingUserId
    ? subscriptions.filter((subscription) => subscription.userId === editingUserId)
    : [];
  const editingUserActiveSubscription =
    editingUserSubscriptions.find((subscription) => subscription.status === "ACTIVE") ??
    editingUserSubscriptions[0] ??
    null;

  useEffect(() => {
    window.localStorage.setItem("trainflow_language", language);
    document.documentElement.lang = language;
    document.title = `${t.brand} | ${currentPageLabel}`;
  }, [currentPageLabel, language, t.brand]);

  useEffect(() => {
    const savedToken = getStoredToken();

    if (!savedToken) {
      setBooting(false);
      return;
    }

    void restoreSession();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    void loadVideos();
  }, [user, libraryFilters.search, libraryFilters.trainerId, libraryFilters.categoryId]);

  useEffect(() => {
    if (!playlists.length) {
      setActivePlaylistId(null);
      return;
    }

    if (!playlists.some((playlist) => playlist.playlistId === activePlaylistId)) {
      setActivePlaylistId(playlists[0].playlistId);
    }
  }, [activePlaylistId, playlists]);

  useEffect(() => {
    setPlaylistNameEdits(
      Object.fromEntries(playlists.map((playlist) => [playlist.playlistId, playlist.playlistName])),
    );
  }, [playlists]);

  useEffect(() => {
    if (!isAdmin && currentPage === "admin") {
      setCurrentPage("overview");
    }
  }, [currentPage, isAdmin]);

  useEffect(() => {
    if (!user && currentPage !== "overview") {
      setCurrentPage("overview");
    }
  }, [currentPage, user]);

  useEffect(() => {
    if (!activeVideo) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveVideo(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideo]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setPaymentForm((current) => ({
      ...current,
      email: current.email || user.email,
      cardholder: current.cardholder || user.name,
    }));
  }, [user]);

  async function restoreSession() {
    setBooting(true);

    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      await loadProtectedData(currentUser);
    } catch (error) {
      clearSession(false);
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Session restore failed.",
      });
    } finally {
      setBooting(false);
    }
  }

  async function loadProtectedData(currentUser: User) {
    setLoadingData(true);

    try {
      const sharedRequests = await Promise.all([
        api.categories.list(),
        api.trainers.list(),
        api.packages.list(),
        api.playlists.list(),
        api.subscriptions.list(),
        currentUser.role === "ADMIN" ? api.users.list() : Promise.resolve([]),
      ]);

      setCategories(sharedRequests[0]);
      setTrainers(sharedRequests[1]);
      setPackages(sharedRequests[2]);
      setPlaylists(sharedRequests[3]);
      setSubscriptions(sharedRequests[4]);
      setUsers(sharedRequests[5] as User[]);
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Data loading failed.",
      });
    } finally {
      setLoadingData(false);
    }
  }

  async function loadVideos() {
    if (!user) {
      return;
    }

    setLoadingVideos(true);

    try {
      const nextVideos = await api.videos.list({
        search: libraryFilters.search || undefined,
        trainerId: numberValue(libraryFilters.trainerId),
        categoryId: numberValue(libraryFilters.categoryId),
      });

      setVideos(nextVideos);
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Video loading failed.",
      });
    } finally {
      setLoadingVideos(false);
    }
  }

  function clearSession(showMessage = true) {
    clearStoredToken();
    setUser(null);
    setCategories([]);
    setTrainers([]);
    setVideos([]);
    setPackages([]);
    setPlaylists([]);
    setSubscriptions([]);
    setUsers([]);
    setSelectedVideoIds([]);
    setActivePlaylistId(null);
    setActiveVideo(null);
    setCurrentPage("overview");

    if (showMessage) {
      setBanner({
        type: "success",
        text: t.signedOut,
      });
    }
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setBanner(null);

    try {
      const result =
        authMode === "register"
          ? await api.auth.register(authForm)
          : await api.auth.login({
              email: authForm.email,
              password: authForm.password,
            });

      setStoredToken(result.token);
      setUser(result.user);
      setAuthForm({
        name: "",
        email: "",
        password: "",
      });
      await loadProtectedData(result.user);
      setCurrentPage("library");
      setBanner({
        type: "success",
        text: authMode === "login" ? t.loginSuccess : t.registerSuccess,
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Authentication failed.",
      });
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogout() {
    try {
      if (user) {
        await api.auth.logout();
      }
    } catch {
      // The backend only instructs the client to remove the token, so local cleanup is enough.
    } finally {
      clearSession();
    }
  }

  async function handleRefresh() {
    if (!user) {
      return;
    }

    await Promise.all([loadProtectedData(user), loadVideos()]);
    setBanner({
      type: "success",
      text: t.refreshSuccess,
    });
  }

  function toggleSelectedVideo(videoId: number) {
    const video = videos.find((entry) => entry.videoId === videoId);

    if (video && !canAccessTier(currentAccessTier, getVideoAccessTier(video))) {
      setBanner({
        type: "error",
        text: `${t.unlockThisVideo}: ${getAccessTierLabel(getVideoAccessTier(video), t)}`,
      });
      return;
    }

    setSelectedVideoIds((current) =>
      current.includes(videoId)
        ? current.filter((id) => id !== videoId)
        : [...current, videoId],
    );
  }

  function videoIsInActivePlaylist(videoId: number) {
    if (!activePlaylist) {
      return false;
    }

    return activePlaylist.playlistVideos.some((entry) => entry.videoId === videoId);
  }

  async function handleCreatePlaylist() {
    if (!newPlaylistName.trim()) {
      setBanner({
        type: "error",
        text: "Playlist name is required.",
      });
      return;
    }

    try {
      await api.playlists.create({
        playlistName: newPlaylistName.trim(),
        videoIds: selectedVideoIds,
      });
      setNewPlaylistName("");
      setSelectedVideoIds([]);
      const nextPlaylists = await api.playlists.list();
      setPlaylists(nextPlaylists);
      setBanner({
        type: "success",
        text: "Playlist created successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Playlist creation failed.",
      });
    }
  }

  async function handleRenamePlaylist(playlistId: number) {
    const playlistName = playlistNameEdits[playlistId]?.trim();

    if (!playlistName) {
      setBanner({
        type: "error",
        text: "Playlist name is required.",
      });
      return;
    }

    try {
      const playlist = playlists.find((entry) => entry.playlistId === playlistId);
      await api.playlists.update(playlistId, {
        playlistName,
        videoIds:
          playlist?.playlistVideos
            .map((entry) => entry.videoId)
            .filter((videoId): videoId is number => typeof videoId === "number") ?? [],
      });
      setPlaylists(await api.playlists.list());
      setBanner({
        type: "success",
        text: "Playlist updated successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Playlist update failed.",
      });
    }
  }

  async function handleDeletePlaylist(playlistId: number) {
    try {
      await api.playlists.delete(playlistId);
      setPlaylists(await api.playlists.list());
      setBanner({
        type: "success",
        text: "Playlist deleted successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Playlist deletion failed.",
      });
    }
  }

  async function handleToggleVideoInPlaylist(videoId: number) {
    const video = videos.find((entry) => entry.videoId === videoId);

    if (video && !canAccessTier(currentAccessTier, getVideoAccessTier(video))) {
      setBanner({
        type: "error",
        text: `${t.unlockThisVideo}: ${getAccessTierLabel(getVideoAccessTier(video), t)}`,
      });
      setCurrentPage("membership");
      return;
    }

    if (!activePlaylist) {
      setBanner({
        type: "error",
        text: "Create or choose a playlist first.",
      });
      return;
    }

    const currentVideoIds = activePlaylist.playlistVideos
      .map((entry) => entry.videoId)
      .filter((id): id is number => typeof id === "number");

    const nextVideoIds = currentVideoIds.includes(videoId)
      ? currentVideoIds.filter((id) => id !== videoId)
      : [...currentVideoIds, videoId];

    try {
      await api.playlists.update(activePlaylist.playlistId, {
        playlistName: activePlaylist.playlistName,
        videoIds: nextVideoIds,
      });
      setPlaylists(await api.playlists.list());
      setBanner({
        type: "success",
        text: "Playlist contents updated.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Playlist sync failed.",
      });
    }
  }

  async function handleRemoveVideoFromPlaylist(playlist: Playlist, videoId: number) {
    const nextVideoIds = playlist.playlistVideos
      .map((entry) => entry.videoId)
      .filter((id): id is number => typeof id === "number" && id !== videoId);

    try {
      await api.playlists.update(playlist.playlistId, {
        playlistName: playlist.playlistName,
        videoIds: nextVideoIds,
      });
      setPlaylists(await api.playlists.list());
      setBanner({
        type: "success",
        text: "Playlist contents updated.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Playlist sync failed.",
      });
    }
  }

  async function handleSubscribe(planId: number) {
    if (!paymentForm.email.trim() || !paymentForm.cardholder.trim() || paymentForm.cardNumber.replace(/\s/g, "").length < 12) {
      setBanner({
        type: "error",
        text: t.paymentIncomplete,
      });
      return;
    }

    setPaymentBusy(true);

    try {
      await api.subscriptions.create({ planId });
      setSubscriptions(await api.subscriptions.list());
      setCheckoutPlanId(null);
      setBanner({
        type: "success",
        text: t.paymentSuccess,
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Subscription failed.",
      });
    } finally {
      setPaymentBusy(false);
    }
  }

  async function handleDeleteSubscription(subscriptionId: number) {
    try {
      await api.subscriptions.delete(subscriptionId);
      setSubscriptions(await api.subscriptions.list());
      setBanner({
        type: "success",
        text: "Subscription removed successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Subscription removal failed.",
      });
    }
  }

  function fillCategoryForm(category: Category) {
    setEditingCategoryId(category.categoryId);
    setCategoryForm({
      categoryName: category.categoryName,
    });
  }

  function fillTrainerForm(trainer: Trainer) {
    setEditingTrainerId(trainer.trainerId);
    setTrainerForm({
      trainerName: trainer.trainerName,
      bio: trainer.bio ?? "",
      startDate: trainer.startDate ? String(trainer.startDate).slice(0, 10) : "",
    });
  }

  function fillPackageForm(subscriptionPlan: SubscriptionPlan) {
    setEditingPackageId(subscriptionPlan.planId);
    setPackageForm({
      planName: subscriptionPlan.planName,
      price: String(subscriptionPlan.price),
      durationMonths: String(subscriptionPlan.durationMonths),
    });
  }

  function fillVideoForm(video: Video) {
    setEditingVideoId(video.videoId);
    setVideoForm({
      title: video.title,
      duration: video.duration ? String(video.duration) : "",
      videoURL: video.videoURL ?? "",
      language: video.language ?? "",
      equipment: video.equipment ?? "",
      shortDescription: video.shortDescription ?? "",
      trainerId: video.trainerId ? String(video.trainerId) : "",
      categoryId: video.categoryId ? String(video.categoryId) : "",
    });
  }

  function fillUserForm(nextUser: User) {
    setEditingUserId(nextUser.userId);
    setUserForm({
      name: nextUser.name,
      email: nextUser.email,
      password: "",
      roleCode: nextUser.role,
      accountStatus:
        nextUser.accountStatus === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
      subscriptionPlanId: "",
      autoRenew: false,
    });
  }

  async function handleSaveCategory() {
    try {
      if (editingCategoryId) {
        await api.categories.update(editingCategoryId, categoryForm);
      } else {
        await api.categories.create(categoryForm);
      }

      setCategories(await api.categories.list());
      setEditingCategoryId(null);
      setCategoryForm(initialCategoryForm);
      setBanner({
        type: "success",
        text: "Category saved successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Category save failed.",
      });
    }
  }

  async function handleDeleteCategory(categoryId: number) {
    try {
      await api.categories.delete(categoryId);
      setCategories(await api.categories.list());
      setEditingCategoryId(null);
      setCategoryForm(initialCategoryForm);
      setBanner({
        type: "success",
        text: "Category deleted successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Category deletion failed.",
      });
    }
  }

  async function handleSaveTrainer() {
    const payload = {
      trainerName: trainerForm.trainerName,
      bio: trainerForm.bio || undefined,
      startDate: isoDateValue(trainerForm.startDate),
    };

    try {
      if (editingTrainerId) {
        await api.trainers.update(editingTrainerId, payload);
      } else {
        await api.trainers.create(payload);
      }

      setTrainers(await api.trainers.list());
      setEditingTrainerId(null);
      setTrainerForm(initialTrainerForm);
      setBanner({
        type: "success",
        text: "Trainer saved successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Trainer save failed.",
      });
    }
  }

  async function handleDeleteTrainer(trainerId: number) {
    try {
      await api.trainers.delete(trainerId);
      setTrainers(await api.trainers.list());
      setEditingTrainerId(null);
      setTrainerForm(initialTrainerForm);
      setBanner({
        type: "success",
        text: "Trainer deleted successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Trainer deletion failed.",
      });
    }
  }

  async function handleSavePackage() {
    const payload = {
      planName: packageForm.planName,
      price: Number(packageForm.price),
      durationMonths: Number(packageForm.durationMonths),
    };

    try {
      if (editingPackageId) {
        await api.packages.update(editingPackageId, payload);
      } else {
        await api.packages.create(payload);
      }

      setPackages(await api.packages.list());
      setEditingPackageId(null);
      setPackageForm(initialPackageForm);
      setBanner({
        type: "success",
        text: "Package saved successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Package save failed.",
      });
    }
  }

  async function handleDeletePackage(planId: number) {
    try {
      await api.packages.delete(planId);
      setPackages(await api.packages.list());
      setEditingPackageId(null);
      setPackageForm(initialPackageForm);
      setBanner({
        type: "success",
        text: "Package deleted successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Package deletion failed.",
      });
    }
  }

  async function handleSaveVideo() {
    const payload = {
      title: videoForm.title,
      duration: numberValue(videoForm.duration),
      videoURL: videoForm.videoURL || undefined,
      language: videoForm.language || undefined,
      equipment: videoForm.equipment || undefined,
      shortDescription: videoForm.shortDescription || undefined,
      trainerId: numberValue(videoForm.trainerId),
      categoryId: numberValue(videoForm.categoryId),
    };

    try {
      if (editingVideoId) {
        await api.videos.update(editingVideoId, payload);
      } else {
        await api.videos.create(payload);
      }

      await loadVideos();
      setEditingVideoId(null);
      setVideoForm(initialVideoForm);
      setBanner({
        type: "success",
        text: "Video saved successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Video save failed.",
      });
    }
  }

  async function handleDeleteVideo(videoId: number) {
    try {
      await api.videos.delete(videoId);
      await loadVideos();
      setEditingVideoId(null);
      setVideoForm(initialVideoForm);
      setBanner({
        type: "success",
        text: "Video deleted successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Video deletion failed.",
      });
    }
  }

  async function handleSaveUser() {
    if (!editingUserId) {
      return;
    }

    try {
      await api.users.update(editingUserId, {
        name: userForm.name || undefined,
        email: userForm.email || undefined,
        password: userForm.password || undefined,
        roleCode: userForm.roleCode,
        accountStatus: userForm.accountStatus,
      });
      const [nextUsers, nextCurrentUser] = await Promise.all([
        api.users.list(),
        user?.userId === editingUserId ? api.auth.me() : Promise.resolve(null),
      ]);
      setUsers(nextUsers);
      if (nextCurrentUser) {
        setUser(nextCurrentUser);
      }
      setEditingUserId(null);
      setUserForm(initialUserForm);
      setBanner({
        type: "success",
        text: "User updated successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "User update failed.",
      });
    }
  }

  async function handleAssignSubscriptionToUser() {
    if (!editingUserId || !userForm.subscriptionPlanId) {
      setBanner({
        type: "error",
        text: "Choose a user and a plan first.",
      });
      return;
    }

    try {
      await api.subscriptions.create({
        userId: editingUserId,
        planId: Number(userForm.subscriptionPlanId),
        autoRenew: userForm.autoRenew,
      });
      setSubscriptions(await api.subscriptions.list());
      setUserForm((current) => ({
        ...current,
        subscriptionPlanId: "",
        autoRenew: false,
      }));
      setBanner({
        type: "success",
        text: "Subscription added successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Subscription assignment failed.",
      });
    }
  }

  async function handleDeleteUser(userId: number) {
    if (user?.userId === userId) {
      setBanner({
        type: "error",
        text: t.adminSelfDeleteBlocked,
      });
      return;
    }

    try {
      await api.users.delete(userId);
      setUsers(await api.users.list());
      setEditingUserId(null);
      setUserForm(initialUserForm);
      setBanner({
        type: "success",
        text: "User deleted successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "User deletion failed.",
      });
    }
  }

  function resetAdminEditor(section = adminSection) {
    if (section === "categories") {
      setEditingCategoryId(null);
      setCategoryForm(initialCategoryForm);
      return;
    }

    if (section === "trainers") {
      setEditingTrainerId(null);
      setTrainerForm(initialTrainerForm);
      return;
    }

    if (section === "packages") {
      setEditingPackageId(null);
      setPackageForm(initialPackageForm);
      return;
    }

    if (section === "videos") {
      setEditingVideoId(null);
      setVideoForm(initialVideoForm);
      return;
    }

    setEditingUserId(null);
    setUserForm(initialUserForm);
  }

  function setAdminWorkspace(section: AdminSection) {
    setAdminSection(section);
    setAdminSearch("");
    resetAdminEditor(section);
  }

  if (booting) {
    return (
      <main className="loading-screen">
        <div className="loading-card">
          <span className="section-eyebrow">{t.brand}</span>
          <h1>{t.loadingApp}</h1>
        </div>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" aria-hidden="true" />
      <div className="ambient ambient-right" aria-hidden="true" />

      <header className="site-header">
        <div className="container header-shell">
          <button className="brand-lockup" type="button" onClick={() => setCurrentPage("overview")}>
            <span className="brand-mark">FN</span>
            <span>
              <strong>{t.brand}</strong>
              <small>{t.tagline}</small>
            </span>
          </button>

          <nav className="main-nav">
            <button
              className={currentPage === "overview" ? "nav-link active" : "nav-link"}
              type="button"
              onClick={() => setCurrentPage("overview")}
            >
              {t.nav.overview}
            </button>
            {user ? (
              <>
                <button
                  className={currentPage === "library" ? "nav-link active" : "nav-link"}
                  type="button"
                  onClick={() => setCurrentPage("library")}
                >
                  {t.nav.library}
                </button>
                <button
                  className={currentPage === "playlists" ? "nav-link active" : "nav-link"}
                  type="button"
                  onClick={() => setCurrentPage("playlists")}
                >
                  {t.nav.playlists}
                </button>
                <button
                  className={currentPage === "membership" ? "nav-link active" : "nav-link"}
                  type="button"
                  onClick={() => setCurrentPage("membership")}
                >
                  {t.nav.membership}
                </button>
              </>
            ) : null}
            {isAdmin ? (
              <button
                className={currentPage === "admin" ? "nav-link active" : "nav-link"}
                type="button"
                onClick={() => setCurrentPage("admin")}
              >
                {t.nav.admin}
              </button>
            ) : null}
          </nav>

          <div className="header-actions">
            <div className="language-switcher">
              <button
                className={language === "en" ? "lang-button active" : "lang-button"}
                type="button"
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
              <button
                className={language === "et" ? "lang-button active" : "lang-button"}
                type="button"
                onClick={() => setLanguage("et")}
              >
                ET
              </button>
            </div>
            {user ? (
              <button className="outline-button" type="button" onClick={handleLogout}>
                {t.logout}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="container main-layout">
        {currentPage === "overview" ? (
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="section-eyebrow">{t.heroEyebrow}</span>
            <h1>{t.heroTitle}</h1>
            <p>{t.heroText}</p>
            <div className="hero-actions">
              {user ? (
                <>
                  <button className="primary-button" type="button" onClick={handleRefresh} disabled={loadingData || loadingVideos}>
                    {t.refresh}
                  </button>
                  <button className="secondary-button" type="button" onClick={() => setCurrentPage("library")}>
                    {t.nav.library}
                  </button>
                </>
              ) : (
                <button className="primary-button" type="button" onClick={() => setAuthMode("register")}>
                  {t.register}
                </button>
              )}
            </div>

            {user ? (
              <div className="hero-member-chip">
                <span>{t.accessLabel}</span>
                <strong>{getAccessTierLabel(currentAccessTier, t)}</strong>
              </div>
            ) : null}

            <div className="stat-grid">
              <StatCard label={t.availableNow} value={availableVideosCount} />
              <StatCard label={t.statsVideos} value={videos.length} />
              <StatCard label={t.statsTrainers} value={trainers.length} />
              <StatCard label={t.statsCategories} value={categories.length} />
              <StatCard label={t.statsPackages} value={packages.length} />
              <StatCard label={t.statsPlaylists} value={playlists.length} />
              <StatCard label={t.statsSubscriptions} value={userSubscriptions.length} />
            </div>
          </div>

          <aside className="auth-card">
            <SectionHeader
              eyebrow={t.authTitle}
              title={user ? t.currentUser : t.guestTitle}
              text={user ? user.email : t.guestText}
            />

            {banner ? (
              <div className={banner.type === "success" ? "banner success" : "banner error"}>
                {banner.text}
              </div>
            ) : null}

            {user ? (
              <div className="profile-summary">
                <div className="profile-chip">
                  <strong>{user.name}</strong>
                  <span>{user.role === "ADMIN" ? t.roleAdmin : t.roleUser}</span>
                </div>
                <div className="profile-meta">
                  <p>{user.email}</p>
                  <p>
                    {t.registerDate}: {formatDate(user.registerDate)}
                  </p>
                  <p>
                    {t.accessLabel}: {getAccessTierLabel(currentAccessTier, t)}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="auth-tabs">
                  <button
                    className={authMode === "login" ? "active" : ""}
                    type="button"
                    onClick={() => setAuthMode("login")}
                  >
                    {t.login}
                  </button>
                  <button
                    className={authMode === "register" ? "active" : ""}
                    type="button"
                    onClick={() => setAuthMode("register")}
                  >
                    {t.register}
                  </button>
                </div>

                <form className="auth-form" onSubmit={handleAuthSubmit}>
                  {authMode === "register" ? (
                    <Field label={t.authName}>
                      <input
                        value={authForm.name}
                        onChange={(event) =>
                          setAuthForm((current) => ({ ...current, name: event.target.value }))
                        }
                        required
                        type="text"
                      />
                    </Field>
                  ) : null}
                  <Field label={t.authEmail}>
                    <input
                      value={authForm.email}
                      onChange={(event) =>
                        setAuthForm((current) => ({ ...current, email: event.target.value }))
                      }
                      autoComplete="email"
                      inputMode="email"
                      required
                      type="text"
                    />
                  </Field>
                  <Field label={t.authPassword}>
                    <input
                      value={authForm.password}
                      onChange={(event) =>
                        setAuthForm((current) => ({ ...current, password: event.target.value }))
                      }
                      minLength={6}
                      required
                      type="password"
                    />
                  </Field>
                  <button className="primary-button wide" disabled={authBusy} type="submit">
                    {authBusy
                      ? "..."
                      : authMode === "login"
                        ? t.authSubmitLogin
                        : t.authSubmitRegister}
                  </button>
                </form>
              </>
            )}
          </aside>
        </section>
        ) : null}

        {banner && currentPage !== "overview" ? (
          <div className={banner.type === "success" ? "banner success page-banner" : "banner error page-banner"}>
            {banner.text}
          </div>
        ) : null}

        {!user ? (
          <section className="content-panel">
            <SectionHeader
              eyebrow={t.nav.overview}
              title={t.guestTitle}
              text={t.dashboardGuestCta}
            />
          </section>
        ) : null}

        {user && currentPage === "overview" ? (
          <section className="content-panel">
            <SectionHeader
              eyebrow={t.nav.overview}
              title={t.overviewTitle}
              text={t.overviewText}
            />

            <div className="overview-grid">
              <article className="highlight-card profile-highlight">
                <span>{t.currentUser}</span>
                <strong>{user.name}</strong>
                <p>{user.email}</p>
                <div className="row-meta">
                  <span>{getAccessTierLabel(currentAccessTier, t)}</span>
                  <span>{t.registerDate}: {formatDate(user.registerDate)}</span>
                </div>
              </article>
              <article className="highlight-card">
                <span>{t.accessLabel}</span>
                <strong>{getAccessTierLabel(currentAccessTier, t)}</strong>
                <p>{currentAccessPlan?.planName ?? t.accessNone}</p>
              </article>
              <article className="highlight-card">
                <span>{t.availableNow}</span>
                <strong>{availableVideosCount}</strong>
                <p>
                  {availableVideosCount === videos.length
                    ? t.accessFull
                    : `${videos.length - availableVideosCount} ${t.lockedCount}`}
                </p>
              </article>
            </div>

            <div className="split-grid">
              <article className="data-card">
                <h3>{t.profileFocus}</h3>
                <div className="mini-list">
                  {videos
                    .filter((video) => canAccessTier(currentAccessTier, getVideoAccessTier(video)))
                    .slice(0, 5)
                    .map((video) => (
                    <div className="mini-list-row" key={video.videoId}>
                      <strong>{video.title}</strong>
                      <span>{video.trainer?.trainerName ?? t.noTrainer}</span>
                    </div>
                  ))}
                </div>
              </article>
              <article className="data-card">
                <h3>{t.nextBestPlan}</h3>
                <div className="mini-list">
                  {packages
                    .filter(
                      (subscriptionPlan) =>
                        getAccessRank(getAccessTierFromPlanName(subscriptionPlan.planName)) >
                        getAccessRank(currentAccessTier),
                    )
                    .slice(0, 3)
                    .map((subscriptionPlan) => (
                      <button
                        className="mini-list-row mini-list-row-button"
                        key={subscriptionPlan.planId}
                        type="button"
                        onClick={() => {
                          setCheckoutPlanId(subscriptionPlan.planId);
                          setCurrentPage("membership");
                        }}
                      >
                        <strong>{subscriptionPlan.planName}</strong>
                        <span>{formatPrice(subscriptionPlan.price)}</span>
                      </button>
                    ))}
                  {packages.filter(
                    (subscriptionPlan) =>
                      getAccessRank(getAccessTierFromPlanName(subscriptionPlan.planName)) >
                      getAccessRank(currentAccessTier),
                  ).length === 0 ? (
                    <div className="mini-list-row">
                      <strong>{t.accessFull}</strong>
                      <span>{t.availableNow}</span>
                    </div>
                  ) : null}
                </div>
              </article>
            </div>
          </section>
        ) : null}

        {user && currentPage === "library" ? (
          <section className="content-panel">
            <SectionHeader
              eyebrow={t.nav.library}
              title={t.libraryTitle}
              text={t.libraryText}
            />

            <div className="filter-grid">
              <Field label={t.searchLabel}>
                <input
                  placeholder={t.searchPlaceholder}
                  type="text"
                  value={libraryFilters.search}
                  onChange={(event) =>
                    setLibraryFilters((current) => ({ ...current, search: event.target.value }))
                  }
                />
              </Field>
              <Field label={t.trainerFilter}>
                <select
                  value={libraryFilters.trainerId}
                  onChange={(event) =>
                    setLibraryFilters((current) => ({
                      ...current,
                      trainerId: event.target.value,
                    }))
                  }
                >
                  <option value="">{t.allTrainers}</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.trainerId} value={trainer.trainerId}>
                      {trainer.trainerName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t.categoryFilter}>
                <select
                  value={libraryFilters.categoryId}
                  onChange={(event) =>
                    setLibraryFilters((current) => ({
                      ...current,
                      categoryId: event.target.value,
                    }))
                  }
                >
                  <option value="">{t.allCategories}</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {loadingVideos ? <p className="muted-text">Loading videos…</p> : null}

            <div className="video-grid">
              {videos.length ? (
                videos.map((video) => {
                  const requiredTier = getVideoAccessTier(video);
                  const unlocked = isAdmin || canAccessTier(currentAccessTier, requiredTier);
                  const thumbnailUrl = getYouTubeThumbnail(video.videoURL);

                  return (
                    <article className={unlocked ? "video-card" : "video-card locked"} key={video.videoId}>
                      <div className={`video-cover tier-${requiredTier}`}>
                        {thumbnailUrl ? (
                          <img alt={video.title} className="video-cover-image" loading="lazy" src={thumbnailUrl} />
                        ) : null}
                        <div className="video-cover-overlay">
                          <span>{video.category?.categoryName ?? t.noCategory}</span>
                          <span>{getAccessTierLabel(requiredTier, t)}</span>
                        </div>
                        <div className="video-cover-copy">
                          <strong>{video.title}</strong>
                          <p>{video.trainer?.trainerName ?? t.noTrainer}</p>
                        </div>
                        {!unlocked ? (
                          <div className="video-lock-layer">
                            <strong>{t.accessNeeded}</strong>
                            <p>{getAccessTierLabel(requiredTier, t)}</p>
                          </div>
                        ) : null}
                      </div>
                      <div className="video-meta-top">
                        <span>{video.duration ? `${video.duration} min` : "—"}</span>
                        <span>{video.language ?? t.noLanguage}</span>
                      </div>
                      <h3>{video.title}</h3>
                      <p>{video.shortDescription ?? t.sessionDetailsSoon}</p>
                      <div className="video-tags">
                        <span>{video.trainer?.trainerName ?? t.noTrainer}</span>
                        <span>{video.equipment ?? t.noEquipment}</span>
                      </div>
                      <div className="video-actions">
                        <label className={unlocked ? "checkbox-chip" : "checkbox-chip disabled"}>
                          <input
                            checked={selectedVideoIds.includes(video.videoId)}
                            disabled={!unlocked}
                            type="checkbox"
                            onChange={() => toggleSelectedVideo(video.videoId)}
                          />
                          <span>{t.selectedVideos}</span>
                        </label>
                        {unlocked ? (
                          <>
                            <button className="small-action" type="button" onClick={() => handleToggleVideoInPlaylist(video.videoId)}>
                              {videoIsInActivePlaylist(video.videoId)
                                ? t.removeFromPlaylist
                                : t.addToPlaylist}
                            </button>
                            {video.videoURL ? (
                              <button
                                className="small-link"
                                type="button"
                                onClick={() => setActiveVideo(video)}
                              >
                                {t.watchNow}
                              </button>
                            ) : null}
                          </>
                        ) : (
                          <button
                            className="small-action"
                            type="button"
                            onClick={() => {
                              const suggestedPlan = packages.find(
                                (subscriptionPlan) =>
                                  getAccessTierFromPlanName(subscriptionPlan.planName) === requiredTier,
                              );
                              setCheckoutPlanId(suggestedPlan?.planId ?? null);
                              setCurrentPage("membership");
                            }}
                          >
                            {t.unlockThisVideo}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })
              ) : (
                <article className="empty-card">{t.noVideos}</article>
              )}
            </div>
          </section>
        ) : null}

        {user && currentPage === "playlists" ? (
          <section className="content-panel">
            <SectionHeader
              eyebrow={t.nav.playlists}
              title={t.playlistsTitle}
              text={t.playlistsText}
            />

            <div className="split-grid">
              <article className="data-card">
                <Field label={t.playlistName}>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(event) => setNewPlaylistName(event.target.value)}
                  />
                </Field>
                <div className="selection-box">
                  <span>{t.selectedVideos}</span>
                  <p>
                    {selectedVideoIds.length
                      ? selectedVideoIds
                          .map((videoId) => videos.find((video) => video.videoId === videoId)?.title ?? String(videoId))
                          .join(", ")
                      : t.emptySelection}
                  </p>
                </div>
                <button className="primary-button wide" type="button" onClick={handleCreatePlaylist}>
                  {t.createPlaylist}
                </button>
              </article>

              <article className="data-card">
                <Field label={t.choosePlaylist}>
                  <select
                    value={activePlaylistId ?? ""}
                    onChange={(event) => setActivePlaylistId(Number(event.target.value) || null)}
                  >
                    <option value="">—</option>
                    {playlists.map((playlist) => (
                      <option key={playlist.playlistId} value={playlist.playlistId}>
                        {playlist.playlistName}
                      </option>
                    ))}
                  </select>
                </Field>
                <p className="muted-text">{activePlaylist ? activePlaylist.playlistName : t.noPlaylists}</p>
              </article>
            </div>

            <div className="playlist-grid">
              {playlists.length ? (
                playlists.map((playlist) => (
                  <article className="playlist-card" key={playlist.playlistId}>
                    <Field label={t.renamePlaylist}>
                      <input
                        type="text"
                        value={playlistNameEdits[playlist.playlistId] ?? playlist.playlistName}
                        onChange={(event) =>
                          setPlaylistNameEdits((current) => ({
                            ...current,
                            [playlist.playlistId]: event.target.value,
                          }))
                        }
                      />
                    </Field>
                    <div className="card-actions">
                      <button className="small-action" type="button" onClick={() => handleRenamePlaylist(playlist.playlistId)}>
                        {t.save}
                      </button>
                      <button className="small-action danger" type="button" onClick={() => handleDeletePlaylist(playlist.playlistId)}>
                        {t.delete}
                      </button>
                    </div>
                    <div className="mini-list">
                      <span className="list-label">{t.videosInPlaylist}</span>
                      {playlist.playlistVideos.length ? (
                        playlist.playlistVideos.map((entry) =>
                          entry.video ? (
                            <div className="mini-list-row" key={entry.playlistVideoId}>
                              <strong>{entry.video.title}</strong>
                              <button
                                className="tiny-button"
                                type="button"
                                onClick={() => handleRemoveVideoFromPlaylist(playlist, entry.video!.videoId)}
                              >
                                {t.delete}
                              </button>
                            </div>
                          ) : null,
                        )
                      ) : (
                        <p className="muted-text">{t.noVideos}</p>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <article className="empty-card">{t.noPlaylists}</article>
              )}
            </div>
          </section>
        ) : null}

        {user && currentPage === "membership" ? (
          <section className="content-panel">
            <SectionHeader
              eyebrow={t.nav.membership}
              title={t.membershipTitle}
              text={t.membershipText}
            />

            <div className="plan-grid">
              {packages.map((subscriptionPlan) => (
                <article
                  className={
                    checkoutPlanId === subscriptionPlan.planId
                      ? "plan-card plan-card-selected"
                      : "plan-card"
                  }
                  key={subscriptionPlan.planId}
                >
                  <span>{subscriptionPlan.planName}</span>
                  <strong>{formatPrice(subscriptionPlan.price)}</strong>
                  <p>{subscriptionPlan.durationMonths} {t.durationMonths.toLowerCase()}</p>
                  <div className="plan-feature-list">
                    {getPlanHighlights(
                      getAccessTierFromPlanName(subscriptionPlan.planName),
                      language,
                    ).map((item) => (
                      <div className="plan-feature" key={item}>
                        {item}
                      </div>
                    ))}
                  </div>
                  <button
                    className="secondary-button wide"
                    type="button"
                    onClick={() => setCheckoutPlanId(subscriptionPlan.planId)}
                  >
                    {checkoutPlanId === subscriptionPlan.planId ? t.selectedPlan : t.selectPlan}
                  </button>
                </article>
              ))}
            </div>

            <div className="split-grid membership-checkout-grid">
              <article className="data-card checkout-card">
                <SectionHeader
                  eyebrow={t.simulatedCheckoutTitle}
                  title={selectedPlan ? selectedPlan.planName : t.selectedPlan}
                  text={t.simulatedCheckoutText}
                />
                <div className="selection-box">
                  <span>{t.accessLabel}</span>
                  <p>{getAccessTierLabel(currentAccessTier, t)}</p>
                </div>
                <div className="selection-box">
                  <span>{t.packageIncludes}</span>
                  <p>
                    {selectedPlan
                      ? getPlanHighlights(getAccessTierFromPlanName(selectedPlan.planName), language).join(" • ")
                      : "—"}
                  </p>
                </div>
                <Field label={t.paymentEmail}>
                  <input
                    type="text"
                    value={paymentForm.email}
                    onChange={(event) =>
                      setPaymentForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </Field>
                <Field label={t.paymentCardholder}>
                  <input
                    type="text"
                    value={paymentForm.cardholder}
                    onChange={(event) =>
                      setPaymentForm((current) => ({ ...current, cardholder: event.target.value }))
                    }
                  />
                </Field>
                <Field label={t.paymentCardNumber}>
                  <input
                    type="text"
                    value={paymentForm.cardNumber}
                    onChange={(event) =>
                      setPaymentForm((current) => ({ ...current, cardNumber: event.target.value }))
                    }
                  />
                </Field>
                <button
                  className="primary-button wide"
                  disabled={!selectedPlan || paymentBusy}
                  type="button"
                  onClick={() => {
                    if (selectedPlan) {
                      void handleSubscribe(selectedPlan.planId);
                    }
                  }}
                >
                  {paymentBusy ? "..." : t.subscribe}
                </button>
                <p className="muted-text">{t.paymentHint}</p>
              </article>

              <div className="subscription-list">
                <span className="list-label">{t.activeSubscriptions}</span>
                {userSubscriptions.length ? (
                  userSubscriptions.map((subscription) => (
                    <article className="subscription-card" key={subscription.userSubscriptionId}>
                      <div>
                        <strong>{subscription.plan?.planName ?? "Plan"}</strong>
                        <p>{formatDate(subscription.startDate)}</p>
                      </div>
                      <button
                        className="small-action danger"
                        type="button"
                        onClick={() => handleDeleteSubscription(subscription.userSubscriptionId)}
                      >
                        {t.delete}
                      </button>
                    </article>
                  ))
                ) : (
                  <article className="empty-card">{t.noSubscriptions}</article>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {user && currentPage === "admin" ? (
          <section className="content-panel">
            <SectionHeader
              eyebrow={t.nav.admin}
              title={t.adminTitle}
              text={`${t.adminText} ${t.adminWorkspaceHint}`}
            />

            <div className="admin-overview-grid">
              {adminSections.map((section) => (
                <button
                  key={section.id}
                  className={adminSection === section.id ? "admin-summary-card active" : "admin-summary-card"}
                  type="button"
                  onClick={() => setAdminWorkspace(section.id)}
                >
                  <span>{section.title}</span>
                  <strong>{section.count}</strong>
                </button>
              ))}
            </div>

            <div className="admin-switcher">
              {adminSections.map((section) => (
                <button
                  key={section.id}
                  className={adminSection === section.id ? "admin-switch active" : "admin-switch"}
                  type="button"
                  onClick={() => setAdminWorkspace(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </div>

            <div className="admin-toolbar">
              <div className="admin-toolbar-copy">
                <span className="section-eyebrow">{activeAdminSection.title}</span>
                <p>{t.adminWorkspaceHint}</p>
              </div>
              <div className="admin-toolbar-actions">
                <Field label={t.searchLabel}>
                  <input
                    type="text"
                    value={adminSearch}
                    placeholder={t.adminSearchPlaceholder}
                    onChange={(event) => setAdminSearch(event.target.value)}
                  />
                </Field>
              </div>
            </div>

            <div className="admin-grid">
              {adminSection === "categories" ? (
              <article className="admin-card">
                <h3>{t.categoryManager}</h3>
                <Field label={t.categoryFilter}>
                  <input
                    type="text"
                    value={categoryForm.categoryName}
                    onChange={(event) =>
                      setCategoryForm({
                        categoryName: event.target.value,
                      })
                    }
                  />
                </Field>
                <div className="card-actions">
                  <button className="small-action" type="button" onClick={handleSaveCategory}>
                    {t.save}
                  </button>
                  <button
                    className="small-action ghost"
                    type="button"
                    onClick={() => {
                      setEditingCategoryId(null);
                      setCategoryForm(initialCategoryForm);
                    }}
                  >
                    {t.cancel}
                  </button>
                  {editingCategoryId ? (
                    <button className="small-action danger" type="button" onClick={() => handleDeleteCategory(editingCategoryId)}>
                      {t.delete}
                    </button>
                  ) : null}
                </div>
                <div className="mini-list">
                  {filteredCategories.length ? (
                    filteredCategories.map((category) => (
                      <button
                        className={editingCategoryId === category.categoryId ? "selectable-row active" : "selectable-row"}
                        key={category.categoryId}
                        type="button"
                        onClick={() => fillCategoryForm(category)}
                      >
                        <strong>{category.categoryName}</strong>
                        <div className="row-meta">
                          <span>{videos.filter((video) => video.categoryId === category.categoryId).length} {t.statsVideos.toLowerCase()}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <article className="empty-card inline-empty">{t.adminNoMatches}</article>
                  )}
                </div>
              </article>
              ) : null}

              {adminSection === "trainers" ? (
              <article className="admin-card">
                <h3>{t.trainerManager}</h3>
                <Field label={t.authName}>
                  <input
                    type="text"
                    value={trainerForm.trainerName}
                    onChange={(event) =>
                      setTrainerForm((current) => ({ ...current, trainerName: event.target.value }))
                    }
                  />
                </Field>
                <Field label={t.trainerBio}>
                  <textarea
                    value={trainerForm.bio}
                    onChange={(event) =>
                      setTrainerForm((current) => ({ ...current, bio: event.target.value }))
                    }
                  />
                </Field>
                <Field label={t.startDate}>
                  <input
                    type="date"
                    value={trainerForm.startDate}
                    onChange={(event) =>
                      setTrainerForm((current) => ({ ...current, startDate: event.target.value }))
                    }
                  />
                </Field>
                <div className="card-actions">
                  <button className="small-action" type="button" onClick={handleSaveTrainer}>
                    {t.save}
                  </button>
                  <button
                    className="small-action ghost"
                    type="button"
                    onClick={() => {
                      setEditingTrainerId(null);
                      setTrainerForm(initialTrainerForm);
                    }}
                  >
                    {t.cancel}
                  </button>
                  {editingTrainerId ? (
                    <button className="small-action danger" type="button" onClick={() => handleDeleteTrainer(editingTrainerId)}>
                      {t.delete}
                    </button>
                  ) : null}
                </div>
                <div className="mini-list">
                  {filteredTrainers.length ? (
                    filteredTrainers.map((trainer) => (
                      <button
                        className={editingTrainerId === trainer.trainerId ? "selectable-row active" : "selectable-row"}
                        key={trainer.trainerId}
                        type="button"
                        onClick={() => fillTrainerForm(trainer)}
                      >
                        <strong>{trainer.trainerName}</strong>
                        <div className="row-meta">
                          <span>{videos.filter((video) => video.trainerId === trainer.trainerId).length} {t.statsVideos.toLowerCase()}</span>
                          <span>{formatDate(trainer.startDate)}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <article className="empty-card inline-empty">{t.adminNoMatches}</article>
                  )}
                </div>
              </article>
              ) : null}

              {adminSection === "packages" ? (
              <article className="admin-card">
                <h3>{t.packageManager}</h3>
                <Field label={t.playlistName}>
                  <input
                    type="text"
                    value={packageForm.planName}
                    onChange={(event) =>
                      setPackageForm((current) => ({ ...current, planName: event.target.value }))
                    }
                  />
                </Field>
                <Field label={t.price}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={packageForm.price}
                    onChange={(event) =>
                      setPackageForm((current) => ({ ...current, price: event.target.value }))
                    }
                  />
                </Field>
                <Field label={t.durationMonths}>
                  <input
                    type="number"
                    min="1"
                    value={packageForm.durationMonths}
                    onChange={(event) =>
                      setPackageForm((current) => ({
                        ...current,
                        durationMonths: event.target.value,
                      }))
                    }
                  />
                </Field>
                <div className="card-actions">
                  <button className="small-action" type="button" onClick={handleSavePackage}>
                    {t.save}
                  </button>
                  <button
                    className="small-action ghost"
                    type="button"
                    onClick={() => {
                      setEditingPackageId(null);
                      setPackageForm(initialPackageForm);
                    }}
                  >
                    {t.cancel}
                  </button>
                  {editingPackageId ? (
                    <button className="small-action danger" type="button" onClick={() => handleDeletePackage(editingPackageId)}>
                      {t.delete}
                    </button>
                  ) : null}
                </div>
                <div className="mini-list">
                  {filteredPackages.length ? (
                    filteredPackages.map((subscriptionPlan) => (
                      <button
                        className={editingPackageId === subscriptionPlan.planId ? "selectable-row active" : "selectable-row"}
                        key={subscriptionPlan.planId}
                        type="button"
                        onClick={() => fillPackageForm(subscriptionPlan)}
                      >
                        <strong>{subscriptionPlan.planName}</strong>
                        <div className="row-meta">
                          <span>{formatPrice(subscriptionPlan.price)}</span>
                          <span>{subscriptionPlan.durationMonths} {t.durationMonths.toLowerCase()}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <article className="empty-card inline-empty">{t.adminNoMatches}</article>
                  )}
                </div>
              </article>
              ) : null}

              {adminSection === "videos" ? (
              <article className="admin-card admin-card-wide">
                <h3>{t.videoManager}</h3>
                <div className="admin-form-grid">
                  <Field label={t.authName}>
                    <input
                      type="text"
                      value={videoForm.title}
                      onChange={(event) =>
                        setVideoForm((current) => ({ ...current, title: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label={t.duration}>
                    <input
                      type="number"
                      min="1"
                      value={videoForm.duration}
                      onChange={(event) =>
                        setVideoForm((current) => ({ ...current, duration: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label={t.videoUrl}>
                    <input
                      type="url"
                      value={videoForm.videoURL}
                      onChange={(event) =>
                        setVideoForm((current) => ({ ...current, videoURL: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label={t.language}>
                    <input
                      type="text"
                      value={videoForm.language}
                      onChange={(event) =>
                        setVideoForm((current) => ({ ...current, language: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label={t.equipment}>
                    <input
                      type="text"
                      value={videoForm.equipment}
                      onChange={(event) =>
                        setVideoForm((current) => ({ ...current, equipment: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label={t.trainerFilter}>
                    <select
                      value={videoForm.trainerId}
                      onChange={(event) =>
                        setVideoForm((current) => ({ ...current, trainerId: event.target.value }))
                      }
                    >
                      <option value="">—</option>
                      {trainers.map((trainer) => (
                        <option key={trainer.trainerId} value={trainer.trainerId}>
                          {trainer.trainerName}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t.categoryFilter}>
                    <select
                      value={videoForm.categoryId}
                      onChange={(event) =>
                        setVideoForm((current) => ({ ...current, categoryId: event.target.value }))
                      }
                    >
                      <option value="">—</option>
                      {categories.map((category) => (
                        <option key={category.categoryId} value={category.categoryId}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label={t.description}>
                  <textarea
                    value={videoForm.shortDescription}
                    onChange={(event) =>
                      setVideoForm((current) => ({
                        ...current,
                        shortDescription: event.target.value,
                      }))
                    }
                  />
                </Field>
                <div className="card-actions">
                  <button className="small-action" type="button" onClick={handleSaveVideo}>
                    {t.save}
                  </button>
                  <button
                    className="small-action ghost"
                    type="button"
                    onClick={() => {
                      setEditingVideoId(null);
                      setVideoForm(initialVideoForm);
                    }}
                  >
                    {t.cancel}
                  </button>
                  {editingVideoId ? (
                    <button className="small-action danger" type="button" onClick={() => handleDeleteVideo(editingVideoId)}>
                      {t.delete}
                    </button>
                  ) : null}
                </div>
                <div className="mini-list">
                  {filteredVideos.length ? (
                    filteredVideos.map((video) => (
                      <button
                        className={editingVideoId === video.videoId ? "selectable-row active" : "selectable-row"}
                        key={video.videoId}
                        type="button"
                        onClick={() => fillVideoForm(video)}
                      >
                        <strong>{video.title}</strong>
                        <div className="row-meta">
                          <span>{video.trainer?.trainerName ?? "—"}</span>
                          <span>{video.category?.categoryName ?? "—"}</span>
                          <span>{video.duration ? `${video.duration} min` : "—"}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <article className="empty-card inline-empty">{t.adminNoMatches}</article>
                  )}
                </div>
              </article>
              ) : null}

              {adminSection === "users" ? (
              <article className="admin-card admin-card-wide">
                <h3>{t.userManager}</h3>
                <div className="admin-form-grid">
                  <Field label={t.authName}>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(event) =>
                        setUserForm((current) => ({ ...current, name: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label={t.authEmail}>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(event) =>
                        setUserForm((current) => ({ ...current, email: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label={t.authPassword}>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(event) =>
                        setUserForm((current) => ({ ...current, password: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label={t.role}>
                    <select
                      value={userForm.roleCode}
                      onChange={(event) =>
                        setUserForm((current) => ({
                          ...current,
                          roleCode: event.target.value as UserFormState["roleCode"],
                        }))
                      }
                    >
                      <option value="USER">{t.roleUser}</option>
                      <option value="ADMIN">{t.roleAdmin}</option>
                    </select>
                  </Field>
                  <Field label={t.accountStatus}>
                    <select
                      value={userForm.accountStatus}
                      onChange={(event) =>
                        setUserForm((current) => ({
                          ...current,
                          accountStatus: event.target.value as UserFormState["accountStatus"],
                        }))
                      }
                    >
                      <option value="ACTIVE">{t.statusActive}</option>
                      <option value="SUSPENDED">{t.statusSuspended}</option>
                    </select>
                  </Field>
                </div>
                <div className="admin-form-grid admin-form-grid-compact">
                  <Field label={t.assignPlan}>
                    <select
                      value={userForm.subscriptionPlanId}
                      onChange={(event) =>
                        setUserForm((current) => ({
                          ...current,
                          subscriptionPlanId: event.target.value,
                        }))
                      }
                    >
                      <option value="">—</option>
                      {packages.map((subscriptionPlan) => (
                        <option key={subscriptionPlan.planId} value={subscriptionPlan.planId}>
                          {subscriptionPlan.planName}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <label className="checkbox-chip admin-chip">
                    <input
                      checked={userForm.autoRenew}
                      type="checkbox"
                      onChange={(event) =>
                        setUserForm((current) => ({
                          ...current,
                          autoRenew: event.target.checked,
                        }))
                      }
                    />
                    <span>Auto renew</span>
                  </label>
                </div>
                <div className="selection-box admin-selection-box">
                  <span>{t.currentPlan}</span>
                  <p>
                    {editingUserActiveSubscription?.plan?.planName ?? t.noSubscriptions}
                  </p>
                </div>
                <div className="card-actions">
                  <button
                    className="small-action"
                    disabled={!editingUserId}
                    type="button"
                    onClick={handleSaveUser}
                  >
                    {t.save}
                  </button>
                  <button
                    className="small-action ghost"
                    type="button"
                    onClick={() => {
                      setEditingUserId(null);
                      setUserForm(initialUserForm);
                    }}
                  >
                    {t.cancel}
                  </button>
                  <button
                    className="small-action"
                    disabled={!editingUserId || !userForm.subscriptionPlanId}
                    type="button"
                    onClick={handleAssignSubscriptionToUser}
                  >
                    {t.assignPlan}
                  </button>
                  {editingUserId ? (
                    <button className="small-action danger" type="button" onClick={() => handleDeleteUser(editingUserId)}>
                      {t.delete}
                    </button>
                  ) : null}
                </div>
                <div className="user-table">
                  {filteredUsers.length ? (
                    filteredUsers.map((listedUser) => (
                      <button
                        className={editingUserId === listedUser.userId ? "user-row active" : "user-row"}
                        key={listedUser.userId}
                        type="button"
                        onClick={() => fillUserForm(listedUser)}
                      >
                        <strong>{listedUser.name}</strong>
                        <span>{listedUser.email}</span>
                        <div className="row-meta row-meta-end">
                          <span>{listedUser.role}</span>
                          <span>{listedUser.accountStatus ?? t.statusActive}</span>
                          <span>
                            {subscriptions.filter((subscription) => subscription.userId === listedUser.userId).length} {t.statsSubscriptions.toLowerCase()}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <article className="empty-card inline-empty">{t.adminNoMatches}</article>
                  )}
                </div>
              </article>
              ) : null}
            </div>
          </section>
        ) : null}

        {user && currentPage === "admin" && !isAdmin ? (
          <section className="content-panel">
            <p>{t.adminOnly}</p>
          </section>
        ) : null}

        {loadingData ? <p className="footer-note">Loading protected data…</p> : null}
      </main>

      {activeVideo && activeVideoId ? (
        <div
          aria-modal="true"
          className="video-modal-backdrop"
          role="dialog"
          onClick={() => setActiveVideo(null)}
        >
          <div className="video-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="video-modal-header">
              <div>
                <span className="section-eyebrow">{activeVideo.category?.categoryName ?? t.noCategory}</span>
                <h3>{activeVideo.title}</h3>
              </div>
              <button className="small-action ghost" type="button" onClick={() => setActiveVideo(null)}>
                <span>{t.closeVideo}</span>
              </button>
            </div>
            <div className="video-frame-shell">
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?rel=0&modestbranding=1`}
                title={activeVideo.title}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
