import admin from "firebase-admin";
import path from "path";

const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json";

try {
    const serviceAccount = require(path.resolve(serviceAccountPath));

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin SDK initialized");
} catch (error) {
    console.warn(
        "⚠️  Firebase Admin SDK not initialized — service account key not found at:",
        serviceAccountPath
    );
    console.warn("   Authentication middleware will not work until this is fixed.");
}

export const adminAuth = admin.auth();
export default admin;
