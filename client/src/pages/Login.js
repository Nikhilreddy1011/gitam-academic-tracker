import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { useToast } from '../components/Toast';

const isGitam = (e) =>
  /@gmail\.com$/.test((e || '').toLowerCase());

const esc = (s) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Step indicator — exact same markup as original
function StepInd({ cur, mode }) {
  const steps =
    mode === 'reset'
      ? [{ l: 'Email' }, { l: 'Verify OTP' }, { l: 'New Password' }]
      : [{ l: 'Email' }, { l: 'Verify OTP' }, { l: 'Sign In' }];

  return (
    <div className="steps">
      {steps.map((s, i) => {
        const cls = i < cur ? 'done' : i === cur ? 'active' : '';
        return (
          <React.Fragment key={i}>
            {i > 0 && <div className={`sline${i <= cur ? ' done' : ''}`} />}
            <div className={`step ${cls}`}>
              <div className="sdot">{i < cur ? '✓' : i + 1}</div>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text3)' }}>
        {steps[cur]?.l || ''}
      </div>
    </div>
  );
}

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toast, showToast, dismissToast } = useToast();

  // Auth step state
  // login | reset
  const [email, setEmail]     = useState('');
  
  const [loading, setLoading] = useState(false);
  const [authErr, setAuthErr] = useState('');
  const [authOk, setAuthOk]   = useState('');
  const [showPass, setShowPass] = useState(false);
  

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

 
  // ── Login with password ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthErr('');
    const pass = e.target.pass.value;
    if (!pass || pass.length < 6) {
      setAuthErr('Please enter your password (min 6 characters).'); return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(email, pass);
      const { token, user: userData } = res.data;
      login(userData, token);
      showToast(`Welcome back, ${userData.name}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setAuthErr(err.response?.data?.message || 'Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Reset password ──
  

 

  // ── Step index for indicator ──

  return (
    <div className="awrap">
      <div className="acard">
        {/* Logo — exact same markup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
          <div className="licon" style={{ width: '38px', height: '38px', fontSize: '17px' }}>G</div>
          <div>
            <div className="ltxt" style={{ fontSize: '15px', fontWeight: 700 }}>GITAM Academic Tracker</div>
            <div className="lsub">Student Productivity System · </div>
          </div>
        </div>

        

        {/* ── STEP: EMAIL ── */}
        
          <>
          <div className="atit">Welcome back</div>
          <div className="asub">
            Enter your email and password to continue
          </div>
        
          {authErr && <div className="aerr">{authErr}</div>}
        
          <form onSubmit={handleLogin}>
            <div className="fg">
              <label className="fl">Enter Email Address</label>
              <input
                type="email"
                className="fi"
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
        
            <div className="fg">
              <label className="fl">Password</label>
              <div style={{ position: 'relative' }}>
  <input
    name="pass"
    type={showPass ? "text" : "password"} // 👈 toggle
    className="fi"
    placeholder="Enter your password"
    required
    style={{ paddingRight: '40px' }}
  />

  <span
    onClick={() => setShowPass(!showPass)}
    style={{
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      fontSize: '14px',
      color: 'var(--text3)'
    }}
  >
    {showPass ? '🙈' : '👁️'}
  </span>
</div>
            </div>
        
            <button type="submit" className="bp" disabled={loading}>
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>
        
          <div style={{ textAlign: 'center', marginTop: '13px', fontSize: '12px', color: 'var(--text3)' }}>
            
         
            New here?{' '}
            <Link to="/signup" style={{ color: 'var(--accent3)' }}>
              Create account
            </Link>
          </div>
        </>
       

        

        
      </div>
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
};

export default Login;