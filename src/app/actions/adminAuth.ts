"use server";

import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cookies } from "next/headers";

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
      maxAge: 60 * 60 * 24, // 1 day
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

export async function getAllUsers() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const usersCol = collection(db, "users");
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, users: JSON.parse(JSON.stringify(userList)) };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Master server action for admin dashboard — fetches users, inquiries, and
 * activity feed in a single round-trip. Runs with server credentials, so
 * Firestore security rules that require auth.uid do NOT block these reads.
 */
export async function getAdminDashboardData() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    // ── Users ──────────────────────────────────────────────────────────────────
    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map(d => {
      const data = d.data() as any;
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
        role: data.role || "member",
        joinedAt: data.joinedAt || "",
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen ? data.lastSeen.toDate?.()?.toISOString() ?? data.lastSeen : null,
        photoURL: data.photoURL || "",
        headshotUrl: data.headshotUrl || "",
        passportScanUrl: data.passportScanUrl || "",
        evidenceUrl: data.evidenceUrl || "",
        passportNumber: data.passportNumber || "",
        bio: data.bio || "",
        fullAddress: data.fullAddress || "",
        legalConsent: data.legalConsent || false,
        paymentId: data.paymentId || "",
      };
    });

    // ── Inquiries ─────────────────────────────────────────────────────────────
    const inqSnap = await getDocs(collection(db, "inquiries"));
    const inquiries = inqSnap.docs.map(d => {
      const data = d.data() as any;
      return {
        id: d.id,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        category: data.category || "",
        message: data.message || "",
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? "",
      };
    });

    // ── Activity Feed ─────────────────────────────────────────────────────────
    let activity: any[] = [];
    try {
      const actQ = query(
        collection(db, "adminActivity"),
        orderBy("timestamp", "desc"),
        limit(30)
      );
      const actSnap = await getDocs(actQ);
      activity = actSnap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          type: data.type || "",
          userId: data.userId || "",
          userName: data.userName || "",
          userEmail: data.userEmail || "",
          timestamp: data.timestamp?.toDate?.()?.toISOString() ?? null,
        };
      });
    } catch (_) {
      // adminActivity collection may not exist yet — not a fatal error
    }

    return {
      success: true,
      data: { users, inquiries, activity },
      fetchedAt: new Date().toISOString(),
    };
  } catch (e: any) {
    console.error("getAdminDashboardData error:", e);
    return { success: false, error: e.message || "Failed to fetch dashboard data" };
  }
}
