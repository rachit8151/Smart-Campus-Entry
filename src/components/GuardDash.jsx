import { Link, useNavigate } from "react-router-dom";
import "../css/Dashboard.css";
const GuardDash = () => {
  const username = sessionStorage.getItem("username");
  const sgId = sessionStorage.getItem("sgId");
  const regId = sessionStorage.getItem("regId");
  const navigate = useNavigate();
  console.log("🟢 Security Guard sgId:", sgId);

  const handleSearchRedirect = () => {
    navigate("/guardSearchStudent");
  };
  
  return (
    <div className="admin-dash-container container mt-5">
      {/* Welcome Section */}
      <div className="welcome-box text-center mb-4">
        <h2>
          Welcome, <span className="username">{username || "Security Guard"}</span>
        </h2>
        <p className="lead">
          Manage users, upload student data, and update your account settings.
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="row justify-content-center">
        {/* Profile */}
        <div className="col-md-3">
          <div className="dash-card card shadow text-center p-4 mb-4">
            <h4>Your Profile</h4>
            <p>View and update your personal details.</p>
            <Link to="/GuardProfile" className="btn btn-outline-secondary">
              View Profile
            </Link>
          </div>
        </div>

        {/* Change Password */}
        <div className="col-md-3">
          <div className="dash-card card shadow text-center p-4 mb-4">
            <h4>Change Password</h4>
            <p>Securely update your password to protect your account.</p>
            <Link to="/changePassword" className="btn btn-outline-warning">
              Change Password
            </Link>
          </div>
        </div>

        {/* Verify Student */}
        <div className="col-md-3">
          <div className="dash-card card shadow text-center p-4 mb-4">
            <h4>Verify Student</h4>
            <p>Check student entry by EnrollmentNo or face recognition.</p>
            <button
              onClick={handleSearchRedirect}
              className="btn btn-outline-success">
              Search / Verify Student
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GuardDash;
