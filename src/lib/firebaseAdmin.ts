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
  let str = jsonStr.trim();

  // Attempt 1: Standard JSON parse
  try {
    return JSON.parse(str);
  } catch (_) {}

  // Attempt 2: If outer-quoted string
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    try {
      const unquoted = JSON.parse(str);
      if (typeof unquoted === "string") return safeParseJson(unquoted);
      if (typeof unquoted === "object" && unquoted !== null) return unquoted;
    } catch (_) {
      str = str.slice(1, -1).trim();
    }
  }

  // Attempt 3: Safe Object Evaluator for JSON with raw newlines in string properties
  try {
    const obj = (new Function(`return (${str})`))();
    if (typeof obj === "string") return safeParseJson(obj);
    if (typeof obj === "object" && obj !== null) return obj;
  } catch (_) {}

  throw new Error("Could not parse credentials JSON");
}

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  let credJson: string | undefined;

  if (process.env.FIREBASE_ADMIN_CREDENTIALS_BASE64) {
    const b64 = process.env.FIREBASE_ADMIN_CREDENTIALS_BASE64.replace(/[\r\n\s]+/g, '');
    credJson = Buffer.from(b64, 'base64').toString('utf8');
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
