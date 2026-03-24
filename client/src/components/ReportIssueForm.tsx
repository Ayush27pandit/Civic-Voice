"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import MediaUpload from "./MediaUpload";
import Image from "next/image";

// Dynamically import MapPicker to prevent SSR issues
const MapPicker = dynamic(() => import("./MapPicker"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full animate-pulse rounded-lg bg-muted" />
});

interface IssueFormData {
    title: string;
    description: string;
    category: string;
    priority: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

export default function ReportIssueForm() {
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [media, setMedia] = useState<{ url: string; type: "image" | "video"; path: string }[]>([]);
    const api = useApi();
    const router = useRouter();
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<IssueFormData>({
        defaultValues: {
            category: "other",
            priority: "medium",
        }
    });

    const handleLocationSelect = async (lat: number, lng: number) => {
        setCoords({ lat, lng });

        // Reverse geocoding using Nominatim (free)
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                {
                    headers: {
                        "Accept-Language": "en", // Good practice to specify language
                    },
                }
            );

            if (!res.ok) throw new Error("Geocoding service unavailable");

            const data = await res.json();
            if (data.address) {
                const addr = data.address;
                setValue("address", data.display_name || "");
                setValue("city", addr.city || addr.town || addr.village || "");
                setValue("state", addr.state || "");
                setValue("pincode", addr.postcode || "");
            }
        } catch (error) {
            console.warn("Geocoding failed, please enter address manually:", error);
        }
    };

    const onSubmit = async (data: IssueFormData) => {
        if (!coords) {
            alert("Please select a location on the map");
            return;
        }

        try {
            await api.post("/issues", {
                ...data,
                location: {
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    coordinates: coords,
                },
                media,
            });
            router.push("/issues");
        } catch (error: any) {
            alert(error.message || "Failed to submit issue");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Issue Title</label>
                        <input
                            {...register("title", { required: "Title is required" })}
                            className="mt-1 w-full rounded-lg border border-border bg-background p-2"
                            placeholder="e.g. Large pothole on Main St"
                        />
                        {errors.title && <p className="mt-1 text-xs text-accent">{errors.title.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            {...register("description", { required: "Description is required" })}
                            className="mt-1 h-32 w-full rounded-lg border border-border bg-background p-2"
                            placeholder="Provide details about the issue..."
                        />
                        {errors.description && <p className="mt-1 text-xs text-accent">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Category</label>
                            <select
                                {...register("category")}
                                className="mt-1 w-full rounded-lg border border-border bg-background p-2"
                            >
                                <option value="pothole">Pothole</option>
                                <option value="streetlight">Streetlight</option>
                                <option value="garbage">Garbage</option>
                                <option value="water">Water Leak</option>
                                <option value="sewage">Sewage</option>
                                <option value="road">Road Block</option>
                                <option value="electricity">Electricity</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Priority</label>
                            <select
                                {...register("priority")}
                                className="mt-1 w-full rounded-lg border border-border bg-background p-2"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Location & Map */}
                <div className="space-y-4">
                    <label className="text-sm font-medium">Pin Location</label>
                    <MapPicker onLocationSelect={handleLocationSelect} />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Address</label>
                            <input
                                {...register("address", { required: true })}
                                className="w-full rounded-lg border border-border bg-background p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">City</label>
                            <input
                                {...register("city", { required: true })}
                                className="w-full rounded-lg border border-border bg-background p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">State</label>
                            <input
                                {...register("state", { required: true })}
                                className="w-full rounded-lg border border-border bg-background p-2 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Media Upload */}
            <div className="space-y-4">
                <label className="text-sm font-medium">Photos / Videos</label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
                    {media.map((m, i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                            {m.type === "image" ? (
                                <img src={m.url} alt="upload" className="h-full w-full object-cover" />
                            ) : (
                                <video src={m.url} className="h-full w-full object-cover" />
                            )}
                            <button
                                type="button"
                                onClick={() => setMedia(media.filter((_, idx) => idx !== i))}
                                className="absolute right-1 top-1 rounded-full bg-accent p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    {media.length < 5 && (
                        <MediaUpload
                            onUploadComplete={(newMedia) => setMedia([...media, newMedia])}
                            folder="issues"
                        />
                    )}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex items-center gap-2 px-12"
                >
                    {isSubmitting ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : "Submit Report"}
                </button>
            </div>
        </form>
    );
}
