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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      match_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          match_id: string
          minute: number | null
          player_id: string | null
          team_id: string | null
          tournament_id: string
          type: Database["public"]["Enums"]["match_event_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          match_id: string
          minute?: number | null
          player_id?: string | null
          team_id?: string | null
          tournament_id: string
          type: Database["public"]["Enums"]["match_event_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          match_id?: string
          minute?: number | null
          player_id?: string | null
          team_id?: string | null
          tournament_id?: string
          type?: Database["public"]["Enums"]["match_event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      match_logs: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          match_id: string
          new_away_score: number | null
          new_home_score: number | null
          old_away_score: number | null
          old_home_score: number | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          match_id: string
          new_away_score?: number | null
          new_home_score?: number | null
          old_away_score?: number | null
          old_home_score?: number | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          match_id?: string
          new_away_score?: number | null
          new_home_score?: number | null
          old_away_score?: number | null
          old_home_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_logs_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_penalty_score: number | null
          away_score: number | null
          away_team_id: string | null
          bracket_order: number | null
          clock_elapsed_seconds: number | null
          clock_last_started_at: string | null
          clock_status: string | null
          created_at: string | null
          home_penalty_score: number | null
          home_score: number | null
          home_team_id: string | null
          id: string
          is_knockout: boolean
          match_date: string | null
          match_time: string | null
          next_match_home_side: boolean | null
          next_match_id: string | null
          round_number: number | null
          stage: Database["public"]["Enums"]["match_stage"]
          status: string | null
          tournament_id: string | null
          updated_by: string | null
          version: number
          winner_team_id: string | null
        }
        Insert: {
          away_penalty_score?: number | null
          away_score?: number | null
          away_team_id?: string | null
          bracket_order?: number | null
          clock_elapsed_seconds?: number | null
          clock_last_started_at?: string | null
          clock_status?: string | null
          created_at?: string | null
          home_penalty_score?: number | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          is_knockout?: boolean
          match_date?: string | null
          match_time?: string | null
          next_match_home_side?: boolean | null
          next_match_id?: string | null
          round_number?: number | null
          stage?: Database["public"]["Enums"]["match_stage"]
          status?: string | null
          tournament_id?: string | null
          updated_by?: string | null
          version?: number
          winner_team_id?: string | null
        }
        Update: {
          away_penalty_score?: number | null
          away_score?: number | null
          away_team_id?: string | null
          bracket_order?: number | null
          clock_elapsed_seconds?: number | null
          clock_last_started_at?: string | null
          clock_status?: string | null
          created_at?: string | null
          home_penalty_score?: number | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          is_knockout?: boolean
          match_date?: string | null
          match_time?: string | null
          next_match_home_side?: boolean | null
          next_match_id?: string | null
          round_number?: number | null
          stage?: Database["public"]["Enums"]["match_stage"]
          status?: string | null
          tournament_id?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_next_match_id_fkey"
            columns: ["next_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string | null
          id: string
          name: string
          team_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          team_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      tournament_players: {
        Row: {
          goals: number | null
          player_id: string
          team_id: string | null
          tournament_id: string
        }
        Insert: {
          goals?: number | null
          player_id: string
          team_id?: string | null
          tournament_id: string
        }
        Update: {
          goals?: number | null
          player_id?: string
          team_id?: string | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_players_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_rules: {
        Row: {
          description: string
          id: string
          order_index: number | null
          title: string
          tournament_id: string | null
        }
        Insert: {
          description: string
          id?: string
          order_index?: number | null
          title: string
          tournament_id?: string | null
        }
        Update: {
          description?: string
          id?: string
          order_index?: number | null
          title?: string
          tournament_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_rules_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_teams: {
        Row: {
          created_at: string | null
          draws: number | null
          goals_against: number | null
          goals_for: number | null
          losses: number | null
          matches_played: number | null
          points: number | null
          team_id: string
          tournament_id: string
          wins: number | null
        }
        Insert: {
          created_at?: string | null
          draws?: number | null
          goals_against?: number | null
          goals_for?: number | null
          losses?: number | null
          matches_played?: number | null
          points?: number | null
          team_id: string
          tournament_id: string
          wins?: number | null
        }
        Update: {
          created_at?: string | null
          draws?: number | null
          goals_against?: number | null
          goals_for?: number | null
          losses?: number | null
          matches_played?: number | null
          points?: number | null
          team_id?: string
          tournament_id?: string
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          admin_name: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          location: string
          max_teams: number | null
          name: string
          registration_status: string | null
          slug: string
          start_date: string | null
          status: string
        }
        Insert: {
          admin_name?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location: string
          max_teams?: number | null
          name: string
          registration_status?: string | null
          slug: string
          start_date?: string | null
          status: string
        }
        Update: {
          admin_name?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string
          max_teams?: number | null
          name?: string
          registration_status?: string | null
          slug?: string
          start_date?: string | null
          status?: string
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
      match_event_type:
        | "GOAL"
        | "YELLOW_CARD"
        | "RED_CARD"
        | "SUBSTITUTION"
        | "MATCH_START"
        | "MATCH_END"
      match_stage:
        | "GROUP"
        | "ROUND_32"
        | "ROUND_16"
        | "QUARTERFINAL"
        | "SEMIFINAL"
        | "FINAL"
        | "THIRD_PLACE"
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
      match_event_type: [
        "GOAL",
        "YELLOW_CARD",
        "RED_CARD",
        "SUBSTITUTION",
        "MATCH_START",
        "MATCH_END",
      ],
      match_stage: [
        "GROUP",
        "ROUND_32",
        "ROUND_16",
        "QUARTERFINAL",
        "SEMIFINAL",
        "FINAL",
        "THIRD_PLACE",
      ],
    },
  },
} as const
