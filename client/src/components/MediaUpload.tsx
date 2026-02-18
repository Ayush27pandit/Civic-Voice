"use client";

import { useState, useRef } from "react";
import { uploadFile } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";

interface MediaFile {
    url: string;
    type: "image" | "video";
    path: string;
}

interface MediaUploadProps {
    onUploadComplete: (media: MediaFile) => void;
    folder?: string;
}

export default function MediaUpload({ onUploadComplete, folder = "general" }: MediaUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            setUploading(true);
            setProgress(0);

            // Generate a unique path: folder/userId/timestamp_filename
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const path = `${folder}/${user._id}/${fileName}`;

            const url = await uploadFile(file, path, (p) => setProgress(p));

            onUploadComplete({
                url,
                type: file.type.startsWith("video") ? "video" : "image",
                path,
            });

            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error: any) {
            alert(error.message || "Upload failed");
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="space-y-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
                id="media-upload"
                disabled={uploading}
            />

            <label
                htmlFor="media-upload"
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:bg-muted ${uploading ? "pointer-events-none opacity-50" : ""
                    }`}
            >
                <div className="text-center">
                    <svg
                        className="mx-auto h-10 w-10 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    <p className="mt-2 text-sm font-medium">Click to upload photo or video</p>
                    <p className="text-xs text-muted-foreground">Max 5MB for images, 50MB for videos</p>
                </div>
            </label>

            {uploading && (
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}
