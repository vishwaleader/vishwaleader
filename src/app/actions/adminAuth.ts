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
        state: data.state || "",
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
        nationalIdUrl: data.nationalIdUrl || "",
        passportFrontUrl: data.passportFrontUrl || "",
        passportBackUrl: data.passportBackUrl || "",
        businessDeckUrl: data.businessDeckUrl || "",
        paperUrl: data.paperUrl || "",
        passportNumber: data.passportNumber || "",
        bio: data.bio || "",
        legalConsent: data.legalConsent || false,
        skippedRegistration: data.skippedRegistration || false,
        verificationStatus: data.verificationStatus || null,
        wizardIntents: data.wizardIntents || [],
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

    // ── Paper Submissions ──────────────────────────────────────────────────────
    let submissions: any[] = [];
    try {
      const subSnap = await db.collection("submissions").get();
      const directSubmissions = subSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || "",
          authors: data.authors || "",
          theme: data.theme || "",
          abstract: data.abstract || "",
          fileName: data.fileName || "",
          fileUrl: data.fileUrl || data.paperUrl || "",
          paperUrl: data.fileUrl || data.paperUrl || "",
          status: data.status || "pending",
          userId: data.userId || "",
          userEmail: data.userEmail || "",
          type: "conference_paper",
          submittedAt: data.submittedAt || "",
        };
      });

      let souvenirSubmissions: any[] = [];
      try {
        const souvSnap = await db.collection("souvenir_submissions").get();
        souvenirSubmissions = souvSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || "",
            authors: data.author || "",
            theme: "souvenir",
            abstract: data.abstract || "",
            fileName: data.fileName || "SouvenirArticle.pdf",
            fileUrl: data.fileUrl || "",
            paperUrl: data.fileUrl || "",
            status: data.status || "pending",
            userId: data.userId || "",
            userEmail: data.userEmail || "",
            type: "souvenir_article",
            submittedAt: data.submittedAt || "",
          };
        });
      } catch (_) {}

      submissions = [...directSubmissions, ...souvenirSubmissions].sort((a, b) => {
        return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
      });
    } catch (_) {}

    return {
      success: true,
      data: { users, inquiries, activity, submissions },
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

export async function getAdminUserData(userId: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const db = getAdminDb();
    const docSnap = await db.collection("users").doc(userId).get();
    if (!docSnap.exists) {
      return { success: false, error: "User not found" };
    }
    const data = docSnap.data() || {};

    let guests: any[] = [];
    try {
      const guestsSnap = await db.collection("users").doc(userId).collection("guests").get();
      guests = guestsSnap.docs.map(g => ({ id: g.id, ...g.data() }));
    } catch (_) {}

    const user = {
      id: docSnap.id,
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
      state: data.state || "",
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
      lastSeen: data.lastSeen ? (data.lastSeen.toDate ? data.lastSeen.toDate().toISOString() : String(data.lastSeen)) : null,
      photoURL: data.photoURL || "",
      headshotUrl: data.headshotUrl || "",
      passportScanUrl: data.passportScanUrl || "",
      evidenceUrl: data.evidenceUrl || "",
      nationalIdUrl: data.nationalIdUrl || "",
      passportFrontUrl: data.passportFrontUrl || "",
      passportBackUrl: data.passportBackUrl || "",
      businessDeckUrl: data.businessDeckUrl || "",
      paperUrl: data.paperUrl || "",
      passportNumber: data.passportNumber || "",
      bio: data.bio || "",
      legalConsent: data.legalConsent || false,
      skippedRegistration: data.skippedRegistration || false,
      verificationStatus: data.verificationStatus || null,
      wizardIntents: data.wizardIntents || [],
      groupType: data.groupType || "none",
      numDelegates: data.numDelegates || 1,
      guestProfiles: data.guestProfiles || guests,
    };

    let userSubmissions: any[] = [];
    try {
      const userSubSnap = await db.collection("submissions").where("userId", "==", userId).get();
      userSubmissions = userSubSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (_) {}

    return { success: true, user: { ...user, submissions: userSubmissions } };
  } catch (e: any) {
    console.error("getAdminUserData error:", e);
    return { success: false, error: e.message || "Failed to fetch user details" };
  }
}

export async function updateSubmissionStatus(submissionId: string, status: 'pending' | 'approved' | 'rejected') {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const db = getAdminDb();
    await db.collection("submissions").doc(submissionId).update({
      status,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getAdminPaymentsData() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayPayments: any[] = [];
    if (keyId && keySecret) {
      try {
        const Razorpay = (await import("razorpay")).default;
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });
        const res: any = await razorpay.payments.all({ count: 100 });
        if (res && res.items) {
          razorpayPayments = res.items.map((p: any) => ({
            id: p.id,
            orderId: p.order_id || "",
            amount: p.amount ? p.amount / 100 : 0,
            currency: p.currency || "INR",
            status: p.status, // captured, failed, authorized, refunded
            method: p.method,
            email: p.email || "",
            contact: p.contact || "",
            createdAt: new Date(p.created_at * 1000).toISOString(),
            errorDescription: p.error_description || "",
            bank: p.bank || "",
            wallet: p.wallet || "",
            vpa: p.vpa || "",
            fee: p.fee ? p.fee / 100 : 0,
            tax: p.tax ? p.tax / 100 : 0,
            notes: p.notes || {}
          }));
        }
      } catch (rzpErr: any) {
        console.error("Razorpay API fetch error:", rzpErr.message);
      }
    }

    const db = getAdminDb();
    let firestoreOrders: any[] = [];
    try {
      const ordersSnap = await db.collection("orders").get();
      firestoreOrders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (_) {}

    let firestoreDonations: any[] = [];
    try {
      const donSnap = await db.collection("donations").get();
      firestoreDonations = donSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (_) {}

    return {
      success: true,
      data: {
        razorpayPayments,
        firestoreOrders,
        firestoreDonations
      }
    };
  } catch (e: any) {
    console.error("getAdminPaymentsData error:", e);
    return { success: false, error: e.message || "Failed to fetch payments data" };
  }
}

export async function reconcileRazorpayPayment(paymentId: string, targetEmail: string, amount: number, customStatus?: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const db = getAdminDb();
    const cleanEmail = targetEmail.trim().toLowerCase();
    const usersSnap = await db.collection("users").where("email", "==", cleanEmail).get();
    
    let matchedDoc = !usersSnap.empty ? usersSnap.docs[0] : null;

    if (!matchedDoc) {
      const allUsersSnap = await db.collection("users").get();
      matchedDoc = allUsersSnap.docs.find(d => (d.data().email || "").toLowerCase() === cleanEmail) || null;
    }

    if (!matchedDoc) {
      return { success: false, error: `No registered user profile found with email '${targetEmail}'.` };
    }

    const userData = matchedDoc.data();
    const previousPaid = Number(userData.amountPaid) || 0;
    const newAmountPaid = previousPaid + amount;
    const authoritativeTotal = Math.max(Number(userData.totalAmount) || 0, newAmountPaid);
    const remainingBalance = Math.max(0, authoritativeTotal - newAmountPaid);
    
    const determinedStatus = customStatus || (remainingBalance <= 0 ? "Paid" : "Partially Paid");

    await matchedDoc.ref.set({
      paymentStatus: determinedStatus,
      paymentId: paymentId,
      amountPaid: newAmountPaid,
      totalAmount: authoritativeTotal,
      remainingBalance: remainingBalance,
      paidAt: new Date().toISOString(),
      paymentHistory: [
        ...(userData.paymentHistory || []),
        {
          paymentId: paymentId,
          amount: amount,
          paidAt: new Date().toISOString(),
          paymentType: determinedStatus === "Paid" ? "Full / Final" : "Partial Deposit",
          status: "captured"
        }
      ]
    }, { merge: true });

    await db.collection("adminActivity").add({
      type: "payment_reconciled",
      userId: matchedDoc.id,
      userEmail: targetEmail,
      userName: userData.name || "User",
      paymentId: paymentId,
      amount: amount,
      status: determinedStatus,
      timestamp: new Date()
    });

    return { success: true, message: `Payment ${paymentId} (₹${amount.toLocaleString('en-IN')}) successfully synced to profile as '${determinedStatus}'.`, status: determinedStatus };
  } catch (e: any) {
    console.error("reconcileRazorpayPayment error:", e);
    return { success: false, error: e.message || "Failed to reconcile payment" };
  }
}

export async function updateUserPaymentStatus(targetEmail: string, status: 'Paid' | 'Partially Paid' | 'Unpaid') {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const db = getAdminDb();
    const cleanEmail = targetEmail.trim().toLowerCase();
    const usersSnap = await db.collection("users").where("email", "==", cleanEmail).get();
    
    let matchedDoc = !usersSnap.empty ? usersSnap.docs[0] : null;

    if (!matchedDoc) {
      const allUsersSnap = await db.collection("users").get();
      matchedDoc = allUsersSnap.docs.find(d => (d.data().email || "").toLowerCase() === cleanEmail) || null;
    }

    if (!matchedDoc) {
      return { success: false, error: `No registered user profile found with email '${targetEmail}'.` };
    }

    await matchedDoc.ref.set({
      paymentStatus: status
    }, { merge: true });

    return { success: true, message: `Updated payment status for ${targetEmail} to '${status}'.` };
  } catch (e: any) {
    console.error("updateUserPaymentStatus error:", e);
    return { success: false, error: e.message || "Failed to update payment status" };
  }
}

