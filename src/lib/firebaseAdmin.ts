/**
 * Firebase Admin SDK — server-only
 * Uses service account credentials to bypass ALL Firestore security rules.
 * Never import this in client components.
 */
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App;

/**
 * Safely parses a JSON string that might contain unescaped newlines/control characters
 * in string literals (e.g. inside private_key).
 */
export function safeParseJson(jsonStr: string): any {
  if (!jsonStr || typeof jsonStr !== "string") {
    throw new Error("Invalid JSON string provided");
  }
  const trimmed = jsonStr.trim();
  try {
    return JSON.parse(trimmed);
  } catch (err1) {
    // Fix unescaped control characters inside JSON string values
    let inString = false;
    let escaped = false;
    let cleaned = "";

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];
      const code = char.charCodeAt(0);

      if (escaped) {
        cleaned += char;
        escaped = false;
        continue;
      }

      if (char === "\\") {
        cleaned += char;
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        cleaned += char;
        continue;
      }

      if (inString && code < 32) {
        if (char === "\n") cleaned += "\\n";
        else if (char === "\r") cleaned += "\\r";
        else if (char === "\t") cleaned += "\\t";
      } else {
        cleaned += char;
      }
    }

    try {
      return JSON.parse(cleaned);
    } catch (err2) {
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        try {
          return JSON.parse(JSON.parse(trimmed));
        } catch (_) {}
      }
      throw err1;
    }
  }
}

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  let credJson: string | undefined;

  if (process.env.FIREBASE_ADMIN_CREDENTIALS_BASE64) {
    credJson = Buffer.from(process.env.FIREBASE_ADMIN_CREDENTIALS_BASE64, 'base64').toString('utf8');
  } else {
    credJson = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON || process.env.GOOGLE_CREDENTIALS_JSON;
  }

  // Fallback: Read local credentials file if env variable parsing failed or is empty
  if (!credJson) {
    try {
      const fs = require("fs");
      const path = require("path");
      const localKeyPath = path.join(process.cwd(), "vishwa-leader-8f76cd8557d7.json");
      if (fs.existsSync(localKeyPath)) {
        credJson = fs.readFileSync(localKeyPath, "utf8");
      }
    } catch (e) {
      // Ignore reading failure
    }
  }

  if (!credJson) {
    throw new Error("FIREBASE_ADMIN_CREDENTIALS_BASE64 or GOOGLE_CREDENTIALS_JSON env variable is not set");
  }

  const cred = safeParseJson(credJson);

  const formattedPrivateKey = cred.private_key
    ? cred.private_key.replace(/\\n/g, "\n")
    : undefined;

  adminApp = initializeApp({
    credential: cert({
      projectId: cred.project_id,
      clientEmail: cred.client_email,
      privateKey: formattedPrivateKey,
    }),
    projectId: cred.project_id,
  });

  return adminApp;
}

export function getAdminDb(): Firestore {
  const app = getAdminApp();
  const dbName = process.env.NEXT_PUBLIC_FIREBASE_DB_NAME || "default";
  return getFirestore(app, dbName);
}
