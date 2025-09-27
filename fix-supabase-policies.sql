-- =================================================================
-- CORRECTED SUPABASE DATABASE SETUP FOR MUSIC EDUCATION ATTENDANCE SYSTEM
-- Faculty of Specific Education - Zagazig University  
-- Dr. Peter Ehab
-- =================================================================

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.student_subjects;

-- Temporarily disable RLS to fix the tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings DISABLE ROW LEVEL SECURITY;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.profiles (
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

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  academic_level TEXT NOT NULL CHECK (academic_level IN ('First Year', 'Second Year', 'Third Year', 'Fourth Year')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert subjects if they don't exist
INSERT INTO public.subjects (name, academic_level, description) 
SELECT * FROM (VALUES
  ('Western Rules & Solfege 1', 'First Year', 'Introduction to Western music theory and sight-singing'),
  ('Western Rules & Solfege 2', 'First Year', 'Advanced Western music theory and sight-singing'),
  ('Rhythmic Movement 1', 'First Year', 'Basic rhythmic movement and dance'),
  ('Western Rules & Solfege 3', 'Second Year', 'Intermediate Western music theory'),
  ('Western Rules & Solfege 4', 'Second Year', 'Advanced Western music theory'),
  ('Hymn Singing', 'Second Year', 'Religious and traditional hymn performance'),
  ('Rhythmic Movement 2', 'Second Year', 'Advanced rhythmic movement and choreography'),
  ('Western Rules & Solfege 5', 'Third Year', 'Advanced Western music theory and composition'),
  ('Improvisation 1', 'Third Year', 'Basic musical improvisation techniques'),
  ('Western Rules & Solfege 6', 'Fourth Year', 'Master level Western music theory'),
  ('Improvisation 2', 'Fourth Year', 'Advanced musical improvisation and composition')
) AS v(name, academic_level, description)
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = v.name);

CREATE TABLE IF NOT EXISTS public.student_subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

CREATE TABLE IF NOT EXISTS public.attendance_sessions (
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

CREATE TABLE IF NOT EXISTS public.attendance_records (
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

CREATE TABLE IF NOT EXISTS public.grades (
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

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('attendance', 'login', 'registration', 'grade', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system settings if they don't exist
INSERT INTO public.system_settings (setting_key, setting_value, description) 
SELECT * FROM (VALUES
  ('qr_expiry_minutes', '30', 'QR code expiry time in minutes'),
  ('max_attendance_score', '10', 'Maximum score for attendance'),
  ('attendance_weight', '0.3', 'Weight of attendance in final grade'),
  ('session_timeout_hours', '24', 'Session timeout in hours')
) AS v(setting_key, setting_value, description)
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings WHERE setting_key = v.setting_key);

-- =================================================================
-- SIMPLIFIED RLS POLICIES (NO RECURSION)
-- =================================================================

-- Enable RLS with simple, non-recursive policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Simple policies that don't cause recursion
CREATE POLICY "Allow all operations for authenticated users" ON public.profiles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to subjects" ON public.subjects
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage subjects" ON public.subjects
  FOR ALL USING (auth.role() = 'authenticated');

-- For other tables, allow authenticated access for now
ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.student_subjects
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.attendance_sessions
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.attendance_records
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.grades
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.notifications
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.system_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(student_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Enable realtime for key tables (optional)
ALTER publication supabase_realtime ADD table public.attendance_records;
ALTER publication supabase_realtime ADD table public.notifications;