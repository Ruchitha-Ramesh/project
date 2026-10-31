import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: "—",
    presentToday: "—",
    absentToday: "—",
    attendanceRate: "—",
  });

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://project-qcsh.vercel.app/api/admin/dashboard",
          { signal: controller.signal }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load dashboard data."
          );
        }

        setStats({
          totalStudents: result.stats?.totalStudents ?? 0,
          presentToday: result.stats?.presentToday ?? 0,
          absentToday: result.stats?.absentToday ?? 0,
          attendanceRate: `${result.stats?.attendanceRate ?? 0}%`,
        });

        setRecords(
          Array.isArray(result.records) ? result.records : []
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Cannot connect to the backend."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => controller.abort();
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/");
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: "👨‍🎓",
      color: "border-t-[#60a5fa]",
      iconColor: "text-[#2563eb]",
    },
    {
      title: "Present Today",
      value: stats.presentToday,
      icon: "✓",
      color: "border-t-[#65ad7d]",
      iconColor: "text-[#65ad7d]",
    },
    {
      title: "Absent Today",
      value: stats.absentToday,
      icon: "✕",
      color: "border-t-[#bd4c53]",
      iconColor: "text-[#bd4c53]",
    },
    {
      title: "Attendance Rate",
      value: stats.attendanceRate,
      icon: "▤",
      color: "border-t-[#6478c5]",
      iconColor: "text-[#4169a8]",
    },
  ];

  const menuItems = [
    { label: "▦  Dashboard", to: "/admin", active: true },
    { label: "✓  Mark Attendance", to: "/attendance" },
    { label: "♙  Student Profile Update", to: "/student-profile" },
    { label: "♙  Employee Profile Update", to: "/employees" },
    { label: "▤  Reports", to: "/reports" },
  ];

  function formatDate(date) {
    if (!date) return "—";

    const dateText = String(date).slice(0, 10);
    const parsed = new Date(`${dateText}T12:00:00`);

    return Number.isNaN(parsed.getTime())
      ? dateText
      : parsed.toLocaleDateString();
  }

  function statusStyle(status) {
    switch (String(status || "").toLowerCase()) {
      case "present":
        return "bg-green-100 text-green-700";
      case "absent":
        return "bg-red-100 text-red-700";
      case "late":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc] font-[Arial,sans-serif] text-[#111827]">
      {/* Sidebar */}
      <aside className="flex min-h-screen w-[265px] shrink-0 flex-col bg-[#17243a] px-[16px] py-[26px] text-white max-md:w-[210px] max-sm:w-full max-sm:min-h-0">
        <div className="px-[12px] pb-[29px] pt-[3px] text-[20px] font-bold">
          🎓 Attend<span className="text-[#60a5fa]">Ease</span>
        </div>

        <div className="px-[10px] py-[10px] text-[12px] tracking-wide text-[#94a3b8]">
          MAIN MENU
        </div>

        <nav className="flex flex-col gap-[7px]">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`block rounded-[8px] px-[12px] py-[13px] text-[14px] leading-[1.4] no-underline transition-colors ${
                item.active
                  ? "bg-[#3278d4] text-white"
                  : "text-[#d1d9e6] hover:bg-[#293b56] hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-[8px] bg-[#30445f] px-3 py-[13px] text-sm text-white transition hover:bg-[#405674]"
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-[30px] max-lg:p-5 max-sm:p-3">
        {/* Header */}
        <header className="mb-[30px] flex items-center justify-between gap-4 max-sm:flex-wrap">
          <div>
            <h1 className="text-[26px] font-bold leading-tight text-[#111827] max-sm:text-[21px]">
              Admin Dashboard
            </h1>
            <p className="mt-[7px] text-[14px] text-[#374151]">
              Welcome back! Here's your attendance overview.
            </p>
          </div>

          <div className="shrink-0 rounded-[12px] bg-[#dbeafe] px-[16px] py-[12px] text-[14px] text-[#315b86]">
            👤 Administrator
          </div>
        </header>

        {/* Statistics */}
        <h2 className="mb-[18px] text-[19px] font-bold text-[#111827]">
          Today's Overview
        </h2>

        <section className="mb-[32px] grid grid-cols-4 gap-[18px] max-xl:grid-cols-2 max-sm:grid-cols-1">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className={`min-h-[165px] min-w-0 rounded-[14px] border border-[#e2e8f0] border-t-[5px] ${stat.color} bg-white px-[20px] py-[25px] shadow-[0_3px_12px_rgba(15,23,42,0.06)]`}
            >
              <div className={`mb-[17px] text-[28px] leading-none ${stat.iconColor}`}>
                {stat.icon}
              </div>
              <p className="mb-[10px] text-[14px] text-[#1f2937]">
                {stat.title}
              </p>
              <h3 className="text-[30px] font-bold leading-tight text-[#111827]">
                {loading ? "…" : stat.value}
              </h3>
            </div>
          ))}
        </section>

        {/* Recent Attendance */}
        <section className="mb-[30px] rounded-[14px] border border-[#e2e8f0] bg-white p-[24px] shadow-sm max-sm:p-3">
          <div className="mb-[23px] flex flex-wrap items-center justify-between gap-3">
  <h2 className="text-[19px] font-bold text-[#111827]">
    Recent Attendance
  </h2>

  <div className="flex flex-wrap gap-3">
    <Link
      to="/student-profile"
      className="inline-block rounded-[8px] bg-[#16a34a] px-[16px] py-[12px] text-[13px] text-white no-underline transition hover:bg-[#15803d]"
    >
      + Add New Student
    </Link>

    <Link
      to="/attendance"
      className="inline-block rounded-[8px] bg-[#2875c7] px-[16px] py-[12px] text-[13px] text-white no-underline transition hover:bg-[#1d5fa8]"
    >
      + Mark Attendance
    </Link>
  </div>
