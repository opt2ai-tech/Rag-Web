'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Conversation {
  id: number;
  session_id: string;
  message: string;
  response: string;
  created_at: string;
}

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Chat Conversations</h1>

      <div className="bg-white rounded-lg shadow-md p-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No conversations yet.</p>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedConv(conv)}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-gray-900">
                    Session: {conv.session_id.substring(0, 20)}...
                  </p>
                  <span className="text-sm text-gray-500">
                    {new Date(conv.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="bg-blue-50 p-3 rounded mb-2">
                  <p className="text-sm font-semibold text-blue-900">User:</p>
                  <p className="text-gray-700">{conv.message}</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm font-semibold text-green-900">AI:</p>
                  <p className="text-gray-700">{conv.response}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedConv && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedConv(null)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Conversation Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Session ID</p>
                <p className="font-mono text-sm">{selectedConv.session_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p>{new Date(selectedConv.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">User Message</p>
                <div className="bg-blue-50 p-4 rounded">
                  <p>{selectedConv.message}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">AI Response</p>
                <div className="bg-green-50 p-4 rounded">
                  <p>{selectedConv.response}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedConv(null)}
              className="mt-6 w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
