// Hand-written Supabase schema types — keep in sync with supabase/migrations/.
// Referenced by nuxt.config `supabase.types` so useSupabaseClient() is typed.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Timestamps = { created_at: string }

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          linkedin_url: string | null
          role: 'member' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          linkedin_url?: string | null
          role?: 'member' | 'admin'
        }
        Update: {
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          linkedin_url?: string | null
          role?: 'member' | 'admin'
        }
        Relationships: []
      }
      lesson_progress: {
        Row: { user_id: string, lesson_path: string, completed_at: string }
        Insert: { user_id: string, lesson_path: string, completed_at?: string }
        Update: { completed_at?: string }
        Relationships: []
      }
      quiz_attempts: {
        Row: { id: string, user_id: string, quiz_id: string, score: number, total: number, answers: Json | null, passed: boolean, skills: Json | null, created_at: string }
        Insert: { user_id: string, quiz_id: string, score: number, total: number, answers?: Json | null, passed?: boolean, skills?: Json | null }
        Update: { score?: number, total?: number, answers?: Json | null, passed?: boolean, skills?: Json | null }
        Relationships: []
      }
      resources: {
        Row: {
          id: string
          user_id: string | null
          title: string
          url: string
          description: string | null
          category: string | null
          icon: string | null
          status: 'pending' | 'approved' | 'rejected'
        } & Timestamps
        Insert: {
          user_id: string
          title: string
          url: string
          description?: string | null
          category?: string | null
          icon?: string | null
          status?: 'pending'
        }
        Update: { status?: 'pending' | 'approved' | 'rejected' }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string | null
          image_url: string | null
          link: string | null
          tags: string[] | null
          status: 'pending' | 'approved' | 'rejected'
        } & Timestamps
        Insert: {
          user_id: string
          title: string
          description?: string | null
          image_url?: string | null
          link?: string | null
          tags?: string[] | null
          status?: 'pending'
        }
        Update: { status?: 'pending' | 'approved' | 'rejected' }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          user_id: string
          page_path: string
          body: string
          parent_id: string | null
          created_at: string
        }
        Insert: { user_id: string, page_path: string, body: string, parent_id?: string | null }
        Update: { body?: string }
        Relationships: []
      }
      resource_votes: {
        Row: { id: string, resource_id: string, user_id: string, created_at: string }
        Insert: { resource_id: string, user_id: string }
        Update: Record<string, never>
        Relationships: []
      }
      certificates: {
        Row: { id: string, code: string, user_id: string | null, name: string, course: string, avg_score: number | null, issued_at: string }
        Insert: { code: string, user_id: string, name: string, course?: string, avg_score?: number | null }
        Update: { name?: string, avg_score?: number | null }
        Relationships: []
      }
      feedback: {
        Row: {
          id: string
          user_id: string | null
          subject: string | null
          message: string
          category: 'general' | 'bug' | 'idea' | 'content' | 'other'
          page_path: string | null
          status: 'open' | 'resolved'
          created_at: string
        }
        Insert: {
          user_id: string
          subject?: string | null
          message: string
          category?: 'general' | 'bug' | 'idea' | 'content' | 'other'
          page_path?: string | null
        }
        Update: { status?: 'open' | 'resolved' }
        Relationships: []
      }
      feedback_replies: {
        Row: { id: string, feedback_id: string, user_id: string | null, body: string, created_at: string }
        Insert: { feedback_id: string, user_id: string, body: string }
        Update: { body?: string }
        Relationships: []
      }
      guestbook: {
        Row: {
          id: string
          user_id: string
          name: string | null
          message: string | null
          drawing: string | null
          status: 'visible' | 'hidden'
          created_at: string
        }
        Insert: {
          user_id: string
          name?: string | null
          message?: string | null
          drawing?: string | null
          status?: 'visible' | 'hidden'
        }
        Update: { status?: 'visible' | 'hidden', message?: string | null }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: { Args: Record<string, never>, Returns: boolean }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
