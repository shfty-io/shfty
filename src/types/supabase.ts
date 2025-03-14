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
      disputes: {
        Row: {
          amount: number
          charge_id: string
          created_at: string
          currency: string
          dispute_id: string
          evidence_due_by: string | null
          id: string
          payment_intent_id: string
          reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          charge_id: string
          created_at?: string
          currency: string
          dispute_id: string
          evidence_due_by?: string | null
          id?: string
          payment_intent_id: string
          reason?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          amount?: number
          charge_id?: string
          created_at?: string
          currency?: string
          dispute_id?: string
          evidence_due_by?: string | null
          id?: string
          payment_intent_id?: string
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          content: string
          created_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fraud_warnings: {
        Row: {
          actionable: boolean | null
          charge_id: string
          created_at: string
          fraud_type: string | null
          id: string
          payment_intent_id: string | null
          updated_at: string
          warning_id: string
        }
        Insert: {
          actionable?: boolean | null
          charge_id: string
          created_at?: string
          fraud_type?: string | null
          id?: string
          payment_intent_id?: string | null
          updated_at?: string
          warning_id: string
        }
        Update: {
          actionable?: boolean | null
          charge_id?: string
          created_at?: string
          fraud_type?: string | null
          id?: string
          payment_intent_id?: string | null
          updated_at?: string
          warning_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string | null
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reviews: {
        Row: {
          created_at: string
          id: string
          outcome: string | null
          payment_intent_id: string
          reason: string | null
          review_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          outcome?: string | null
          payment_intent_id: string
          reason?: string | null
          review_id: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          outcome?: string | null
          payment_intent_id?: string
          reason?: string | null
          review_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          byline: string
          categories: Database["public"]["Enums"]["product_category"][] | null
          created_at: string | null
          demo_url: string | null
          description: string | null
          faq: Json | null
          github_repo_url: string | null
          github_token: string | null
          id: string
          image_urls: string[] | null
          image_positions: Json | null
          likes_count: number | null
          name: string
          price: number | null
          purchase_count: number | null
          short_description: string
          status: Database["public"]["Enums"]["product_status"] | null
          technologies:
            | Database["public"]["Enums"]["product_technology"][]
            | null
          trending_score: number | null
          updated_at: string | null
          user_id: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          byline: string
          categories?: Database["public"]["Enums"]["product_category"][] | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          faq?: Json | null
          github_repo_url?: string | null
          github_token?: string | null
          id?: string
          image_urls?: string[] | null
          image_positions?: Json | null
          likes_count?: number | null
          name: string
          price?: number | null
          purchase_count?: number | null
          short_description: string
          status?: Database["public"]["Enums"]["product_status"] | null
          technologies?:
            | Database["public"]["Enums"]["product_technology"][]
            | null
          trending_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          byline?: string
          categories?: Database["public"]["Enums"]["product_category"][] | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          faq?: Json | null
          github_repo_url?: string | null
          github_token?: string | null
          id?: string
          image_urls?: string[] | null
          image_positions?: Json | null
          likes_count?: number | null
          name?: string
          price?: number | null
          purchase_count?: number | null
          short_description?: string
          status?: Database["public"]["Enums"]["product_status"] | null
          technologies?:
            | Database["public"]["Enums"]["product_technology"][]
            | null
          trending_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          email_notifications_enabled: boolean | null
          full_name: string | null
          github_username: string | null
          id: string
          is_admin: boolean | null
          is_seller: boolean | null
          stripe_customer_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          github_username?: string | null
          id: string
          is_admin?: boolean | null
          is_seller?: boolean | null
          stripe_customer_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          github_username?: string | null
          id?: string
          is_admin?: boolean | null
          is_seller?: boolean | null
          stripe_customer_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string | null
          github_username: string
          id: string
          product_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          github_username: string
          id?: string
          product_id: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          github_username?: string
          id?: string
          product_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          product_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          product_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          product_id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      repository_access: {
        Row: {
          access_key: string
          created_at: string | null
          id: string
          product_id: string
          repository_url: string
          user_id: string
        }
        Insert: {
          access_key: string
          created_at?: string | null
          id?: string
          product_id: string
          repository_url: string
          user_id: string
        }
        Update: {
          access_key?: string
          created_at?: string | null
          id?: string
          product_id?: string
          repository_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repository_access_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repository_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_accounts: {
        Row: {
          account_status: string | null
          created_at: string | null
          github_token: string | null
          id: string
          is_onboarded: boolean | null
          stripe_account_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_status?: string | null
          created_at?: string | null
          github_token?: string | null
          id?: string
          is_onboarded?: boolean | null
          stripe_account_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_status?: string | null
          created_at?: string | null
          github_token?: string | null
          id?: string
          is_onboarded?: boolean | null
          stripe_account_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_external_accounts: {
        Row: {
          account_type: string
          created_at: string
          event_type: string
          external_account_id: string
          id: string
          metadata: Json | null
          seller_account_id: string
          status: string
        }
        Insert: {
          account_type: string
          created_at?: string
          event_type: string
          external_account_id: string
          id?: string
          metadata?: Json | null
          seller_account_id: string
          status: string
        }
        Update: {
          account_type?: string
          created_at?: string
          event_type?: string
          external_account_id?: string
          id?: string
          metadata?: Json | null
          seller_account_id?: string
          status?: string
        }
        Relationships: []
      }
      seller_payouts: {
        Row: {
          amount: number
          arrival_date: string | null
          created_at: string
          currency: string
          failure_code: string | null
          failure_message: string | null
          id: string
          payout_id: string
          seller_account_id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          arrival_date?: string | null
          created_at?: string
          currency: string
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          payout_id: string
          seller_account_id: string
          status: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          arrival_date?: string | null
          created_at?: string
          currency?: string
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          payout_id?: string
          seller_account_id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_trending_score: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_codebases_bucket: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user: {
        Args: {
          input_profile_id: string
        }
        Returns: undefined
      }
      increment_product_purchase: {
        Args: {
          product_id: string
        }
        Returns: undefined
      }
      increment_product_view: {
        Args: {
          product_id: string
        }
        Returns: undefined
      }
      increment_view_count: {
        Args: {
          product_id: string
        }
        Returns: undefined
      }
      manage_codebases_bucket: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      toggle_like: {
        Args: {
          _product_id: string
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      product_category:
        | "photo_video"
        | "productivity"
        | "utilities"
        | "entertainment"
        | "developer_tools"
        | "business"
        | "creativity"
        | "security"
        | "lifestyle"
        | "education"
        | "communication_social"
        | "games"
        | "finance"
        | "other"
      product_status: "draft" | "in_review" | "approved" | "rejected"
      product_technology:
        | "react"
        | "vue"
        | "angular"
        | "svelte"
        | "next_js"
        | "nuxt"
        | "tailwind"
        | "node_js"
        | "python"
        | "java"
        | "php"
        | "ruby"
        | "go"
        | "rust"
        | "postgresql"
        | "mysql"
        | "mongodb"
        | "supabase"
        | "firebase"
        | "aws"
        | "google_cloud"
        | "azure"
        | "vercel"
        | "docker"
        | "kubernetes"
        | "clerk"
        | "auth0"
        | "nextauth"
        | "stripe"
        | "ngrok"
        | "graphql"
        | "redis"
        | "websocket"
      report_reason: "copyright_infringement" | "other"
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
