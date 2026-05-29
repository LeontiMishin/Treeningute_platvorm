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
import { Field, SectionHeader, StatCard } from "./components/Common";
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
                      ? getPlanHighlights(getPlanAccessTier(selectedPlan), language).join(" • ")
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
    </div>
  );
}

export default App;
