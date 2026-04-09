import { useState } from "react";
import { authAPI } from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";

export default function OTP() {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email; // ✅ get email safely

  const handle = async () => {
    try {
      await authAPI.verifyOtp(email, otp);
      alert("OTP Verified!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Invalid OTP");
    }
  };

  if (!email) {
    return <p>Email not found. Go back and register again.</p>;
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Enter OTP</h2>
        <input
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
        />
        <button onClick={handle} className="btn-primary">
          Verify OTP
        </button>
      </div>
    </div>
  );
}