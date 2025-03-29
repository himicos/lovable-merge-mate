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
          created_at: string | null
          error: string | null
          id: string
          max_retries: number
          message_id: string
          payload: Json
          priority: number
          retry_count: number
          source: string
          status: string
          updated_at: string | null
          user_id: string
          visible_after: string | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          max_retries?: number
          message_id: string
          payload: Json
          priority?: number
          retry_count?: number
          source: string
          status?: string
          updated_at?: string | null
          user_id: string
          visible_after?: string | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          max_retries?: number
          message_id?: string
          payload?: Json
          priority?: number
          retry_count?: number
          source?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          visible_after?: string | null
        }
        Relationships: []
      }
      message_responses: {
        Row: {
          created_at: string | null
          id: string
          message_id: string | null
          response_text: string
          response_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id?: string | null
          response_text: string
          response_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string | null
          response_text?: string
          response_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_responses_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "processed_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_messages: {
        Row: {
          action: Database["public"]["Enums"]["message_action"]
          category: Database["public"]["Enums"]["message_category"]
          content: string
          created_at: string | null
          id: string
          original_message_id: string
          processed_at: string | null
          prompt: string | null
          raw_data: Json | null
          requires_voice_response: boolean | null
          sender: string
          source: Database["public"]["Enums"]["message_source"]
          subject: string | null
          summary: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["message_action"]
          category: Database["public"]["Enums"]["message_category"]
          content: string
          created_at?: string | null
          id?: string
          original_message_id: string
          processed_at?: string | null
          prompt?: string | null
          raw_data?: Json | null
          requires_voice_response?: boolean | null
          sender: string
          source: Database["public"]["Enums"]["message_source"]
          subject?: string | null
          summary?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["message_action"]
          category?: Database["public"]["Enums"]["message_category"]
          content?: string
          created_at?: string | null
          id?: string
          original_message_id?: string
          processed_at?: string | null
          prompt?: string | null
          raw_data?: Json | null
          requires_voice_response?: boolean | null
          sender?: string
          source?: Database["public"]["Enums"]["message_source"]
          subject?: string | null
          summary?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      secrets: {
        Row: {
          claude_api_key: string | null
          created_at: string | null
          elevenlabs_api_key: string | null
          google_client_id: string
          google_client_secret: string
          id: string
          supabase_anon_key: string
          supabase_jwt_secret: string
          supabase_url: string
          updated_at: string | null
        }
        Insert: {
          claude_api_key?: string | null
          created_at?: string | null
          elevenlabs_api_key?: string | null
          google_client_id: string
          google_client_secret: string
          id?: string
          supabase_anon_key: string
          supabase_jwt_secret: string
          supabase_url: string
          updated_at?: string | null
        }
        Update: {
          claude_api_key?: string | null
          created_at?: string | null
          elevenlabs_api_key?: string | null
          google_client_id?: string
          google_client_secret?: string
          id?: string
          supabase_anon_key?: string
          supabase_jwt_secret?: string
          supabase_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_process_enabled: boolean
          created_at: string | null
          id: string
          marketing_email_policy: string
          system_alert_policy: string
          updated_at: string | null
          user_id: string | null
          voice_enabled: boolean
        }
        Insert: {
          auto_process_enabled?: boolean
          created_at?: string | null
          id?: string
          marketing_email_policy?: string
          system_alert_policy?: string
          updated_at?: string | null
          user_id?: string | null
          voice_enabled?: boolean
        }
        Update: {
          auto_process_enabled?: boolean
          created_at?: string | null
          id?: string
          marketing_email_policy?: string
          system_alert_policy?: string
          updated_at?: string | null
          user_id?: string | null
          voice_enabled?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      message_action:
        | "generate_prompt"
        | "create_summary"
        | "mark_read"
        | "move"
      message_category:
        | "important"
        | "indirectly_relevant"
        | "marketing"
        | "system_alert"
      message_source: "email" | "slack" | "teams"
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
