
-- Mobile Attendance Tracker
-- Tested database queries
-- Database: attendance_db

-- 1. View all users (admin and students)
SELECT user_id, name, email, role
FROM users
ORDER BY user_id;


-- 2. View attendance records for a particular student
-- Example: student_id = 2
SELECT attendance_date, check_in_time, status
FROM attendance
WHERE student_id = 2
ORDER BY attendance_date DESC;


-- 3. Admin attendance report
-- Displays student details and their attendance records
SELECT
    u.user_id,
    u.name,
    u.email,
    a.attendance_date,
    a.check_in_time,
    a.status
FROM users u
JOIN attendance a
    ON u.user_id = a.student_id
WHERE u.role = 'student'
ORDER BY a.attendance_date DESC;


-- 4. Attendance summary
-- Counts attendance records by status
SELECT status, COUNT(*) AS total
FROM attendance
GROUP BY status;


-- 5. Insert an attendance record
-- Example only: run only when a new record is needed.
-- Do not rerun for a student who already has a record
-- for the current date.
-- INSERT INTO attendance (student_id, status)
-- VALUES (2, 'present');


-- =========================================
-- 1. USERS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('admin', 'student'))
);

-- =========================================
-- 2. STUDENT DETAILS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.student_details (
    student_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    contact VARCHAR(15),
    course VARCHAR(100) NOT NULL,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration INTEGER NOT NULL,
    CONSTRAINT fk_student_user
        FOREIGN KEY (user_id)
        REFERENCES public.users(user_id)
);

-- =========================================
-- 3. ADMIN DETAILS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.admin_details (
    admin_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    contact VARCHAR(15),
    designation VARCHAR(100) NOT NULL,
    date_of_join DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_admin_user
        FOREIGN KEY (user_id)
        REFERENCES public.users(user_id)
);

-- =========================================
-- 4. SAMPLE USER ACCOUNTS
-- Demo password hashes are placeholders,
-- not usable login passwords.
-- =========================================

INSERT INTO public.users (name, email, password_hash, role)
VALUES
('Rahul Kumar', 'rahul.demo@example.com', 'DEMO_ONLY', 'student'),
('Priya Sharma', 'priya.demo@example.com', 'DEMO_ONLY', 'student'),
('Arun Kumar', 'arun.admin.demo@example.com', 'DEMO_ONLY', 'admin'),
('Meena Devi', 'meena.admin.demo@example.com', 'DEMO_ONLY', 'admin')
ON CONFLICT (email) DO NOTHING;

-- =========================================
-- 5. INSERT STUDENT DETAILS
-- IDs are looked up from users by email.
-- =========================================

INSERT INTO public.student_details
(user_id, first_name, last_name, contact, course, enrollment_date, duration)
SELECT u.user_id, d.first_name, d.last_name, d.contact,
       d.course, d.enrollment_date, d.duration
FROM (
    VALUES
    ('rahul.demo@example.com', 'Rahul', 'Kumar',
     '9876543210', 'BCA', DATE '2026-06-15', 3),
    ('priya.demo@example.com', 'Priya', 'Sharma',
     '9876543211', 'BCA', DATE '2026-06-20', 3)
) AS d(email, first_name, last_name, contact, course, enrollment_date, duration)
JOIN public.users u ON u.email = d.email AND u.role = 'student'
ON CONFLICT (user_id) DO NOTHING;

-- =========================================
-- 6. INSERT ADMIN DETAILS
-- IDs are looked up from users by email.
-- =========================================

INSERT INTO public.admin_details
(user_id, first_name, last_name, contact, designation, date_of_join)
SELECT u.user_id, d.first_name, d.last_name, d.contact,
       d.designation, d.date_of_join
FROM (
    VALUES
    ('arun.admin.demo@example.com', 'Arun', 'Kumar',
     '9876543212', 'System Administrator', DATE '2025-01-10'),
    ('meena.admin.demo@example.com', 'Meena', 'Devi',
     '9876543213', 'HR Administrator', DATE '2025-03-15')
) AS d(email, first_name, last_name, contact, designation, date_of_join)
JOIN public.users u ON u.email = d.email AND u.role = 'admin'
ON CONFLICT (user_id) DO NOTHING;

-- =========================================
-- 7. VERIFY INSERTED RECORDS
-- =========================================

SELECT * FROM public.users ORDER BY user_id;
SELECT * FROM public.student_details ORDER BY student_id;
SELECT * FROM public.admin_details ORDER BY admin_id;
