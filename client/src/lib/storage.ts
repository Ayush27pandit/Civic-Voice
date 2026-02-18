import { supabase } from "./supabase";

// ── Config ──────────────────────────────────────────
const BUCKET_NAME = "media"; // create this bucket in Supabase dashboard

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

type ProgressCallback = (progress: number) => void;

// ── Validation ──────────────────────────────────────
function validateFile(file: File): void {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
        throw new Error(
            `Unsupported file type: ${file.type}. Allowed: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(", ")}`
        );
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
        throw new Error(`Image must be smaller than ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
        throw new Error(`Video must be smaller than ${MAX_VIDEO_SIZE / 1024 / 1024}MB`);
    }
}

/**
 * Upload a file to Supabase Storage bucket.
 *
 * @param file     - File to upload
 * @param path     - Storage path (e.g. "issues/123/photo.jpg")
 * @param onProgress - Optional progress callback (0-100).
 *                     Note: Supabase JS SDK doesn't natively stream progress,
 *                     so this fires once at 100 when the upload completes.
 * @returns Public URL of the uploaded file
 */
export async function uploadFile(
    file: File,
    path: string,
    onProgress?: ProgressCallback
): Promise<string> {
    validateFile(file);

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, {
            cacheControl: "3600",
            upsert: true, // overwrite if same path exists
            contentType: file.type,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Signal completion
    onProgress?.(100);

    return getPublicUrl(path);
}

/**
 * Get the public URL for a file in the Supabase bucket.
 */
export function getPublicUrl(path: string): string {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
}

/**
 * Get a temporary signed URL (useful for private buckets).
 *
 * @param path      - Storage path
 * @param expiresIn - Seconds until expiry (default 1 hour)
 */
export async function getSignedUrl(
    path: string,
    expiresIn = 3600
): Promise<string> {
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
        throw new Error(`Failed to create signed URL: ${error?.message}`);
    }

    return data.signedUrl;
}

/**
 * Delete a file from the Supabase bucket.
 */
export async function deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
}

/**
 * Delete multiple files from the Supabase bucket.
 */
export async function deleteFiles(paths: string[]): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove(paths);

    if (error) {
        throw new Error(`Bulk delete failed: ${error.message}`);
    }
}

/**
 * List all files in a folder within the bucket.
 */
export async function listFiles(folder: string) {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folder);

    if (error) {
        throw new Error(`List failed: ${error.message}`);
    }

    return data;
}
