import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChangePassword = (props) => {

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = formData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            props.showAlert("Please fill in all fields", "warning");
            return;
        }

        if (newPassword.length < 6) {
            props.showAlert("New password must be at least 6 characters", "warning");
            return;
        }

        if (newPassword !== confirmPassword) {
            props.showAlert("New password and confirm password do not match", "warning");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const regId = sessionStorage.getItem("regId"); // ✅ sessionStorage instead of localStorage

            if (!regId) {
                props.showAlert("User session expired. Please log in again.", "danger");
                return;
            }

            const response = await fetch("http://localhost:3000/api/auth/changePassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
                body: JSON.stringify({
                    regId,                            // ✅ Send this
                    oldPassword: currentPassword,     // ✅ Backend expects 'oldPassword'
                    newPassword,                      // ✅ Backend expects 'newPassword'
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                props.showAlert(result.message || result.error || "Password change failed", "danger");
                return;
            }

            props.showAlert(result.message || "Password changed successfully", "success");

            // Optional redirect after 2 seconds
            setTimeout(() => {
                const roleId = sessionStorage.getItem("roleId");
                switch (parseInt(roleId)) {
                    case 1: navigate("/UniAdminDash"); break;
                    case 2: navigate("/HODDash"); break;
                    case 3: navigate("/GuardDash"); break;
                    default: navigate("/");
                }
            }, 2000);

        } catch (error) {
            console.error("Change password error:", error);
            props.showAlert("Something went wrong. Please try again.", "danger");
        }
    };



    return (
        <div className="container mt-5" style={{ maxWidth: "500px" }}>
            <div className="card shadow p-4">
                <h3 className="text-center mb-4">Change Password</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="currentPassword" className="form-label">Current Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={onChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="newPassword" className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={onChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={onChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Change Password</button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
