# Haus Studio Booking Web Application

A modern, full-featured booking system for Haus Studio with customer-facing interface and admin panel. Built with Next.js 14, TypeScript, TailwindCSS, and Supabase.

## Features

### Customer Features
- **Studio Availability**: View real-time availability for two studios
- **Flexible Booking**: Choose from 2, 4, 6, or 8-hour sessions with optional additional hour
- **Add-ons**: Select from available add-ons (equipment, services, etc.)
- **WhatsApp Integration**: Confirm bookings and request changes via WhatsApp
- **Booking Search**: Find and manage bookings using unique booking ID
- **Conflict Prevention**: System prevents double-booking automatically

### Admin Features
- **Dashboard**: View all bookings with filtering options
- **Booking Management**: Update booking status (pending/confirmed/cancelled)
- **Settings Configuration**: Manage WhatsApp number and additional hour pricing
- **Pricing Management**: Configure prices for different booking durations
- **Add-ons Management**: Create, edit, and manage available add-ons

### Design
- **Theme**: Brown-Cream soft premium aesthetic
- **Responsive**: Mobile-first design that works on all devices
- **Modern UI**: Clean, professional interface with smooth interactions

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: TailwindCSS with custom brown-cream theme
- **Backend**: Supabase (PostgreSQL database, real-time subscriptions)
- **Icons**: Lucide React
- **Utilities**: date-fns for date handling

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works fine)

## Setup Instructions

### 1. Clone or Download the Project

```bash
cd /path/to/HausStudio
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js and React
- Supabase client
- TailwindCSS
- TypeScript
- Lucide React icons
- date-fns

### 3. Set Up Supabase

#### 3.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Haus Studio (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for starting
5. Click "Create new project" and wait for it to initialize (2-3 minutes)

#### 3.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL**: Something like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: A long string starting with `eyJ...`
4. Keep this page open, you'll need these values in the next step

#### 3.3 Set Up the Database Schema

1. In your Supabase project, click on the **SQL Editor** icon in the left sidebar
2. Click **"New query"**
3. Open the `supabase-schema.sql` file from this project
4. Copy ALL the contents of that file
5. Paste it into the SQL Editor in Supabase
6. Click **"Run"** (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned" - this means your database is set up!

This will create:
- All necessary tables (studios, bookings, pricing, addons, settings)
- Default data (2 studios, pricing tiers, sample add-ons)
- Indexes for performance
- Row Level Security policies

### 4. Configure Environment Variables

1. In the project root, create a file named `.env.local`
2. Add the following content (replace with your actual values):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Configuration
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzg5MzY3MCwiZXhwIjoxOTM5NDY5NjcwfQ.abc123def456
NEXT_PUBLIC_ADMIN_PASSWORD=MySecurePassword123!
```

