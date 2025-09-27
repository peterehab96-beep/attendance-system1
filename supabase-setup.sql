-- =================================================================
-- SUPABASE DATABASE SETUP FOR MUSIC EDUCATION ATTENDANCE SYSTEM
-- Faculty of Specific Education - Zagazig University
-- Dr. Peter Ehab
-- =================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- 1. USER PROFILES TABLE
-- =================================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student')) DEFAULT 'student',
  academic_level TEXT CHECK (academic_level IN ('First Year', 'Second Year', 'Third Year', 'Fourth Year')),
  subjects TEXT[], -- Array of subject names for students
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================
-- 2. SUBJECTS TABLE
-- =================================================================
CREATE TABLE public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  academic_level TEXT NOT NULL CHECK (academic_level IN ('First Year', 'Second Year', 'Third Year', 'Fourth Year')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert subjects for each academic level
INSERT INTO public.subjects (name, academic_level, description) VALUES
-- First Year
('Western Rules & Solfege 1', 'First Year', 'Introduction to Western music theory and sight-singing'),
('Western Rules & Solfege 2', 'First Year', 'Advanced Western music theory and sight-singing'),
('Rhythmic Movement 1', 'First Year', 'Basic rhythmic movement and dance'),

-- Second Year  
('Western Rules & Solfege 3', 'Second Year', 'Intermediate Western music theory'),
('Western Rules & Solfege 4', 'Second Year', 'Advanced Western music theory'),
('Hymn Singing', 'Second Year', 'Religious and traditional hymn performance'),
('Rhythmic Movement 2', 'Second Year', 'Advanced rhythmic movement and choreography'),

-- Third Year
('Western Rules & Solfege 5', 'Third Year', 'Advanced Western music theory and composition'),
('Improvisation 1', 'Third Year', 'Basic musical improvisation techniques'),

-- Fourth Year
('Western Rules & Solfege 6', 'Fourth Year', 'Master level Western music theory'),
('Improvisation 2', 'Fourth Year', 'Advanced musical improvisation and composition');

-- =================================================================
-- 3. STUDENT SUBJECTS (ENROLLMENT) TABLE  
-- =================================================================
CREATE TABLE public.student_subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- =================================================================
-- 4. ATTENDANCE SESSIONS TABLE
-- =================================================================
CREATE TABLE public.attendance_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_name TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_level TEXT NOT NULL,
  qr_code_data TEXT NOT NULL,
  secure_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- =================================================================
-- 5. ATTENDANCE RECORDS TABLE
-- =================================================================
CREATE TABLE public.attendance_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('present', 'late', 'absent')) DEFAULT 'present',
  score DECIMAL(5,2) DEFAULT 10.00,
  scan_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(session_id, student_id)
);

-- =================================================================
-- 6. GRADES TABLE
-- =================================================================
CREATE TABLE public.grades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  attendance_score DECIMAL(5,2) DEFAULT 0,
  midterm_score DECIMAL(5,2) DEFAULT 0,
  final_score DECIMAL(5,2) DEFAULT 0,
  total_score DECIMAL(5,2) DEFAULT 0,
  letter_grade TEXT,
  semester TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, subject_id, semester, academic_year)
);

-- =================================================================
-- 7. NOTIFICATIONS TABLE
-- =================================================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('attendance', 'login', 'registration', 'grade', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================
-- 8. SYSTEM SETTINGS TABLE
-- =================================================================
CREATE TABLE public.system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('qr_expiry_minutes', '30', 'QR code expiry time in minutes'),
('max_attendance_score', '10', 'Maximum score for attendance'),
('attendance_weight', '0.3', 'Weight of attendance in final grade'),
('session_timeout_hours', '24', 'Session timeout in hours');

-- =================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- PROFILES POLICIES
-- =================================================================
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =================================================================
-- SUBJECTS POLICIES  
-- =================================================================
CREATE POLICY "Everyone can view subjects" ON public.subjects
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage subjects" ON public.subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =================================================================
-- STUDENT SUBJECTS POLICIES
-- =================================================================
CREATE POLICY "Students can view own enrollments" ON public.student_subjects
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can enroll in subjects" ON public.student_subjects
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can manage all enrollments" ON public.student_subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =================================================================
-- ATTENDANCE SESSIONS POLICIES
-- =================================================================
CREATE POLICY "Students can view active sessions" ON public.attendance_sessions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all sessions" ON public.attendance_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =================================================================
-- ATTENDANCE RECORDS POLICIES
-- =================================================================
CREATE POLICY "Students can view own attendance" ON public.attendance_records
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can mark own attendance" ON public.attendance_records
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can view all attendance" ON public.attendance_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =================================================================
-- GRADES POLICIES
-- =================================================================
CREATE POLICY "Students can view own grades" ON public.grades
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage all grades" ON public.grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =================================================================
-- NOTIFICATIONS POLICIES
-- =================================================================
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- =================================================================
-- SYSTEM SETTINGS POLICIES
-- =================================================================
CREATE POLICY "Everyone can view settings" ON public.system_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =================================================================
-- FUNCTIONS AND TRIGGERS
-- =================================================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
-- REMOVED: SECURITY DEFINER for better security
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, academic_level)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
    COALESCE(NEW.raw_user_meta_data ->> 'academic_level', 'Second Year')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER grades_updated_at
  BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =================================================================
