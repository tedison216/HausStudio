'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { formatCurrency, generateBookingId, getAvailableTimeSlots, getBookedTimeSlots, calculateEndTime, formatTime } from '@/lib/utils'
import { Calendar, Clock, Plus, Check } from 'lucide-react'

interface Studio {
  id: number
  name: string
  description: string | null
}

interface Pricing {
  duration_hours: number
  price: number
}

interface Addon {
  id: number
  name: string
  description: string | null
  price: number
}

interface Settings {
  additional_hour_price: number
  whatsapp_number: string
}

export default function HomePage() {
  const router = useRouter()
  const [studios, setStudios] = useState<Studio[]>([])
  const [pricing, setPricing] = useState<Pricing[]>([])
  const [addons, setAddons] = useState<Addon[]>([])
  const [settings, setSettings] = useState<Settings>({ additional_hour_price: 150000, whatsapp_number: '' })
  
  // Form state
  const [selectedStudio, setSelectedStudio] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [additionalHour, setAdditionalHour] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState<{ [key: number]: number }>({})
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<Array<{ start: string; end: string }>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedStudio && selectedDate && selectedDuration) {
      loadAvailableSlots()
    }
  }, [selectedStudio, selectedDate, selectedDuration, additionalHour])

  async function loadInitialData() {
    try {
      // Load studios
      const { data: studiosData } = await supabase
        .from('studios')
        .select('*')
        .eq('is_active', true)
        .order('id')
      
      // Load pricing
      const { data: pricingData } = await supabase
        .from('pricing')
        .select('*')
        .order('duration_hours')
      
      // Load addons
      const { data: addonsData } = await supabase
        .from('addons')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      // Load settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
      
      if (studiosData) setStudios(studiosData)
      if (pricingData) setPricing(pricingData)
      if (addonsData) setAddons(addonsData)
      
      if (settingsData) {
        const additionalHourPrice = settingsData.find(s => s.key === 'additional_hour_price')
        const whatsappNumber = settingsData.find(s => s.key === 'whatsapp_number')
        
        setSettings({
          additional_hour_price: additionalHourPrice ? parseInt(additionalHourPrice.value) : 150000,
          whatsapp_number: whatsappNumber ? whatsappNumber.value : ''
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  async function loadAvailableSlots() {
    if (!selectedStudio || !selectedDate || !selectedDuration) return

    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('start_time, duration_hours, additional_hour')
        .eq('studio_id', selectedStudio)
        .eq('booking_date', selectedDate)
        .neq('status', 'cancelled')

      const slots = getAvailableTimeSlots(
        selectedDate,
        bookings || [],
        selectedDuration,
        additionalHour
      )
      
      const booked = getBookedTimeSlots(bookings || [])
      
      setAvailableSlots(slots)
      setBookedSlots(booked)
      
      // Reset selected time if it's no longer available
      if (selectedTime && !slots.includes(selectedTime)) {
        setSelectedTime('')
      }
    } catch (error) {
      console.error('Error loading available slots:', error)
    }
  }

  function calculateTotalPrice(): number {
    let total = 0
    
    // Base price for duration
    if (selectedDuration) {
      const priceItem = pricing.find(p => p.duration_hours === selectedDuration)
      if (priceItem) total += priceItem.price
    }
    
    // Additional hour
    if (additionalHour) {
      total += settings.additional_hour_price
    }
    
    // Addons
    Object.entries(selectedAddons).forEach(([addonId, quantity]) => {
      if (quantity > 0) {
        const addon = addons.find(a => a.id === parseInt(addonId))
        if (addon) total += addon.price * quantity
      }
    })
    
    return total
  }

  function toggleAddon(addonId: number) {
    setSelectedAddons(prev => ({
      ...prev,
      [addonId]: prev[addonId] ? 0 : 1
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selectedStudio || !selectedDate || !selectedTime || !selectedDuration) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const bookingId = generateBookingId()
      const totalPrice = calculateTotalPrice()

      // Insert booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          id: bookingId,
          studio_id: selectedStudio,
          booking_date: selectedDate,
          start_time: selectedTime,
          duration_hours: selectedDuration,
          additional_hour: additionalHour,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || null,
          total_price: totalPrice,
          status: 'pending'
        })

      if (bookingError) throw bookingError

      // Insert addons
      const addonInserts = Object.entries(selectedAddons)
        .filter(([_, quantity]) => quantity > 0)
        .map(([addonId, quantity]) => {
          const addon = addons.find(a => a.id === parseInt(addonId))
          return {
            booking_id: bookingId,
            addon_id: parseInt(addonId),
            quantity,
            price: addon!.price
          }
        })

      if (addonInserts.length > 0) {
        const { error: addonsError } = await supabase
          .from('booking_addons')
          .insert(addonInserts)

        if (addonsError) throw addonsError
      }

      // Redirect to confirmation page
      router.push(`/confirmation?id=${bookingId}`)
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="section-title">Book Your Studio</h1>
            <p className="section-subtitle">
              Choose your preferred studio, date, and time for your creative session
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Studio Selection */}
            <div className="card">
              <h2 className="text-2xl font-bold text-brown-900 mb-4">Select Studio</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {studios.map(studio => (
                  <button
                    key={studio.id}
                    type="button"
                    onClick={() => setSelectedStudio(studio.id)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      selectedStudio === studio.id
                        ? 'border-brown-700 bg-brown-50'
                        : 'border-brown-200 hover:border-brown-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-brown-900">{studio.name}</h3>
                        {studio.description && (
                          <p className="text-brown-600 mt-1">{studio.description}</p>
                        )}
                      </div>
                      {selectedStudio === studio.id && (
                        <Check className="w-6 h-6 text-brown-700" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Duration */}
            <div className="card">
              <h2 className="text-2xl font-bold text-brown-900 mb-4">Date & Duration</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-brown-900 font-medium mb-2">
                    <Calendar className="inline w-5 h-5 mr-2" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={minDate}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brown-900 font-medium mb-2">
                    <Clock className="inline w-5 h-5 mr-2" />
                    Duration
                  </label>
                  <div className="select-field">
                    <select
                      value={selectedDuration || ''}
                      onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                      className="bg-white"
                      required
                    >
                      <option value="">Select duration</option>
                      {pricing.map(p => (
                        <option key={p.duration_hours} value={p.duration_hours}>
                          {p.duration_hours} hours - {formatCurrency(p.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label
                  className={`checkbox-field cursor-pointer ${
                    additionalHour ? 'checkbox-field-active' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={additionalHour}
                    onChange={(e) => setAdditionalHour(e.target.checked)}
                  />
                  <span className="text-brown-900 font-medium">
                    Add 1 additional hour (+{formatCurrency(settings.additional_hour_price)})
                  </span>
                </label>
              </div>
            </div>

            {/* Time Selection */}
            {selectedStudio && selectedDate && selectedDuration && (
              <div className="card">
                <h2 className="text-2xl font-bold text-brown-900 mb-4">Select Time</h2>
                {bookedSlots.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      Already booked: {bookedSlots.map(slot => `${formatTime(slot.start)} - ${formatTime(slot.end)}`).join(', ')}
                    </p>
                  </div>
                )}
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`p-3 rounded-lg border-2 font-medium transition-all ${
                          selectedTime === slot
                            ? 'border-brown-700 bg-brown-700 text-cream-50'
                            : 'border-brown-200 hover:border-brown-400 text-brown-900'
                        }`}
                      >
                        {formatTime(slot)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-brown-600">No available time slots for the selected date and duration.</p>
                )}
                {selectedTime && (
                  <p className="mt-4 text-brown-700 font-medium">
                    Session: {formatTime(selectedTime)} - {formatTime(calculateEndTime(selectedTime, selectedDuration + (additionalHour ? 1 : 0)))}
                  </p>
                )}
              </div>
            )}

            {/* Add-ons */}
            {addons.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold text-brown-900 mb-4">Add-ons (Optional)</h2>
                <div className="space-y-3">
                  {addons.map(addon => (
                    <label
                      key={addon.id}
                      className="flex items-center justify-between p-4 rounded-lg border-2 border-brown-200 hover:border-brown-400 cursor-pointer transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedAddons[addon.id] > 0}
                          onChange={() => toggleAddon(addon.id)}
                          className="w-5 h-5 text-brown-700 rounded focus:ring-brown-500"
                        />
                        <div>
                          <p className="font-medium text-brown-900">{addon.name}</p>
                          {addon.description && (
                            <p className="text-sm text-brown-600">{addon.description}</p>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-brown-900">{formatCurrency(addon.price)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="card">
              <h2 className="text-2xl font-bold text-brown-900 mb-4">Your Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-brown-900 font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brown-900 font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="input-field"
                    placeholder="e.g., 08123456789"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brown-900 font-medium mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="input-field"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="card bg-brown-50 border-brown-300">
              <h2 className="text-2xl font-bold text-brown-900 mb-4">Booking Summary</h2>
              <div className="space-y-2">
                {selectedDuration && (
                  <div className="flex justify-between text-brown-900">
                    <span>{selectedDuration} hours session</span>
                    <span className="font-medium">
                      {formatCurrency(pricing.find(p => p.duration_hours === selectedDuration)?.price || 0)}
                    </span>
                  </div>
                )}
                {additionalHour && (
                  <div className="flex justify-between text-brown-900">
                    <span>Additional 1 hour</span>
                    <span className="font-medium">{formatCurrency(settings.additional_hour_price)}</span>
                  </div>
                )}
                {Object.entries(selectedAddons).map(([addonId, quantity]) => {
                  if (quantity === 0) return null
                  const addon = addons.find(a => a.id === parseInt(addonId))
                  if (!addon) return null
                  return (
                    <div key={addonId} className="flex justify-between text-brown-900">
                      <span>{addon.name}</span>
                      <span className="font-medium">{formatCurrency(addon.price * quantity)}</span>
                    </div>
                  )
                })}
                <div className="border-t-2 border-brown-300 pt-2 mt-2">
                  <div className="flex justify-between text-xl font-bold text-brown-900">
                    <span>Total</span>
                    <span>{formatCurrency(calculateTotalPrice())}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedStudio || !selectedDate || !selectedTime || !selectedDuration || !customerName || !customerPhone}
              className="btn-primary w-full text-lg py-4"
            >
              {loading ? 'Processing...' : 'Continue to Confirmation'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
