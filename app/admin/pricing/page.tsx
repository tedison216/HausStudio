'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Save } from 'lucide-react'

interface Pricing {
  id: number
  duration_hours: number
  price: number
}

export default function PricingPage() {
  const router = useRouter()
  const [pricing, setPricing] = useState<Pricing[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_authenticated')
    if (auth !== 'true') {
      router.push('/admin')
      return
    }
    loadPricing()
  }, [])

  async function loadPricing() {
    try {
      const { data } = await supabase
        .from('pricing')
        .select('*')
        .order('duration_hours')
      
      if (data) setPricing(data)
    } catch (error) {
      console.error('Error loading pricing:', error)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      for (const item of pricing) {
        const { error } = await supabase
          .from('pricing')
          .update({ price: item.price, updated_at: new Date().toISOString() } as any)
          .eq('id', item.id)
        
        if (error) throw error
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving pricing:', error)
      alert('Failed to save pricing')
    } finally {
      setLoading(false)
    }
  }

  function updatePrice(id: number, newPrice: number) {
    setPricing(pricing.map(p => 
      p.id === id ? { ...p, price: newPrice } : p
    ))
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
          <h1 className="text-3xl font-bold text-brown-900 mb-8">Pricing Configuration</h1>

          <form onSubmit={handleSave} className="card space-y-6">
            <p className="text-brown-600">
              Configure the prices for different booking durations. Prices are in Indonesian Rupiah (IDR).
            </p>

            <div className="space-y-4">
              {pricing.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-brown-50 rounded-lg">
                  <div>
                    <p className="font-bold text-brown-900">{item.duration_hours} Hours</p>
                    <p className="text-sm text-brown-600">Session duration</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-brown-700">Rp</span>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updatePrice(item.id, parseInt(e.target.value))}
                      className="w-40 px-3 py-2 border-2 border-brown-200 rounded-lg focus:outline-none focus:border-brown-500"
                      required
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>
              ))}
            </div>

            {success && (
              <div className="bg-green-50 border-2 border-green-300 text-green-800 px-4 py-3 rounded-lg">
                Pricing updated successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save Pricing'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
