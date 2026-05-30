import { FormEvent, useEffect, useState } from "react";
import { api, clearStoredToken, getStoredToken, setStoredToken } from "./api";
import { copy } from "./appCopy";
import {
  initialCategoryForm,
  initialPaymentForm,
  initialPackageForm,
  initialTrainerForm,
  initialUserForm,
  initialVideoForm,
  pageIds,
} from "./appDefaults";
import {
  canAccessTier,
  extractYouTubeId,
  formatDate,
  formatPrice,
  getAccessRank,
  getAccessTierLabel,
  getPlanAccessTier,
  getPlanHighlights,
  getVideoAccessTier,
  getYouTubeThumbnail,
  isoDateValue,
  matchesQuery,
  numberValue,
} from "./appHelpers";
import type {
  AccessTier,
  AdminSection,
  AuthMode,
  Banner,
  CategoryFormState,
  Language,
  PackageFormState,
  PageId,
  PaymentFormState,
  TrainerFormState,
  UserFormState,
  VideoFormState,
} from "./appTypes";
import { ConfirmDialog, Field, SectionHeader, StatCard, ToastBanner } from "./components/Common";
import type {
  Category,
  Playlist,
  SubscriptionPlan,
  Trainer,
  User,
  UserSubscription,
  Video,
} from "./types";
import { AdminPanel } from "./components/AdminPanel";

