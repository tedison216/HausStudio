'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface Addon {
  id: number
  name: string
  description: string | null
  price: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export default function AddonsPage() {
  const router = useRouter()
  const [addons, setAddons] = useState<Addon[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', price: 0 })
  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', description: '', price: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_authenticated')
    if (auth !== 'true') {
      router.push('/admin')
      return
    }
    loadAddons()
  }, [])

  async function loadAddons() {
    try {
      const { data } = await supabase
        .from('addons')
        .select('*')
        .order('name')
      
      if (data) setAddons(data)
    } catch (error) {
      console.error('Error loading addons:', error)
    }
  }

  function startEdit(addon: Addon) {
    setEditingId(addon.id)
    setEditForm({
      name: addon.name,
      description: addon.description || '',
      price: addon.price
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ name: '', description: '', price: 0 })
  }

  async function saveEdit(id: number) {
    setLoading(true)
    try {
      const updates: Partial<Addon> = {
        name: editForm.name,
        description: editForm.description || null,
        price: editForm.price,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('addons')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      await loadAddons()
      cancelEdit()
    } catch (error) {
      console.error('Error updating addon:', error)
      alert('Failed to update addon')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(id: number, currentStatus: boolean) {
    try {
      const updates: Partial<Addon> = {
        is_active: !currentStatus,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('addons')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      await loadAddons()
    } catch (error) {
      console.error('Error toggling addon:', error)
      alert('Failed to toggle addon status')
    }
  }

  async function deleteAddon(id: number) {
    if (!confirm('Are you sure you want to delete this add-on?')) return

    try {
      const { error } = await supabase.from('addons').delete().eq('id', id)
      
      if (error) throw error

      await loadAddons()
    } catch (error) {
      console.error('Error deleting addon:', error)
      alert('Failed to delete addon')
    }
  }

  async function createAddon() {
    if (!newForm.name || newForm.price <= 0) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const insertPayload: Partial<Addon> = {
        name: newForm.name,
        description: newForm.description || null,
        price: newForm.price,
        is_active: true,
      }

      const { error } = await supabase.from('addons').insert(insertPayload)

      if (error) throw error

      await loadAddons()
      setShowNewForm(false)
      setNewForm({ name: '', description: '', price: 0 })
    } catch (error) {
      console.error('Error creating addon:', error)
      alert('Failed to create addon')
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-brown-900">Add-ons Management</h1>
            <button
              onClick={() => setShowNewForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New</span>
            </button>
          </div>

          {showNewForm && (
            <div className="card mb-6 bg-brown-50 border-brown-300">
              <h3 className="text-xl font-bold text-brown-900 mb-4">Create New Add-on</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-brown-900 font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brown-900 font-medium mb-2">Description</label>
                  <textarea
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    className="input-field"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-brown-900 font-medium mb-2">Price (IDR) *</label>
                  <input
                    type="number"
                    value={newForm.price}
                    onChange={(e) => setNewForm({ ...newForm, price: parseInt(e.target.value) })}
                    className="input-field"
                    required
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={createAddon}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Creating...' : 'Create Add-on'}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewForm(false)
                      setNewForm({ name: '', description: '', price: 0 })
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {addons.map(addon => (
              <div key={addon.id} className="card">
                {editingId === addon.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-brown-900 font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-brown-900 font-medium mb-2">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="input-field"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-brown-900 font-medium mb-2">Price (IDR)</label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) })}
                        className="input-field"
                        min="0"
                        step="1000"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => saveEdit(addon.id)}
                        disabled={loading}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{loading ? 'Saving...' : 'Save'}</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="btn-outline flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-brown-900">{addon.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          addon.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {addon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {addon.description && (
                        <p className="text-brown-600 mt-1">{addon.description}</p>
                      )}
                      <p className="text-brown-900 font-bold mt-2">{formatCurrency(addon.price)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleActive(addon.id, addon.is_active)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          addon.is_active
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            : 'bg-green-200 text-green-800 hover:bg-green-300'
                        }`}
                      >
                        {addon.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => startEdit(addon)}
                        className="p-2 text-brown-700 hover:bg-brown-100 rounded-lg"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteAddon(addon.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {addons.length === 0 && (
              <div className="card text-center py-12">
                <p className="text-brown-600">No add-ons yet. Click "Add New" to create one.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
