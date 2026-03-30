/**
 * This file contains a minimal type definition for the Supabase database
 * schema used by the production‑ready SaaS platform.  Defining types
 * centrally allows the Supabase client to be strongly typed, improving
 * developer experience and catching mistakes at compile time.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          school_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          school_id?: string | null;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          school_id?: string | null;
        };
      };
      user_roles: {
        Row: {
          user_id: string;
          school_id: string;
          role: 'super_admin' | 'directivo' | 'administrativo' | 'alumno';
          created_at: string;
        };
        Insert: {
          user_id: string;
          school_id: string;
          role: 'super_admin' | 'directivo' | 'administrativo' | 'alumno';
        };
        Update: {};
      };
      students: {
        Row: {
          id: string;
          school_id: string;
          first_name: string;
          last_name: string;
          level: string | null;
          grade: string | null;
          section: string | null;
          status: 'activo' | 'por_reinscribir' | 'baja';
          guardian: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          school_id: string;
          first_name: string;
          last_name: string;
          level?: string | null;
          grade?: string | null;
          section?: string | null;
          status?: 'activo' | 'por_reinscribir' | 'baja';
          guardian?: string | null;
          phone?: string | null;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          level?: string | null;
          grade?: string | null;
          section?: string | null;
          status?: 'activo' | 'por_reinscribir' | 'baja';
          guardian?: string | null;
          phone?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          amount: number;
          concept: string;
          status: 'pagado' | 'pendiente' | 'parcial' | 'vencido';
          due_date: string;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          school_id: string;
          student_id: string;
          amount: number;
          concept: string;
          status?: 'pagado' | 'pendiente' | 'parcial' | 'vencido';
          due_date: string;
          paid_at?: string | null;
        };
        Update: {
          amount?: number;
          concept?: string;
          status?: 'pagado' | 'pendiente' | 'parcial' | 'vencido';
          due_date?: string;
          paid_at?: string | null;
        };
      };
      settings: {
        Row: {
          id: string;
          school_id: string;
          key: string;
          value: any;
          created_at: string;
        };
        Insert: {
          school_id: string;
          key: string;
          value: any;
        };
        Update: {
          value?: any;
        };
      };
    };
    Views: {};
    Functions: {};
  };
}

export type StudentStatus = Database['public']['Tables']['students']['Row']['status'];
export type PaymentStatus = Database['public']['Tables']['payments']['Row']['status'];
export type AppRole = Database['public']['Tables']['user_roles']['Row']['role'];