"use client";

import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialLocation?: [number, number];
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function MarkerUpdater({ position }: { position: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom());
        }
    }, [position, map]);
    return position === null ? null : <Marker position={position} />;
}

export default function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLocation ? [initialLocation[0], initialLocation[1]] : null
    );
    const [locating, setLocating] = useState(false);
    const defaultCenter: [number, number] = [28.6139, 77.209];

    const handleLocationSelect = useCallback((lat: number, lng: number) => {
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
    }, [onLocationSelect]);

    const handleMapClick = useCallback((lat: number, lng: number) => {
        handleLocationSelect(lat, lng);
    }, [handleLocationSelect]);

    const getCurrentLocation = () => {
        if (!("geolocation" in navigator)) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                handleLocationSelect(latitude, longitude);
                setLocating(false);
            },
            () => {
                alert("Unable to retrieve your location");
                setLocating(false);
            }
        );
    };

    return (
        <div className="relative">
            <div className="h-[300px] w-full overflow-hidden rounded-lg border border-border">
                <MapContainer
                    center={position || defaultCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onLocationSelect={handleMapClick} />
                    <MarkerUpdater position={position} />
                </MapContainer>
            </div>
            <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locating}
                className="btn-secondary mt-2 flex items-center gap-2 px-4 py-2 text-sm"
            >
                <svg className={`h-4 w-4 ${locating ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {locating ? "Getting location..." : "Use Current Location"}
            </button>
            <p className="mt-1 text-xs text-muted-foreground">Click anywhere on the map to set issue location</p>
        </div>
    );
}
