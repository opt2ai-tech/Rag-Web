'use client';

import { useEffect, useState } from 'react';
import { api, Room } from '@/lib/api';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [maxGuests, setMaxGuests] = useState('');
  const [amenities, setAmenities] = useState('');
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      const data = await api.getRooms();
      setRooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openForm(room?: Room) {
    if (room) {
      setEditingRoom(room);
      setName(room.name);
      setDescription(room.description);
      setPrice(room.price_per_night.toString());
      setMaxGuests(room.max_guests.toString());
      setAmenities(room.amenities.join(', '));
      setAvailable(room.available);
    } else {
      resetForm();
    }
    setShowForm(true);
  }

  function resetForm() {
    setEditingRoom(null);
    setName('');
    setDescription('');
    setPrice('');
    setMaxGuests('');
    setAmenities('');
    setAvailable(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const roomData = {
      name,
      description,
      price_per_night: parseFloat(price),
      max_guests: parseInt(maxGuests),
      amenities: amenities.split(',').map((a) => a.trim()).filter((a) => a),
      images: [],
      available,
    };

    try {
      if (editingRoom) {
        await api.updateRoom(editingRoom.id, roomData);
      } else {
        await api.createRoom(roomData);
      }
      setShowForm(false);
      resetForm();
      loadRooms();
    } catch (err) {
      console.error(err);
      alert('Failed to save room');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      await api.deleteRoom(id);
      loadRooms();
    } catch (err) {
      console.error(err);
      alert('Failed to delete room');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Rooms</h1>
        <button
          onClick={() => openForm()}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          Add New Room
        </button>
      </div>

      {/* Room Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Room Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Price per Night</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Max Guests</label>
                  <input
                    type="number"
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  placeholder="WiFi, TV, Mini Bar, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-gray-700 font-semibold">Available</span>
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rooms List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-2">{room.name}</h3>
              <p className="text-gray-600 mb-4">{room.description}</p>
              <div className="mb-4">
                <p className="text-2xl font-bold text-primary-600">
                  ${room.price_per_night}/night
                </p>
                <p className="text-gray-600">Max Guests: {room.max_guests}</p>
                <p className={`text-sm ${room.available ? 'text-green-600' : 'text-red-600'}`}>
                  {room.available ? 'Available' : 'Unavailable'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openForm(room)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
