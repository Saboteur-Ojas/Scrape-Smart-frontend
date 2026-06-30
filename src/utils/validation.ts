import type { ScrapCategory } from "../types/pickupRequest";
import { AppError } from "./errors";

export const categories: ScrapCategory[] = ["newspaper", "cardboard", "plastic", "metal", "e_waste", "mixed", "other"];

export function requireText(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new AppError(`${label} is required.`);
  return trimmed;
}

export function cleanCity(city: string) {
  const trimmed = requireText(city, "City");
  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function normalizeCity(city: string) {
  return requireText(city, "City").trim().replace(/\s+/g, " ").toLowerCase();
}

export function validateEmail(email: string) {
  const value = requireText(email, "Email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new AppError("Enter a valid email address.");
  return value;
}

export function validatePassword(password: string, confirm?: string) {
  if (password.length < 6) throw new AppError("Password must be at least 6 characters.");
  if (confirm !== undefined && password !== confirm) throw new AppError("Passwords do not match.");
  return password;
}

export function validateServiceAreas(value: string) {
  const areas = value.split(",").map((area) => area.trim()).filter(Boolean);
  if (areas.length === 0) throw new AppError("Enter at least one service area.");
  return areas;
}

export function validateImages(files: File[]) {
  if (files.length === 0) throw new AppError("Upload at least one scrap image.");
  if (files.length > 5) throw new AppError("You can upload up to 5 images.");
  for (const file of files) {
    if (!file.type.startsWith("image/")) throw new AppError("Only image files are allowed.");
    if (file.size > 5 * 1024 * 1024) throw new AppError("Each image must be 5MB or smaller.");
  }
}

export function validateFinalPrice(value: string) {
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) throw new AppError("Final price must be a number >= 0.");
  return price;
}

export function validateRating(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 5) throw new AppError("Rating must be between 1 and 5.");
}
