import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import PasswordStrength, { getPasswordStrength } from '../components/PasswordStrength';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authErr, setAuthErr] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthErr('');

    if (!getPasswordStrength(pass).meetsMinimum) {
      setAuthErr('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      return;
    }
    if (pass !== pass2) {
      setAuthErr('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, pass, pass2);
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setAuthErr(err.response?.data?.msg || err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="awrap">
      <div className="acard">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
          <div className="licon" style={{ width: '38px', height: '38px', fontSize: '17px' }}>G</div>
          <div>
            <div className="ltxt" style={{ fontSize: '15px', fontWeight: 700 }}>GITAM Academic Tracker</div>
            <div className="lsub">Student Productivity System</div>
          </div>
        </div>

        {!token ? (
          <>
            <div className="atit">Invalid reset link</div>
            <div className="aerr">This password reset link is missing or malformed.</div>
            <div style={{ textAlign: 'center', marginTop: '13px', fontSize: '12px' }}>
              <Link to="/forgot-password" style={{ color: 'var(--accent3)' }}>Request a new link</Link>
            </div>
          </>
        ) : done ? (
          <>
            <div className="atit">Password updated ✓</div>
            <div className="aok">Your password has been changed successfully. Redirecting you to sign in…</div>
            <Link to="/login" className="bp" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
              Go to Sign In →
            </Link>
          </>
        ) : (
          <>
            <div className="atit">Set a new password</div>
            <div className="asub">Choose a strong new password for your account</div>
            {authErr && <div className="aerr">{authErr}</div>}
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="fg">
                <label className="fl">New Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="fi"
                    placeholder="Enter new password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    style={{ paddingRight: '40px' }}
                    autoFocus
                    required
                  />
                  <span
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '14px', color: 'var(--text3)' }}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </span>
                </div>
                <PasswordStrength password={pass} />
              </div>
              <div className="fg">
                <label className="fl">Confirm New Password *</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="fi"
                  placeholder="Repeat new password"
                  value={pass2}
                  onChange={(e) => setPass2(e.target.value)}
                  required
                />
                {pass2 && pass !== pass2 && (
                  <div style={{ fontSize: '11px', color: 'var(--red2)', marginTop: '4px' }}>Passwords do not match</div>
                )}
              </div>
              <button type="submit" className="bp" disabled={loading}>
                {loading ? '⏳ Updating...' : 'Update Password →'}
              </button>
            </form>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '13px', fontSize: '12px', color: 'var(--text3)' }}>
          <Link to="/login" style={{ color: 'var(--accent3)' }}>← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
