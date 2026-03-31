export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          city: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          city?: string | null;
        };
        Update: {
          name?: string;
          city?: string | null;
        };
      };
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
          id: string;
          user_id: string;
          school_id: string;
          role: 'super_admin' | 'directivo' | 'administrativo' | 'profesor' | 'alumno' | 'padre';
          created_at: string;
        };
        Insert: {
          user_id: string;
          school_id: string;
          role: 'super_admin' | 'directivo' | 'administrativo' | 'profesor' | 'alumno' | 'padre';
        };
        Update: {
          role?: 'super_admin' | 'directivo' | 'administrativo' | 'profesor' | 'alumno' | 'padre';
        };
      };
      academic_years: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          school_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
        };
      };
      groups: {
        Row: {
          id: string;
          school_id: string;
          academic_year_id: string;
          level: string;
          grade: string;
          section: string;
          name: string;
          created_at: string;
        };
        Insert: {
          school_id: string;
          academic_year_id: string;
          level: string;
          grade: string;
          section: string;
        };
        Update: {
          level?: string;
          grade?: string;
          section?: string;
        };
      };
      students: {
        Row: {
          id: string;
          school_id: string;
          profile_id: string | null;
          first_name: string;
          last_name: string;
          level: string | null;
          grade: string | null;
          section: string | null;
          group_id: string | null;
          status: 'activo' | 'por_reinscribir' | 'baja';
          guardian: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          school_id: string;
          profile_id?: string | null;
          first_name: string;
          last_name: string;
          level?: string | null;
          grade?: string | null;
          section?: string | null;
          group_id?: string | null;
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
          group_id?: string | null;
          status?: 'activo' | 'por_reinscribir' | 'baja';
          guardian?: string | null;
          phone?: string | null;
        };
      };
      teachers: {
        Row: {
          id: string;
          school_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          school_id: string;
          profile_id: string;
        };
        Update: {
          profile_id?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          code: string | null;
          level: string | null;
          grade: string | null;
          created_at: string;
        };
        Insert: {
          school_id: string;
          name: string;
          code?: string | null;
          level?: string | null;
          grade?: string | null;
        };
        Update: {
          name?: string;
          code?: string | null;
          level?: string | null;
          grade?: string | null;
        };
      };
      teacher_subject_assignments: {
        Row: {
          id: string;
          school_id: string;
          teacher_id: string;
          subject_id: string;
          group_id: string;
          academic_year_id: string;
          created_at: string;
        };
        Insert: {
          school_id: string;
          teacher_id: string;
          subject_id: string;
          group_id: string;
          academic_year_id: string;
        };
        Update: {
          teacher_id?: string;
          subject_id?: string;
          group_id?: string;
          academic_year_id?: string;
        };
      };
      student_subject_enrollments: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          subject_id: string;
          group_id: string;
          academic_year_id: string;
          created_at: string;
        };
        Insert: {
          school_id: string;
          student_id: string;
          subject_id: string;
          group_id: string;
          academic_year_id: string;
        };
        Update: {};
      };
      grade_items: {
        Row: {
          id: string;
          school_id: string;
          subject_id: string;
          group_id: string;
          teacher_id: string;
          title: string;
          item_type: string;
          period: string;
          percentage: number;
          created_at: string;
        };
        Insert: {
          school_id: string;
          subject_id: string;
          group_id: string;
          teacher_id: string;
          title: string;
          item_type: string;
          period: string;
          percentage: number;
        };
        Update: {
          title?: string;
          item_type?: string;
          period?: string;
          percentage?: number;
        };
      };
      student_grades: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          grade_item_id: string;
          score: number;
          comments: string | null;
          created_at: string;
        };
        Insert: {
          school_id: string;
          student_id: string;
          grade_item_id: string;
          score: number;
          comments?: string | null;
        };
        Update: {
          score?: number;
          comments?: string | null;
        };
      };
      announcements: {
        Row: {
          id: string;
          school_id: string;
          author_profile_id: string;
          title: string;
          content: string;
          subject_id: string | null;
          group_id: string | null;
          target_role: 'super_admin' | 'directivo' | 'administrativo' | 'profesor' | 'alumno' | 'padre' | null;
          is_published: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          school_id: string;
          author_profile_id: string;
          title: string;
          content: string;
          subject_id?: string | null;
          group_id?: string | null;
          target_role?: 'super_admin' | 'directivo' | 'administrativo' | 'profesor' | 'alumno' | 'padre' | null;
          is_published?: boolean;
          expires_at?: string | null;
        };
        Update: {
          title?: string;
          content?: string;
          subject_id?: string | null;
          group_id?: string | null;
          target_role?: 'super_admin' | 'directivo' | 'administrativo' | 'profesor' | 'alumno' | 'padre' | null;
          is_published?: boolean;
          expires_at?: string | null;
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
    };
    Views: {};
    Functions: {};
  };
}

export type AppRole =
  Database['public']['Tables']['user_roles']['Row']['role'];

export type StudentStatus =
  Database['public']['Tables']['students']['Row']['status'];

export type PaymentStatus =
  Database['public']['Tables']['payments']['Row']['status'];