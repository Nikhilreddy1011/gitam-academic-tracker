import { useState } from "react";
import { authAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handle = async () => {
    try {
      await authAPI.sendOtp(email);
      navigate("/otp", { state: { email } }); // ✅ pass email
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Register</h2>
        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handle} className="btn-primary">
          Send OTP
        </button>
      </div>
    </div>
  );
}