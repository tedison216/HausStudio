'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatTime } from '@/lib/utils'
import { Calendar, Settings, DollarSign, Package, LogOut } from 'lucide-react'

interface Booking {
  id: string
  studio_id: number
  booking_date: string
  start_time: string
  duration_hours: number
  additional_hour: boolean | null
  customer_name: string
  customer_phone: string
  total_price: number
  status: string
  studio_name: string
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [totalBookings, setTotalBookings] = useState(0)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const itemsPerPage = 20

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_authenticated')
    if (auth === 'true') {
      setIsAuthenticated(true)
      loadBookings()
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage(1) // Reset to first page when filters change
      loadBookings()
    }
  }, [filter, selectedDate, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings()
    }
  }, [currentPage])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
    
    if (password === adminPassword) {
      sessionStorage.setItem('admin_authenticated', 'true')
      setIsAuthenticated(true)
      setError('')
      loadBookings()
    } else {
      setError('Invalid password')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
    setPassword('')
  }

  async function loadBookings() {
    setLoading(true)
    try {
      // Get total count (always unfiltered)
      const { count: totalCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
      
      setTotalBookings(totalCount || 0)

      // Build data query with pagination
      let query = supabase
        .from('bookings')
        .select(`
          *,
          studios (name)
        `)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      if (selectedDate) {
        query = query.eq('booking_date', selectedDate)
      }

      const { data, error } = await query

      if (error) throw error

      if (data) {
        setBookings(data.map(b => ({
          ...b,
          studio_name: b.studios.name
        })))
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateBookingStatus(bookingId: string, newStatus: string) {
    try {
      const { error} = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId)

      if (error) throw error

      await loadBookings()
    } catch (error) {
      console.error('Error updating booking status:', error)
      alert('Failed to update booking status')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="card max-w-md w-full">
          <h1 className="text-3xl font-bold text-brown-900 mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-brown-900 font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-brown-700 hover:text-brown-900 underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-white border-b-2 border-brown-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-brown-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link href="/admin/settings" className="text-brown-700 hover:text-brown-900 font-medium flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              <button onClick={handleLogout} className="text-brown-700 hover:text-brown-900 font-medium flex items-center space-x-2">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/settings" className="card hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="bg-brown-700 p-3 rounded-lg">
                <Settings className="w-6 h-6 text-cream-50" />
              </div>
              <div>
                <p className="text-sm text-brown-600">Manage</p>
                <p className="text-xl font-bold text-brown-900">Settings</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/pricing" className="card hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="bg-brown-700 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-cream-50" />
              </div>
              <div>
                <p className="text-sm text-brown-600">Configure</p>
                <p className="text-xl font-bold text-brown-900">Pricing</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/addons" className="card hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="bg-brown-700 p-3 rounded-lg">
                <Package className="w-6 h-6 text-cream-50" />
              </div>
              <div>
                <p className="text-sm text-brown-600">Manage</p>
                <p className="text-xl font-bold text-brown-900">Add-ons</p>
              </div>
            </div>
          </Link>

          <div className="card bg-brown-50 border-brown-300">
            <div className="flex items-center space-x-4">
              <div className="bg-brown-700 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-cream-50" />
              </div>
              <div>
                <p className="text-sm text-brown-600">Total</p>
                <p className="text-xl font-bold text-brown-900">{totalBookings} Bookings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-brown-900 mb-4">Filter Bookings</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`p-4 rounded-lg border-2 font-medium transition-all ${
                filter === 'all'
                  ? 'border-brown-700 bg-brown-700 text-cream-50'
                  : 'border-brown-200 hover:border-brown-400 text-brown-900'
              }`}
            >
              All Bookings
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`p-4 rounded-lg border-2 font-medium transition-all ${
                filter === 'pending'
                  ? 'border-yellow-600 bg-yellow-600 text-white'
                  : 'border-yellow-200 hover:border-yellow-400 text-yellow-800'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`p-4 rounded-lg border-2 font-medium transition-all ${
                filter === 'confirmed'
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-green-200 hover:border-green-400 text-green-800'
              }`}
            >
              Confirmed
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setFilter('cancelled')}
              className={`p-4 rounded-lg border-2 font-medium transition-all ${
                filter === 'cancelled'
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-red-200 hover:border-red-400 text-red-800'
              }`}
            >
              Cancelled
            </button>
            <div>
              <label className="block text-brown-900 font-medium mb-2">Filter by Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-brown-900 mb-4">Bookings</h2>
          {loading ? (
            <p className="text-brown-600">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-brown-600">No bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-brown-200">
                    <th className="text-left py-3 px-2 text-brown-900 font-bold">ID</th>
                    <th className="text-left py-3 px-2 text-brown-900 font-bold">Customer</th>
                    <th className="text-left py-3 px-2 text-brown-900 font-bold">Studio</th>
                    <th className="text-left py-3 px-2 text-brown-900 font-bold">Date</th>
                    <th className="text-left py-3 px-2 text-brown-900 font-bold">Time</th>
                    <th className="text-left py-3 px-2 text-brown-900 font-bold">Price</th>
                    <th className="text-left py-3 px-2 text-brown-900 font-bold">Status</th>
                    <th className="text-left py-3 px-2 text-brown-900 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} className="border-b border-brown-100 hover:bg-brown-50">
                      <td className="py-3 px-2 text-sm font-mono text-brown-700">{booking.id}</td>
                      <td className="py-3 px-2 text-brown-900">
                        <div>
                          <p className="font-medium">{booking.customer_name}</p>
                          <p className="text-sm text-brown-600">{booking.customer_phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-brown-900">{booking.studio_name}</td>
                      <td className="py-3 px-2 text-brown-900">
                        {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-2 text-brown-900">
                        {formatTime(booking.start_time)}
                        <span className="text-sm text-brown-600 block">
                          {booking.duration_hours + (booking.additional_hour ? 1 : 0)}h
                        </span>
                      </td>
                      <td className="py-3 px-2 text-brown-900 font-medium">
                        {formatCurrency(booking.total_price)}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value as any)}
                          className="text-sm border-2 border-brown-200 rounded px-2 py-1 text-brown-900"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && bookings.length > 0 && (
            <div className="mt-6 flex items-center justify-between border-t border-brown-200 pt-4">
              <div className="text-sm text-brown-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalBookings)} of {totalBookings} bookings
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border-2 border-brown-200 rounded-lg text-brown-900 font-medium hover:border-brown-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.ceil(totalBookings / itemsPerPage) }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      const totalPages = Math.ceil(totalBookings / itemsPerPage)
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1)
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      const prevPage = array[index - 1]
                      const showEllipsis = prevPage && page - prevPage > 1
                      
                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && <span className="px-2 text-brown-600">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg font-medium ${
                              currentPage === page
                                ? 'bg-brown-700 text-cream-50'
                                : 'text-brown-900 hover:bg-brown-100'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      )
                    })}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(totalBookings / itemsPerPage), currentPage + 1))}
                  disabled={currentPage >= Math.ceil(totalBookings / itemsPerPage)}
                  className="px-4 py-2 border-2 border-brown-200 rounded-lg text-brown-900 font-medium hover:border-brown-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
