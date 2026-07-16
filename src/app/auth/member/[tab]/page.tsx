import { Suspense } from "react";
import MemberClientPage from "../member-client";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-white"></div>}>
      <MemberClientPage />
    </Suspense>
  );
}
