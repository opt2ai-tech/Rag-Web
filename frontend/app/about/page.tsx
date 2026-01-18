import Link from 'next/link';

export default function AboutPage() {
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
              <Link href="/booking" className="text-gray-700 hover:text-primary-600">
                Book Now
              </Link>
              <Link href="/about" className="text-primary-600 font-semibold">
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
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-primary-100">Discover our story and commitment to excellence</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to Luxury Hotel</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            At Luxury Hotel, we believe that exceptional hospitality goes beyond providing a place to stay. 
            It's about creating unforgettable experiences, anticipating your needs, and making every moment special.
          </p>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Founded with a vision to redefine hotel experiences, we combine traditional hospitality values 
            with cutting-edge technology. Our AI-powered concierge service ensures you have instant access 
            to information and assistance 24/7, while our dedicated staff provides the personal touch that 
            makes your stay truly memorable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              To provide world-class accommodation and service while embracing innovation to enhance 
              every aspect of your stay.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              To be the leading hotel that seamlessly blends luxury, comfort, and technology to create 
              exceptional guest experiences.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6">Location Highlights</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Prime Location</h3>
              <p className="text-gray-700">
                Situated in the heart of the city with easy access to shopping, dining, and entertainment.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Nearby Attractions</h3>
              <ul className="text-gray-700 list-disc list-inside">
                <li>City Center - 5 minutes walk</li>
                <li>Beach - 10 minutes drive</li>
                <li>Airport - 20 minutes drive</li>
                <li>Convention Center - 2 minutes walk</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
