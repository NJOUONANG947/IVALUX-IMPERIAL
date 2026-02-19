'use client';

import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-serif text-luxury-ivory mb-4">Access Denied</h1>
        <p className="text-luxury-ivory/60 mb-8">
          You do not have permission to view this page. Admin access is required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-luxury-gold text-luxury-black font-medium hover:bg-luxury-gold/90 transition-colors"
          >
            Sign in with different account
          </Link>
        </div>
      </div>
    </div>
  );
}
