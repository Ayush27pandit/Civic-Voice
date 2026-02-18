import { useAuth } from "@/context/AuthContext";
import { useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Hook for making authenticated API requests.
 *
 * Usage:
 *   const api = useApi();
 *   const data = await api.get("/issues");
 *   const created = await api.post("/issues", { title: "..." });
 */
export function useApi() {
    const { getIdToken } = useAuth();

    const request = useCallback(
        async (endpoint: string, options: RequestInit = {}) => {
            const token = await getIdToken();

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                ...(options.headers as Record<string, string>),
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "API request failed");
            }

            return data;
        },
        [getIdToken]
    );

    return {
        get: (endpoint: string) => request(endpoint, { method: "GET" }),
        post: (endpoint: string, body: any) =>
            request(endpoint, { method: "POST", body: JSON.stringify(body) }),
        patch: (endpoint: string, body: any) =>
            request(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
        delete: (endpoint: string) => request(endpoint, { method: "DELETE" }),
    };
}