-- INDEXES FOR PERFORMANCE
-- =================================================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_academic_level ON public.profiles(academic_level);
CREATE INDEX idx_subjects_academic_level ON public.subjects(academic_level);
CREATE INDEX idx_attendance_sessions_active ON public.attendance_sessions(is_active);
CREATE INDEX idx_attendance_sessions_expires ON public.attendance_sessions(expires_at);
CREATE INDEX idx_attendance_records_student ON public.attendance_records(student_id);
CREATE INDEX idx_attendance_records_session ON public.attendance_records(session_id);
CREATE INDEX idx_grades_student_subject ON public.grades(student_id, subject_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read);

-- =================================================================
-- SECURE VIEWS WITH PROPER RLS
-- =================================================================

-- View for student attendance summary (SECURITY INVOKER - respects user permissions)
CREATE VIEW public.student_attendance_summary 
WITH (security_invoker=true) AS
SELECT 
  p.id as student_id,
  p.full_name as student_name,
  p.academic_level,
  s.name as subject_name,
  COUNT(ar.id) as total_sessions_attended,
  AVG(ar.score) as average_score,
  MAX(ar.scan_timestamp) as last_attendance
FROM public.profiles p
JOIN public.student_subjects ss ON p.id = ss.student_id
JOIN public.subjects s ON ss.subject_id = s.id
LEFT JOIN public.attendance_records ar ON p.id = ar.student_id AND s.id = ar.subject_id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.academic_level, s.name, s.id;

-- Add RLS policy for the view
ALTER VIEW public.student_attendance_summary OWNER TO postgres;
GRANT SELECT ON public.student_attendance_summary TO authenticated;

-- View for active sessions (SECURITY INVOKER - respects user permissions)
CREATE VIEW public.active_sessions 
WITH (security_invoker=true) AS
SELECT 
  ats.id,
  ats.session_name,
  s.name as subject_name,
  ats.academic_level,
  ats.expires_at,
  ats.created_at,
  p.full_name as created_by_name,
  COUNT(ar.id) as attendees_count
FROM public.attendance_sessions ats
JOIN public.subjects s ON ats.subject_id = s.id
JOIN public.profiles p ON ats.created_by = p.id
LEFT JOIN public.attendance_records ar ON ats.id = ar.session_id
WHERE ats.is_active = true AND ats.expires_at > NOW()
GROUP BY ats.id, ats.session_name, s.name, ats.academic_level, ats.expires_at, ats.created_at, p.full_name;

-- Add RLS policy for the view
ALTER VIEW public.active_sessions OWNER TO postgres;
GRANT SELECT ON public.active_sessions TO authenticated;

-- =================================================================
-- SAMPLE DATA FOR TESTING
-- =================================================================

-- Insert sample subjects if they don't exist
INSERT INTO public.subjects (name, academic_level, description) 
SELECT * FROM (VALUES
  ('Music Theory Advanced', 'Third Year', 'Advanced music theory concepts'),
  ('Performance Practice', 'Fourth Year', 'Professional performance techniques')
) AS v(name, academic_level, description)
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = v.name);

COMMENT ON TABLE public.profiles IS 'User profiles for students and administrators';
COMMENT ON TABLE public.subjects IS 'Academic subjects offered by the music education faculty';
COMMENT ON TABLE public.attendance_sessions IS 'QR code attendance sessions created by administrators';
COMMENT ON TABLE public.attendance_records IS 'Individual student attendance records';
COMMENT ON TABLE public.grades IS 'Student grades and performance records';
COMMENT ON TABLE public.notifications IS 'System notifications for users';

-- =================================================================
-- END OF SETUP SCRIPT
-- =================================================================