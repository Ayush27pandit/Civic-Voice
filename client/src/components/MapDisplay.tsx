"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icons
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapDisplay({ center }: { center: [number, number] }) {
    return (
        <div className="h-[300px] w-full overflow-hidden rounded-lg border border-border">
            <MapContainer
                center={center}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center} />
            </MapContainer>
        </div>
    );
}
