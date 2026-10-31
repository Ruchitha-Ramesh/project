
import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL ="https://project-qcsh.vercel.app";

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("attendance");

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  async function generateReport() {
    if (!startDate || !endDate) {
      setError("Please select both From Date and To Date.");
      return;
    }

    if (startDate > endDate) {
      setError("From Date cannot be after To Date.");
      return;
    }

    setLoading(true);
    setError("");
    setGenerated(false);

    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        reportType,
      });

      const response = await fetch(
        `${API_URL}/api/reports?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate report.");
      }

      setRecords(data.records || []);
      setSummary(data.summary || null);
      setGenerated(true);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the backend. Check whether it is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    if (!records.length) return;

    const columns = Object.keys(records[0]);

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csv = [
      columns.map(escapeCSV).join(","),
      ...records.map((record) =>
        columns.map((column) => escapeCSV(record[column])).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `attendance-report-${startDate}-to-${endDate}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/admin"
          className="mb-6 inline-block text-blue-600 hover:underline"
        >
          ← Back to Admin Dashboard
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-800">
            Attendance Reports
          </h1>

          <p className="mt-2 text-slate-500">
            Generate reports using attendance records from your database.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="reportType"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Report Type
              </label>

              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              >
                <option value="attendance">Attendance Summary</option>
                <option value="student">Student-wise Report</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                From Date
              </label>

              <input
                id="startDate"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                To Date
              </label>

              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={generateReport}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>

            {generated && records.length > 0 && (
              <button
                type="button"
                onClick={downloadCSV}
                className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Download CSV
              </button>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {generated && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-800">
                Report Results
              </h2>

              {summary && (
                <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[
                    ["Total Records", summary.totalRecords],
                    ["Present", summary.present],
                    ["Absent", summary.absent],
                    ["Late", summary.late],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-sm text-slate-500">{label}</p>
                      <p className="mt-2 text-2xl font-bold text-slate-800">
                        {value ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {records.length > 0 ? (
                <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        {Object.keys(records[0]).map((column) => (
                          <th
                            key={column}
                            className="whitespace-nowrap px-4 py-3 font-semibold"
                          >
                            {column.replace(/_/g, " ")}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {records.map((record, index) => (
                        <tr
                          key={record.attendance_id ?? index}
                          className="border-t border-slate-200"
                        >
                          {Object.keys(records[0]).map((column) => (
                            <td
                              key={column}
                              className="whitespace-nowrap px-4 py-3 text-slate-600"
                            >
                              {record[column] ?? "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-5 rounded-lg bg-slate-50 p-5 text-slate-600">
                  No attendance records found for the selected dates.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
