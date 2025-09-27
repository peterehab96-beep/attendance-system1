-- Sample Test Data Generator for Immediate Testing
-- Dr. Peter Ehab - Music Education Attendance System
-- Run this script in Supabase SQL Editor to create test data

-- Clean up existing test data (optional)
-- DELETE FROM public.attendance_records WHERE student_id LIKE '%test%';
-- DELETE FROM public.attendance_sessions WHERE instructor_id LIKE '%test%';
-- DELETE FROM public.grades WHERE student_id LIKE '%test%';
-- DELETE FROM public.notifications WHERE user_id LIKE '%test%';
-- DELETE FROM public.student_subjects WHERE student_id LIKE '%test%';
-- DELETE FROM public.profiles WHERE email LIKE '%test%';

-- Create test user profiles (simulating registered users)
INSERT INTO public.profiles (id, full_name, email, student_id, role, year_level, phone, is_active) VALUES
-- Test Students
('11111111-1111-1111-1111-111111111111', 'أحمد حسن محمد', 'ahmed.hassan@test.zu.edu.eg', 'MU2024001', 'student', 2, '+201234567890', true),
('22222222-2222-2222-2222-222222222222', 'فاطمة علي أحمد', 'fatima.ali@test.zu.edu.eg', 'MU2024002', 'student', 1, '+201234567891', true),
('33333333-3333-3333-3333-333333333333', 'عمر محمد سالم', 'omar.mohamed@test.zu.edu.eg', 'MU2024003', 'student', 3, '+201234567892', true),
('44444444-4444-4444-4444-444444444444', 'مريم أحمد حسن', 'mariam.ahmed@test.zu.edu.eg', 'MU2024004', 'student', 4, '+201234567893', true),
('55555555-5555-5555-5555-555555555555', 'محمد عبدالله', 'mohamed.abdullah@test.zu.edu.eg', 'MU2024005', 'student', 1, '+201234567894', true),
-- Test Instructor
('66666666-6666-6666-6666-666666666666', 'د. سارة محمود', 'dr.sarah@test.zu.edu.eg', NULL, 'instructor', NULL, '+201234567895', true),
-- Test Admin
('77777777-7777-7777-7777-777777777777', 'إدارة النظام', 'admin@test.zu.edu.eg', NULL, 'admin', NULL, '+201234567896', true)
ON CONFLICT (id) DO NOTHING;

-- Update subjects to assign instructor
UPDATE public.subjects 
SET instructor_id = '66666666-6666-6666-6666-666666666666'
WHERE code IN ('WRS101', 'WRS201', 'WRS301', 'RM101', 'IMP301');

-- Create student subject enrollments
INSERT INTO public.student_subjects (student_id, subject_id) 
SELECT 
  p.id as student_id,
  s.id as subject_id
FROM public.profiles p
CROSS JOIN public.subjects s
WHERE p.role = 'student' 
  AND s.year_level = p.year_level
  AND p.email LIKE '%test%'
ON CONFLICT (student_id, subject_id) DO NOTHING;

-- Create test attendance sessions
INSERT INTO public.attendance_sessions (id, subject_id, instructor_id, session_date, session_time, session_type, location, qr_code, is_active, expires_at) 
SELECT 
  uuid_generate_v4() as id,
  s.id as subject_id,
  '66666666-6666-6666-6666-666666666666' as instructor_id,
  CURRENT_DATE as session_date,
  '10:00:00'::time as session_time,
  'lecture' as session_type,
  CASE 
    WHEN s.code LIKE 'WRS%' THEN 'قاعة النظريات الموسيقية'
    WHEN s.code LIKE 'RM%' THEN 'استوديو الحركة الإيقاعية'
    WHEN s.code LIKE 'IMP%' THEN 'قاعة الارتجال'
    ELSE 'القاعة الرئيسية'
  END as location,
  json_build_object(
    'sessionId', uuid_generate_v4(),
    'timestamp', extract(epoch from now()),
    'subject', s.code,
    'instructor', 'dr.sarah@test.zu.edu.eg'
  )::text as qr_code,
  true as is_active,
  (now() + interval '2 hours') as expires_at
