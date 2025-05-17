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
      slack_connections: {
        Row: {
          access_token: string
          created_at: string | null
          id: string
          scope: string
          team_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          id?: string
          scope: string
          team_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          id?: string
          scope?: string
          team_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      teams_connections: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string
          scope: string
          tenant_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token: string
          scope: string
          tenant_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string
          scope?: string
          tenant_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: number | null
          id: string
          metadata: Json | null
          provider: string
          refresh_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: number | null
          id?: string
          metadata?: Json | null
          provider: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: number | null
          id?: string
          metadata?: Json | null
          provider?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      get_secrets: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      message_action: [
        "generate_prompt",
        "create_summary",
        "mark_read",
        "move",
      ],
      message_category: [
        "important",
        "indirectly_relevant",
        "marketing",
        "system_alert",
      ],
      message_source: ["email", "slack", "teams"],
    },
  },
} as const
