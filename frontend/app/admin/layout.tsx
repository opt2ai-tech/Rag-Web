'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = api.getToken();
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  function handleLogout() {
    api.clearToken();
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Nav */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link href="/admin/dashboard" className="text-2xl font-bold text-primary-600">
                Admin Panel
              </Link>
              <Link
                href="/admin/dashboard"
                className="text-gray-700 hover:text-primary-600"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/rooms"
                className="text-gray-700 hover:text-primary-600"
              >
                Rooms
              </Link>
              <Link
                href="/admin/documents"
                className="text-gray-700 hover:text-primary-600"
              >
                Documents
              </Link>
              <Link
                href="/admin/conversations"
                className="text-gray-700 hover:text-primary-600"
              >
                Conversations
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-primary-600">
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
