export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string
          event_date: string
          name: string
          age: number | null
          activity: string
          dream: string
          concern: string
          want_to_talk: string
          outfit_photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_date: string
          name: string
          age?: number | null
          activity: string
          dream: string
          concern: string
          want_to_talk: string
          outfit_photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_date?: string
          name?: string
          age?: number | null
          activity?: string
          dream?: string
          concern?: string
          want_to_talk?: string
          outfit_photo_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      talk_requests: {
        Row: {
          id: string
          from_participant_id: string
          to_participant_id: string
          event_date: string
          created_at: string
        }
        Insert: {
          id?: string
          from_participant_id: string
          to_participant_id: string
          event_date: string
          created_at?: string
        }
        Update: {
          id?: string
          from_participant_id?: string
          to_participant_id?: string
          event_date?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Participant = Database['public']['Tables']['participants']['Row']
export type TalkRequest = Database['public']['Tables']['talk_requests']['Row']
