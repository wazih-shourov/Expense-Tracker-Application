export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      budget_plans: {
        Row: {
          category: string
          created_at: string
          id: string
          month: number
          monthly_limit: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          month: number
          monthly_limit: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          month?: number
          monthly_limit?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_health_scores: {
        Row: {
          calculation_date: string
          created_at: string | null
          id: string
          income_vs_expense_score: number
          savings_score: number
          score: number
          spending_habits_score: number
          user_id: string
        }
        Insert: {
          calculation_date?: string
          created_at?: string | null
          id?: string
          income_vs_expense_score: number
          savings_score: number
          score: number
          spending_habits_score: number
          user_id: string
        }
        Update: {
          calculation_date?: string
          created_at?: string | null
          id?: string
          income_vs_expense_score?: number
          savings_score?: number
          score?: number
          spending_habits_score?: number
          user_id?: string
        }
        Relationships: []
      }
      low_stock_alerts: {
        Row: {
          created_at: string
          id: string
          product_id: string
          status: string
          threshold: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          status?: string
          threshold?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          status?: string
          threshold?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "low_stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          notes: string | null
          purchase_price: number
          quantity: number
          selling_price: number
          sku: string | null
          supplier: string | null
          unit_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          purchase_price?: number
          quantity?: number
          selling_price?: number
          sku?: string | null
          supplier?: string | null
          unit_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          purchase_price?: number
          quantity?: number
          selling_price?: number
          sku?: string | null
          supplier?: string | null
          unit_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          currency: string | null
          id: string
          name: string | null
          onboarded: boolean | null
          theme_preference: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          currency?: string | null
          id: string
          name?: string | null
          onboarded?: boolean | null
          theme_preference?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          name?: string | null
          onboarded?: boolean | null
          theme_preference?: string | null
        }
        Relationships: []
      }
      savings_buckets: {
        Row: {
          created_at: string
          current_amount: number
          id: string
          name: string
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          id?: string
          name: string
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          id?: string
          name?: string
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          name: string
          price_per_unit: number
          quantity: number
          shopping_list_id: string
          total_price: number
          unit_type: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          name: string
          price_per_unit: number
          quantity: number
          shopping_list_id: string
          total_price: number
          unit_type?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          name?: string
          price_per_unit?: number
          quantity?: number
          shopping_list_id?: string
          total_price?: number
          unit_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          date: string
          id: string
          total_amount: number
          transactions_created: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          total_amount?: number
          transactions_created?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          total_amount?: number
          transactions_created?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      social_poll_options: {
        Row: {
          created_at: string
          id: string
          option_order: number
          option_text: string
          post_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_order: number
          option_text: string
          post_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_order?: number
          option_text?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_poll_options_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_poll_votes: {
        Row: {
          created_at: string
          id: string
          poll_option_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_option_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_option_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_poll_votes_poll_option_id_fkey"
            columns: ["poll_option_id"]
            isOneToOne: false
            referencedRelation: "social_poll_options"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          content: string | null
          created_at: string
          financial_score: number | null
          id: string
          post_type: Database["public"]["Enums"]["social_post_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          financial_score?: number | null
          id?: string
          post_type?: Database["public"]["Enums"]["social_post_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          financial_score?: number | null
          id?: string
          post_type?: Database["public"]["Enums"]["social_post_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: Database["public"]["Enums"]["social_reaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type?: Database["public"]["Enums"]["social_reaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: Database["public"]["Enums"]["social_reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transactions: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          reference: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          reference?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          reference?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          id: string
          note: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date?: string
          id?: string
          note?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          id?: string
          note?: string | null
          title?: string
          type?: string
          user_id?: string
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
      social_post_type: "text" | "poll" | "financial_health"
      social_reaction_type: "like" | "love"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      social_post_type: ["text", "poll", "financial_health"],
      social_reaction_type: ["like", "love"],
    },
  },
} as const
