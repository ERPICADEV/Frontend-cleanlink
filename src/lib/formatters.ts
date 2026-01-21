import type { ReportLocation } from "@/services/reportService";
import type { RegionLocation } from "@/types/user";

export const formatRelativeTime = (input: string | Date | undefined | null): string => {
  // Add null/undefined check
  if (!input) {
    return "Recently";
  }
  
  const date = typeof input === "string" ? new Date(input) : input;
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Recently";
  }
  
  const diffMs = Date.now() - date.getTime();
  const seconds = Math.round(diffMs / 1000);

  const thresholds = [
    { limit: 60, divisor: 1, unit: "second" },
    { limit: 3600, divisor: 60, unit: "minute" },
    { limit: 86400, divisor: 3600, unit: "hour" },
    { limit: 604800, divisor: 86400, unit: "day" },
    { limit: 2629800, divisor: 604800, unit: "week" },
    { limit: 31557600, divisor: 2629800, unit: "month" },
    { limit: Infinity, divisor: 31557600, unit: "year" },
  ];

  for (const threshold of thresholds) {
    if (seconds < threshold.limit) {
      const value = Math.max(1, Math.floor(seconds / threshold.divisor));
      return `${value} ${threshold.unit}${value > 1 ? "s" : ""} ago`;
    }
  }

  return date.toLocaleDateString();
};

export const formatCategoryLabel = (category?: string) => {
  if (!category) return "Other";
  return category
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const formatStatusLabel = (status?: string) => {
  if (!status) return "Pending";
  return status
    .split(/[_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const formatLocationName = (location?: ReportLocation | RegionLocation | string | null) => {
  if (!location) return "Unknown location";
  
  // Handle string input (e.g., from signup form)
  if (typeof location === "string") {
    return location;
  }
  
  // Handle both ReportLocation and RegionLocation types
  const loc = location as ReportLocation | RegionLocation;
  
  // Check if it's an object before using 'in' operator
  if (typeof loc !== "object" || loc === null) {
    return "Unknown location";
  }
  
  if ('area_name' in loc && loc.area_name) return loc.area_name;
  if ('address' in loc && loc.address) return loc.address;
  const parts = [loc.city, loc.state, loc.country].filter(Boolean);
  if (parts.length) return parts.join(", ");
  if ('lat' in loc && 'lng' in loc && loc.lat && loc.lng) {
    return `Lat ${loc.lat.toFixed(4)}, Lng ${loc.lng.toFixed(4)}`;
  }
  return "Unknown location";
};

type ImageObject = { url?: string };

// Normalize backend-relative image URLs to absolute (API origin)
const apiBase =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://backend-cleanlink.onrender.com/api/v1";
// Try to strip trailing "/api/v1" to get origin
const apiOrigin = apiBase.replace(/\/api\/v1$/, "");
const normalizeImageUrl = (url: string) => {
  if (!url) return url;
  if (url.startsWith("/uploads")) return `${apiOrigin}${url}`;
  return url;
};

export const extractFirstImage = (images?: unknown) => {
  if (!images) return null;
  if (Array.isArray(images)) {
    const [first] = images;
    if (typeof first === "string") return normalizeImageUrl(first);
    if (typeof first === "object" && first && "url" in first) {
      return normalizeImageUrl((first as ImageObject).url ?? null);
    }
  }
  if (typeof images === "string") {
    // Handle legacy stringified arrays: '["data:..."]'
    const trimmed = images.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          if (typeof first === "string") return normalizeImageUrl(first);
          if (first && typeof first === "object" && "url" in first) {
            return normalizeImageUrl((first as ImageObject).url ?? null);
          }
        }
      } catch {
        // fall through to returning the raw string
      }
    }
    return normalizeImageUrl(images);
  }
  if (typeof images === "object" && images && "url" in images) {
    return normalizeImageUrl((images as ImageObject).url ?? null);
  }
  return null;
};

