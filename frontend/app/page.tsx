'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                Luxury Hotel
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/rooms" className="text-gray-700 hover:text-primary-600">
                Rooms
              </Link>
              <Link href="/booking" className="text-gray-700 hover:text-primary-600">
                Book Now
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600">
                Contact
              </Link>
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-primary-600">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to Luxury Hotel
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Experience exceptional hospitality with AI-powered concierge service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/booking"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
              >
                Book Now
              </Link>
              <button
                onClick={() => {
                  const event = new CustomEvent('openChat');
                  window.dispatchEvent(event);
                }}
                className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition border-2 border-white"
              >
                Chat with Concierge
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Rooms</h2>
            <p className="text-xl text-gray-600">
              Discover comfort and luxury in every room
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Room Card 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Deluxe Suite</h3>
                <p className="text-gray-600 mb-4">
                  Spacious suite with premium amenities and city views
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">$299</span>
                  <Link
                    href="/rooms"
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>

            {/* Room Card 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Ocean View</h3>
                <p className="text-gray-600 mb-4">
                  Beautiful ocean-facing room with balcony
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">$249</span>
                  <Link
                    href="/rooms"
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>

            {/* Room Card 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Presidential Suite</h3>
                <p className="text-gray-600 mb-4">
                  Ultimate luxury with panoramic views and butler service
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">$599</span>
                  <Link
                    href="/rooms"
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/rooms"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              View All Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold mb-2">AI Concierge</h3>
              <p className="text-gray-600">
                Get instant answers to your questions 24/7 from our AI-powered concierge
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏨</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Luxury Rooms</h3>
              <p className="text-gray-600">
                Choose from our selection of beautifully designed rooms and suites
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Simple and fast online booking process with instant confirmation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Luxury Hotel. All rights reserved.</p>
          <p className="text-gray-400 mt-2">Powered by AI RAG Technology</p>
        </div>
      </footer>
    </div>
  );
}
