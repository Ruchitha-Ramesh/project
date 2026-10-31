import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  contact: "",
  course: "",
  enrollment_date: "",
  duration: "",
};

export default function StudentProfile() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const isAdmin = user?.role === "admin";

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(
    isAdmin ? "" : String(user?.user_id ?? "")
  );
  const [form, setForm] = useState(emptyForm);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [message, setMessage] = useState("");

  // Redirect if nobody is logged in.
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Load students for the admin dropdown.
  useEffect(() => {
    if (!isAdmin) return;

    const loadStudents = async () => {
      setLoadingStudents(true);
      setMessage("");

      try {
        const response = await fetch(
          "http://localhost:5000/api/students"
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load students."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("The server returned an invalid student list.");
        }

        setStudents(data);

        if (data.length === 0) {
          setMessage("No students were found in the database.");
        }
      } catch (error) {
        setMessage(error.message || "Unable to load students.");
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [isAdmin]);

  // Load the selected student's profile.
  useEffect(() => {
    if (!user || !selectedStudentId) {
      setForm(emptyForm);
      return;
    }

    const loadProfile = async () => {
      setLoadingProfile(true);
      setMessage("");

      try {
        const response = await fetch(
          `http://localhost:5000/api/student/profile/${selectedStudentId}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load profile."
          );
        }

        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          contact: data.contact || "",
          course: data.course || "",
          enrollment_date: data.enrollment_date
            ? String(data.enrollment_date).slice(0, 10)
            : "",
          duration: data.duration ?? "",
        });
      } catch (error) {
        setForm(emptyForm);
        setMessage(error.message || "Unable to connect to the backend.");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user, selectedStudentId]);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage(
    "Next, we'll connect this form to the student registration API."
  );
};

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 text-[#1e293b] max-sm:p-3">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Student Profile Update
            </h1>
            <p className="mt-2 text-sm text-[#64748b]">
              {isAdmin
                ? "View and update student profile details."
                : "View and update your profile details."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(isAdmin ? "/admin" : "/student")}
            className="rounded-lg bg-[#0f172a] px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            ← Back to Dashboard
          </button>
        </header>

        <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          {isAdmin && (
            <div className="mb-5">
              <label
                htmlFor="studentSelect"
                className="mb-2 block text-sm font-semibold"
              >
                Select Student
              </label>

              <select
                id="studentSelect"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-3"
              >
                <option value="">Choose a student</option>

                {students.map((student) => (
                  <option
                    key={student.user_id}
                    value={String(student.user_id)}
                  >
                    {student.name} — {student.email}
                  </option>
                ))}
              </select>

              {loadingStudents && (
                <p className="mt-2 text-sm text-slate-500">
                  Loading students...
                </p>
              )}

              {!loadingStudents && students.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  {students.length} student(s) loaded.
                </p>
              )}
            </div>
          )}

          {loadingProfile && (
            <p className="mb-4 text-sm text-slate-500">
              Loading profile...
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              {[
                ["first_name", "First Name"],
                ["last_name", "Last Name"],
                ["email", "Email Address"],
                ["contact", "Phone Number"],
                ["course", "Course / Department"],
                ["enrollment_date", "Enrollment Date"],
                ["duration", "Course Duration"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label
                    htmlFor={name}
                    className="mb-2 block text-sm font-semibold"
                  >
                    {label}
                  </label>

                  <input
                    id={name}
                    name={name}
                    type={
                      name === "email"
                        ? "email"
                        : name === "enrollment_date"
                        ? "date"
                        : "text"
                    }
                    value={form[name]}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={
                loadingProfile ||
                loadingStudents ||
                !selectedStudentId
              }
              className="mt-6 rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Save Profile
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              {message}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}