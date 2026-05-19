import type {
  AuthResponse,
  Category,
  Playlist,
  SubscriptionPlan,
  Trainer,
  User,
  UserSubscription,
  Video,
  VideoQuery,
} from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const TOKEN_KEY = "trainflow_token";

let accessToken =
  typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return data as T;
}

export function getStoredToken() {
  return accessToken;
}

export function setStoredToken(token: string) {
  accessToken = token;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  accessToken = null;
  window.localStorage.removeItem(TOKEN_KEY);
}

export const api = {
  auth: {
    register(payload: { name: string; email: string; password: string }) {
      return request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    login(payload: { email: string; password: string }) {
      return request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    logout() {
      return request<{ message: string }>("/auth/logout", {
        method: "POST",
      });
    },
    me() {
      return request<User>("/auth/me");
    },
  },
  categories: {
    list() {
      return request<Category[]>("/categories");
    },
    create(payload: { categoryName: string }) {
      return request<Category>("/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(id: number, payload: { categoryName: string }) {
      return request<Category>(`/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    delete(id: number) {
      return request<{ message: string }>(`/categories/${id}`, {
        method: "DELETE",
      });
    },
  },
  trainers: {
    list() {
      return request<Trainer[]>("/trainers");
    },
    create(payload: { trainerName: string; bio?: string; startDate?: string }) {
      return request<Trainer>("/trainers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(id: number, payload: { trainerName: string; bio?: string; startDate?: string }) {
      return request<Trainer>(`/trainers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    delete(id: number) {
      return request<{ message: string }>(`/trainers/${id}`, {
        method: "DELETE",
      });
    },
  },
  videos: {
    list(query: VideoQuery = {}) {
      return request<Video[]>(
        `/videos${buildQuery({
          trainerId: query.trainerId,
          categoryId: query.categoryId,
          search: query.search,
        })}`,
      );
    },
    create(payload: {
      title: string;
      duration?: number;
      videoURL?: string;
      language?: string;
      equipment?: string;
      shortDescription?: string;
      trainerId?: number;
      categoryId?: number;
    }) {
      return request<Video>("/videos", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(
      id: number,
      payload: {
        title?: string;
        duration?: number;
        videoURL?: string;
        language?: string;
        equipment?: string;
        shortDescription?: string;
        trainerId?: number;
        categoryId?: number;
      },
    ) {
      return request<Video>(`/videos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    delete(id: number) {
      return request<{ message: string }>(`/videos/${id}`, {
        method: "DELETE",
      });
    },
  },
  packages: {
    list() {
      return request<SubscriptionPlan[]>("/packages");
    },
    create(payload: { planName: string; price: number; durationMonths: number }) {
      return request<SubscriptionPlan>("/packages", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(id: number, payload: { planName: string; price: number; durationMonths: number }) {
      return request<SubscriptionPlan>(`/packages/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    delete(id: number) {
      return request<{ message: string }>(`/packages/${id}`, {
        method: "DELETE",
      });
    },
  },
  playlists: {
    list() {
      return request<Playlist[]>("/playlists");
    },
    create(payload: { playlistName: string; videoIds?: number[] }) {
      return request<Playlist>("/playlists", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(id: number, payload: { playlistName?: string; videoIds?: number[] }) {
      return request<Playlist>(`/playlists/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    delete(id: number) {
      return request<{ message: string }>(`/playlists/${id}`, {
        method: "DELETE",
      });
    },
  },
  subscriptions: {
    list() {
      return request<UserSubscription[]>("/subscriptions");
    },
    create(payload: { planId: number; userId?: number; startDate?: string }) {
      return request<UserSubscription>("/subscriptions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    delete(id: number) {
      return request<{ message: string }>(`/subscriptions/${id}`, {
        method: "DELETE",
      });
    },
  },
  users: {
    list() {
      return request<User[]>("/users");
    },
    update(id: number, payload: { name?: string; email?: string; password?: string }) {
      return request<User>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    delete(id: number) {
      return request<{ message: string }>(`/users/${id}`, {
        method: "DELETE",
      });
    },
  },
};
