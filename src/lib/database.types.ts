// Hand-written Database types matching supabase/migrations/00000001_initial.sql.
// Regenerate with: npx supabase gen types --lang=ts --schema public > src/lib/database.types.ts
// when connected to a live project.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          company: string | null;
          notes: string | null;
          owner_id: string | null;
          visibility: "public" | "private";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          company?: string | null;
          notes?: string | null;
          owner_id?: string | null;
          visibility?: "public" | "private";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          company?: string | null;
          notes?: string | null;
          owner_id?: string | null;
          visibility?: "public" | "private";
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: "admin" | "client";
          client_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: "admin" | "client";
          client_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "admin" | "client";
          client_id?: string | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: "active" | "completed" | "on-hold" | "cancelled" | null;
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          client_id: string | null;
          owner_id: string | null;
          visibility: "public" | "private";
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: "active" | "completed" | "on-hold" | "cancelled" | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          client_id?: string | null;
          owner_id?: string | null;
          visibility?: "public" | "private";
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: "active" | "completed" | "on-hold" | "cancelled" | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          client_id?: string | null;
          owner_id?: string | null;
          visibility?: "public" | "private";
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string | null;
          title: string;
          description: string | null;
          assignee_ids: string[];
          status: "todo" | "in-progress" | "review" | "done";
          priority: "low" | "medium" | "high";
          due_date: string | null;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          title: string;
          description?: string | null;
          assignee_ids?: string[];
          status?: "todo" | "in-progress" | "review" | "done";
          priority?: "low" | "medium" | "high";
          due_date?: string | null;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          title?: string;
          description?: string | null;
          assignee_ids?: string[];
          status?: "todo" | "in-progress" | "review" | "done";
          priority?: "low" | "medium" | "high";
          due_date?: string | null;
          order?: number;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      current_user_role: {
        Args: {};
        Returns: string;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}