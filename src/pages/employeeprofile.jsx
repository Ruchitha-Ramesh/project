import { useState } from "react";
import { Link } from "react-router-dom";

export default function EmployeeProfile() {
  const [form, setForm] = useState({
    name: "",
    employeeId: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMessage("Profile form submitted. Database saving will be connected next.");
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/admin"
          className="mb-6 inline-block text-blue-600 hover:underline"
        >
          ← Back to Admin Dashboard
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-800">
            Employee Profile Update
          </h1>
          <p className="mt-2 text-slate-500">
            Enter the employee details below.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {[
              { label: "Employee Name", name: "name", type: "text" },
              { label: "Employee ID", name: "employeeId", type: "text" },
              { label: "Email Address", name: "email", type: "email" },
              { label: "Phone Number", name: "phone", type: "tel" },
              { label: "Department", name: "department", type: "text" },
              { label: "Designation", name: "designation", type: "text" },
            ].map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            ))}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Update Employee Profile
            </button>
          </form>

          {message && (
            <p role="status" className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}