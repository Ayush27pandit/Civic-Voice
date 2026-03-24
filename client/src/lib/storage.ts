const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

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

export async function uploadFile(
    file: File,
    _path: string,
    onProgress?: (progress: number) => void
): Promise<string> {
    validateFile(file);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    onProgress?.(100);
                    const fullUrl = response.url.startsWith("http") 
                        ? response.url 
                        : `${API_URL.replace("/api", "")}${response.url}`;
                    resolve(fullUrl);
                } else {
                    reject(new Error(response.error || "Upload failed"));
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
        });

        const formData = new FormData();
        formData.append("file", file);

        xhr.open("POST", `${API_URL}/upload`);
        xhr.send(formData);
    });
}

export function getPublicUrl(filename: string): string {
    return `${API_URL.replace("/api", "")}/uploads/${filename}`;
}

export async function deleteFile(url: string): Promise<void> {
    const filename = url.split("/uploads/")[1];
    if (!filename) return;

    const response = await fetch(`${API_URL}/upload/${filename}`, {
        method: "DELETE",
    });
    
    if (!response.ok) {
        throw new Error("Delete failed");
    }
}
