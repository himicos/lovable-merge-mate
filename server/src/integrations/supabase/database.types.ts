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
      user_auth_providers: {
        Row: {
          id: string
          user_id: string
          provider: string
          provider_id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          provider_id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          provider_id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      gmail_connections: {
        Row: {
          id: string
          user_id: string
          email: string
          access_token: string
          refresh_token: string
          token_type: string
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          access_token: string
          refresh_token: string
          token_type: string
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          access_token?: string
          refresh_token?: string
          token_type?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      slack_connections: {
        Row: {
          id: string
          user_id: string
          team_id: string
          access_token: string
          scope: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id: string
          access_token: string
          scope: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string
          access_token?: string
          scope?: string
          created_at?: string
          updated_at?: string
        }
      }
      teams_connections: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          access_token: string
          refresh_token: string
          scope: string
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          access_token: string
          refresh_token: string
          scope: string
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          access_token?: string
          refresh_token?: string
          scope?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      message_queue: {
        Row: {
          id: string
          user_id: string
          message_id: string
          source: string
          priority: number
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          retry_count: number
          max_retries: number
          next_retry_at: string | null
          created_at: string
          updated_at: string
          error: string | null
        }
        Insert: {
          id?: string
          user_id: string
          message_id: string
          source: string
          priority?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          retry_count?: number
          max_retries?: number
          next_retry_at?: string | null
          created_at?: string
          updated_at?: string
          error?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          message_id?: string
          source?: string
          priority?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          retry_count?: number
          max_retries?: number
          next_retry_at?: string | null
          created_at?: string
          updated_at?: string
          error?: string | null
        }
      }
      message_responses: {
        Row: {
          id: string
          user_id: string
          message_id: string
          response: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message_id: string
          response: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message_id?: string
          response?: Json
          created_at?: string
        }
      }
      processed_messages: {
        Row: {
          id: string
          user_id: string
          message_id: string
          source: string
          category: string
          summary: string | null
          action_taken: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message_id: string
          source: string
          category: string
          summary?: string | null
          action_taken?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message_id?: string
          source?: string
          category?: string
          summary?: string | null
          action_taken?: string | null
          created_at?: string
        }
      }
      secrets: {
        Row: {
          id: string
          user_id: string
          claude_api_key: string | null
          elevenlabs_api_key: string | null
          google_client_id: string | null
          google_client_secret: string | null
          ms_client_id: string | null
          ms_client_secret: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          claude_api_key?: string | null
          elevenlabs_api_key?: string | null
          google_client_id?: string | null
          google_client_secret?: string | null
          ms_client_id?: string | null
          ms_client_secret?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          claude_api_key?: string | null
          elevenlabs_api_key?: string | null
          google_client_id?: string | null
          google_client_secret?: string | null
          ms_client_id?: string | null
          ms_client_secret?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          settings: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          settings?: Json
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
