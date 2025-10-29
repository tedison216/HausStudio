'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save } from 'lucide-react'

interface Studio {
  id: number
  name: string
  is_active: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [additionalHourPrice, setAdditionalHourPrice] = useState('150000')
  const [studios, setStudios] = useState<Studio[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_authenticated')
    if (auth !== 'true') {
      router.push('/admin')
      return
    }
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const { data } = await supabase.from('settings').select('*')
      
      if (data) {
        const whatsapp = data.find(s => s.key === 'whatsapp_number')
        const additionalHour = data.find(s => s.key === 'additional_hour_price')
        
        if (whatsapp) setWhatsappNumber(whatsapp.value)
        if (additionalHour) setAdditionalHourPrice(additionalHour.value)
      }

      // Load studios
      const { data: studiosData } = await supabase
        .from('studios')
        .select('id, name, is_active')
        .order('id')
      
      if (studiosData) setStudios(studiosData)
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  async function toggleStudio(studioId: number, currentStatus: boolean) {
    try {
      await supabase
        .from('studios')
        .update({ is_active: !currentStatus })
        .eq('id', studioId)

      setStudios(studios.map(s => 
        s.id === studioId ? { ...s, is_active: !currentStatus } : s
      ))
    } catch (error) {
      console.error('Error toggling studio:', error)
      alert('Failed to update studio status')
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      await supabase.from('settings').upsert([
        { key: 'whatsapp_number', value: whatsappNumber },
        { key: 'additional_hour_price', value: additionalHourPrice }
      ], { onConflict: 'key' })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-white border-b-2 border-brown-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Link href="/admin" className="flex items-center space-x-2 text-brown-700 hover:text-brown-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-brown-900 mb-8">Settings</h1>

          <div className="card mb-6">
            <h2 className="text-2xl font-bold text-brown-900 mb-4">Studio Availability</h2>
            <p className="text-brown-600 mb-4">Enable or disable studios for booking</p>
            <div className="space-y-3">
              {studios.map(studio => (
                <div key={studio.id} className="flex items-center justify-between p-4 bg-brown-50 rounded-lg">
                  <div>
                    <p className="font-bold text-brown-900">{studio.name}</p>
                    <p className="text-sm text-brown-600">
                      {studio.is_active ? 'Available for booking' : 'Disabled'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleStudio(studio.id, studio.is_active)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      studio.is_active
                        ? 'bg-green-200 text-green-800 hover:bg-green-300'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {studio.is_active ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSave} className="card space-y-6">
            <h2 className="text-2xl font-bold text-brown-900">General Settings</h2>
            
            <div>
              <label className="block text-brown-900 font-medium mb-2">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g., 628123456789"
                className="input-field"
                required
              />
              <p className="text-sm text-brown-600 mt-1">
                Enter the number with country code (e.g., 628123456789 for Indonesia)
              </p>
            </div>

            <div>
              <label className="block text-brown-900 font-medium mb-2">
                Additional Hour Price (IDR)
              </label>
              <input
                type="number"
                value={additionalHourPrice}
                onChange={(e) => setAdditionalHourPrice(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {success && (
              <div className="bg-green-50 border-2 border-green-300 text-green-800 px-4 py-3 rounded-lg">
                Settings saved successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
