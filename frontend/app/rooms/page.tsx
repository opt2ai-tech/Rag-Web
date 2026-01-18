'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Room } from '@/lib/api';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      const data = await api.getRooms(true);
      setRooms(data);
    } catch (err) {
      setError('Failed to load rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Luxury Hotel
            </Link>
            <div className="flex space-x-8">
              <Link href="/rooms" className="text-primary-600 font-semibold">
                Rooms
              </Link>
              <Link href="/booking" className="text-gray-700 hover:text-primary-600">
                Book Now
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Our Rooms & Suites</h1>
          <p className="text-xl text-primary-100">
            Choose from our selection of luxury accommodations
          </p>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading rooms...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
            >
              <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600"></div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{room.name}</h3>
                <p className="text-gray-600 mb-4">{room.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Amenities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.slice(0, 4).map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700">
                    <span className="font-semibold">Max Guests:</span> {room.max_guests}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <span className="text-3xl font-bold text-primary-600">
                      ${room.price_per_night}
                    </span>
                    <span className="text-gray-600"> / night</span>
                  </div>
                  <Link
                    href={`/booking?room=${room.id}`}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && rooms.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No rooms available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
