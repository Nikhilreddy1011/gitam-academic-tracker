import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const isGitam = (e) =>
  /@gmail\.com$/.test((e || '').toLowerCase());

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [authErr, setAuthErr] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthErr('');
    if (!email) { setAuthErr('Please enter your email address.'); return; }
    if (!isGitam(email)) { setAuthErr('Only Gmail addresses are allowed.'); return; }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      // Backend always returns a generic success message here (even if the
      // account doesn't exist) so this page can't be used to probe which
      // emails are registered.
      setSent(true);
    } catch (err) {
      setAuthErr(err.response?.data?.msg || err.response?.data?.message || 'Something went wrong. Please try again.');
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

        {!sent ? (
          <>
            <div className="atit">Forgot your password?</div>
            <div className="asub">Enter your email and we'll send you a link to reset it</div>
            {authErr && <div className="aerr">{authErr}</div>}
            <form onSubmit={handleSubmit}>
              <div className="fg">
                <label className="fl">Email Address</label>
                <input
                  className="fi" type="email" autoFocus
                  placeholder="yourname@gmail.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button className="bp" type="submit" disabled={loading}>
                {loading ? '⏳ Sending link...' : 'Send Reset Link →'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="atit">Check your email</div>
            <div className="aok">
              If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
              It expires in 30 minutes.
            </div>
            <button className="bsec" onClick={() => setSent(false)}>↺ Send another link</button>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '13px', fontSize: '12px', color: 'var(--text3)' }}>
          <Link to="/login" style={{ color: 'var(--accent3)' }}>← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
