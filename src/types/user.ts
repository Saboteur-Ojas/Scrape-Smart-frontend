export type UserRole = "user" | "collector";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  cityNormalized?: string;
  area?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RegisterUserInput {
  name: string;
  phone: string;
  email: string;
  password: string;
  city: string;
  area: string;
}

export interface UpdateUserLocationInput {
  city: string;
  area: string;
}
