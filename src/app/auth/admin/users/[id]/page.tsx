import UserDetailClientPage from "./user-detail-client";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">Loading user details...</div>}>
      <UserDetailClientPage userId={id} />
    </Suspense>
  );
}
