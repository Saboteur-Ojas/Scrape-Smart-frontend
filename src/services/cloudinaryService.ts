import { auth } from "../lib/firebase/auth";
import type { ScrapImage } from "../types/cloudinary";
import { validateImages } from "../utils/validation";

const OPTIMISATION_TRANSFORM = "f_auto,q_auto";

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  original_filename?: string;
  created_at?: string;
}

function getCloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const folder = import.meta.env.VITE_CLOUDINARY_UPLOAD_FOLDER;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
  }

  return { cloudName, uploadPreset, folder };
}

async function uploadSingle(
  file: File,
  config: ReturnType<typeof getCloudinaryConfig>,
  userId: string,
  description?: string
): Promise<ScrapImage> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", config.uploadPreset);
  if (config.folder) {
    formData.append("folder", `${config.folder}/${userId}`);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ?? `Cloudinary upload failed (${response.status})`
    );
  }

  const data = (await response.json()) as CloudinaryUploadResponse;

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
    originalFilename: data.original_filename ?? file.name,
    description: description?.trim() || undefined,
    createdAt: data.created_at,
  };
}

export async function uploadScrapImagesToCloudinary(
  files: File[],
  userId: string,
  descriptions: string[] = []
): Promise<ScrapImage[]> {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    throw new Error("You can only upload your own images.");
  }

  validateImages(files);
  const config = getCloudinaryConfig();
  return Promise.all(files.map((file, index) => uploadSingle(file, config, userId, descriptions[index])));
}

export function buildOptimisedUrl(publicIdOrUrl: string): string {
  if (publicIdOrUrl.includes("res.cloudinary.com")) {
    if (publicIdOrUrl.includes(`/upload/${OPTIMISATION_TRANSFORM}/`)) {
      return publicIdOrUrl;
    }
    return publicIdOrUrl.replace("/upload/", `/upload/${OPTIMISATION_TRANSFORM}/`);
  }

  if (/^https?:\/\//i.test(publicIdOrUrl)) {
    return publicIdOrUrl;
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
  if (!cloudName) {
    throw new Error("Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME.");
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/${OPTIMISATION_TRANSFORM}/${publicIdOrUrl}`;
}

export function getPrimaryImageUrl(images?: ScrapImage[], imageUrls?: string[], imageUrl?: string) {
  return images?.[0]?.url ?? imageUrls?.[0] ?? imageUrl ?? "";
}

export function getImageUrls(images?: ScrapImage[], imageUrls?: string[], imageUrl?: string) {
  if (images?.length) return images.map((image) => image.url);
  if (imageUrls?.length) return imageUrls;
  return imageUrl ? [imageUrl] : [];
}
