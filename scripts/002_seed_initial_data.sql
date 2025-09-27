-- Seed initial data for the attendance system
-- Insert comprehensive test data for all academic levels

-- First Year Subjects
INSERT INTO public.subjects (name, code, year_level, semester, credits, description) VALUES
('Western Rules & Solfege 1', 'WRS101', 1, 1, 3, 'Introduction to Western music theory and sight-singing'),
('Western Rules & Solfege 2', 'WRS102', 1, 2, 3, 'Continuation of Western music theory and sight-singing'),
('Rhythmic Movement 1', 'RM101', 1, 1, 2, 'Basic rhythmic patterns and movement coordination'),
('Music History 1', 'MH101', 1, 1, 2, 'Overview of Western music history - Ancient to Medieval'),
('Piano Basics', 'PB101', 1, 1, 2, 'Introduction to piano playing and basic techniques');

-- Second Year Subjects  
INSERT INTO public.subjects (name, code, year_level, semester, credits, description) VALUES
('Western Rules & Solfege 3', 'WRS201', 2, 1, 3, 'Advanced music theory - Harmony and counterpoint'),
('Western Rules & Solfege 4', 'WRS202', 2, 2, 3, 'Advanced sight-singing and dictation'),
('Hymn Singing', 'HS201', 2, 1, 2, 'Religious music and hymn interpretation'),
('Rhythmic Movement 2', 'RM201', 2, 2, 2, 'Advanced rhythmic patterns and conducting'),
('Music History 2', 'MH201', 2, 2, 2, 'Renaissance to Baroque period music history');

-- Third Year Subjects
INSERT INTO public.subjects (name, code, year_level, semester, credits, description) VALUES
('Western Rules & Solfege 5', 'WRS301', 3, 1, 3, 'Complex harmonic analysis and composition'),
('Improvisation 1', 'IMP301', 3, 1, 2, 'Basic improvisation techniques and jazz theory'),
('Conducting Techniques', 'CT301', 3, 1, 3, 'Basic conducting patterns and score reading'),
('Music Education Methods', 'MEM301', 3, 2, 3, 'Teaching methodologies for music education'),
('Chamber Music', 'CM301', 3, 2, 2, 'Small ensemble performance and collaboration');

-- Fourth Year Subjects
INSERT INTO public.subjects (name, code, year_level, semester, credits, description) VALUES
('Western Rules & Solfege 6', 'WRS401', 4, 1, 3, 'Advanced composition and analysis'),
('Improvisation 2', 'IMP401', 4, 2, 2, 'Advanced improvisation and performance'),
('Music Technology', 'MT401', 4, 1, 2, 'Digital audio workstations and music production'),
('Graduation Project', 'GP401', 4, 2, 4, 'Final capstone project in music education'),
('Professional Practice', 'PP401', 4, 2, 2, 'Internship and professional development');

-- Sample test users data (these will be created when users register)
-- Note: Actual user creation happens through Supabase Auth, but we can prepare test data

-- Test data for demonstration purposes
-- This creates sample attendance sessions and records for testing

-- First, let's add some sample QR code data patterns
-- These will be used when creating actual attendance sessions

-- Create sample notification templates
INSERT INTO public.notifications (user_id, title, message, type, action_url) 
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid, -- Placeholder, will be updated with real user IDs
  'Welcome to Music Education System',
  'Your account has been successfully created. Start by exploring your subjects and attendance records.',
  'success',
  '/dashboard'
WHERE NOT EXISTS (SELECT 1 FROM public.notifications WHERE title = 'Welcome to Music Education System');

-- Sample grades structure for demonstration
-- Will be populated when actual students and instructors are created
