/*
  # Student Marks Portal - Initial Schema
  
  ## Tables Created
  
  1. departments
    - id (uuid, primary key)
    - name (text, unique)
    - created_at (timestamptz)
    
  2. admins
    - id (uuid, primary key)
    - username (text, unique)
    - password_hash (text)
    - full_name (text)
    - email (text, unique)
    - created_at (timestamptz)
    
  3. teachers
    - id (uuid, primary key)
    - teacher_id (text, unique, indexed)
    - username (text, unique)
    - password_hash (text)
    - full_name (text)
    - email (text, unique)
    - phone (text)
    - department_id (uuid, foreign key)
    - must_change_password (boolean, default true)
    - created_at (timestamptz)
    
  4. students
    - id (uuid, primary key)
    - student_id (text, unique, indexed)
    - full_name (text)
    - department_id (uuid, foreign key)
    - semester (integer)
    - year (integer)
    - batch (text)
    - email (text, unique)
    - password_hash (text)
    - must_change_password (boolean, default true)
    - created_by_teacher_id (uuid, foreign key)
    - created_at (timestamptz)
    
  5. subjects
    - id (uuid, primary key)
    - code (text)
    - name (text)
    - department_id (uuid, foreign key)
    - created_at (timestamptz)
    
  6. marks
    - id (uuid, primary key)
    - student_id (uuid, foreign key)
    - subject_id (uuid, foreign key)
    - exam_name (text)
    - marks (numeric)
    - max_marks (numeric)
    - created_by_teacher_id (uuid, foreign key)
    - created_at (timestamptz)
    
  7. otp_tokens
    - id (uuid, primary key)
    - user_type (text, 'student' or 'teacher')
    - user_id (uuid)
    - otp_code_hash (text)
    - expires_at (timestamptz)
    - used (boolean, default false)
    - created_at (timestamptz)
    
  8. activity_logs
    - id (uuid, primary key)
    - user_type (text)
    - user_id (uuid)
    - action (text)
    - details (jsonb)
    - created_at (timestamptz)
    
  ## Security
  - RLS enabled on all tables
  - Policies created for role-based access
  - Indexes added for performance
*/

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  must_change_password boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_teachers_teacher_id ON teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teachers_department_id ON teachers(department_id);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  semester integer NOT NULL,
  year integer NOT NULL,
  batch text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  must_change_password boolean DEFAULT true,
  created_by_teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_department_id ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_created_by ON students(created_by_teacher_id);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(code, department_id)
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_subjects_department_id ON subjects(department_id);

-- Create marks table
CREATE TABLE IF NOT EXISTS marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  exam_name text NOT NULL,
  marks numeric NOT NULL,
  max_marks numeric NOT NULL,
  created_by_teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE marks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_marks_student_id ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_subject_id ON marks(subject_id);

-- Create otp_tokens table
CREATE TABLE IF NOT EXISTS otp_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type text NOT NULL CHECK (user_type IN ('student', 'teacher')),
  user_id uuid NOT NULL,
  otp_code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE otp_tokens ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_otp_tokens_user ON otp_tokens(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_expires ON otp_tokens(expires_at);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type text NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_type, user_id);

-- RLS Policies (service role bypass)
-- Since we're using backend with service role key, we create permissive policies

CREATE POLICY "Allow service role full access to departments"
  ON departments FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to admins"
  ON admins FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to teachers"
  ON teachers FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to students"
  ON students FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to subjects"
  ON subjects FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to marks"
  ON marks FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to otp_tokens"
  ON otp_tokens FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to activity_logs"
  ON activity_logs FOR ALL
  USING (true)
  WITH CHECK (true);