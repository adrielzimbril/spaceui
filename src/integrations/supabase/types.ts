export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      community_wall: {
        Row: {
          id: string
          user_id: string | null
          creator_name: string
          creator_avatar_url: string | null
          message: string
          pattern_index: number
          rotation: number
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          creator_name: string
          creator_avatar_url?: string | null
          message: string
          pattern_index?: number
          rotation?: number
          is_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          creator_name?: string
          creator_avatar_url?: string | null
          message?: string
          pattern_index?: number
          rotation?: number
          is_verified?: boolean
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          polar_customer_id: string | null
          status: string
          product_id: string | null
          price_id: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          polar_customer_id?: string | null
          status: string
          product_id?: string | null
          price_id?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          polar_customer_id?: string | null
          status?: string
          product_id?: string | null
          price_id?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          amount: number | null
          currency: string | null
          status: string
          created_at: string
        }
        Insert: {
          id: string
          user_id?: string | null
          product_id?: string | null
          amount?: number | null
          currency?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          amount?: number | null
          currency?: string | null
          status?: string
          created_at?: string
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
