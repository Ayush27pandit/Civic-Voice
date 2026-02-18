"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icons in Leaflet + Next.js
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

function LocationMarker({ onLocationSelect, position }: {
    onLocationSelect: (lat: number, lng: number) => void;
    position: [number, number] | null;
}) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
}

export default function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLocation || null
    );

    // Default to a central location (e.g., Delhi) if no initial or geolocation
    const defaultCenter: [number, number] = [28.6139, 77.209];

    useEffect(() => {
        if (!initialLocation && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
                onLocationSelect(latitude, longitude);
            });
        }
    }, [initialLocation, onLocationSelect]);

    const handleSelect = (lat: number, lng: number) => {
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
    };

    return (
        <div className="h-[300px] w-full overflow-hidden rounded-lg border border-border">
            <MapContainer
                center={position || defaultCenter}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onLocationSelect={handleSelect} position={position} />
            </MapContainer>
            <p className="mt-2 text-xs text-muted-foreground">Click on the map to set the issue location</p>
        </div>
    );
}
