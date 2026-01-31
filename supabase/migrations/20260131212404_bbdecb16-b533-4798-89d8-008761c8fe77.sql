-- =============================================
-- SISTEMA DE GESTIÓN ESCOLAR - ESQUEMA COMPLETO
-- =============================================

-- 1. TIPOS ENUMERADOS
-- =============================================

-- Roles de aplicación
CREATE TYPE public.app_role AS ENUM ('super_admin', 'directivo', 'administrativo', 'profesor', 'alumno', 'padre');

-- Estados de alumno
CREATE TYPE public.student_status AS ENUM ('activo', 'por_reinscribir', 'egresado', 'baja', 'suspendido');

-- Métodos de pago
CREATE TYPE public.payment_method AS ENUM ('efectivo', 'transferencia', 'tarjeta', 'otro');

-- Estados de pago
CREATE TYPE public.payment_status AS ENUM ('pendiente', 'pagado', 'parcial', 'vencido', 'condonado');

-- Estados de documento
CREATE TYPE public.document_status AS ENUM ('pendiente', 'entregado', 'observaciones');

-- Tipos de concepto de pago
CREATE TYPE public.fee_type AS ENUM ('inscripcion', 'colegiatura', 'seguro', 'uniforme', 'evento', 'extra');

-- Estados de calificación
CREATE TYPE public.grade_status AS ENUM ('borrador', 'publicado');

-- 2. TABLAS DE USUARIOS Y ROLES
-- =============================================

-- Tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de roles de usuario (separada para seguridad)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 3. ESTRUCTURA ACADÉMICA
-- =============================================

-- Ciclos escolares
CREATE TABLE public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- ej: "2025-2026"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Niveles educativos
CREATE TABLE public.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- ej: "Kinder", "Primaria", "Secundaria", "Preparatoria"
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grados
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID REFERENCES public.levels(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- ej: "1°", "2°", "3°"
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grupos
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id UUID REFERENCES public.grades(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- ej: "A", "B", "C"
  capacity INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. ALUMNOS Y TUTORES
-- =============================================

-- Tutores/Padres
CREATE TABLE public.guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  phone_secondary TEXT,
  relationship TEXT, -- ej: "Padre", "Madre", "Tutor"
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alumnos
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_code TEXT UNIQUE, -- Matrícula
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  curp TEXT,
  birth_date DATE,
  email TEXT,
  phone TEXT,
  address TEXT,
  photo_url TEXT,
  status student_status NOT NULL DEFAULT 'activo',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Relación alumno-tutor (muchos a muchos)
CREATE TABLE public.student_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, guardian_id)
);

-- Inscripciones (enrollment por ciclo)
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status student_status NOT NULL DEFAULT 'activo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, academic_year_id)
);

-- 5. MATERIAS Y PROFESORES
-- =============================================

-- Materias
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  level_id UUID REFERENCES public.levels(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Asignación de profesores a materias/grupos
CREATE TABLE public.teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(teacher_user_id, subject_id, group_id, academic_year_id)
);

-- 6. CALIFICACIONES
-- =============================================

-- Periodos de evaluación
CREATE TABLE public.evaluation_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- ej: "1er Bimestre", "2do Trimestre"
  order_index INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Libro de calificaciones
CREATE TABLE public.gradebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_assignment_id UUID REFERENCES public.teacher_assignments(id) ON DELETE CASCADE NOT NULL,
  evaluation_period_id UUID REFERENCES public.evaluation_periods(id) ON DELETE CASCADE NOT NULL,
  status grade_status NOT NULL DEFAULT 'borrador',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(teacher_assignment_id, evaluation_period_id)
);

-- Calificaciones individuales
CREATE TABLE public.student_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gradebook_id UUID REFERENCES public.gradebooks(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  score DECIMAL(5,2), -- Escala 0-10 o configurable
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gradebook_id, student_id)
);

-- 7. PAGOS Y COLEGIATURAS
-- =============================================

