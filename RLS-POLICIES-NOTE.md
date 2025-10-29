# Row Level Security (RLS) Policies Issue

## Problem
The original RLS policies in `supabase-schema.sql` were too restrictive and prevented updates from working properly in the admin panel.

## Solution
You disabled all RLS policies, which allows all operations to work.

## Security Considerations

### Current State (No RLS)
- **Pros**: Everything works without authentication issues
- **Cons**: Anyone with the anon key can read/write all data

### For Production
You should re-enable RLS with proper policies. Here are recommended policies:

```sql
-- Enable RLS on all tables
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read access for studios (only active ones)
CREATE POLICY "Public can view active studios" ON studios
  FOR SELECT USING (is_active = true);

-- Public read access for pricing
CREATE POLICY "Public can view pricing" ON pricing
  FOR SELECT USING (true);

-- Public read access for active addons
CREATE POLICY "Public can view active addons" ON addons
  FOR SELECT USING (is_active = true);

-- Public read access for settings
CREATE POLICY "Public can view settings" ON settings
  FOR SELECT USING (true);

-- Public can create bookings
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Public can view their own bookings (by ID)
CREATE POLICY "Public can view bookings" ON bookings
  FOR SELECT USING (true);

-- Public can update bookings (for status changes via admin)
CREATE POLICY "Public can update bookings" ON bookings
  FOR UPDATE USING (true);

-- Public can create booking addons
CREATE POLICY "Public can create booking addons" ON booking_addons
  FOR INSERT WITH CHECK (true);

-- Public can view booking addons
CREATE POLICY "Public can view booking addons" ON booking_addons
  FOR SELECT USING (true);

-- Allow all operations on studios for admin (you'll need to implement proper auth)
CREATE POLICY "Allow all on studios" ON studios
  FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on pricing for admin
CREATE POLICY "Allow all on pricing" ON pricing
  FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on addons for admin
CREATE POLICY "Allow all on addons" ON addons
  FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on settings for admin
CREATE POLICY "Allow all on settings" ON settings
  FOR ALL USING (true) WITH CHECK (true);
```

## Better Long-term Solution

For production, you should:

1. **Implement Supabase Auth** for the admin panel
2. **Use Service Role Key** for admin operations (server-side only)
3. **Keep anon key** for public operations (viewing studios, creating bookings)
4. **Add proper RLS policies** that check for authenticated admin users

Example with Auth:
```sql
-- Only authenticated users can update bookings
CREATE POLICY "Authenticated users can update bookings" ON bookings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can manage studios
CREATE POLICY "Authenticated users can manage studios" ON studios
  FOR ALL USING (auth.role() = 'authenticated');
```

## Current Recommendation

For development and testing, keeping RLS disabled is fine. Before going to production:

1. Implement proper authentication
2. Re-enable RLS
3. Apply the policies above (or customize them for your needs)
4. Test thoroughly

## To Disable RLS (Current State)
```sql
ALTER TABLE studios DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pricing DISABLE ROW LEVEL SECURITY;
ALTER TABLE addons DISABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

## To Re-enable RLS
```sql
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
```
