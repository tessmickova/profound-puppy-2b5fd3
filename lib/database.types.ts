// lib/database.types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      subscribers: {
        Row: {
          id: string
          created_at: string
          channel: string
          contact: string
          kp_threshold: number
          active: boolean
          user_id: string | null
          location_lat: number | null
          location_lng: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          channel: string
          contact: string
          kp_threshold?: number
          active?: boolean
          user_id?: string | null
          location_lat?: number | null
          location_lng?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          channel?: string
          contact?: string
          kp_threshold?: number
          active?: boolean
          user_id?: string | null
          location_lat?: number | null
          location_lng?: number | null
        }
        Relationships: []
      }
      aurora_cache: {
        Row: {
          id: string
          fetched_at: string
          kp_current: number
          bz: number | null
          sw_speed: number | null
          sw_density: number | null
          payload: Json
        }
        Insert: {
          id?: string
          fetched_at?: string
          kp_current: number
          bz?: number | null
          sw_speed?: number | null
          sw_density?: number | null
          payload: Json
        }
        Update: {
          id?: string
          fetched_at?: string
          kp_current?: number
          bz?: number | null
          sw_speed?: number | null
          sw_density?: number | null
          payload?: Json
        }
        Relationships: []
      }
      alert_log: {
        Row: {
          id: string
          sent_at: string
          channel: string
          recipient: string
          kp_at_send: number
          message: string | null
          success: boolean
          error: string | null
        }
        Insert: {
          id?: string
          sent_at?: string
          channel: string
          recipient: string
          kp_at_send: number
          message?: string | null
          success: boolean
          error?: string | null
        }
        Update: {
          id?: string
          sent_at?: string
          channel?: string
          recipient?: string
          kp_at_send?: number
          message?: string | null
          success?: boolean
          error?: string | null
        }
        Relationships: []
      }
      community_photos: {
        Row: {
          id: string
          created_at: string
          user_id: string
          storage_path: string
          thumb_path: string | null
          location: string | null
          kp_at_time: number | null
          lat: number | null
          lng: number | null
          approved: boolean
          likes: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          storage_path: string
          thumb_path?: string | null
          location?: string | null
          kp_at_time?: number | null
          lat?: number | null
          lng?: number | null
          approved?: boolean
          likes?: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          storage_path?: string
          thumb_path?: string | null
          location?: string | null
          kp_at_time?: number | null
          lat?: number | null
          lng?: number | null
          approved?: boolean
          likes?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          level: string
          points: number
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          level?: string
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          level?: string
          points?: number
          created_at?: string
        }
        Relationships: []
      }
      sightings: {
        Row: {
          id: string
          created_at: string
          night_date: string
          type: 'seen' | 'photo'
          kp_at_time: number | null
          bz_at_time: number | null
          fingerprint: string
        }
        Insert: {
          id?: string
          created_at?: string
          night_date: string
          type: 'seen' | 'photo'
          kp_at_time?: number | null
          bz_at_time?: number | null
          fingerprint: string
        }
        Update: {
          id?: string
          created_at?: string
          night_date?: string
          type?: 'seen' | 'photo'
          kp_at_time?: number | null
          bz_at_time?: number | null
          fingerprint?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_aurora_cache: {
        Args: { keep_rows?: number }
        Returns: undefined
      }
    }
  }
}
