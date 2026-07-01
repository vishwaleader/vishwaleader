"use server";

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
  return { success: false, error: "Invalid credentials. Only authorized team members can access this area." };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("vl_admin_session");
}

export async function checkAdminSession() {
  const cookieStore = await cookies();
  return cookieStore.get("vl_admin_session")?.value === "authenticated";
}
