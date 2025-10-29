-- Haus Studio Database Schema
-- This file contains all the SQL commands needed to set up your Supabase database

-- Create studios table
CREATE TABLE studios (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricing table
CREATE TABLE pricing (
  id SERIAL PRIMARY KEY,
  duration_hours INTEGER NOT NULL UNIQUE,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create addons table
CREATE TABLE addons (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  studio_id INTEGER NOT NULL REFERENCES studios(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  additional_hour BOOLEAN DEFAULT FALSE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_addons table
CREATE TABLE booking_addons (
  id SERIAL PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  addon_id INTEGER NOT NULL REFERENCES addons(id),
  quantity INTEGER DEFAULT 1,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_studio ON bookings(studio_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_booking_addons_booking ON booking_addons(booking_id);

-- Insert default studios
INSERT INTO studios (name, description) VALUES
('Studio A', 'Premium studio with natural lighting'),
('Studio B', 'Spacious studio with professional equipment');

-- Insert default pricing (in IDR)
INSERT INTO pricing (duration_hours, price) VALUES
(2, 200000),
(4, 350000),
(6, 500000),
(8, 600000);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
('whatsapp_number', '628123456789'),
('additional_hour_price', '150000');

-- Insert sample addons (optional)
INSERT INTO addons (name, description, price, is_active) VALUES
('Professional Lighting', 'Complete professional lighting setup', 100000, true),
('Backdrop Set', 'Various backdrop options', 50000, true),
('Makeup Artist', '2-hour makeup session', 300000, true),
('Photography Equipment', 'Professional camera and lenses', 200000, true);

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (customers can view)
CREATE POLICY "Allow public read access to studios" ON studios FOR SELECT USING (true);
CREATE POLICY "Allow public read access to pricing" ON pricing FOR SELECT USING (true);
CREATE POLICY "Allow public read access to active addons" ON addons FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to settings" ON settings FOR SELECT USING (true);

-- Create policies for bookings (customers can create and read their own)
CREATE POLICY "Allow public insert on bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public update on bookings" ON bookings FOR UPDATE USING (true);

-- Create policies for booking_addons
CREATE POLICY "Allow public insert on booking_addons" ON booking_addons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on booking_addons" ON booking_addons FOR SELECT USING (true);

-- Note: For production, you should create more restrictive RLS policies
-- and use Supabase Auth to properly secure your data
