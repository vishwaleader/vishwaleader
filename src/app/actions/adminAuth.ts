"use server";

import { collection, getDocs } from "firebase/firestore";
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
  // First, ensure the request is from an authenticated admin
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  const usersCol = collection(db, "users");
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // We are returning plain objects to avoid serialization issues with Next.js
  return { success: true, users: JSON.parse(JSON.stringify(userList)) };
}
