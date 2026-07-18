"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDb = getAdminDb;
/**
 * Firebase Admin SDK — server-only
 * Uses service account credentials to bypass ALL Firestore security rules.
 * Never import this in client components.
 */
var app_1 = require("firebase-admin/app");
var firestore_1 = require("firebase-admin/firestore");
var adminApp;
var adminDb;
function getAdminApp() {
    if ((0, app_1.getApps)().length > 0) {
        return (0, app_1.getApps)()[0];
    }
    var credJson;
    if (process.env.FIREBASE_ADMIN_CREDENTIALS_BASE64) {
        credJson = Buffer.from(process.env.FIREBASE_ADMIN_CREDENTIALS_BASE64, 'base64').toString('utf8');
    }
    else {
        credJson = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON || process.env.GOOGLE_CREDENTIALS_JSON;
    }
    if (!credJson) {
        throw new Error("FIREBASE_ADMIN_CREDENTIALS_BASE64 or GOOGLE_CREDENTIALS_JSON env variable is not set");
    }
    var cred = JSON.parse(credJson);
    adminApp = (0, app_1.initializeApp)({
        credential: (0, app_1.cert)({
            projectId: cred.project_id,
            clientEmail: cred.client_email,
            privateKey: cred.private_key,
        }),
        projectId: cred.project_id,
    });
    return adminApp;
}
function getAdminDb() {
    var app = getAdminApp();
    var dbName = process.env.NEXT_PUBLIC_FIREBASE_DB_NAME || "default";
    return (0, firestore_1.getFirestore)(app, dbName);
}
