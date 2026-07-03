import { Suspense } from "react";
import MemberClientPage from "./member-client";

export const unstable_instant = false;

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-brandBlue font-bold text-sm uppercase tracking-widest animate-pulse">Loading Member Portal...</div>}>
      <MemberClientPage />
    </Suspense>
  );
}