-- Planes de pago por nivel
CREATE TABLE public.fee_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID REFERENCES public.levels(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  fee_type fee_type NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_day INTEGER, -- Día del mes
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Calendario de pagos mensuales
CREATE TABLE public.payment_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
  fee_plan_id UUID REFERENCES public.fee_plans(id) ON DELETE SET NULL,
  month INTEGER NOT NULL, -- 1-12
  year INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Becas y descuentos
CREATE TABLE public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- ej: "Beca deportiva", "Descuento hermanos"
  discount_type TEXT NOT NULL, -- "porcentaje" o "monto"
  value DECIMAL(10,2) NOT NULL, -- % o monto fijo
  applies_to fee_type[], -- Conceptos a los que aplica
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pagos realizados
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_schedule_id UUID REFERENCES public.payment_schedule(id) ON DELETE SET NULL,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  reference TEXT, -- Folio/referencia
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  received_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  is_reversed BOOLEAN DEFAULT false,
  reversed_at TIMESTAMPTZ,
  reversed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reversal_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. DOCUMENTOS
-- =============================================

-- Catálogo de documentos requeridos por nivel
CREATE TABLE public.document_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID REFERENCES public.levels(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- ej: "Acta de nacimiento", "CURP", "Fotos"
  is_required BOOLEAN DEFAULT true,
  order_index INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documentos del alumno
CREATE TABLE public.student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  requirement_id UUID REFERENCES public.document_requirements(id) ON DELETE SET NULL,
  status document_status NOT NULL DEFAULT 'pendiente',
  file_url TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. COMENTARIOS Y NOTAS (CRM)
-- =============================================

CREATE TABLE public.student_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- ej: "cobranza", "académico", "conducta", "general"
  tags TEXT[],
  is_private BOOLEAN DEFAULT false, -- Solo visible para ciertos roles
  visible_to_roles app_role[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. AVISOS Y COMUNICACIONES
-- =============================================

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_levels UUID[], -- Niveles objetivo
  target_groups UUID[], -- Grupos objetivo
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Confirmación de lectura
CREATE TABLE public.announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- 11. AUDITORÍA
-- =============================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- ej: "payment_created", "grade_updated"
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- FUNCIONES DE SEGURIDAD
-- =============================================

-- Función para verificar rol de usuario (evita recursión en RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Función para obtener roles de usuario
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(role), '{}'::app_role[])
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- Función para verificar si es admin o directivo
CREATE OR REPLACE FUNCTION public.is_admin_or_directivo(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'directivo')
  )
$$;

-- Función para verificar si es staff (admin, directivo o administrativo)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'directivo', 'administrativo')
  )
$$;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guardians_updated_at BEFORE UPDATE ON public.guardians FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON public.academic_years FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gradebooks_updated_at BEFORE UPDATE ON public.gradebooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_grades_updated_at BEFORE UPDATE ON public.student_grades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_schedule_updated_at BEFORE UPDATE ON public.payment_schedule FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_documents_updated_at BEFORE UPDATE ON public.student_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_comments_updated_at BEFORE UPDATE ON public.student_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gradebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE PERFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT USING (public.is_staff(auth.uid()));

-- POLÍTICAS DE ROLES (solo super_admin puede modificar)
CREATE POLICY "Anyone can view roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Super admin can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- POLÍTICAS DE ESTRUCTURA ACADÉMICA (lectura pública, escritura admin)
CREATE POLICY "Anyone can view academic years" ON public.academic_years FOR SELECT USING (true);
CREATE POLICY "Admin can manage academic years" ON public.academic_years FOR ALL USING (public.is_admin_or_directivo(auth.uid()));

CREATE POLICY "Anyone can view levels" ON public.levels FOR SELECT USING (true);
CREATE POLICY "Admin can manage levels" ON public.levels FOR ALL USING (public.is_admin_or_directivo(auth.uid()));

CREATE POLICY "Anyone can view grades" ON public.grades FOR SELECT USING (true);
CREATE POLICY "Admin can manage grades" ON public.grades FOR ALL USING (public.is_admin_or_directivo(auth.uid()));

