// import React, { useState } from 'react';

// const ForgetPassword = () => {
//   const [step, setStep] = useState(1);
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');

//   const sendOTP = async () => {
//     const res = await fetch("http://localhost:3000/api/otp/send-otp", {
//       method: "POST",
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email })
//     });
//     const data = await res.json();
//     if (data.success) {
//       setMessage("✅ OTP sent to your email.");
//       setStep(2);
//     } else {
//       setMessage(data.error || "❌ Error sending OTP.");
//     }
//   };

//   const verifyOTP = async () => {
//     const res = await fetch("http://localhost:3000/api/otp/verify-otp", {
//       method: "POST",
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, otp })
//     });
//     const data = await res.json();
//     if (data.success) {
//       setMessage("✅ OTP verified.");
//       setStep(3);
//     } else {
//       setMessage(data.error || "❌ OTP verification failed.");
//     }
//   };

//   const changePassword = async () => {
//     if (newPassword !== confirmPassword) {
//       setMessage("❌ New password and confirm password do not match.");
//       return;
//     }

//     const res = await fetch("http://localhost:3000/api/forgetPassword/change-password", {
//       method: "POST",
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, newPassword })
//     });
//     const data = await res.json();
//     if (res.ok) {
//       setMessage("✅ Password changed successfully.");
//       setStep(1);
//       setEmail('');
//       setOtp('');
//       setNewPassword('');
//       setConfirmPassword('');
//     } else {
//       setMessage(data.error || "❌ Error changing password.");
//     }
//   };

//   return (
//     <div className="container mt-3">
//       <h2>Forgot Password</h2>
//       {message && <div className="alert alert-info">{message}</div>}

//       {step === 1 && (
//         <>
//           <label>Email</label>
//           <input
//             type="email"
//             className="form-control"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <button className="btn btn-primary mt-2" onClick={sendOTP}>Send OTP</button>
//         </>
//       )}

//       {step === 2 && (
//         <>
//           <label>Enter OTP</label>
//           <input
//             type="text"
//             className="form-control"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//             required
//           />
//           <button className="btn btn-success mt-2" onClick={verifyOTP}>Verify OTP</button>
//         </>
//       )}

//       {step === 3 && (
//         <>
//           <label>New Password</label>
//           <input
//             type="password"
//             className="form-control"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             required
//           />
//           <label className="mt-2">Confirm Password</label>
//           <input
//             type="password"
//             className="form-control"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//           />
//           <button className="btn btn-warning mt-3" onClick={changePassword}>
//             Change Password
//           </button>
//         </>
//       )}
//     </div>
//   );
// };

// export default ForgetPassword;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    return passwordRegex.test(password);
  };

  const sendOTP = async () => {
    if (!email) {
      setMessage("❌ Please enter your email.");
      return;
    }

    if (!validateEmail(email)) {
      setMessage("❌ Please enter a valid email address.");
      return;
    }

    const res = await fetch("http://localhost:3000/api/otp/send-otp", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (data.success) {
      setMessage("✅ OTP sent to your email.");

      const userOtp = prompt('Enter the OTP sent to your email:');
      if (!userOtp) {
        setMessage("❌ OTP input cancelled.");
        return;
      }

      const verifyRes = await fetch("http://localhost:3000/api/otp/verify-otp", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: userOtp })
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        setMessage("✅ OTP verified. Please enter your new password.");
        setStep(3);
      } else {
        setMessage(verifyData.error || "❌ OTP verification failed.");
      }
    } else {
      setMessage(data.error || "❌ Error sending OTP.");
    }
  };

  const changePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage("❌ Please fill in all password fields.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setMessage("❌ Password must be at least 6 characters and include a number and a special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ New password and confirm password do not match.");
      return;
    }

    const res = await fetch("http://localhost:3000/api/otp/resetPassword", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Password changed successfully.");
      setStep(1);
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      setMessage(data.error || "❌ Error changing password.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="p-4 rounded shadow-sm bg-white" style={{ width: '100%', maxWidth: '400px' }}>
        <h4 className="text-center mb-4">Forgot Password</h4>

        {message && <div className="alert alert-info">{message}</div>}

        {step === 1 && (
          <>
            <label>Email</label>
            <input
              type="email"
              className="form-control custom-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn btn-primary w-100 mt-3" onClick={sendOTP}>
              Send OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <label>New Password</label>
            <input
              type="password"
              className="form-control custom-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <label className="mt-2">Confirm Password</label>
            <input
              type="password"
              className="form-control custom-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button className="btn btn-warning w-100 mt-3" onClick={changePassword}>
              Change Password
            </button>
          </>
        )}
      </div>

      <style>{`
        .custom-input {
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          padding: 6px 10px;
        }
      `}</style>
    </div>
  );
};

export default ForgetPassword;
