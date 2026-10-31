const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const db = require("./db");


const app = express();

console.log("SERVER FILE:", __filename);
console.log("RUNNING FROM:", process.cwd());
console.log("EXPRESS VERSION:", require("express/package.json").version);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const attendanceRoutes = require("./attendanceRoutes");
app.use("/api/attendance", attendanceRoutes);

app.get("/api/reports-test", (req, res) => {
  res.json({ message: "Reports route is reachable!" });
});
app.get("/api/ping", (req, res) => {
  res.send("PING WORKS");
});

console.log(
  "Registered routes:",
  app.router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods),
    }))
);
 // --------------------------------------------------
 // Attendance Reports
 // --------------------------------------------------
app.get("/api/reports", async (req, res) => {
  try {
    const { startDate, endDate, reportType = "attendance" } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "From Date and To Date are required.",
      });
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
      startDate > endDate
    ) {
      return res.status(400).json({
        message: "Please provide a valid date range.",
      });
    }

    if (!["attendance", "student"].includes(reportType)) {
      return res.status(400).json({
        message: "Invalid report type.",
      });
    }

    const result = await db.query(
      `SELECT
         a.attendance_id,
         a.student_id,
         u.name,
         a.attendance_date,
         a.check_in_time,
         LOWER(a.status) AS status
       FROM attendance a
       JOIN users u ON u.user_id = a.student_id
       WHERE u.role = 'student'
         AND a.attendance_date BETWEEN $1::date AND $2::date
       ORDER BY
         CASE WHEN $3 = 'student' THEN u.name END ASC,
         a.attendance_date DESC,
         a.check_in_time DESC NULLS LAST`,
      [startDate, endDate, reportType]
    );

    const records = result.rows;

    const summary = {
      totalRecords: records.length,
      present: records.filter(
        (r) => r.status === "present"
      ).length,
      absent: records.filter(
        (r) => r.status === "absent"
      ).length,
      late: records.filter(
        (r) => r.status === "late"
      ).length,
    };

    return res.json({
      summary,
      records,
    });
  } catch (error) {
    console.error("Attendance reports error:", error.message);

    return res.status(500).json({
      message: "Unable to generate attendance report.",
    });
  }
});

// --------------------------------------------------
// Home
// --------------------------------------------------
app.get("/", (req, res) => {
  res.send("AttendEase Backend is running!");
});

// --------------------------------------------------
// Test PostgreSQL connection
// --------------------------------------------------
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT current_database()");

    res.json({
      message: "Database connected successfully!",
      database: result.rows[0].current_database,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      message: "Database connection failed.",
    });
  }
});

// --------------------------------------------------
// List existing database tables
// --------------------------------------------------
app.get("/api/tables", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tables:", error.message);

    res.status(500).json({
      message: "Could not fetch tables.",
    });
  }
});

// --------------------------------------------------
// Login
// --------------------------------------------------
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password, and role are required.",
      });
    }

    const result = await db.query(
      `SELECT user_id, name, email, password_hash, role
       FROM users
       WHERE LOWER(email) = LOWER($1)
         AND role = $2`,
      [email.trim(), role.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email, password, or role.",
      });
    }

    const user = result.rows[0];

    if (!user.password_hash.startsWith("$2")) {
      return res.status(401).json({
        message: "This account needs secure password setup before login.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email, password, or role.",
      });
    }

    res.json({
      message: "Login successful!",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "An internal server error occurred.",
    });
  }
});