FROM public.subjects s
WHERE s.code IN ('WRS101', 'WRS201', 'WRS301', 'RM101', 'IMP301')
LIMIT 5;

-- Create test attendance records
INSERT INTO public.attendance_records (session_id, student_id, check_in_time, location, device_info, is_verified)
SELECT 
  att_s.id as session_id,
  p.id as student_id,
  (now() - interval '1 hour') as check_in_time,
  att_s.location,
  json_build_object(
    'userAgent', 'Mozilla/5.0 (Test Browser)',
    'platform', 'Web',
    'timestamp', extract(epoch from now())
  )::text as device_info,
  true as is_verified
FROM public.attendance_sessions att_s
CROSS JOIN public.profiles p
JOIN public.subjects s ON att_s.subject_id = s.id
WHERE p.role = 'student' 
  AND p.year_level = s.year_level
  AND p.email LIKE '%test%'
  AND random() > 0.3  -- 70% attendance rate
LIMIT 10;

-- Create test grades
INSERT INTO public.grades (student_id, subject_id, grade_type, score, max_score, grade_date, comments)
SELECT 
  p.id as student_id,
  s.id as subject_id,
  grade_types.type as grade_type,
  (random() * 40 + 60)::numeric(5,2) as score,  -- Random score between 60-100
  100 as max_score,
  (CURRENT_DATE - interval '1 week') as grade_date,
  CASE 
    WHEN grade_types.type = 'حضور' THEN 'درجة الحضور والمشاركة'
    WHEN grade_types.type = 'امتحان منتصف الفصل' THEN 'امتحان نظري وعملي'
    WHEN grade_types.type = 'مشروع' THEN 'مشروع فردي'
    WHEN grade_types.type = 'امتحان نهائي' THEN 'الامتحان النهائي'
    ELSE 'تقييم عام'
  END as comments
FROM public.profiles p
CROSS JOIN public.subjects s
CROSS JOIN (
  SELECT unnest(ARRAY['حضور', 'امتحان منتصف الفصل', 'مشروع', 'امتحان نهائي']) as type
) as grade_types
JOIN public.student_subjects ss ON p.id = ss.student_id AND s.id = ss.subject_id
WHERE p.role = 'student' AND p.email LIKE '%test%'
LIMIT 20;

-- Create test notifications
INSERT INTO public.notifications (user_id, title, message, type, is_read, action_url)
SELECT 
  p.id as user_id,
  notifications.title,
  notifications.message,
  notifications.type,
  (random() > 0.7) as is_read,  -- 30% read rate
  notifications.action_url
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('مرحباً بك في النظام', 'تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الحضور ومتابعة درجاتك.', 'success', '/dashboard'),
    ('جلسة حضور جديدة', 'تم إنشاء جلسة حضور جديدة لمادة القواعد الغربية والصولفيج', 'info', '/attendance'),
    ('درجة جديدة', 'تم رفع درجة امتحان منتصف الفصل', 'success', '/grades'),
    ('تذكير هام', 'لا تنس تسجيل حضورك في الجلسة القادمة', 'warning', '/sessions'),
    ('تحديث النظام', 'تم تحديث النظام بميزات جديدة', 'info', '/updates')
) as notifications(title, message, type, action_url)
WHERE p.email LIKE '%test%'
LIMIT 15;

-- Create additional sample data for better testing