</div>
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[540px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="bg-[#f8fafc] px-[13px] py-[15px] text-[12px] font-semibold text-[#374151]">
                    STUDENT ID
                  </th>
                  <th className="bg-[#f8fafc] px-[13px] py-[15px] text-[12px] font-semibold text-[#374151]">
                    STUDENT NAME
                  </th>
                  <th className="bg-[#f8fafc] px-[13px] py-[15px] text-[12px] font-semibold text-[#374151]">
                    DATE
                  </th>
                  <th className="bg-[#f8fafc] px-[13px] py-[15px] text-[12px] font-semibold text-[#374151]">
                    STATUS
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-500">
                      Loading attendance records...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-500">
                      Attendance could not be loaded.
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-[22px] text-center text-[14px] text-[#6b7280]">
                      No attendance records to display.
                    </td>
                  </tr>
                ) : (
                  records.map((record, index) => (
                    <tr key={`${record.student_id}-${record.date}-${index}`}>
                      <td className="border-b border-[#e2e8f0] px-[13px] py-4 text-[13px]">
                        {record.student_id ?? "—"}
                      </td>
                      <td className="border-b border-[#e2e8f0] px-[13px] py-4 text-[13px]">
                        {record.student_name || "—"}
                      </td>
                      <td className="border-b border-[#e2e8f0] px-[13px] py-4 text-[13px]">
                        {formatDate(record.date)}
                      </td>
                      <td className="border-b border-[#e2e8f0] px-[13px] py-4 text-[13px]">
                        <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold capitalize ${statusStyle(record.status)}`}>
                          {record.status || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Reminder */}
        <section className="rounded-[9px] bg-[#eff6ff] px-[15px] py-[15px] text-[14px] leading-[1.6] text-[#1e40af]">
          <strong>📌 Admin Reminder</strong>
          <p className="mt-[2px]">
            Please mark attendance for the current date and save the records.
            Students can view their attendance but cannot mark it themselves.
          </p>
        </section>
      </main>
    </div>
  );
}