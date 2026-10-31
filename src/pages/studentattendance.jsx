import { useState } from "react";

export default function StudentAttendance() {
  const [locationStatus, setLocationStatus] = useState("");
  const [message, setMessage] = useState("");

  function turnOnLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setMessage("Your browser does not support location services.");
      return;
    }

    setLocationStatus("checking");
    setMessage("Checking your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus("verified");
        setMessage(
          `Location detected. Accuracy: ±${Math.round(
            position.coords.accuracy
          )} metres.`
        );
      },
      () => {
        setLocationStatus("error");
        setMessage(
          "Unable to access location. Please allow location permission and try again."
        );
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
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-800">
          Mark Attendance
        </h1>

        <p className="mt-2 text-slate-500">
          Enable your location to begin attendance verification.
        </p>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            College Location Verification
          </h2>

          <button
            onClick={turnOnLocation}
            disabled={locationStatus === "checking"}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:bg-slate-400"
          >
            {locationStatus === "checking"
              ? "Checking Location..."
              : "📍 Turn On Location"}
          </button>

          {message && (
  <p role="status" className="mt-4 text-sm text-slate-700">
    {message}
  </p>
)}

<button
  type="button"
  disabled={locationStatus !== "verified"}
  onClick={() => {
    setMessage(
      "Location detected! Next, we need to verify the college location and connect attendance saving to the backend."
    );
  }}
  className="mt-5 w-full rounded-lg bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
>
  ✓ Mark My Attendance
</button>
        </div>
      </div>
    </div>
  );
}