**Important Notes:**
- Replace `your_supabase_project_url` with your actual Project URL from step 3.2
- Replace `your_supabase_anon_key` with your actual anon key from step 3.2
- Replace `your_admin_password` with a secure password for admin access
- Never commit `.env.local` to version control (it's already in .gitignore)

### 5. Configure WhatsApp Number (Important!)

1. Start the development server (see step 6)
2. Navigate to `http://localhost:3000/admin`
3. Log in with the admin password you set in `.env.local`
4. Click on **"Settings"**
5. Enter your WhatsApp number in international format (e.g., `628123456789` for Indonesia)
6. Click **"Save Settings"**

**WhatsApp Number Format:**
- Remove any spaces, dashes, or special characters
- Include country code without the + sign
- Example: For +62 812-3456-789, enter: `628123456789`

### 6. Run the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### 7. Test the Application

#### Customer Flow:
1. Go to `http://localhost:3000`
2. Select a studio
3. Choose a date and duration
4. Select a time slot
5. Add any add-ons (optional)
6. Fill in your information
7. Submit the booking
8. You'll be redirected to a confirmation page with a WhatsApp link

#### Admin Flow:
1. Go to `http://localhost:3000/admin`
2. Enter your admin password (from `.env.local`)
3. View all bookings in the dashboard
4. Update booking statuses
5. Configure settings, pricing, and add-ons

#### Search Booking:
1. Go to `http://localhost:3000/search`
2. Enter a booking ID (e.g., `HS-ABC123-XYZ`)
3. View booking details
4. Request edits or cancellations via WhatsApp

## Project Structure

```
HausStudio/
├── app/                          # Next.js app directory
│   ├── admin/                    # Admin pages
│   │   ├── settings/            # Settings page
│   │   │   └── page.tsx
│   │   └── page.tsx             # Admin dashboard
│   ├── confirmation/            # Booking confirmation page
│   │   └── page.tsx
│   ├── search/                  # Booking search page
│   │   └── page.tsx
│   ├── globals.css              # Global styles with custom theme
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page (booking form)
├── components/                   # Reusable components
│   └── Header.tsx               # Navigation header
├── lib/                         # Utility functions and configs
│   ├── database.types.ts        # TypeScript types for database
│   ├── supabase.ts              # Supabase client configuration
│   └── utils.ts                 # Helper functions
├── .env.local.example           # Environment variables template
├── .gitignore                   # Git ignore file
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── postcss.config.js            # PostCSS configuration
├── supabase-schema.sql          # Database schema
├── tailwind.config.ts           # TailwindCSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## Database Schema

### Tables

1. **studios**: Studio information
   - `id`, `name`, `description`, `created_at`

2. **bookings**: Customer bookings
   - `id`, `studio_id`, `booking_date`, `start_time`, `duration_hours`
   - `additional_hour`, `customer_name`, `customer_phone`, `customer_email`
   - `total_price`, `status`, `notes`, `created_at`, `updated_at`

3. **pricing**: Pricing for different durations
   - `id`, `duration_hours`, `price`, `created_at`, `updated_at`

4. **addons**: Available add-ons
   - `id`, `name`, `description`, `price`, `is_active`, `created_at`, `updated_at`

5. **booking_addons**: Junction table for booking add-ons
   - `id`, `booking_id`, `addon_id`, `quantity`, `price`, `created_at`

6. **settings**: Application settings
   - `id`, `key`, `value`, `created_at`, `updated_at`

## Configuration

### Operating Hours
- Fixed: 8:00 AM to 6:00 PM
- To change: Modify the constants in `lib/utils.ts`

### Booking Durations
- Default: 2, 4, 6, 8 hours
- To change: Update the `pricing` table in Supabase

### Additional Hour Price
- Default: Rp 150,000
- To change: Update via Admin Settings page

### Studios
- Default: Studio A and Studio B
- To add more: Insert into `studios` table in Supabase

### Add-ons
- Manage via Admin panel (future feature) or directly in Supabase
- Toggle `is_active` to show/hide add-ons

## Customization

### Theme Colors
Edit `tailwind.config.ts` to customize the brown-cream color palette:

```typescript
colors: {
  brown: {
    // Your custom brown shades
  },
  cream: {
    // Your custom cream shades
  }
}
```

### WhatsApp Message Templates
Edit the message generation functions in:
- `app/confirmation/page.tsx` - Confirmation messages
- `app/search/page.tsx` - Edit/cancel request messages

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`
6. Click "Deploy"

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables in Site settings
7. Click "Deploy site"

## Troubleshooting

### "Cannot connect to Supabase"
- Check that your `.env.local` file exists and has correct values
- Verify your Supabase project URL and anon key
- Ensure your Supabase project is active (not paused)

### "No time slots available"
- Check that the selected date is not in the past
- Verify there are no conflicting bookings for that studio
- Ensure the booking duration + additional hour doesn't exceed operating hours

### "Admin login not working"
- Verify `NEXT_PUBLIC_ADMIN_PASSWORD` in `.env.local`
- Clear browser cache and try again
- Check browser console for errors

### Lint errors in IDE
- These are expected before running `npm install`
- Run `npm install` to install all dependencies
- Restart your IDE/editor after installation

### Database errors
- Verify the SQL schema was executed successfully in Supabase
- Check Supabase logs in the dashboard
- Ensure RLS policies are set up correctly

## Security Notes

### For Production:

1. **Admin Password**: Use a strong, unique password
2. **Environment Variables**: Never commit `.env.local` to version control
3. **Supabase RLS**: The current setup allows public read/write for ease of development. For production:
   - Implement Supabase Auth
   - Create more restrictive RLS policies
   - Separate admin and customer access levels
4. **API Keys**: Rotate your Supabase keys periodically
5. **HTTPS**: Always use HTTPS in production (automatic with Vercel/Netlify)

## Support & Maintenance

### Backup Database
Regularly backup your Supabase database:
1. Go to Supabase Dashboard → Database
2. Click "Backups" in the sidebar
3. Enable automatic backups (available on paid plans)

### Monitor Usage
- Check Supabase dashboard for database size and API usage
- Free tier limits: 500MB database, 2GB bandwidth/month

### Update Dependencies
```bash
npm update
```

## Future Enhancements

Potential features to add:
- Email notifications
- Payment gateway integration
- Calendar view for bookings
- Customer accounts with booking history
- SMS notifications
- Multi-language support
- Advanced reporting and analytics
- Booking cancellation policies
- Automated reminders

## License

This project is provided as-is for Haus Studio. Modify and use as needed.

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Need Help?** Check the troubleshooting section or review the Supabase and Next.js documentation.
