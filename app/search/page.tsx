'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatTime, calculateEndTime } from '@/lib/utils'
import { Search, Calendar, Clock, MapPin, MessageCircle, AlertCircle } from 'lucide-react'

interface BookingDetails {
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

export default function SearchPage() {
  const router = useRouter()
  const [bookingId, setBookingId] = useState('')
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          studios (name)
        `)
        .eq('id', bookingId.trim().toUpperCase())
        .single()

      if (bookingError || !bookingData) {
        setError('Booking not found. Please check your Booking ID.')
        setBooking(null)
      } else {
        setBooking({
          ...bookingData,
          studio_name: bookingData.studios.name
        })

        // Load WhatsApp number
        const { data: settingsData } = await supabase
          .from('settings')
          .select('*')
          .eq('key', 'whatsapp_number')
          .single()

        if (settingsData) {
          setWhatsappNumber(settingsData.value)
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setBooking(null)
    } finally {
      setLoading(false)
    }
  }

  function generateWhatsAppMessage(action: 'edit' | 'cancel'): string {
    if (!booking) return ''

    const actionText = action === 'edit' ? 'modify' : 'cancel'
    let message = `Hi! I would like to ${actionText} my booking:\n\n`
    message += `Booking ID: ${booking.id}\n`
    message += `Studio: ${booking.studio_name}\n`
    message += `Date: ${new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`
    message += `Time: ${formatTime(booking.start_time)}\n`
    message += `\nPlease assist me with this request.`

    return encodeURIComponent(message)
  }

  function getWhatsAppLink(action: 'edit' | 'cancel'): string {
    const message = generateWhatsAppMessage(action)
    return `https://wa.me/${whatsappNumber}?text=${message}`
  }

  const totalDuration = booking ? booking.duration_hours + (booking.additional_hour ? 1 : 0) : 0
  const endTime = booking ? calculateEndTime(booking.start_time, totalDuration) : ''

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="section-title">Find Your Booking</h1>
            <p className="section-subtitle">
              Enter your Booking ID to view or manage your reservation
            </p>
          </div>

          <form onSubmit={handleSearch} className="card mb-8">
            <label className="block text-brown-900 font-medium mb-2">
              <Search className="inline w-5 h-5 mr-2" />
              Booking ID
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="e.g., HS-ABC123-XYZ"
                className="input-field flex-1"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {error && (
            <div className="card bg-red-50 border-red-300 mb-8">
              <div className="flex items-center space-x-3 text-red-700">
                <AlertCircle className="w-6 h-6" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {booking && (
            <div className="space-y-6">
              <div className="card">
                <div className="border-b border-brown-200 pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-brown-900">Booking Details</h2>
                      <p className="text-brown-600 mt-1">ID: <span className="font-mono font-bold">{booking.id}</span></p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-brown-700 mt-1" />
                    <div>
                      <p className="font-medium text-brown-900">Studio</p>
                      <p className="text-brown-700">{booking.studio_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-brown-700 mt-1" />
                    <div>
                      <p className="font-medium text-brown-900">Date</p>
                      <p className="text-brown-700">
                        {new Date(booking.booking_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-brown-700 mt-1" />
                    <div>
                      <p className="font-medium text-brown-900">Time</p>
                      <p className="text-brown-700">
                        {formatTime(booking.start_time)} - {formatTime(endTime)} ({totalDuration} hours)
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-brown-200 pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-xl font-bold text-brown-900">Total Amount</p>
                      <p className="text-2xl font-bold text-brown-900">{formatCurrency(booking.total_price)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {booking.status !== 'cancelled' && (
                <div className="card bg-brown-50 border-brown-300">
                  <h3 className="text-xl font-bold text-brown-900 mb-4">Need to make changes?</h3>
                  <p className="text-brown-700 mb-4">
                    Contact us via WhatsApp to modify or cancel your booking.
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <a
                      href={getWhatsAppLink('edit')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-center flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Request Edit</span>
                    </a>
                    <a
                      href={getWhatsAppLink('cancel')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-center flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Request Cancellation</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
