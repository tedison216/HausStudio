'use client'

import Link from 'next/link'
import { Calendar } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white border-b-2 border-brown-200 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-brown-700 p-2 rounded-lg">
              <Calendar className="w-8 h-8 text-cream-50" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brown-900">Haus Studio</h1>
              <p className="text-sm text-brown-600">Premium Creative Space</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-brown-700 hover:text-brown-900 font-medium transition-colors">
              Book Now
            </Link>
            <Link href="/search" className="text-brown-700 hover:text-brown-900 font-medium transition-colors">
              Find Booking
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