-- Add more recent attendance sessions (last 7 days)
INSERT INTO public.attendance_sessions (subject_id, instructor_id, session_date, session_time, session_type, location, qr_code, is_active)
SELECT 
  s.id as subject_id,
  '66666666-6666-6666-6666-666666666666' as instructor_id,
  (CURRENT_DATE - interval '1 day' * generate_series(1, 7)) as session_date,
  (array['09:00:00', '11:00:00', '13:00:00', '15:00:00'])[1 + mod(abs(hashtext(s.code)), 4)]::time as session_time,
  (array['lecture', 'practical', 'seminar'])[1 + mod(abs(hashtext(s.code)), 3)] as session_type,
  s.name || ' - ' || CASE 
    WHEN mod(abs(hashtext(s.code)), 3) = 0 THEN 'القاعة الرئيسية'
    WHEN mod(abs(hashtext(s.code)), 3) = 1 THEN 'المعمل العملي'
    ELSE 'قاعة السيمينار'
  END as location,
  json_build_object(
    'sessionId', uuid_generate_v4(),
    'timestamp', extract(epoch from now()),
    'subject', s.code
  )::text as qr_code,
  false as is_active  -- Past sessions are inactive
FROM public.subjects s
WHERE s.instructor_id = '66666666-6666-6666-6666-666666666666'
LIMIT 10;

-- Summary query to verify test data
SELECT 
  'Test Users' as category,
  count(*) as count
FROM public.profiles 
WHERE email LIKE '%test%'

UNION ALL

SELECT 
  'Total Subjects' as category,
  count(*) as count
FROM public.subjects

UNION ALL

SELECT 
  'Student Enrollments' as category,
  count(*) as count
FROM public.student_subjects ss
JOIN public.profiles p ON ss.student_id = p.id
WHERE p.email LIKE '%test%'

UNION ALL

SELECT 
  'Attendance Sessions' as category,
  count(*) as count
FROM public.attendance_sessions

UNION ALL

SELECT 
  'Attendance Records' as category,
  count(*) as count
FROM public.attendance_records ar
JOIN public.profiles p ON ar.student_id = p.id
WHERE p.email LIKE '%test%'

UNION ALL

SELECT 
  'Grade Records' as category,
  count(*) as count
FROM public.grades g
JOIN public.profiles p ON g.student_id = p.id
WHERE p.email LIKE '%test%'

UNION ALL

SELECT 
  'Notifications' as category,
  count(*) as count
FROM public.notifications n
JOIN public.profiles p ON n.user_id = p.id
WHERE p.email LIKE '%test%'

ORDER BY category;

-- Test data validation queries

-- 1. Check student enrollments by year
SELECT 
  p.year_level,
  p.full_name,
  count(ss.subject_id) as enrolled_subjects
FROM public.profiles p
LEFT JOIN public.student_subjects ss ON p.id = ss.student_id
WHERE p.role = 'student' AND p.email LIKE '%test%'
GROUP BY p.id, p.year_level, p.full_name
ORDER BY p.year_level, p.full_name;

-- 2. Check attendance rates
SELECT 
  p.full_name,
  s.name as subject_name,
  count(ar.id) as attendance_count,
  count(ats.id) as total_sessions,
  ROUND((count(ar.id)::float / NULLIF(count(ats.id), 0)) * 100, 2) as attendance_rate
FROM public.profiles p
JOIN public.student_subjects ss ON p.id = ss.student_id
JOIN public.subjects s ON ss.subject_id = s.id
LEFT JOIN public.attendance_sessions ats ON s.id = ats.subject_id
LEFT JOIN public.attendance_records ar ON ats.id = ar.session_id AND p.id = ar.student_id
WHERE p.role = 'student' AND p.email LIKE '%test%'
GROUP BY p.id, p.full_name, s.id, s.name
ORDER BY p.full_name, s.name;

-- 3. Check grade averages
SELECT 
  p.full_name,
  s.name as subject_name,
  count(g.id) as grade_count,
  ROUND(AVG(g.score), 2) as average_score,
  ROUND(AVG(g.percentage), 2) as average_percentage
FROM public.profiles p
JOIN public.grades g ON p.id = g.student_id
JOIN public.subjects s ON g.subject_id = s.id
WHERE p.role = 'student' AND p.email LIKE '%test%'
GROUP BY p.id, p.full_name, s.id, s.name
ORDER BY p.full_name, s.name;

-- Success message
SELECT 'Test data created successfully! ✅' as status,
       'You can now test all system functionality with the sample data.' as message;
"