CREATE POLICY "Anyone can view groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Admin can manage groups" ON public.groups FOR ALL USING (public.is_admin_or_directivo(auth.uid()));

-- POLÍTICAS DE ALUMNOS
CREATE POLICY "Staff can view all students" ON public.students FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Teachers can view assigned students" ON public.students FOR SELECT USING (public.has_role(auth.uid(), 'profesor'));
CREATE POLICY "Parents can view their children" ON public.students FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.guardians g
    JOIN public.student_guardians sg ON g.id = sg.guardian_id
    WHERE sg.student_id = students.id AND g.user_id = auth.uid()
  )
);
CREATE POLICY "Students can view own data" ON public.students FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Staff can manage students" ON public.students FOR ALL USING (public.is_staff(auth.uid()));

-- POLÍTICAS DE TUTORES
CREATE POLICY "Staff can view all guardians" ON public.guardians FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Guardians can view own data" ON public.guardians FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Staff can manage guardians" ON public.guardians FOR ALL USING (public.is_staff(auth.uid()));

-- POLÍTICAS DE RELACIÓN ALUMNO-TUTOR
CREATE POLICY "Staff can view student guardians" ON public.student_guardians FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage student guardians" ON public.student_guardians FOR ALL USING (public.is_staff(auth.uid()));

-- POLÍTICAS DE INSCRIPCIONES
CREATE POLICY "Staff can view enrollments" ON public.enrollments FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Teachers can view enrollments" ON public.enrollments FOR SELECT USING (public.has_role(auth.uid(), 'profesor'));
CREATE POLICY "Staff can manage enrollments" ON public.enrollments FOR ALL USING (public.is_staff(auth.uid()));

-- POLÍTICAS DE MATERIAS
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Admin can manage subjects" ON public.subjects FOR ALL USING (public.is_admin_or_directivo(auth.uid()));

-- POLÍTICAS DE ASIGNACIONES DE PROFESORES
CREATE POLICY "Staff can view teacher assignments" ON public.teacher_assignments FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Teachers can view own assignments" ON public.teacher_assignments FOR SELECT USING (teacher_user_id = auth.uid());
CREATE POLICY "Admin can manage teacher assignments" ON public.teacher_assignments FOR ALL USING (public.is_admin_or_directivo(auth.uid()));

-- POLÍTICAS DE PERIODOS DE EVALUACIÓN
CREATE POLICY "Anyone can view evaluation periods" ON public.evaluation_periods FOR SELECT USING (true);
CREATE POLICY "Admin can manage evaluation periods" ON public.evaluation_periods FOR ALL USING (public.is_admin_or_directivo(auth.uid()));

-- POLÍTICAS DE GRADEBOOKS
CREATE POLICY "Teachers can manage own gradebooks" ON public.gradebooks FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.teacher_assignments ta
    WHERE ta.id = gradebooks.teacher_assignment_id AND ta.teacher_user_id = auth.uid()
  )
);
CREATE POLICY "Staff can view gradebooks" ON public.gradebooks FOR SELECT USING (public.is_staff(auth.uid()));

-- POLÍTICAS DE CALIFICACIONES
CREATE POLICY "Teachers can manage grades in own gradebooks" ON public.student_grades FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.gradebooks gb
    JOIN public.teacher_assignments ta ON gb.teacher_assignment_id = ta.id
    WHERE gb.id = student_grades.gradebook_id AND ta.teacher_user_id = auth.uid()
  )
);
CREATE POLICY "Staff can view all grades" ON public.student_grades FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Students can view published grades" ON public.student_grades FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.gradebooks gb WHERE gb.id = student_grades.gradebook_id AND gb.status = 'publicado'
  )
);
CREATE POLICY "Parents can view children published grades" ON public.student_grades FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.guardians g
    JOIN public.student_guardians sg ON g.id = sg.guardian_id
    WHERE sg.student_id = student_grades.student_id AND g.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.gradebooks gb WHERE gb.id = student_grades.gradebook_id AND gb.status = 'publicado'
  )
);

