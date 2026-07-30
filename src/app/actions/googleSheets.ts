"use server";

import { google } from "googleapis";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { checkAdminSession } from "./adminAuth";

export async function exportToGoogleSheets() {
  try {
    // 1. Ensure the user is an authenticated admin
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return { success: false, error: "Unauthorized: Admin access required." };
    }

    // 2. Load environment variables & service account credentials
    const sheetId = process.env.GOOGLE_SHEET_ID || "1pgCCDMM3UK6Shi4tmoa6k2rzmYhlhhNqly7YVB4T98Y";
    const sheetName = process.env.GOOGLE_SHEET_NAME || "Sheet1";
    const credentialsEnv = process.env.GOOGLE_CREDENTIALS_JSON;
    
    let credentials: any = null;

    if (credentialsEnv) {
      try {
        const { safeParseJson } = await import("@/lib/firebaseAdmin");
        credentials = safeParseJson(credentialsEnv);
      } catch (err) {
        console.error("Failed to parse GOOGLE_CREDENTIALS_JSON env variable:", err);
      }
    }

    // Fallback: Read local credentials file if env variable parsing failed or is empty
    if (!credentials) {
      try {
        const fs = require("fs");
        const path = require("path");
        const localKeyPath = path.join(process.cwd(), "vishwa-leader-8f76cd8557d7.json");
        if (fs.existsSync(localKeyPath)) {
          credentials = JSON.parse(fs.readFileSync(localKeyPath, "utf8"));
        }
      } catch (err) {
        console.error("Failed to load local Google service account key file:", err);
      }
    }

    if (!credentials) {
      return { 
        success: false, 
        error: "Google Sheets credentials not found. Configure GOOGLE_CREDENTIALS_JSON or place key file in root." 
      };
    }

    // 3. Initialize Google Auth client
    const privateKey = credentials.private_key?.replace(/\\n/g, "\n");
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 4. Fetch users from Firestore using Admin SDK (bypasses security rules)
    const adminDb = getAdminDb();
    const userSnapshot = await adminDb.collection("users").get();
    const users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

    // 5. Prepare data rows
    const headers = [
      "User UID",
      "Full Name",
      "Email Address",
      "Phone Number",
      "Designation",
      "Organization",
      "Sector",
      "Country",
      "Gender",
      "Age",
      "Nationality",
      "City",
      "Delegate Type",
      "Nomination Category",
      "Package/Tour Selected",
      "Visa Support Required",
      "Accommodation Support",
      "Payment Status",
      "Role",
      "Registered At"
    ];

    const rows = users.map(u => [
      u.id || "",
      u.name || "",
      u.email || "",
      u.phone || "",
      u.designation || "",
      u.organization || "",
      u.sector || "",
      u.country || "",
      u.gender || "",
      u.age || "",
      u.nationality || "",
      u.city || "",
      u.delegateType || "",
      u.nominationCategory || "",
      u.packageTour || "",
      u.visaSupport ? "Yes" : "No",
      u.accommodationSupport ? "Yes" : "No",
      u.paymentStatus || "Unpaid",
      u.role || "member",
      u.joinedAt || ""
    ]);

    const values = [headers, ...rows];

    // 6. Clear current values on Sheet1 to avoid lingering old data
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:Z10000`,
    });

    // 7. Write the updated values
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    return { success: true, count: users.length };
  } catch (error: any) {
    console.error("Google Sheets Export Error:", error);
    return { success: false, error: error?.message || "An unexpected error occurred during export." };
  }
}
