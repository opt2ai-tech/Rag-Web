import { Room } from '@/lib/api';
import Link from 'next/link';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
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
  );
}
