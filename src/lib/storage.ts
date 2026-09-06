import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/**
 * File storage adapter — LOCAL DISK implementation.
 *
 * Files are written under /public/uploads/<category>/ and served by
 * Next.js as static files. This works out of the box for development and
 * for any host with a persistent writable filesystem.
 *
 * IMPORTANT for production on serverless/read-only-filesystem hosts
 * (e.g. Vercel): local disk storage does NOT persist across deployments
 * or scale across instances. Swap this module for an S3-compatible
 * adapter (S3, Cloudflare R2, Backblaze B2, etc.) before going live on
 * such a host. The function signatures below are intentionally storage-
 * agnostic so callers do not need to change when that swap happens.
 */

const MAX_SIZE_BYTES = Number(process.env.UPLOAD_MAX_SIZE_MB ?? 10) * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_DOCUMENT_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

export type UploadCategory =
  | "avatars"
  | "gallery"
  | "materials"
  | "courses"
  | "notices"
  | "achievements"
  | "testimonials"
  | "admissions";

export class UploadValidationError extends Error {}

function safeExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return ext || "";
}

/**
 * Validates and saves an uploaded file. Returns the public URL path to
 * store in the database (e.g. "/uploads/gallery/abc123.jpg").
 */
export async function saveUploadedFile(
  file: File,
  category: UploadCategory,
  allowedTypes: string[] = ALLOWED_DOCUMENT_TYPES
): Promise<string> {
  if (!allowedTypes.includes(file.type)) {
    throw new UploadValidationError(`File type "${file.type}" is not allowed.`);
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadValidationError(
      `File exceeds the maximum allowed size of ${MAX_SIZE_BYTES / (1024 * 1024)}MB.`
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = `${randomUUID()}${safeExtension(file.name)}`;
  const dir = path.join(process.cwd(), "public", "uploads", category);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), buffer);

  return `/uploads/${category}/${safeName}`;
}
