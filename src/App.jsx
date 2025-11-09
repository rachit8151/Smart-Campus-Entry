import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Alert from "./components/Alert";
import UniAdminDash from "./components/UniAdminDash";
import HODDash from "./components/HODDash";
import UniAdminProfile from "./components/UniAdminProfile";
import Logout from "./components/Logout";
import ForgetPassword from "./components/ForgetPassword";
import ChangePassword from "./components/ChangePassword";
import BulkStudentInsert from "./components/BulkStudentInsert";
import RegisterGuest from "./components/RegisterGuest";
import GuestApprovals from "./components/GuestApprovals";
import HODProfile from "./components/HODProfile";
import ManageHODs from "./components/ManageHODs";
import GuardDash from "./components/GuardDash";
import GuardProfile from "./components/GuardProfile";
import StudentAdmission from "./components/StudentAdmission";
import GuardSearchStudent from "./components/GuardSearchStudent";

function App() {
  const [alert, setAlert] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🧩 Show alert for success/error
  const showAlert = (message, type) => {
    setAlert({ msg: message, type: type });
    setTimeout(() => setAlert(null), 2000);
  };

  // 🧠 Check if user already logged in (via localStorage token)
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <Router>
      {/* ✅ Common Navbar + Alerts */}
      <Navbar isLoggedIn={isLoggedIn} />
      <Alert alert={alert} />

      {/* ✅ Define Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        <Route
          path="/login"
          element={<Login showAlert={showAlert} setIsLoggedIn={setIsLoggedIn} />}
        />

        <Route
          path="/signup"
          element={<Signup showAlert={showAlert} />}
        />

        <Route path="/UniAdminDash" element={<UniAdminDash />} />
        <Route path="/HODDash" element={<HODDash />} />
        <Route path="/GuardDash" element={<GuardDash />} />
        <Route path="/UniAdminProfile" element={<UniAdminProfile showAlert={showAlert} />} />
        <Route path="/HODProfile" element={<HODProfile showAlert={showAlert} />} />
        <Route path="/GuardProfile" element={<GuardProfile showAlert={showAlert} />} />
        <Route
          path="/logout"
          element={<Logout showAlert={showAlert} setIsLoggedIn={setIsLoggedIn} />}
        />

        <Route path="/forgetPassword" element={<ForgetPassword />} />
        <Route
          path="/changePassword"
          element={<ChangePassword showAlert={showAlert} />}
        />

        <Route path="/BulkStudentInsert" element={<BulkStudentInsert />} />

        <Route path="/RegisterGuest" element={<RegisterGuest />} />
        <Route path="/GuestApprovals" element={<GuestApprovals />} />

        <Route path="/manageHODs" element={<ManageHODs />} />

        <Route path="/StudentAdmission" element={<StudentAdmission />} />

        <Route path="/guardSearchStudent" element={<GuardSearchStudent />} />
      </Routes>
    </Router>
  );
}

export default App;
