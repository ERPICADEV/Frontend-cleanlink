import type { ReportLocation } from "@/services/reportService";

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

export const formatLocationName = (location?: ReportLocation | null) => {
  if (!location) return "Unknown location";
  if (location.area_name) return location.area_name;
  if (location.address) return location.address;
  const parts = [location.city, location.state, location.country].filter(Boolean);
  if (parts.length) return parts.join(", ");
  if (location.lat && location.lng) {
    return `Lat ${location.lat.toFixed(4)}, Lng ${location.lng.toFixed(4)}`;
  }
  return "Unknown location";
};

type ImageObject = { url?: string };

export const extractFirstImage = (images?: unknown) => {
  if (!images) return null;
  if (Array.isArray(images)) {
    const [first] = images;
    if (typeof first === "string") return first;
    if (typeof first === "object" && first && "url" in first) {
      return (first as ImageObject).url ?? null;
    }
  }
  if (typeof images === "string") return images;
  if (typeof images === "object" && images && "url" in images) {
    return (images as ImageObject).url ?? null;
  }
  return null;
};

