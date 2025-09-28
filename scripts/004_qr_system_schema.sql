-- QR Code Attendance System Enhanced Schema
-- Adds missing tables and columns for complete QR functionality

-- Add missing columns to attendance_sessions table if they don't exist
DO $$ 
BEGIN
    -- Add qr_data column for storing QR code data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_sessions' AND column_name = 'qr_data') THEN
        ALTER TABLE public.attendance_sessions ADD COLUMN qr_data TEXT;
    END IF;
    
    -- Add academic_level column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_sessions' AND column_name = 'academic_level') THEN
        ALTER TABLE public.attendance_sessions ADD COLUMN academic_level TEXT;
    END IF;
    
    -- Add token column for security
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_sessions' AND column_name = 'token') THEN
        ALTER TABLE public.attendance_sessions ADD COLUMN token TEXT;
    END IF;
    
    -- Add subject_name for easier queries
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_sessions' AND column_name = 'subject_name') THEN
        ALTER TABLE public.attendance_sessions ADD COLUMN subject_name TEXT;
    END IF;
END $$;

-- Add missing columns to attendance_records table
DO $$ 
BEGIN
    -- Add method column to track how attendance was marked
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_records' AND column_name = 'method') THEN
        ALTER TABLE public.attendance_records ADD COLUMN method TEXT DEFAULT 'qr_scan' CHECK (method IN ('qr_scan', 'manual', 'biometric'));
    END IF;
    
    -- Add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_records' AND column_name = 'status') THEN
        ALTER TABLE public.attendance_records ADD COLUMN status TEXT DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent', 'excused'));
    END IF;
    
    -- Add grade_points column for automatic grading
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_records' AND column_name = 'grade_points') THEN
        ALTER TABLE public.attendance_records ADD COLUMN grade_points DECIMAL(5,2) DEFAULT 10.0;
    END IF;
END $$;

-- Add missing columns to profiles table for better student management
DO $$ 
BEGIN
    -- Add subjects array for student subjects
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subjects') THEN
        ALTER TABLE public.profiles ADD COLUMN subjects TEXT[];
    END IF;
    
    -- Add academic_level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'academic_level') THEN
        ALTER TABLE public.profiles ADD COLUMN academic_level TEXT;
    END IF;
END $$;

-- Create attendance_analytics view for better reporting
CREATE OR REPLACE VIEW public.attendance_analytics AS
SELECT 
    s.id as session_id,
    s.subject_name,
    s.academic_level,
    s.session_date,
    s.session_time,
    s.instructor_id,
    COUNT(ar.id) as total_attendees,
    COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN ar.status = 'late' THEN 1 END) as late_count,
    COUNT(CASE WHEN ar.method = 'qr_scan' THEN 1 END) as qr_scan_count,
    ROUND(AVG(ar.grade_points), 2) as avg_grade_points,
    s.created_at
FROM public.attendance_sessions s
LEFT JOIN public.attendance_records ar ON s.id = ar.session_id
WHERE s.is_active = true
GROUP BY s.id, s.subject_name, s.academic_level, s.session_date, s.session_time, s.instructor_id, s.created_at
ORDER BY s.created_at DESC;

-- Create student_attendance_summary view
CREATE OR REPLACE VIEW public.student_attendance_summary AS
SELECT 
    p.id as student_id,
    p.full_name,
    p.email,
    p.academic_level,
    COUNT(ar.id) as total_sessions_attended,
    COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_sessions,
    COUNT(CASE WHEN ar.status = 'late' THEN 1 END) as late_sessions,
    ROUND(AVG(ar.grade_points), 2) as avg_attendance_grade,
    SUM(ar.grade_points) as total_attendance_points,
    MAX(ar.check_in_time) as last_attendance
FROM public.profiles p
LEFT JOIN public.attendance_records ar ON p.id = ar.student_id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.email, p.academic_level
ORDER BY total_attendance_points DESC;

-- Create function to auto-assign attendance grade
CREATE OR REPLACE FUNCTION public.auto_assign_attendance_grade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    grade_points DECIMAL(5,2) := 10.0;
    session_record RECORD;
BEGIN
    -- Get session details
    SELECT subject_id, subject_name, academic_level INTO session_record
    FROM public.attendance_sessions 
    WHERE id = NEW.session_id;
    
    -- Calculate grade points based on timing
    IF NEW.status = 'present' THEN
        grade_points := 10.0;
    ELSIF NEW.status = 'late' THEN
        grade_points := 7.0;
    ELSE
        grade_points := 0.0;
    END IF;
    
    -- Set the grade points
    NEW.grade_points := grade_points;
    
    -- Insert into grades table for permanent record
    INSERT INTO public.grades (
        student_id,
        subject_id,
        grade_type,
        score,
        max_score,
        grade_date,
        comments
    ) VALUES (
        NEW.student_id,
        session_record.subject_id,
        'attendance',
        grade_points,
        10.0,
        CURRENT_DATE,
        'Attendance grade for ' || session_record.subject_name || ' - ' || NEW.status
    ) ON CONFLICT (student_id, subject_id, grade_date, grade_type) DO UPDATE
    SET score = EXCLUDED.score, comments = EXCLUDED.comments;
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic grade assignment
DROP TRIGGER IF EXISTS auto_assign_attendance_grade_trigger ON public.attendance_records;
CREATE TRIGGER auto_assign_attendance_grade_trigger
    BEFORE INSERT ON public.attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_attendance_grade();

-- Create function to expire old QR sessions
CREATE OR REPLACE FUNCTION public.expire_old_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.attendance_sessions 
    SET is_active = false 
    WHERE expires_at < NOW() AND is_active = true;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_active ON public.attendance_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_expires_at ON public.attendance_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session_student ON public.attendance_records(session_id, student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_academic_level ON public.profiles(academic_level);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.attendance_sessions TO authenticated;
GRANT SELECT, INSERT ON public.attendance_records TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.attendance_analytics TO authenticated;
GRANT SELECT ON public.student_attendance_summary TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.attendance_sessions IS 'Stores QR code attendance sessions created by instructors';
COMMENT ON COLUMN public.attendance_sessions.qr_data IS 'JSON string containing QR code data';
COMMENT ON COLUMN public.attendance_sessions.token IS 'Security token to prevent QR code forgery';
COMMENT ON COLUMN public.attendance_sessions.academic_level IS 'Academic level for the session';
COMMENT ON COLUMN public.attendance_sessions.subject_name IS 'Subject name for easier querying';

COMMENT ON TABLE public.attendance_records IS 'Records of student attendance marked via QR scanning';
COMMENT ON COLUMN public.attendance_records.method IS 'Method used to mark attendance (qr_scan, manual, biometric)';
COMMENT ON COLUMN public.attendance_records.status IS 'Attendance status (present, late, absent, excused)';
COMMENT ON COLUMN public.attendance_records.grade_points IS 'Points awarded for attendance';

COMMENT ON VIEW public.attendance_analytics IS 'Analytics view for attendance session statistics';
COMMENT ON VIEW public.student_attendance_summary IS 'Summary view of student attendance performance';