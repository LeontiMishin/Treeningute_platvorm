import type { AccessTier, Language } from "./appTypes";
import type { SubscriptionPlan, Video } from "./types";

export function numberValue(value: string) {
  return value ? Number(value) : undefined;
}

export function isoDateValue(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatPrice(value: number | string) {
  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-EE", {
    style: "currency",
    currency: "EUR",
  }).format(numeric);
}

export function matchesQuery(values: Array<string | number | null | undefined>, normalizedQuery: string) {
  if (!normalizedQuery) {
    return true;
  }

  return values.some((value) => String(value ?? "").toLowerCase().includes(normalizedQuery));
}

export function extractYouTubeId(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const watchMatch = url.match(/[?&]v=([^?&/]+)/i);
  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/i);
  const embedMatch = url.match(/embed\/([^?&/]+)/i);
  const shortsMatch = url.match(/shorts\/([^?&/]+)/i);

  return watchMatch?.[1] ?? shortMatch?.[1] ?? embedMatch?.[1] ?? shortsMatch?.[1] ?? null;
}

export function getYouTubeThumbnail(url: string | null | undefined) {
  const videoId = extractYouTubeId(url);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}

export function normalizeAccessTier(value: string | null | undefined): AccessTier {
  const normalized = (value ?? "").toLowerCase();

  if (normalized.includes("full") || normalized === "pro") {
    return "full";
  }

  if (normalized.includes("plus") || normalized.includes("active")) {
    return "plus";
  }

  if (normalized.includes("starter")) {
    return "starter";
  }

  return "starter";
}

export function getPlanAccessTier(plan: Pick<SubscriptionPlan, "accessTier" | "planName"> | null | undefined): AccessTier {
  return normalizeAccessTier(plan?.accessTier ?? plan?.planName);
}

export function getAccessRank(tier: AccessTier) {
  return {
    none: 0,
    starter: 1,
    plus: 2,
    full: 3,
  }[tier];
}

export function getVideoAccessTier(video: Video): AccessTier {
  return normalizeAccessTier(video.accessTier ?? video.category?.categoryName);
}

export function canAccessTier(currentTier: AccessTier, requiredTier: AccessTier) {
  return getAccessRank(currentTier) >= getAccessRank(requiredTier);
}

export function getAccessTierLabel(
  tier: AccessTier,
  labels: {
    accessStarter: string;
    accessPlus: string;
    accessFull: string;
    accessNone: string;
  },
) {
  if (tier === "starter") {
    return labels.accessStarter;
  }

  if (tier === "plus") {
    return labels.accessPlus;
  }

  if (tier === "full") {
    return labels.accessFull;
  }

  return labels.accessNone;
}

export function getPlanHighlights(tier: AccessTier, language: Language) {
  if (language === "et") {
    if (tier === "starter") {
      return ["Taastumine ja jooga", "Rahulik algus nädalasse", "Põhiline videoteek"];
    }

    if (tier === "plus") {
      return ["Kõik Starter treeningud", "Cardio ja liikuvus", "Tõhusamad nädalaplaanid"];
    }

    return ["Kõik treeningud", "Jõutreeningud ja täielik ligipääs", "Piiramatu FitNest kogemus"];
  }

  if (tier === "starter") {
    return ["Recovery and yoga", "Gentle start to the week", "Core video access"];
  }

  if (tier === "plus") {
    return ["Everything in Starter", "Cardio and mobility", "Stronger weekly routine"];
  }

  return ["All workouts", "Strength sessions and full access", "Unlimited FitNest experience"];
}