function App() {
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    text: string;
    confirmLabel: string;
    cancelLabel: string;
    danger?: boolean;
    onConfirm: () => void | Promise<void>;
  } | null>(null);
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
  const [activePlaylistId, setActivePlaylistId] = useState<number | null>(null);
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
  const currentTrainer = user
    ? trainers.find((trainer) => trainer.user?.userId === user.userId) ?? null
    : null;
  const isTrainer = Boolean(currentTrainer) && !isAdmin;
  const currentRoleLabel = isAdmin ? t.roleAdmin : isTrainer ? t.roleTrainer : t.roleUser;
  const currentTrainerVideos = currentTrainer
    ? videos.filter((video) => video.trainerId === currentTrainer.trainerId)
    : [];
  const activePlaylist = playlists.find((playlist) => playlist.playlistId === activePlaylistId) ?? null;
  const userSubscriptions = user
    ? subscriptions.filter(
        (subscription) => subscription.userId === user.userId && subscription.status === "ACTIVE",
      )
    : [];
  const currentAccessTier = isAdmin
    ? "full"
    : userSubscriptions.reduce<AccessTier>((highestTier, subscription) => {
        const planTier = getPlanAccessTier(subscription.plan);
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
              getAccessRank(getPlanAccessTier(right)) -
              getAccessRank(getPlanAccessTier(left)),
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
    if (!banner) {
      return;
    }

    const timeout = window.setTimeout(() => setBanner(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [banner]);

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

  function openConfirmDialog(nextDialog: NonNullable<typeof confirmDialog>) {
    setConfirmDialog(nextDialog);
  }

  async function runConfirmedAction() {
    if (!confirmDialog) {
      return;
    }

    const action = confirmDialog.onConfirm;
    setConfirmDialog(null);
    await action();
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

  async function handleCreatePlaylist() {
    if (!newPlaylistName.trim()) {
      setBanner({
        type: "error",
        text: "Playlist name is required.",
      });
      return;
    }

    try {
      const createdPlaylist = await api.playlists.create({
        playlistName: newPlaylistName.trim(),
      });
      setNewPlaylistName("");
      const nextPlaylists = await api.playlists.list();
      setPlaylists(nextPlaylists);
      setActivePlaylistId(createdPlaylist.playlistId);
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

  async function handleAddVideoToPlaylist(videoId: number) {
    const playlist = activePlaylist;

    if (!playlist) {
      setBanner({
        type: "error",
        text: t.choosePlaylistFirst,
      });
      return;
    }

    const currentVideoIds = playlist.playlistVideos
      .map((entry) => entry.videoId)
      .filter((id): id is number => typeof id === "number");

    if (currentVideoIds.includes(videoId)) {
      setBanner({
        type: "error",
        text: "This video is already in the selected playlist.",
      });
      return;
    }

    try {
      await api.playlists.update(playlist.playlistId, {
        playlistName: playlist.playlistName,
        videoIds: [...currentVideoIds, videoId],
      });
      setPlaylists(await api.playlists.list());
      setActivePlaylistId(playlist.playlistId);
      setBanner({
        type: "success",
        text: "Video added to playlist.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Playlist sync failed.",
      });
    }
  }

  async function handleDeletePlaylist(playlistId: number) {
    const playlist = playlists.find((entry) => entry.playlistId === playlistId);

    openConfirmDialog({
      title: "Delete playlist?",
      text: playlist
        ? `Remove "${playlist.playlistName}" and all its saved links?`
        : "Remove this playlist and all its saved links?",
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
      onConfirm: async () => {
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
      },
    });
  }

  async function handleRemoveVideoFromPlaylist(playlist: Playlist, videoId: number) {
    const nextVideoIds = playlist.playlistVideos
      .map((entry) => entry.videoId)
      .filter((id): id is number => typeof id === "number" && id !== videoId);

    openConfirmDialog({
      title: "Remove video from playlist?",
      text: "This will update the playlist immediately and the video will no longer appear in the collection.",
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
      onConfirm: async () => {
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
      },
    });
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
    openConfirmDialog({
      title: "Delete subscription?",
      text: "This will remove the selected subscription from the account.",
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
      onConfirm: async () => {
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
      },
    });
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
      accountStatus: nextUser.accountStatus === "BLOCKED" ? "BLOCKED" : "ACTIVE",
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
    const category = categories.find((entry) => entry.categoryId === categoryId);
    openConfirmDialog({
      title: "Delete category?",
      text: category ? `Remove "${category.categoryName}" from the library?` : "Remove this category from the library?",
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
      onConfirm: async () => {
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
      },
    });
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
    const trainer = trainers.find((entry) => entry.trainerId === trainerId);
    openConfirmDialog({
      title: "Delete trainer?",
      text: trainer ? `Remove "${trainer.trainerName}" from the studio?` : "Remove this trainer from the studio?",
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
      onConfirm: async () => {
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
      },
    });
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
    const plan = packages.find((entry) => entry.planId === planId);
    openConfirmDialog({
      title: "Delete package?",
      text: plan ? `Remove "${plan.planName}" and its access rule?` : "Remove this package and its access rule?",
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
      onConfirm: async () => {
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
      },
    });
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
    const video = videos.find((entry) => entry.videoId === videoId);
    openConfirmDialog({
      title: "Delete video?",
      text: video ? `Remove "${video.title}" from the library?` : "Remove this video from the library?",
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
      onConfirm: async () => {
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
      },
    });
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

    const plan = packages.find((entry) => entry.planId === Number(userForm.subscriptionPlanId));

    openConfirmDialog({
      title: "Assign subscription?",
      text: plan
        ? `Add "${plan.planName}" to ${users.find((listedUser) => listedUser.userId === editingUserId)?.name ?? "this user"}?`
        : "Add the selected subscription to this user?",
      confirmLabel: t.assignPlan,
      cancelLabel: t.cancel,
      danger: false,
      onConfirm: async () => {
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
      },
    });
  }

  async function handleDeleteUser(userId: number) {
    if (user?.userId === userId) {
      setBanner({
        type: "error",
        text: t.adminSelfDeleteBlocked,
      });
      return;
    }

    const listedUser = users.find((entry) => entry.userId === userId);
    openConfirmDialog({
      title: "Delete user?",
      text: listedUser
        ? `Remove "${listedUser.name}" and all related access records?`
        : "Remove this user and all related access records?",
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
      onConfirm: async () => {
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
      },
    });
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
              <>
                <div className="hero-member-chip">
                  <span>{t.accessLabel}</span>
                  <strong>{getAccessTierLabel(currentAccessTier, t)}</strong>
                </div>

                <div className="stat-grid">
                  <StatCard label={t.availableNow} value={availableVideosCount} />
                  <StatCard label={t.statsVideos} value={videos.length} />
                  <StatCard label={t.statsTrainers} value={trainers.length} />
                  <StatCard label={t.statsCategories} value={categories.length} />
                  <StatCard label={t.statsPackages} value={packages.length} />
                  <StatCard label={t.statsPlaylists} value={playlists.length} />
                  <StatCard label={t.statsSubscriptions} value={userSubscriptions.length} />
                </div>

                {isTrainer ? (
                  <article className="highlight-card trainer-highlight">
                    <span>{t.trainerDashboard}</span>
                    <strong>{currentTrainer?.trainerName ?? t.roleTrainer}</strong>
                    <p>{t.trainerDashboardText}</p>
                    <div className="row-meta">
                      <span>
                        {currentTrainerVideos.length} {t.statsVideos.toLowerCase()}
                      </span>
                    </div>
                    <div className="mini-list">
                      {currentTrainerVideos.slice(0, 3).map((video) => (
                        <div className="mini-list-row" key={video.videoId}>
                          <strong>{video.title}</strong>
                          <span>{video.category?.categoryName ?? t.noCategory}</span>
                        </div>
                      ))}
                      {currentTrainerVideos.length === 0 ? (
                        <div className="mini-list-row">
                          <strong>{t.noVideos}</strong>
                          <span>{t.sessionDetailsSoon}</span>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ) : null}
              </>
            ) : null}
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
                  <span>{currentRoleLabel}</span>
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

        <ToastBanner banner={banner} />

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
                        getAccessRank(getPlanAccessTier(subscriptionPlan)) >
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
                      getAccessRank(getPlanAccessTier(subscriptionPlan)) >
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

            <div className="library-playlist-picker">
              <Field label={t.choosePlaylist}>
                <select
                  value={activePlaylistId ?? ""}
                  onChange={(event) => setActivePlaylistId(Number(event.target.value) || null)}
                >
                  <option value="">-</option>
                  {playlists.map((playlist) => (
                    <option key={playlist.playlistId} value={playlist.playlistId}>
                      {playlist.playlistName}
                    </option>
                  ))}
                </select>
              </Field>
              <p className="muted-text">
                {activePlaylist
                  ? `${activePlaylist.playlistName} · ${activePlaylist.playlistVideos.length} videos`
                  : t.choosePlaylistFirst}
              </p>
            </div>

            <div className="video-grid">
              {videos.length ? (
                videos.map((video) => {
                  const requiredTier = getVideoAccessTier(video);
                  const unlocked = isAdmin || canAccessTier(currentAccessTier, requiredTier);
                  const thumbnailUrl = getYouTubeThumbnail(video.videoURL);
                  const inPlaylist =
                    activePlaylist?.playlistVideos.some((entry) => entry.videoId === video.videoId) ?? false;

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
                        {unlocked ? (
                          <>
                            <button
                              className="small-action"
                              disabled={inPlaylist}
                              type="button"
                              onClick={() => void handleAddVideoToPlaylist(video.videoId)}
                            >
                              {inPlaylist
                                ? t.addedToPlaylist
                                : activePlaylist
                                  ? t.addToPlaylist
                                  : t.choosePlaylist}
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
                                  getPlanAccessTier(subscriptionPlan) === requiredTier,
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

            <div className="playlist-create-bar">
              <Field label={t.playlistName}>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(event) => setNewPlaylistName(event.target.value)}
                />
              </Field>
              <button className="primary-button" type="button" onClick={handleCreatePlaylist}>
                {t.createPlaylist}
              </button>
            </div>

            <div className="playlist-list-panel">
              <span className="list-label">{t.playlistsTitle}</span>
              {playlists.length ? (
                <div className="playlist-list">
                  {playlists.map((playlist) => (
                    <article
                      className={activePlaylistId === playlist.playlistId ? "playlist-row active" : "playlist-row"}
                      key={playlist.playlistId}
                    >
                      <button
                        className="playlist-row-main"
                        type="button"
                        onClick={() => setActivePlaylistId(playlist.playlistId)}
                      >
                        <strong>{playlist.playlistName}</strong>
                        <span>{playlist.playlistVideos.length} {t.statsVideos.toLowerCase()}</span>
                      </button>
                      <button
                        className="small-action danger"
                        type="button"
                        onClick={() => handleDeletePlaylist(playlist.playlistId)}
                      >
                        {t.delete}
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <article className="empty-card">{t.noPlaylists}</article>
              )}
            </div>

            <article className="data-card playlist-detail-card">
              <div className="playlist-detail-header">
                <div>
                  <span className="section-eyebrow">{t.choosePlaylist}</span>
                  <h3>{activePlaylist?.playlistName ?? t.noPlaylists}</h3>
                  <p>
                    {activePlaylist
                      ? `${activePlaylist.playlistVideos.length} ${t.statsVideos.toLowerCase()}`
                      : t.createOrChoosePlaylist}
                  </p>
                </div>
              </div>
              <div className="mini-list">
                {activePlaylist?.playlistVideos.length ? (
                  activePlaylist.playlistVideos.map((entry) =>
                    entry.video ? (
                      <article
                        className="playlist-video-row"
                        key={entry.playlistVideoId}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveVideo(entry.video!)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setActiveVideo(entry.video!);
                          }
                        }}
                      >
                        <div className="playlist-video-copy">
                          <strong>{entry.video.title}</strong>
                          <span>{entry.video.category?.categoryName ?? t.noCategory}</span>
                        </div>
                        <button
                          className="tiny-button danger"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleRemoveVideoFromPlaylist(activePlaylist, entry.video!.videoId);
                          }}
                        >
                          {t.delete}
                        </button>
                      </article>
                    ) : null,
                  )
                ) : (
                  <p className="muted-text">{t.noVideos}</p>
                )}
              </div>
            </article>
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
                      getPlanAccessTier(subscriptionPlan),
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

            {selectedPlan ? (
              <div
                aria-modal="true"
                className="checkout-modal-backdrop"
                role="dialog"
                onClick={() => setCheckoutPlanId(null)}
              >
                <article className="checkout-modal-card" onClick={(event) => event.stopPropagation()}>
                  <div className="checkout-modal-header">
                    <div>
                      <span className="section-eyebrow">{t.simulatedCheckoutTitle}</span>
                      <h3>{selectedPlan.planName}</h3>
                      <p>{t.simulatedCheckoutText}</p>
                    </div>
                    <button className="small-action ghost" type="button" onClick={() => setCheckoutPlanId(null)}>
                      {t.closeVideo}
                    </button>
                  </div>

                  <div className="checkout-preview">
                    <div>
                      <span>{t.accessLabel}</span>
                      <strong>{getAccessTierLabel(getPlanAccessTier(selectedPlan), t)}</strong>
                    </div>
                    <div>
                      <span>{t.price}</span>
                      <strong>{formatPrice(selectedPlan.price)}</strong>
                    </div>
                  </div>

                  <div className="checkout-card-visual">
                    <span>{t.paymentCardNumber}</span>
                    <strong>{paymentForm.cardNumber || "4242 4242 4242 4242"}</strong>
                    <div className="row-meta">
                      <span>{paymentForm.cardholder || user?.name || "FitNest User"}</span>
                      <span>{paymentForm.email || user?.email || "member@fitnest.ee"}</span>
                    </div>
                  </div>

                  <div className="checkout-form-grid">
                    <Field label={t.paymentEmail}>
                      <input
                        type="email"
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
                        inputMode="numeric"
                        placeholder="4242 4242 4242 4242"
                        type="text"
                        value={paymentForm.cardNumber}
                        onChange={(event) =>
                          setPaymentForm((current) => ({ ...current, cardNumber: event.target.value }))
                        }
                      />
                    </Field>
                  </div>

                  <button
                    className="primary-button wide"
                    disabled={paymentBusy}
                    type="button"
                    onClick={() => {
                      void handleSubscribe(selectedPlan.planId);
                    }}
                  >
                    {paymentBusy ? "..." : t.subscribe}
                  </button>
                  <p className="muted-text">{t.paymentHint}</p>
                </article>
              </div>
            ) : null}

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
          </section>
        ) : null}

        {user && currentPage === "admin" ? (
          <AdminPanel
            t={t}
            adminSections={adminSections}
            activeAdminSection={activeAdminSection}
            adminSection={adminSection}
            setAdminWorkspace={setAdminWorkspace}
            adminSearch={adminSearch}
            setAdminSearch={setAdminSearch}
            categories={categories}
            trainers={trainers}
            videos={videos}
            packages={packages}
            subscriptions={subscriptions}
            filteredCategories={filteredCategories}
            filteredTrainers={filteredTrainers}
            filteredPackages={filteredPackages}
            filteredVideos={filteredVideos}
            filteredUsers={filteredUsers}
            categoryForm={categoryForm}
            setCategoryForm={setCategoryForm}
            trainerForm={trainerForm}
            setTrainerForm={setTrainerForm}
            packageForm={packageForm}
            setPackageForm={setPackageForm}
            videoForm={videoForm}
            setVideoForm={setVideoForm}
            userForm={userForm}
            setUserForm={setUserForm}
            editingCategoryId={editingCategoryId}
            setEditingCategoryId={setEditingCategoryId}
            editingTrainerId={editingTrainerId}
            setEditingTrainerId={setEditingTrainerId}
            editingPackageId={editingPackageId}
            setEditingPackageId={setEditingPackageId}
            editingVideoId={editingVideoId}
            setEditingVideoId={setEditingVideoId}
            editingUserId={editingUserId}
            setEditingUserId={setEditingUserId}
            editingUserActiveSubscription={editingUserActiveSubscription}
            fillCategoryForm={fillCategoryForm}
            fillTrainerForm={fillTrainerForm}
            fillPackageForm={fillPackageForm}
            fillVideoForm={fillVideoForm}
            fillUserForm={fillUserForm}
            handleSaveCategory={handleSaveCategory}
            handleDeleteCategory={handleDeleteCategory}
            handleSaveTrainer={handleSaveTrainer}
            handleDeleteTrainer={handleDeleteTrainer}
            handleSavePackage={handleSavePackage}
            handleDeletePackage={handleDeletePackage}
            handleSaveVideo={handleSaveVideo}
            handleDeleteVideo={handleDeleteVideo}
            handleSaveUser={handleSaveUser}
            handleAssignSubscriptionToUser={handleAssignSubscriptionToUser}
            handleDeleteUser={handleDeleteUser}
          />
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

      <ConfirmDialog
        cancelLabel={confirmDialog?.cancelLabel ?? t.cancel}
        confirmLabel={confirmDialog?.confirmLabel ?? t.save}
        danger={confirmDialog?.danger ?? true}
        open={Boolean(confirmDialog)}
        text={confirmDialog?.text ?? ""}
        title={confirmDialog?.title ?? ""}
        onCancel={() => setConfirmDialog(null)}
        onConfirm={runConfirmedAction}
      />
    </div>
  );
}

export default App;
