import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import AdminDashboard from "./pages/admindashboard.jsx";
import StudentDashboard from "./pages/studentdashboard.jsx";
import StudentProfile from "./pages/studentprofile.jsx";
import StudentAttendance from "./pages/studentattendance.jsx";
import AdminAttendance from "./pages/adminattendance.jsx";
import EmployeeProfile from "./pages/employeeprofile.jsx";
import Reports from "./pages/reports.jsx";
import MyProfile from "./pages/myprofile.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
        <Route
          path="/student"
          element={<StudentDashboard />}
        />
         <Route
          path="/student-profile"
          element={<StudentProfile />}
        />
        <Route
  path="/student-attendance"
  element={<StudentAttendance />}
/>
<Route
  path="/attendance"
  element={<AdminAttendance />}
/>
<Route
          path="/employees"
          element={<EmployeeProfile />}
        />
        <Route
  path="/reports"
  element={<Reports />}
/>
<Route path="/my-profile" element={<MyProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;