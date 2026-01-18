-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'guest',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price_per_night FLOAT NOT NULL,
    max_guests INTEGER NOT NULL,
    amenities JSONB,
    images JSONB,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP NOT NULL,
    guest_count INTEGER NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    processed BOOLEAN DEFAULT FALSE
);

-- Document chunks with vector embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),
    chunk_metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat logs table
CREATE TABLE IF NOT EXISTS chat_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(available);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_session_id ON chat_logs(session_id);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Insert a default admin user (password: admin123)
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@hotel.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5QiRgBvWGw7xG', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample rooms
INSERT INTO rooms (name, description, price_per_night, max_guests, amenities, images, available) VALUES
('Deluxe King Suite', 'Spacious suite with king bed, city view, and premium amenities', 299.99, 2, 
 '["King Bed", "City View", "Mini Bar", "Coffee Maker", "Free WiFi", "Smart TV"]'::jsonb,
 '["/images/rooms/deluxe-king-1.jpg", "/images/rooms/deluxe-king-2.jpg"]'::jsonb, true),
('Ocean View Double', 'Beautiful ocean-facing room with two queen beds', 249.99, 4,
 '["Two Queen Beds", "Ocean View", "Balcony", "Free WiFi", "Smart TV"]'::jsonb,
 '["/images/rooms/ocean-double-1.jpg", "/images/rooms/ocean-double-2.jpg"]'::jsonb, true),
('Presidential Suite', 'Luxury suite with separate living area, jacuzzi, and panoramic views', 599.99, 4,
 '["King Bed", "Living Room", "Jacuzzi", "Panoramic View", "Butler Service", "Free WiFi"]'::jsonb,
 '["/images/rooms/presidential-1.jpg", "/images/rooms/presidential-2.jpg"]'::jsonb, true),
('Standard Queen', 'Comfortable room with queen bed and essential amenities', 149.99, 2,
 '["Queen Bed", "Free WiFi", "Smart TV", "Coffee Maker"]'::jsonb,
 '["/images/rooms/standard-queen-1.jpg"]'::jsonb, true)
ON CONFLICT DO NOTHING;
