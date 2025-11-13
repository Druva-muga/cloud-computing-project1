import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/LoginPage/Login";
import Register from "./pages/RegisterPage/Register";
import Overview from "./pages/OverviewPage/Overview";
import AdminDashboard from "./pages/AdminDashboardPage/AdminDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import FaceAttendance from "./pages/FaceAttendancePage/FaceAttendance";
import RegisterFace from "./pages/FaceAttendancePage/RegisterFace";



function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Router>
          <Navbar />
          <div className="content-wrap">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Overview />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/face-attendance" element={<FaceAttendance />} />
              <Route path="/register-face" element={<RegisterFace />} />
            </Routes>
          </div>
          <Footer />
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