-- POLÍTICAS DE PLANES DE PAGO
CREATE POLICY "Staff can view fee plans" ON public.fee_plans FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin can manage fee plans" ON public.fee_plans FOR ALL USING (public.is_admin_or_directivo(auth.uid()));

-- POLÍTICAS DE CALENDARIO DE PAGOS
CREATE POLICY "Staff can view payment schedule" ON public.payment_schedule FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage payment schedule" ON public.payment_schedule FOR ALL USING (public.is_staff(auth.uid()));
CREATE POLICY "Parents can view children payment schedule" ON public.payment_schedule FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    JOIN public.students s ON e.student_id = s.id
    JOIN public.student_guardians sg ON s.id = sg.student_id
    JOIN public.guardians g ON sg.guardian_id = g.id
    WHERE e.id = payment_schedule.enrollment_id AND g.user_id = auth.uid()
  )
);

-- POLÍTICAS DE DESCUENTOS
CREATE POLICY "Staff can view discounts" ON public.discounts FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin can manage discounts" ON public.discounts FOR ALL USING (public.is_admin_or_directivo(auth.uid()));

-- POLÍTICAS DE PAGOS
CREATE POLICY "Staff can view payments" ON public.payments FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can create payments" ON public.payments FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admin can manage payments" ON public.payments FOR UPDATE USING (public.is_admin_or_directivo(auth.uid()));
CREATE POLICY "Parents can view children payments" ON public.payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    JOIN public.students s ON e.student_id = s.id
    JOIN public.student_guardians sg ON s.id = sg.student_id
    JOIN public.guardians g ON sg.guardian_id = g.id
    WHERE e.id = payments.enrollment_id AND g.user_id = auth.uid()
  )
);

-- POLÍTICAS DE DOCUMENTOS
CREATE POLICY "Staff can view document requirements" ON public.document_requirements FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin can manage document requirements" ON public.document_requirements FOR ALL USING (public.is_admin_or_directivo(auth.uid()));

CREATE POLICY "Staff can view student documents" ON public.student_documents FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage student documents" ON public.student_documents FOR ALL USING (public.is_staff(auth.uid()));

-- POLÍTICAS DE COMENTARIOS
CREATE POLICY "Staff can view comments based on role" ON public.student_comments FOR SELECT USING (
  public.is_staff(auth.uid())
  AND (
    NOT is_private 
    OR author_id = auth.uid()
    OR public.get_user_roles(auth.uid()) && visible_to_roles
  )
);
CREATE POLICY "Staff can create comments" ON public.student_comments FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Authors can update own comments" ON public.student_comments FOR UPDATE USING (author_id = auth.uid());

-- POLÍTICAS DE AVISOS
CREATE POLICY "Anyone can view published announcements" ON public.announcements FOR SELECT USING (is_published = true);
CREATE POLICY "Staff can view all announcements" ON public.announcements FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin can manage announcements" ON public.announcements FOR ALL USING (public.is_admin_or_directivo(auth.uid()));

CREATE POLICY "Users can mark announcements as read" ON public.announcement_reads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own reads" ON public.announcement_reads FOR SELECT USING (auth.uid() = user_id);

-- POLÍTICAS DE AUDITORÍA
CREATE POLICY "Admin can view audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin_or_directivo(auth.uid()));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Insertar niveles educativos
INSERT INTO public.levels (name, order_index) VALUES
  ('Kinder', 1),
  ('Primaria', 2),
  ('Secundaria', 3),
  ('Preparatoria', 4);

-- Insertar grados por nivel
INSERT INTO public.grades (level_id, name, order_index)
SELECT l.id, g.name, g.order_index
FROM public.levels l
CROSS JOIN (
  VALUES 
    ('1°', 1), ('2°', 2), ('3°', 3)
) AS g(name, order_index)
WHERE l.name = 'Kinder';

