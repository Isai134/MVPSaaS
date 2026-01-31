// Custom types for the school management system
// These complement the auto-generated Supabase types

export type AppRole = 'super_admin' | 'directivo' | 'administrativo' | 'profesor' | 'alumno' | 'padre';

export type StudentStatus = 'activo' | 'por_reinscribir' | 'egresado' | 'baja' | 'suspendido';

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';

export type PaymentStatus = 'pendiente' | 'pagado' | 'parcial' | 'vencido' | 'condonado';

export type DocumentStatus = 'pendiente' | 'entregado' | 'observaciones';

export type FeeType = 'inscripcion' | 'colegiatura' | 'seguro' | 'uniforme' | 'evento' | 'extra';

export type GradeStatus = 'borrador' | 'publicado';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Student {
  id: string;
  user_id?: string;
  student_code?: string;
  first_name: string;
  last_name: string;
  curp?: string;
  birth_date?: string;
  email?: string;
  phone?: string;
  address?: string;
  photo_url?: string;
  status: StudentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Guardian {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  phone_secondary?: string;
  relationship?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Level {
  id: string;
  name: string;
  order_index: number;
  created_at: string;
}

export interface Grade {
  id: string;
  level_id: string;
  name: string;
  order_index: number;
  created_at: string;
}

export interface Group {
  id: string;
  grade_id: string;
  academic_year_id: string;
  name: string;
  capacity?: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  academic_year_id: string;
  group_id?: string;
  enrolled_at: string;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

export interface PaymentSchedule {
  id: string;
  enrollment_id: string;
  fee_plan_id?: string;
  month: number;
  year: number;
  due_date: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  payment_schedule_id?: string;
  enrollment_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference?: string;
  payment_date: string;
  received_by?: string;
  notes?: string;
  is_reversed: boolean;
  reversed_at?: string;
  reversed_by?: string;
  reversal_reason?: string;
  created_at: string;
}

export interface StudentComment {
  id: string;
  student_id: string;
  author_id: string;
  content: string;
  category?: string;
  tags?: string[];
  is_private: boolean;
  visible_to_roles?: AppRole[];
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id?: string;
  target_levels?: string[];
  target_groups?: string[];
  is_published: boolean;
  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Helper type for stats
export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  pendingPayments: number;
  overduePayments: number;
  totalIncome: number;
  monthlyIncome: number;
}

// Role display names
export const roleDisplayNames: Record<AppRole, string> = {
  super_admin: 'Super Administrador',
  directivo: 'Directivo',
  administrativo: 'Administrativo',
  profesor: 'Profesor',
  alumno: 'Alumno',
  padre: 'Padre/Tutor',
};

// Status display names
export const studentStatusDisplayNames: Record<StudentStatus, string> = {
  activo: 'Activo',
  por_reinscribir: 'Por Reinscribir',
  egresado: 'Egresado',
  baja: 'Baja',
  suspendido: 'Suspendido',
};

export const paymentStatusDisplayNames: Record<PaymentStatus, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  parcial: 'Parcial',
  vencido: 'Vencido',
  condonado: 'Condonado',
};

export const documentStatusDisplayNames: Record<DocumentStatus, string> = {
  pendiente: 'Pendiente',
  entregado: 'Entregado',
  observaciones: 'Con Observaciones',
};

// Level colors for UI
export const levelColors: Record<string, string> = {
  'Kinder': 'bg-purple-500',
  'Primaria': 'bg-sky-500',
  'Secundaria': 'bg-emerald-500',
  'Preparatoria': 'bg-amber-500',
};

// Payment status colors
export const paymentStatusColors: Record<PaymentStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  pagado: 'bg-green-100 text-green-800',
  parcial: 'bg-blue-100 text-blue-800',
  vencido: 'bg-red-100 text-red-800',
  condonado: 'bg-gray-100 text-gray-800',
};

// Student status colors
export const studentStatusColors: Record<StudentStatus, string> = {
  activo: 'bg-green-100 text-green-800',
  por_reinscribir: 'bg-yellow-100 text-yellow-800',
  egresado: 'bg-blue-100 text-blue-800',
  baja: 'bg-red-100 text-red-800',
  suspendido: 'bg-gray-100 text-gray-800',
};
