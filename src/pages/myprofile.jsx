import { Link } from "react-router-dom";

export default function MyProfile() {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/student"
          className="mb-6 inline-block text-blue-600 hover:underline"
        >
          ← Back to Student Dashboard
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-800">
            My Profile
          </h1>

          <p className="mt-2 text-slate-500">
            View your personal and academic details.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="font-semibold text-slate-800">
                Loading from your profile...
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Student ID</p>
              <p className="font-semibold text-slate-800">—</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-semibold text-slate-800">—</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Department</p>
              <p className="font-semibold text-slate-800">—</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}