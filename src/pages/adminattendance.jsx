import { useState } from "react";
import { Link } from "react-router-dom";

export default function AdminAttendance() {
  const [locationStatus, setLocationStatus] = useState("Not checked");
  const [message, setMessage] = useState("");

  function checkLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Unavailable");
      setMessage("Your browser does not support location services.");
      return;
    }

    if (!window.isSecureContext) {
      setLocationStatus("Unavailable");
      setMessage("Location access requires HTTPS or a trusted local environment.");
      return;
    }

    setLocationStatus("Checking...");
    setMessage("Checking your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus("Location detected");
        setMessage(
          `Location detected with accuracy of approximately ${Math.round(
            position.coords.accuracy
          )} metres.`
        );
      },
      (error) => {
        setLocationStatus("Failed");

        if (error.code === 1) {
          setMessage("Location permission was denied. Allow location access in your browser.");
        } else if (error.code === 2) {
          setMessage("Location unavailable. Check your device location settings.");
        } else if (error.code === 3) {
          setMessage("Location request timed out. Please try again.");
        } else {
          setMessage("Unable to retrieve your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin"
          className="mb-6 inline-block text-blue-600 hover:underline"
        >
          ← Back to Admin Dashboard
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-800">
            Mark Attendance
          </h1>

          <p className="mt-2 text-slate-500">
            Admin attendance management with location verification.
          </p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-3xl">📍</div>

            <h2 className="mt-3 text-lg font-semibold text-slate-800">
              Location Tracking
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Check the current location of the device being used by the admin.
            </p>

            <p className="mt-4 font-medium text-slate-700">
              Status: {locationStatus}
            </p>

            <button
              type="button"
              onClick={checkLocation}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              📍 Check Location
            </button>

            {message && (
              <p
                role="status"
                aria-live="polite"
                className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800"
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}