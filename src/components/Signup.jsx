import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Signup.css";

const Signup = ({ showAlert }) => {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [credentials, setCredentials] = useState({
    username: "",
    email: "",
    phone: "",
    roleId: "",
  });

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [extra, setExtra] = useState({
    department: "",
    shift: "",
    joiningDate: "",
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ username: "", email: "" });
  const [isTaken, setIsTaken] = useState({ username: false, email: false });

  const debounceRef = useRef({ username: null, email: null });
  const lastChecked = useRef({ username: "", email: "" });

  // ---------------------------
  // ✅ Password Generator
  // ---------------------------
  const generatePassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "@#";
    const all = upper + lower + digits + symbols;

    let password = "";
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += all[Math.floor(Math.random() * all.length)];
    return password;
  };

  // ---------------------------
  // Fetch roles & departments
  // ---------------------------
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/auth/roles`)
      .then((res) => setRoles(res.data))
      .catch(() => showAlert("Failed to load roles", "danger"));

    axios
      .get(`${API_BASE}/api/departments`)
      .then((res) => setDepartments(res.data))
      .catch(() => showAlert("Failed to load departments", "danger"));
  }, []);

  // ---------------------------
  // Handle input change
  // ---------------------------
  const onChange = (e) => {
    const { name, value } = e.target;

    if (["department", "shift", "joiningDate"].includes(name)) {
      setExtra((prev) => ({ ...prev, [name]: value }));
    } else {
      setCredentials((prev) => ({
        ...prev,
        [name]: name === "roleId" ? (value ? parseInt(value) : "") : value,
      }));
    }

    // Check availability only for username/email
    if (name === "username" || name === "email") {
      if (debounceRef.current[name]) clearTimeout(debounceRef.current[name]);
      debounceRef.current[name] = setTimeout(() => {
        if (lastChecked.current[name] !== value) {
          checkAvailability(name, value);
          lastChecked.current[name] = value;
        }
      }, 400);
    }
  };

  // ---------------------------
  // Duplicate check
  // ---------------------------
  const checkAvailability = async (field, value) => {
    if (!value || value.trim() === "") return;
    try {
      const res = await axios.get(`${API_BASE}/api/auth/check-availability?${field}=${value}`);
      const exists = res.data.exists;

      setFieldErrors((prev) => ({
        ...prev,
        [field]: exists ? `${field} already taken` : "",
      }));

      setIsTaken((prev) => ({
        ...prev,
        [field]: exists,
      }));
    } catch {
      showAlert("Error checking availability", "danger");
    }
  };

  // ---------------------------
  // ✅ OTP Email Verification
  // ---------------------------
  const sendOtp = async () => {
    if (!credentials.email) return showAlert("Enter email first", "warning");
    if (isTaken.email) return showAlert("Email already taken", "danger");

    try {
      const { data } = await axios.post(`${API_BASE}/api/otp/signup-otp`, {
        email: credentials.email,
      });

      if (!data.success) return showAlert(data.error || "Failed to send OTP", "danger");

      const otp = prompt("Enter OTP sent to your email:");
      if (!otp) return showAlert("OTP cancelled", "warning");

      const verify = await axios.post(`${API_BASE}/api/otp/verify-signup`, {
        email: credentials.email,
        otp,
      });

      if (verify.data.success) {
        setEmailVerified(true);
        showAlert("Email verified!", "success");
      } else showAlert("Invalid OTP", "danger");
    } catch (err) {
      console.error("OTP error:", err);
      showAlert("OTP error", "danger");
    }
  };

  // ---------------------------
  // ✅ Submit Signup (Auto Password)
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, phone, roleId } = credentials;

    if (!emailVerified) return showAlert("Verify email first", "warning");
    if (isTaken.username || isTaken.email) return showAlert("Fix duplicate fields first", "danger");

    try {
      const generatedPassword = generatePassword();

      const payload = {
        ...credentials,
        password: generatedPassword,
        cpassword: generatedPassword,
        extra,
      };

      const res = await axios.post(`${API_BASE}/api/auth/signup`, payload);

      if (res.data.success) {
        showAlert(`Signup successful! Temporary password sent to: ${email}`, "success");
        navigate("/login");
      } else showAlert(res.data.error || "Signup failed", "danger");
    } catch (err) {
      console.error("Signup error:", err);
      showAlert("Server error", "danger");
    }
  };

  // ---------------------------
  // JSX
  // ---------------------------
  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Signup</h2>
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className={`form-control ${fieldErrors.username ? "is-invalid" : ""}`}
              onChange={onChange}
              required
            />
            {fieldErrors.username && <div className="invalid-feedback">{fieldErrors.username}</div>}
          </div>

          {/* Email + OTP */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="input-group">
              <input
                type="email"
                name="email"
                className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
                onChange={onChange}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={sendOtp}
                disabled={emailVerified || isTaken.email}
              >
                {emailVerified ? "Verified" : "Send OTP"}
              </button>
            </div>
            {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input type="text" name="phone" className="form-control" onChange={onChange} />
          </div>

          {/* Role */}
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select name="roleId" className="form-select" onChange={onChange} required>
              <option value="">Select Role</option>
              {roles
                .filter((r) => r.roleId !== 1) // Exclude UniversityAdmin
                .map((r) => (
                  <option key={r.roleId} value={r.roleId}>
                    {r.roleName}
                  </option>
                ))}
            </select>
          </div>

          {/* Conditional Fields */}

          {/* HOD Fields */}
          {credentials.roleId === 2 && (
            <div className="mb-3">
              <label className="form-label">Department</label>
              <select name="department" className="form-select" onChange={onChange} required>
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.deptId} value={dept.deptName}>
                    {dept.deptName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ✅ Security Guard Fields */}
          {credentials.roleId === 3 && (
            <>
              <div className="mb-3">
                <label className="form-label">Shift</label>
                <select
                  name="shift"
                  className="form-select"
                  onChange={onChange}
                  required
                >
                  <option value="">Select Shift</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  className="form-control"
                  onChange={onChange}
                  required
                />
              </div>
            </>
          )}

          {/* Submit */}
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!emailVerified || isTaken.username || isTaken.email}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
