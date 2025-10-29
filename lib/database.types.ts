export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      studios: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          studio_id: number
          booking_date: string
          start_time: string
          duration_hours: number
          additional_hour: boolean
          customer_name: string
          customer_phone: string
          customer_email: string | null
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          studio_id: number
          booking_date: string
          start_time: string
          duration_hours: number
          additional_hour?: boolean
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          total_price: number
          status?: 'pending' | 'confirmed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          studio_id?: number
          booking_date?: string
          start_time?: string
          duration_hours?: number
          additional_hour?: boolean
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      booking_addons: {
        Row: {
          id: number
          booking_id: string
          addon_id: number
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: number
          booking_id: string
          addon_id: number
          quantity?: number
          price: number
          created_at?: string
        }
        Update: {
          id?: number
          booking_id?: string
          addon_id?: number
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      addons: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pricing: {
        Row: {
          id: number
          duration_hours: number
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          duration_hours: number
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          duration_hours?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: number
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          key?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