INSERT INTO public.grades (level_id, name, order_index)
SELECT l.id, g.name, g.order_index
FROM public.levels l
CROSS JOIN (
  VALUES 
    ('1°', 1), ('2°', 2), ('3°', 3), ('4°', 4), ('5°', 5), ('6°', 6)
) AS g(name, order_index)
WHERE l.name = 'Primaria';

INSERT INTO public.grades (level_id, name, order_index)
SELECT l.id, g.name, g.order_index
FROM public.levels l
CROSS JOIN (
  VALUES 
    ('1°', 1), ('2°', 2), ('3°', 3)
) AS g(name, order_index)
WHERE l.name IN ('Secundaria', 'Preparatoria');

-- Insertar ciclo escolar activo
INSERT INTO public.academic_years (name, start_date, end_date, is_active) VALUES
  ('2024-2025', '2024-08-15', '2025-07-15', true),
  ('2025-2026', '2025-08-15', '2026-07-15', false);

-- Insertar periodos de evaluación para el ciclo activo
INSERT INTO public.evaluation_periods (academic_year_id, name, order_index, start_date, end_date)
SELECT ay.id, p.name, p.order_index, p.start_date::date, p.end_date::date
FROM public.academic_years ay
CROSS JOIN (
  VALUES 
    ('1er Bimestre', 1, '2024-08-15', '2024-10-15'),
    ('2do Bimestre', 2, '2024-10-16', '2024-12-15'),
    ('3er Bimestre', 3, '2025-01-06', '2025-02-28'),
    ('4to Bimestre', 4, '2025-03-01', '2025-04-30'),
    ('5to Bimestre', 5, '2025-05-01', '2025-07-15')
) AS p(name, order_index, start_date, end_date)
WHERE ay.is_active = true;

-- Insertar materias de ejemplo
INSERT INTO public.subjects (name, code, level_id)
SELECT s.name, s.code, l.id
FROM (
  VALUES 
    ('Español', 'ESP', 'Primaria'),
    ('Matemáticas', 'MAT', 'Primaria'),
    ('Ciencias Naturales', 'CN', 'Primaria'),
    ('Historia', 'HIS', 'Primaria'),
    ('Geografía', 'GEO', 'Primaria'),
    ('Educación Física', 'EF', 'Primaria'),
    ('Artes', 'ART', 'Primaria'),
    ('Inglés', 'ING', 'Primaria'),
    ('Español', 'ESP', 'Secundaria'),
    ('Matemáticas', 'MAT', 'Secundaria'),
    ('Ciencias', 'CIE', 'Secundaria'),
    ('Historia', 'HIS', 'Secundaria'),
    ('Formación Cívica', 'FC', 'Secundaria'),
    ('Inglés', 'ING', 'Secundaria'),
    ('Tecnología', 'TEC', 'Secundaria')
) AS s(name, code, level_name)
JOIN public.levels l ON l.name = s.level_name;

-- Insertar documentos requeridos por nivel
INSERT INTO public.document_requirements (level_id, name, is_required, order_index)
SELECT l.id, d.name, d.is_required, d.order_index
FROM public.levels l
CROSS JOIN (
  VALUES 
    ('Acta de nacimiento', true, 1),
    ('CURP', true, 2),
    ('Fotografías', true, 3),
    ('Cartilla de vacunación', true, 4),
    ('Comprobante de domicilio', false, 5)
) AS d(name, is_required, order_index)
WHERE l.name = 'Kinder';

INSERT INTO public.document_requirements (level_id, name, is_required, order_index)
SELECT l.id, d.name, d.is_required, d.order_index
FROM public.levels l
CROSS JOIN (
  VALUES 
    ('Acta de nacimiento', true, 1),
    ('CURP', true, 2),
    ('Fotografías', true, 3),
    ('Boleta del ciclo anterior', true, 4),
    ('Comprobante de domicilio', false, 5),
    ('Certificado médico', false, 6)
) AS d(name, is_required, order_index)
WHERE l.name IN ('Primaria', 'Secundaria', 'Preparatoria');