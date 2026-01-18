'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardStats {
  total_rooms: number;
  total_bookings: number;
  total_revenue: number;
  total_chat_logs: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Rooms</p>
                  <p className="text-3xl font-bold text-primary-600 mt-2">
                    {stats?.total_rooms || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏨</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Bookings</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {stats?.total_bookings || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Revenue</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    ${stats?.total_revenue.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Chat Interactions</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {stats?.total_chat_logs || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <a
                href="/admin/rooms"
                className="block bg-primary-50 hover:bg-primary-100 p-6 rounded-lg transition text-center"
              >
                <p className="text-3xl mb-2">➕</p>
                <p className="font-semibold text-primary-900">Add New Room</p>
              </a>
              <a
                href="/admin/documents"
                className="block bg-green-50 hover:bg-green-100 p-6 rounded-lg transition text-center"
              >
                <p className="text-3xl mb-2">📤</p>
                <p className="font-semibold text-green-900">Upload Document</p>
              </a>
              <a
                href="/admin/conversations"
                className="block bg-purple-50 hover:bg-purple-100 p-6 rounded-lg transition text-center"
              >
                <p className="text-3xl mb-2">👀</p>
                <p className="font-semibold text-purple-900">View Conversations</p>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
