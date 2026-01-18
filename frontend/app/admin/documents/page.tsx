'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Document {
  id: number;
  filename: string;
  uploaded_at: string;
  processed: boolean;
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      await api.uploadDocument(file);
      setUploadProgress('Processing document...');
      await loadDocuments();
      setUploadProgress('Upload complete!');
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (err: any) {
      setUploadProgress('');
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.deleteDocument(id);
      loadDocuments();
    } catch (err) {
      console.error(err);
      alert('Failed to delete document');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Documents</h1>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Upload New Document</h2>
        <p className="text-gray-600 mb-4">
          Upload hotel documents (PDF, DOC, DOCX, TXT) to train the AI chatbot.
        </p>
        
        {uploadProgress && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
            {uploadProgress}
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-gray-600">
              <p className="text-4xl mb-2">📄</p>
              <p className="font-semibold">Click to upload or drag and drop</p>
              <p className="text-sm mt-2">PDF, DOC, DOCX, TXT (max 10MB)</p>
            </div>
          </label>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Uploaded Documents</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : documents.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No documents uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Filename</th>
                  <th className="text-left py-3 px-4">Uploaded</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{doc.filename}</td>
                    <td className="py-3 px-4">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          doc.processed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {doc.processed ? 'Processed' : 'Processing'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
