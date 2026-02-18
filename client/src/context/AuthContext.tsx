"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import {
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "@/lib/firebase";

interface UserProfile {
    _id: string;
    firebaseUid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: "citizen" | "official" | "admin";
}

interface AuthContextType {
    firebaseUser: FirebaseUser | null;
    user: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithFacebook: () => Promise<void>;
    signOut: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Sync Firebase user with MongoDB on auth state change
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);

            if (fbUser) {
                try {
                    const token = await fbUser.getIdToken();

                    // Register / sync user in MongoDB
                    const res = await fetch(`${API_URL}/auth/register`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            displayName: fbUser.displayName || "User",
                            photoURL: fbUser.photoURL || "",
                            phone: fbUser.phoneNumber || "",
                        }),
                    });

                    const data = await res.json();
                    if (data.success) {
                        setUser(data.data);
                    }
                } catch (error) {
                    console.error("Failed to sync user:", error);
                }
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        await signInWithPopup(auth, googleProvider);
    };

    const signInWithFacebook = async () => {
        await signInWithPopup(auth, facebookProvider);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
    };

    const getIdToken = async (): Promise<string | null> => {
        if (!firebaseUser) return null;
        return firebaseUser.getIdToken();
    };

    return (
        <AuthContext.Provider
            value={{
                firebaseUser,
                user,
                loading,
                signInWithGoogle,
                signInWithFacebook,
                signOut,
                getIdToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
