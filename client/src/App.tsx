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
};

const copy = {
  en: {
    brand: "TrainFlow",
    tagline: "Frontend and backend working together.",
    nav: {
      overview: "Overview",
      library: "Library",
      playlists: "Playlists",
      membership: "Membership",
      admin: "Admin",
    },
    heroEyebrow: "Connected platform",
    heroTitle: "Your training frontend is now wired to the real backend API.",
    heroText:
      "Register or log in to load live videos, categories, trainers, packages, playlists, subscriptions, and admin tools from the existing Express + Prisma backend.",
    authTitle: "Account",
    login: "Log in",
    register: "Register",
    logout: "Log out",
    refresh: "Refresh data",
    guestTitle: "Sign in to unlock backend data",
    guestText:
      "The backend protects videos, trainers, categories, playlists, packages, and subscriptions behind JWT authentication.",
    authName: "Name",
    authEmail: "Email",
    authPassword: "Password",
    authSubmitLogin: "Enter platform",
    authSubmitRegister: "Create account",
    overviewTitle: "Platform summary",
    overviewText: "This dashboard shows live counts and your current account state.",
    libraryTitle: "Workout library",
    libraryText: "Search and filter videos using the backend query endpoints.",
    searchLabel: "Search",
    searchPlaceholder: "Search by title or description",
    trainerFilter: "Trainer",
    categoryFilter: "Category",
    allTrainers: "All trainers",
    allCategories: "All categories",
    noVideos: "No videos found for the current filters.",
    playlistsTitle: "Playlists",
    playlistsText: "Create playlists, rename them, add or remove videos, and delete them.",
    createPlaylist: "Create playlist",
    playlistName: "Playlist name",
    selectedVideos: "Selected videos for new playlist",
    noPlaylists: "You do not have any playlists yet.",
    membershipTitle: "Membership and subscriptions",
    membershipText: "Packages come from the backend. You can create or cancel subscriptions here.",
    subscribe: "Subscribe",
    activeSubscriptions: "Active subscriptions",
    noSubscriptions: "No subscriptions yet.",
    adminTitle: "Admin workspace",
    adminText: "Manage categories, trainers, packages, videos, and users from the same frontend.",
    categoryManager: "Category manager",
    trainerManager: "Trainer manager",
    packageManager: "Package manager",
    videoManager: "Video manager",
    userManager: "User manager",
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
    registerDate: "Registered",
    currentUser: "Current user",
    roleAdmin: "Admin",
    roleUser: "User",
    dashboardGuestCta: "Use the auth card to connect the frontend to the backend.",
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
  },
  et: {
    brand: "TrainFlow",
    tagline: "Frontend ja backend töötavad koos.",
    nav: {
      overview: "Ülevaade",
      library: "Videoteek",
      playlists: "Pleilistid",
      membership: "Paketid",
      admin: "Admin",
    },
    heroEyebrow: "Ühendatud platvorm",
    heroTitle: "Sinu treeningu frontend on nüüd seotud päris backend API-ga.",
    heroText:
      "Registreeri või logi sisse, et laadida olemasolevast Express + Prisma backendist videod, kategooriad, treenerid, paketid, pleilistid, tellimused ja admin-tööriistad.",
    authTitle: "Konto",
    login: "Logi sisse",
    register: "Registreeri",
    logout: "Logi välja",
    refresh: "Värskenda andmeid",
    guestTitle: "Logi sisse, et näha backend-andmeid",
    guestText:
      "Backend kaitseb videoid, treenereid, kategooriaid, pleiliste, pakette ja tellimusi JWT autentimisega.",
    authName: "Nimi",
    authEmail: "E-post",
    authPassword: "Parool",
    authSubmitLogin: "Sisene platvormi",
    authSubmitRegister: "Loo konto",
    overviewTitle: "Platvormi ülevaade",
    overviewText: "See juhtpaneel näitab pärisandmete koguseid ja sinu konto seisu.",
    libraryTitle: "Treeningute videoteek",
    libraryText: "Otsi ja filtreeri videoid backend query-endpointide kaudu.",
    searchLabel: "Otsing",
    searchPlaceholder: "Otsi pealkirja või kirjelduse järgi",
    trainerFilter: "Treener",
    categoryFilter: "Kategooria",
    allTrainers: "Kõik treenerid",
    allCategories: "Kõik kategooriad",
    noVideos: "Praeguste filtritega videoid ei leitud.",
    playlistsTitle: "Pleilistid",
    playlistsText: "Loo pleiliste, nimeta ümber, lisa või eemalda videoid ja kustuta neid.",
    createPlaylist: "Loo pleilist",
    playlistName: "Pleilisti nimi",
    selectedVideos: "Valitud videod uue pleilisti jaoks",
    noPlaylists: "Sul ei ole veel ühtegi pleilisti.",
    membershipTitle: "Paketid ja tellimused",
    membershipText: "Paketid tulevad backendist. Siin saad luua või tühistada tellimusi.",
    subscribe: "Telli",
    activeSubscriptions: "Aktiivsed tellimused",
    noSubscriptions: "Tellimusi veel ei ole.",
    adminTitle: "Admin töölaud",
    adminText: "Halda kategooriaid, treenereid, pakette, videoid ja kasutajaid samast frontendist.",
    categoryManager: "Kategooriate haldus",
    trainerManager: "Treenerite haldus",
    packageManager: "Pakettide haldus",
    videoManager: "Videote haldus",
    userManager: "Kasutajate haldus",
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
    registerDate: "Registreeritud",
    currentUser: "Praegune kasutaja",
    roleAdmin: "Admin",
    roleUser: "Kasutaja",
    dashboardGuestCta: "Kasuta auth-kaarti, et ühendada frontend backendiga.",
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
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(initialCategoryForm);
  const [trainerForm, setTrainerForm] = useState<TrainerFormState>(initialTrainerForm);
  const [packageForm, setPackageForm] = useState<PackageFormState>(initialPackageForm);
  const [videoForm, setVideoForm] = useState<VideoFormState>(initialVideoForm);
  const [userForm, setUserForm] = useState<UserFormState>(initialUserForm);

  const t = copy[language];
  const isAdmin = user?.role === "ADMIN";
  const activePlaylist = playlists.find((playlist) => playlist.playlistId === activePlaylistId) ?? null;
  const currentPageLabel = t.nav[currentPage as keyof typeof t.nav];

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
    setCurrentPage("overview");

    if (showMessage) {
      setBanner({
        type: "success",
        text: "Session cleared on the client side.",
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
        text: result.message,
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
      text: "Data refreshed.",
    });
  }

  function toggleSelectedVideo(videoId: number) {
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
    try {
      await api.subscriptions.create({ planId });
      setSubscriptions(await api.subscriptions.list());
      setBanner({
        type: "success",
        text: "Subscription created successfully.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Subscription failed.",
      });
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
      });
      setUsers(await api.users.list());
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

  async function handleDeleteUser(userId: number) {
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

  if (booting) {
    return (
      <main className="loading-screen">
        <div className="loading-card">
          <span className="section-eyebrow">{t.brand}</span>
          <h1>Loading session…</h1>
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
            <span className="brand-mark">TF</span>
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
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="section-eyebrow">{t.heroEyebrow}</span>
            <h1>{t.heroTitle}</h1>
            <p>{t.heroText}</p>
            <div className="hero-actions">
              {user ? (
                <button className="primary-button" type="button" onClick={handleRefresh} disabled={loadingData || loadingVideos}>
                  {t.refresh}
                </button>
              ) : (
                <button className="primary-button" type="button" onClick={() => setAuthMode("register")}>
                  {t.register}
                </button>
              )}
              <button className="secondary-button" type="button" onClick={() => setCurrentPage("library")}>
                {t.nav.library}
              </button>
            </div>

            <div className="stat-grid">
              <StatCard label={t.statsVideos} value={videos.length} />
              <StatCard label={t.statsTrainers} value={trainers.length} />
              <StatCard label={t.statsCategories} value={categories.length} />
              <StatCard label={t.statsPackages} value={packages.length} />
              <StatCard label={t.statsPlaylists} value={playlists.length} />
              <StatCard label={t.statsSubscriptions} value={subscriptions.length} />
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
                      required
                      type="email"
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
              <article className="highlight-card">
                <span>{t.currentUser}</span>
                <strong>{user.name}</strong>
                <p>{user.email}</p>
              </article>
              <article className="highlight-card">
                <span>{t.statsPlaylists}</span>
                <strong>{playlists.length}</strong>
                <p>{activePlaylist ? activePlaylist.playlistName : t.noPlaylists}</p>
              </article>
              <article className="highlight-card">
                <span>{t.activeSubscriptions}</span>
                <strong>{subscriptions.length}</strong>
                <p>
                  {subscriptions[0]?.plan?.planName
                    ? `${subscriptions[0].plan.planName} • ${formatDate(subscriptions[0].startDate)}`
                    : t.noSubscriptions}
                </p>
              </article>
            </div>

            <div className="split-grid">
              <article className="data-card">
                <h3>{t.nav.library}</h3>
                <div className="mini-list">
                  {videos.slice(0, 5).map((video) => (
                    <div className="mini-list-row" key={video.videoId}>
                      <strong>{video.title}</strong>
                      <span>{video.trainer?.trainerName ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </article>
              <article className="data-card">
                <h3>{t.nav.membership}</h3>
                <div className="mini-list">
                  {packages.slice(0, 5).map((subscriptionPlan) => (
                    <div className="mini-list-row" key={subscriptionPlan.planId}>
                      <strong>{subscriptionPlan.planName}</strong>
                      <span>{formatPrice(subscriptionPlan.price)}</span>
                    </div>
                  ))}
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
                videos.map((video) => (
                  <article className="video-card" key={video.videoId}>
                    <div className="video-meta-top">
                      <span>{video.category?.categoryName ?? "No category"}</span>
                      <span>{video.duration ? `${video.duration} min` : "—"}</span>
                    </div>
                    <h3>{video.title}</h3>
                    <p>{video.shortDescription ?? "No description yet."}</p>
                    <div className="video-tags">
                      <span>{video.trainer?.trainerName ?? "No trainer"}</span>
                      <span>{video.language ?? "No language"}</span>
                      <span>{video.equipment ?? "No equipment"}</span>
                    </div>
                    <div className="video-actions">
                      <label className="checkbox-chip">
                        <input
                          checked={selectedVideoIds.includes(video.videoId)}
                          type="checkbox"
                          onChange={() => toggleSelectedVideo(video.videoId)}
                        />
                        <span>{t.selectedVideos}</span>
                      </label>
                      <button className="small-action" type="button" onClick={() => handleToggleVideoInPlaylist(video.videoId)}>
                        {videoIsInActivePlaylist(video.videoId)
                          ? t.removeFromPlaylist
                          : t.addToPlaylist}
                      </button>
                      {video.videoURL ? (
                        <a className="small-link" href={video.videoURL} rel="noreferrer" target="_blank">
                          Open video
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))
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
                      ? selectedVideoIds.join(", ")
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
                <article className="plan-card" key={subscriptionPlan.planId}>
                  <span>{subscriptionPlan.planName}</span>
                  <strong>{formatPrice(subscriptionPlan.price)}</strong>
                  <p>{subscriptionPlan.durationMonths} months</p>
                  <button className="primary-button wide" type="button" onClick={() => handleSubscribe(subscriptionPlan.planId)}>
                    {t.subscribe}
                  </button>
                </article>
              ))}
            </div>

            <div className="subscription-list">
              <span className="list-label">{t.activeSubscriptions}</span>
              {subscriptions.length ? (
                subscriptions.map((subscription) => (
                  <article className="subscription-card" key={subscription.userSubscriptionId}>
                    <div>
                      <strong>{subscription.plan?.planName ?? "Plan"}</strong>
                      <p>
                        {formatDate(subscription.startDate)}
                        {subscription.user?.email ? ` • ${subscription.user.email}` : ""}
                      </p>
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
          </section>
        ) : null}

        {user && currentPage === "admin" ? (
          <section className="content-panel">
            <SectionHeader
              eyebrow={t.nav.admin}
              title={t.adminTitle}
              text={t.adminText}
            />

            <div className="admin-grid">
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
                  {categories.map((category) => (
                    <button className="selectable-row" key={category.categoryId} type="button" onClick={() => fillCategoryForm(category)}>
                      {category.categoryName}
                    </button>
                  ))}
                </div>
              </article>

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
                  {trainers.map((trainer) => (
                    <button className="selectable-row" key={trainer.trainerId} type="button" onClick={() => fillTrainerForm(trainer)}>
                      {trainer.trainerName}
                    </button>
                  ))}
                </div>
              </article>

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
                  {packages.map((subscriptionPlan) => (
                    <button
                      className="selectable-row"
                      key={subscriptionPlan.planId}
                      type="button"
                      onClick={() => fillPackageForm(subscriptionPlan)}
                    >
                      {subscriptionPlan.planName}
                    </button>
                  ))}
                </div>
              </article>

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
                  {videos.map((video) => (
                    <button className="selectable-row" key={video.videoId} type="button" onClick={() => fillVideoForm(video)}>
                      {video.title}
                    </button>
                  ))}
                </div>
              </article>

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
                  {editingUserId ? (
                    <button className="small-action danger" type="button" onClick={() => handleDeleteUser(editingUserId)}>
                      {t.delete}
                    </button>
                  ) : null}
                </div>
                <div className="user-table">
                  {users.map((listedUser) => (
                    <button
                      className="user-row"
                      key={listedUser.userId}
                      type="button"
                      onClick={() => fillUserForm(listedUser)}
                    >
                      <strong>{listedUser.name}</strong>
                      <span>{listedUser.email}</span>
                      <span>{listedUser.role}</span>
                    </button>
                  ))}
                </div>
              </article>
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
    </div>
  );
}

export default App;
