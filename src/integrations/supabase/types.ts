export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      gmail_connections: {
        Row: {
          access_token: string
          created_at: string
          email: string
          expires_at: string | null
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          email: string
          expires_at?: string | null
          refresh_token?: string | null
          updated_at: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          email?: string
          expires_at?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          visible_after: string
          created_at: string
          updated_at: string
          payload: Json
          error?: string
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
          visible_after?: string
          created_at?: string
          updated_at?: string
          payload: Json
          error?: string
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
          visible_after?: string
          created_at?: string
          updated_at?: string
          payload?: Json
          error?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_queue_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      message_responses: {
        Row: {
          id: string
          message_id: string
          user_id: string
          response_text: string
          response_type: 'voice' | 'text'
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          response_text: string
          response_type: 'voice' | 'text'
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          response_text?: string
          response_type?: 'voice' | 'text'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_responses_message_id_fkey"
            columns: ["message_id"]
            referencedRelation: "processed_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_responses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      processed_messages: {
        Row: {
          id: string
          user_id: string
          original_message_id: string
          source: string
          sender: string
          subject: string | null
          content: string
          category: string
          action: string
          summary: string | null
          prompt: string | null
          requires_voice_response: boolean
          processed_at: string
          created_at: string
          raw_data: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          original_message_id: string
          source: string
          sender: string
          subject?: string | null
          content: string
          category: string
          action: string
          summary?: string | null
          prompt?: string | null
          requires_voice_response?: boolean
          processed_at?: string
          created_at?: string
          raw_data?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          original_message_id?: string
          source?: string
          sender?: string
          subject?: string | null
          content?: string
          category?: string
          action?: string
          summary?: string | null
          prompt?: string | null
          requires_voice_response?: boolean
          processed_at?: string
          created_at?: string
          raw_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "processed_messages_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      secrets: {
        Row: {
          claude_api_key: string | null
          google_client_id: string | null
          google_client_secret: string | null
          ms_client_id: string | null
          ms_client_secret: string | null
          elevenlabs_api_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          claude_api_key?: string | null
          google_client_id?: string | null
          google_client_secret?: string | null
          ms_client_id?: string | null
          ms_client_secret?: string | null
          elevenlabs_api_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          claude_api_key?: string | null
          google_client_id?: string | null
          google_client_secret?: string | null
          ms_client_id?: string | null
          ms_client_secret?: string | null
          elevenlabs_api_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          marketing_email_policy: string
          system_alert_policy: string
          voice_enabled: boolean
          auto_process_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          marketing_email_policy?: string
          system_alert_policy?: string
          voice_enabled?: boolean
          auto_process_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          marketing_email_policy?: string
          system_alert_policy?: string
          voice_enabled?: boolean
          auto_process_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
