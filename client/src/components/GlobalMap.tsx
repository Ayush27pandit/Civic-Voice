"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";

// Custom icon generator for categories
const getCategoryIcon = (category: string, status: string) => {
    let color = "#2563eb"; // default blue
    if (status === "resolved") color = "#16a34a"; // green
    else if (status === "pending") color = "#ea580c"; // orange

    return L.divIcon({
        html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; items-center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transform: translate(-8px, -8px);">
             <span style="font-size: 16px;">${getEmoji(category)}</span>
           </div>`,
        className: "custom-marker",
    });
};

const getEmoji = (category: string) => {
    switch (category) {
        case "pothole": return "🕳️";
        case "streetlight": return "💡";
        case "garbage": return "🗑️";
        case "water": return "💧";
        case "sewage": return "🚽";
        case "road": return "🚧";
        case "electricity": return "⚡";
        default: return "📍";
    }
};

const UserLocationIcon = L.divIcon({
    html: `<div style="background-color: #3b82f6; width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(59,130,246,0.6); animation: pulse 2s infinite;">
           <span style="font-size: 14px; font-weight: bold; color: white;">YOU</span>
         </div>`,
    className: "user-location-marker",
});


// Fix for default marker icons
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Issue {
    _id: string;
    title: string;
    category: string;
    status: string;
    location: {
        coordinates: { lat: number; lng: number };
        address: string;
    };
    media: { url: string }[];
}

// Sub-component to center map on user location
function RecenterMap({ position }: { position: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 13);
        }
    }, [position, map]);
    return null;
}

// Locate button component
function LocateButton({ onLocate, locating }: { onLocate: () => void; locating: boolean }) {
    return (
        <button
            onClick={onLocate}
            disabled={locating}
            className="absolute bottom-6 right-6 z-[1000] flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background/90 shadow-lg backdrop-blur-md transition-all hover:bg-background active:scale-95 disabled:opacity-50"
            title="Go to current location"
        >
            {locating ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            ) : (
                <svg className="h-6 w-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )}
        </button>
    );
}

export default function GlobalMap() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [locating, setLocating] = useState(false);
    const api = useApi();

    const getCurrentLocation = () => {
        if (!("geolocation" in navigator)) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                setLocating(false);
            },
            () => {
                alert("Unable to retrieve your location");
                setLocating(false);
            }
        );
    };

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const res = await api.get("/issues?limit=100");
                setIssues(res.data);
            } catch (error) {
                console.error("Failed to fetch map issues:", error);
            }
        };

        fetchIssues();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "resolved": return "#16a34a"; // green
            case "pending": return "#ea580c";  // orange
            case "in-progress": return "#2563eb"; // blue
            default: return "#6b7280";
        }
    };

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={userLocation || [28.6139, 77.209]}
                zoom={13}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap position={userLocation || [28.6139, 77.209]} />

                {/* User's Location Marker */}
                {userLocation && (
                    <Marker position={userLocation} icon={UserLocationIcon}>
                        <Popup>
                            <div className="text-center font-bold">You are here</div>
                        </Popup>
                    </Marker>
                )}

                {/* Issue Markers */}
                {issues.map((issue) => (
                    <Marker
                        key={issue._id}
                        position={[issue.location.coordinates.lat, issue.location.coordinates.lng]}
                        icon={getCategoryIcon(issue.category, issue.status)}
                    >
                        <Popup className="custom-popup">
                            <div className="w-48 space-y-2">
                                {issue.media?.[0] && (
                                    <div className="relative aspect-video w-full overflow-hidden rounded-md">
                                        <img
                                            src={issue.media[0].url}
                                            alt={issue.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                <h3 className="font-bold text-sm line-clamp-1">{issue.title}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                        {issue.category}
                                    </span>
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: getStatusColor(issue.status) }}
                                />
                            </div>
                            <Link
                                href={`/issues/${issue._id}`}
                                className="block w-full rounded-md bg-primary py-1.5 text-center text-xs font-bold text-white hover:bg-primary-dark transition-colors"
                            >
                                View Full Details
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
            </MapContainer>
            
            {/* Locate Button */}
            <LocateButton onLocate={getCurrentLocation} locating={locating} />
        </div>
    );
}
