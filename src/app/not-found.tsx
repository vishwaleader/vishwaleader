// Force dynamic rendering so Firebase is never initialized during static prerender
export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-6">
      <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
      <p className="text-xl text-slate-600 mb-2">Page Not Found</p>
      <p className="text-slate-400 text-sm mb-8">The page you are looking for does not exist or has been moved.</p>
      <Link
        href="/"
        className="bg-brandBlue text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm"
      >
        Go to Homepage
      </Link>
    </div>
  );
}
