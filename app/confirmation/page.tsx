'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatTime, calculateEndTime } from '@/lib/utils'
import { CheckCircle, Calendar, Clock, MapPin, MessageCircle } from 'lucide-react'

interface BookingDetails {
  id: string
  studio_id: number
  booking_date: string
  start_time: string
  duration_hours: number
  additional_hour: boolean | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  total_price: number
  status: string
  studio_name: string
  addons: Array<{ name: string; quantity: number; price: number }>
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('id')
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails()
    }
  }, [bookingId])

  async function loadBookingDetails() {
    if (!bookingId) return
    
    try {
      // Load booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          studios (name)
        `)
        .eq('id', bookingId)
        .single()

      if (bookingError) throw bookingError

      // Load addons
      const { data: addonsData } = await supabase
        .from('booking_addons')
        .select(`
          quantity,
          price,
          addons (name)
        `)
        .eq('booking_id', bookingId)

      // Load WhatsApp number
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'whatsapp_number')
        .single()

      if (bookingData) {
        setBooking({
          ...bookingData,
          studio_name: bookingData.studios.name,
          addons: addonsData?.map(a => ({
            name: a.addons.name,
            quantity: a.quantity ?? 1,
            price: a.price
          })) || []
        })
      }

      if (settingsData) {
        setWhatsappNumber(settingsData.value)
      }
    } catch (error) {
      console.error('Error loading booking:', error)
    } finally {
      setLoading(false)
    }
  }

  function generateWhatsAppMessage(): string {
    if (!booking) return ''

    const totalDuration = booking.duration_hours + (booking.additional_hour ? 1 : 0)
    const endTime = calculateEndTime(booking.start_time, totalDuration)

    let message = `Hi! I would like to confirm my booking:\n\n`
    message += `Booking ID: ${booking.id}\n`
    message += `Studio: ${booking.studio_name}\n`
    message += `Date: ${new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`
    message += `Time: ${formatTime(booking.start_time)} - ${formatTime(endTime)}\n`
    message += `Duration: ${totalDuration} hours\n`
    
    if (booking.addons.length > 0) {
      message += `\nAdd-ons:\n`
      booking.addons.forEach(addon => {
        message += `- ${addon.name} (x${addon.quantity})\n`
      })
    }
    
    message += `\nTotal: ${formatCurrency(booking.total_price)}\n`
    message += `\nName: ${booking.customer_name}\n`
    message += `Phone: ${booking.customer_phone}`

    return encodeURIComponent(message)
  }

  function getWhatsAppLink(): string {
    const message = generateWhatsAppMessage()
    return `https://wa.me/${whatsappNumber}?text=${message}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-brown-700">Loading booking details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-brown-700">Booking not found.</p>
            <Link href="/" className="btn-primary inline-block mt-4">
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const totalDuration = booking.duration_hours + (booking.additional_hour ? 1 : 0)
  const endTime = calculateEndTime(booking.start_time, totalDuration)

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-brown-900 mb-2">Booking Created!</h1>
            <p className="text-lg text-brown-600">
              Your booking has been created successfully. Please confirm via WhatsApp to complete your reservation.
            </p>
          </div>

          <div className="card mb-6">
            <div className="border-b border-brown-200 pb-4 mb-4">
              <h2 className="text-2xl font-bold text-brown-900">Booking Details</h2>
              <p className="text-brown-600 mt-1">Booking ID: <span className="font-mono font-bold">{booking.id}</span></p>
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

              {booking.addons.length > 0 && (
                <div className="border-t border-brown-200 pt-4">
                  <p className="font-medium text-brown-900 mb-2">Add-ons</p>
                  <ul className="space-y-1">
                    {booking.addons.map((addon, index) => (
                      <li key={index} className="text-brown-700">
                        • {addon.name} (x{addon.quantity}) - {formatCurrency(addon.price * addon.quantity)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-brown-200 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold text-brown-900">Total Amount</p>
                  <p className="text-2xl font-bold text-brown-900">{formatCurrency(booking.total_price)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-brown-50 border-brown-300 mb-6">
            <h3 className="text-xl font-bold text-brown-900 mb-3">Next Steps</h3>
            <ol className="space-y-2 text-brown-700">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Click the button below to confirm your booking via WhatsApp</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>Our team will respond with payment instructions</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Complete the payment to secure your booking</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                <span>Receive confirmation and enjoy your studio session!</span>
              </li>
            </ol>
          </div>

          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full text-center text-lg py-4 flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-6 h-6" />
            <span>Confirm via WhatsApp</span>
          </a>

          <div className="mt-6 text-center">
            <p className="text-brown-600 mb-4">
              Save your booking ID: <span className="font-mono font-bold text-brown-900">{booking.id}</span>
            </p>
            <Link href="/search" className="text-brown-700 hover:text-brown-900 font-medium underline">
              Search for your booking later
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-brown-700">Loading...</p>
          </div>
        </main>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
