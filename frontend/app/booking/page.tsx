'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { api, Room, Booking } from '@/lib/api';

function BookingPageContent() {
  const searchParams = useSearchParams();
  const preselectedRoomId = searchParams.get('room');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(
    preselectedRoomId ? parseInt(preselectedRoomId) : null
  );
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      const data = await api.getRooms(true);
      setRooms(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedRoomId || !checkIn || !checkOut || !guestName || !guestEmail) {
      setError('Please fill in all fields');
      return;
    }

    if (checkIn >= checkOut) {
      setError('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);

    try {
      const booking: Booking = {
        room_id: selectedRoomId,
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        guest_count: guestCount,
        guest_name: guestName,
        guest_email: guestEmail,
      };

      await api.createBooking(booking);
      setSuccess(true);
      
      // Reset form
      setSelectedRoomId(null);
      setCheckIn(null);
      setCheckOut(null);
      setGuestCount(1);
      setGuestName('');
      setGuestEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  }

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = selectedRoom && nights ? selectedRoom.price_per_night * nights : 0;

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
              <Link href="/rooms" className="text-gray-700 hover:text-primary-600">
                Rooms
              </Link>
              <Link href="/booking" className="text-primary-600 font-semibold">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Book Your Stay</h1>
          <p className="text-xl text-primary-100">Complete your reservation in minutes</p>
        </div>
      </div>

      {/* Booking Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold">Booking confirmed!</p>
            <p>Check your email for confirmation details.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          {/* Room Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Select Room</label>
            <select
              value={selectedRoomId || ''}
              onChange={(e) => setSelectedRoomId(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              required
            >
              <option value="">Choose a room...</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} - ${room.price_per_night}/night
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Check-in Date</label>
              <DatePicker
                selected={checkIn}
                onChange={(date) => setCheckIn(date)}
                minDate={new Date()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholderText="Select check-in date"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Check-out Date</label>
              <DatePicker
                selected={checkOut}
                onChange={(date) => setCheckOut(date)}
                minDate={checkIn || new Date()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholderText="Select check-out date"
                required
              />
            </div>
          </div>

          {/* Guest Count */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Number of Guests</label>
            <input
              type="number"
              min="1"
              max={selectedRoom?.max_guests || 10}
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              required
            />
          </div>

          {/* Guest Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Summary */}
          {selectedRoom && nights > 0 && (
            <div className="bg-primary-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span className="font-semibold">{selectedRoom.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span className="font-semibold">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per night:</span>
                  <span className="font-semibold">${selectedRoom.price_per_night}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-primary-600">${totalPrice}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BookingPage() {
  // `useSearchParams()` requires a Suspense boundary for static generation.
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <BookingPageContent />
    </Suspense>
  );
}
