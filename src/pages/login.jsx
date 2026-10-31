import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");

    // Backend authentication will be connected in a later step.
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userId.trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Invalid login credentials.");
        return;
      }
localStorage.setItem("user", JSON.stringify(data.user));
      // Navigate according to the role verified by the backend.
      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "student") {
        navigate("/student");
      } else {
        localStorage.removeItem("user");
        setMessage("Your account role is not recognized.");
      }
    } catch (error) {
      setMessage(
        "Cannot connect to the server. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-container">
        <div className="login-logo">🎓</div>

        <h1>Welcome Back!</h1>

        <p className="login-subtitle">
          Student Attendance
          <br />
          Management System
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="role">Login As</label>

          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          <label htmlFor="email">email address</label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email ID"
            autoComplete="username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In →"}
          </button>

          <p className="login-message" role="status">
            {message}
          </p>
        </form>

        <footer className="login-footer">
          Student Attendance Management System
        </footer>
      </section>
    </main>
  );
}