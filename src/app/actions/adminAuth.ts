"use server";

import { cookies } from "next/headers";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function loginAsAdmin(username: string, password: string) {
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const cookieStore = await cookies();
    cookieStore.set("vl_admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return { success: true };
  }
  return { success: false, error: "Login failed. Please check your input and try again." };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("vl_admin_session");
}

export async function checkAdminSession() {
  const cookieStore = await cookies();
  return cookieStore.get("vl_admin_session")?.value === "authenticated";
}

/**
 * Fetches all dashboard data using Firebase Admin SDK.
 * Runs server-side — bypasses Firestore security rules entirely.
 */
export async function getAdminDashboardData() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const db = getAdminDb();

    // ── Users ──────────────────────────────────────────────────────────────────
    const usersSnap = await db.collection("users").get();
    const users = usersSnap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        designation: data.designation || "",
        organization: data.organization || "",
        sector: data.sector || "",
        country: data.country || "",
        gender: data.gender || "",
        age: data.age || "",
        nationality: data.nationality || "",
        city: data.city || "",
        delegateType: data.delegateType || "",
        nominationCategory: data.nominationCategory || "",
        packageTour: data.packageTour || "",
        visaSupport: data.visaSupport || false,
        accommodationSupport: data.accommodationSupport || false,
        paymentStatus: data.paymentStatus || "Unpaid",
        paymentId: data.paymentId || "",
        role: data.role || "member",
        joinedAt: data.joinedAt || "",
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen
          ? (data.lastSeen.toDate ? data.lastSeen.toDate().toISOString() : String(data.lastSeen))
          : null,
        photoURL: data.photoURL || "",
        headshotUrl: data.headshotUrl || "",
        passportScanUrl: data.passportScanUrl || "",
        evidenceUrl: data.evidenceUrl || "",
        passportNumber: data.passportNumber || "",
        bio: data.bio || "",
        legalConsent: data.legalConsent || false,
      };
    });

    // ── Inquiries ─────────────────────────────────────────────────────────────
    const inqSnap = await db.collection("inquiries").get();
    const inquiries = inqSnap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        category: data.category || "",
        message: data.message || "",
        createdAt: data.createdAt
          ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : String(data.createdAt))
          : "",
      };
    });

    // ── Activity Feed ─────────────────────────────────────────────────────────
    let activity: any[] = [];
    try {
      const actSnap = await db
        .collection("adminActivity")
        .orderBy("timestamp", "desc")
        .limit(30)
        .get();
      activity = actSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          type: data.type || "",
          userId: data.userId || "",
          userName: data.userName || "",
          userEmail: data.userEmail || "",
          fileType: data.fileType || "",
          timestamp: data.timestamp
            ? (data.timestamp.toDate ? data.timestamp.toDate().toISOString() : String(data.timestamp))
            : null,
        };
      });
    } catch (_) {
      // adminActivity collection may not exist yet
    }

    return {
      success: true,
      data: { users, inquiries, activity },
      fetchedAt: new Date().toISOString(),
    };
  } catch (e: any) {
    console.error("getAdminDashboardData error:", e.message);
    return { success: false, error: e.message || "Failed to fetch dashboard data" };
  }
}

/** Legacy — kept for Google Sheets export compat */
export async function getAllUsers() {
  const res = await getAdminDashboardData();
  if (!res.success || !res.data) return { success: false, error: res.error };
  return { success: true, users: res.data.users };
}

// ── Announcement Settings ──────────────────────────────────────────────────
export async function getAnnouncementSettings() {
  try {
    const db = getAdminDb();
    const docSnap = await db.collection("settings").doc("announcement").get();
    if (docSnap.exists) {
      return { success: true, data: docSnap.data() };
    }
    return { success: true, data: { enabled: false, message: "" } };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateAnnouncementSettings(enabled: boolean, message: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const db = getAdminDb();
    await db.collection("settings").doc("announcement").set({
      enabled,
      message,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Ad Settings ────────────────────────────────────────────────────────────
export async function getAdSettings() {
  try {
    const db = getAdminDb();
    const docSnap = await db.collection("settings").doc("ads").get();
    if (docSnap.exists) {
      return { success: true, data: docSnap.data() };
    }
    return { success: true, data: { enabled: false } };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateAdSettings(enabled: boolean) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const db = getAdminDb();
    await db.collection("settings").doc("ads").set({
      enabled,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function verifyUserDocuments(
  userId: string, 
  userEmail: string, 
  userName: string,
  verificationData: Record<string, { approved: boolean, feedback: string, label: string }>
) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const db = getAdminDb();
    
    // Save verification data to Firestore
    await db.collection("users").doc(userId).update({
      verificationStatus: verificationData,
      lastVerifiedAt: new Date().toISOString()
    });

    // Check if any items are rejected
    const rejectedItems = Object.entries(verificationData)
      .filter(([_, data]) => !data.approved)
      .map(([key, data]) => ({ key, label: data.label, feedback: data.feedback }));

    // Send email if there are rejections
    if (rejectedItems.length > 0 && userEmail) {
      // Import dynamically to avoid circular dependency issues if any
      const { sendReuploadNotification } = await import("./emailActions");
      await sendReuploadNotification(userEmail, userName, rejectedItems);
    }

    return { success: true };
  } catch (e: any) {
    console.error("verifyUserDocuments error:", e);
    return { success: false, error: e.message };
  }
}