// --------------------------------------------------
// Admin dashboard
// --------------------------------------------------
app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const studentResult = await db.query(`
      SELECT COUNT(*) AS total_students
      FROM users
      WHERE role = 'student'
    `);

    const attendanceResult = await db.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE status = 'present'
        ) AS present_today,
        COUNT(*) FILTER (
          WHERE status = 'absent'
        ) AS absent_today,
        COUNT(*) FILTER (
          WHERE status IN ('present', 'late')
        ) AS attended_today,
        COUNT(*) AS total_marked_today
      FROM attendance
      WHERE attendance_date = CURRENT_DATE
    `);

    const recentResult = await db.query(`
      SELECT
        u.user_id AS student_id,
        u.name AS student_name,
        a.attendance_date AS date,
        a.status
      FROM attendance a
      JOIN users u ON u.user_id = a.student_id
      WHERE u.role = 'student'
      ORDER BY
        a.attendance_date DESC,
        a.check_in_time DESC NULLS LAST
      LIMIT 10
    `);

    const attendance = attendanceResult.rows[0];
    const totalMarked = Number(attendance.total_marked_today);
    const attended = Number(attendance.attended_today);

    res.json({
      stats: {
        totalStudents: Number(studentResult.rows[0].total_students),
        presentToday: Number(attendance.present_today),
        absentToday: Number(attendance.absent_today),
        attendanceRate:
          totalMarked > 0
            ? Math.round((attended / totalMarked) * 100)
            : 0,
      },
      records: recentResult.rows,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);

    res.status(500).json({
      message: "Unable to load admin dashboard data.",
    });
  }
});

// --------------------------------------------------
// Get all students from PostgreSQL
// Used by the admin's Student Profile Update dropdown
// --------------------------------------------------
app.get("/api/students", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.user_id,
        u.name,
        u.email,
        s.student_id,
        s.first_name,
        s.last_name,
        s.course
      FROM users u
      JOIN student_details s ON s.user_id = u.user_id
      WHERE u.role = 'student'
      ORDER BY s.first_name ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch students error:", error.message);

    res.status(500).json({
      message: "Unable to fetch students.",
    });
  }
});

// --------------------------------------------------
// Student attendance
// --------------------------------------------------
app.get("/api/student/attendance/:studentId", async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(400).json({
        message: "Invalid student ID.",
      });
    }

    const studentResult = await db.query(
      `SELECT user_id, name
       FROM users
       WHERE user_id = $1 AND role = 'student'`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Student account not found.",
      });
    }

    const summaryResult = await db.query(
      `SELECT
         COUNT(*) AS total_classes,
         COUNT(*) FILTER (
           WHERE LOWER(status) = 'present'
         ) AS present_days,
         COUNT(*) FILTER (
           WHERE LOWER(status) = 'absent'
         ) AS absent_days,
         COUNT(*) FILTER (
           WHERE LOWER(status) IN ('present', 'late')
         ) AS attended_classes
       FROM attendance
       WHERE student_id = $1`,
      [studentId]
    );

    const summary = summaryResult.rows[0];
    const totalClasses = Number(summary.total_classes);
    const attendedClasses = Number(summary.attended_classes);

    const recordsResult = await db.query(
      `SELECT
         attendance_id AS id,
         attendance_date AS date,
         check_in_time,
         status
       FROM attendance
       WHERE student_id = $1
       ORDER BY
         attendance_date DESC,
         check_in_time DESC NULLS LAST
       LIMIT 20`,
      [studentId]
    );

    res.json({
      studentName: studentResult.rows[0].name,
      summary: {
        totalClasses,
        presentDays: Number(summary.present_days),
        absentDays: Number(summary.absent_days),
        attendanceRate:
          totalClasses > 0
            ? Math.round((attendedClasses / totalClasses) * 100)
            : 0,
      },
      records: recordsResult.rows.map((record) => ({
        ...record,
        subject: null,
      })),
    });
  } catch (error) {
    console.error("Student attendance error:", error.message);

    res.status(500).json({
      message: "Unable to load student attendance.",
    });
  }
});

// --------------------------------------------------
// Get one student's profile
// --------------------------------------------------
app.get("/api/student/profile/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const result = await db.query(
      `SELECT
         u.user_id,
         u.name,
         u.email,
         s.student_id,
         s.first_name,
         s.last_name,
         s.contact,
         s.course,
         s.enrollment_date,
         s.duration
       FROM users u
       LEFT JOIN student_details s ON s.user_id = u.user_id
       WHERE u.user_id = $1
         AND u.role = 'student'`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student account not found.",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Student profile error:", error.message);

    res.status(500).json({
      message: "Unable to load student profile.",
    });
  }
});

// --------------------------------------------------
// Register a new student
// Saves to the existing users and student_details tables
// --------------------------------------------------
app.post("/api/students/register", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    contact,
    course,
    enrollment_date,
    duration,
  } = req.body;

  if (
    typeof first_name !== "string" ||
    !first_name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password ||
    typeof course !== "string" ||
    !course.trim() ||
    duration === undefined ||
    duration === null ||
    String(duration).trim() === ""
  ) {
    return res.status(400).json({
      message: "First name, email, password, course, and duration are required.",
    });
  }

  const parsedDuration = Number(duration);

  if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
    return res.status(400).json({
      message: "Duration must be a positive whole number.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must contain at least 8 characters.",
    });
  }

  if (
    last_name != null &&
    typeof last_name !== "string"
  ) {
    return res.status(400).json({
      message: "Last name must be text.",
    });
  }

  if (
    contact != null &&
    typeof contact !== "string"
  ) {
    return res.status(400).json({
      message: "Contact must be text.",
    });
  }

  if (
    enrollment_date &&
    !/^\d{4}-\d{2}-\d{2}$/.test(enrollment_date)
  ) {
    return res.status(400).json({
      message: "Enrollment date must use YYYY-MM-DD format.",
    });
  }

  let client;

  try {
    client = await db.pool.connect();

    await client.query("BEGIN");

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await client.query(
      "SELECT user_id FROM users WHERE LOWER(email) = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'student')
       RETURNING user_id, name, email, role`,
      [
        `${first_name.trim()} ${last_name?.trim() || ""}`.trim(),
        normalizedEmail,
        passwordHash,
      ]
    );

    const newUser = userResult.rows[0];

    const studentResult = await client.query(
      `INSERT INTO student_details
         (user_id, first_name, last_name, contact, course,
          enrollment_date, duration)
       VALUES ($1, $2, $3, $4, $5,
               COALESCE($6::date, CURRENT_DATE), $7)
       RETURNING student_id, user_id, first_name, last_name,
                 contact, course, enrollment_date, duration`,
      [
        newUser.user_id,
        first_name.trim(),
        last_name?.trim() || null,
        contact?.trim() || null,
        course.trim(),
        enrollment_date || null,
        parsedDuration,
      ]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Student registered successfully.",
      user: newUser,
      student: studentResult.rows[0],
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Student registration error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "An account or student profile already exists.",
      });
    }

    if (error.code === "22P02" || error.code === "22007") {
      return res.status(400).json({
        message: "Please check the enrollment date and duration.",
      });
    }

    return res.status(500).json({
      message: "Unable to register student.",
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// --------------------------------------------------
// Start server
// --------------------------------------------------
// --------------------------------------------------
// Start server
// --------------------------------------------------
app.listen(PORT, () => {
  console.log(`AttendEase server running on port ${PORT}`);
});