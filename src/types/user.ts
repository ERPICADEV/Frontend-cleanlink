export interface RegionLocation {
  country?: string;
  state?: string;
  city?: string;
  area_name?: string;
}

export interface User {
  id: string;
  username: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  civicPoints: number;
  civicLevel?: number;
  badges?: string[];
  trustScore?: number;
  region?: RegionLocation | null;
  status?: "active" | "inactive" | "suspended";
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  level_info?: {
    level: number;
    name: string;
    color: string;
    progress: number;
    next_level_at: number | null;
  };
}

export interface ProfileUpdateData {
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface RegionUpdateData {
  region: {
    country: string;
    state: string;
    city: string;
  };
}

export interface Region {
  id?: string;
  name: string;
  country?: string;
  admins?: number;
  reports?: number;
}

export interface RegionsResponse {
  countries: Array<{
    name: string;
    states: Array<{
      name: string;
      cities: string[];
    }>;
  }>;
}


