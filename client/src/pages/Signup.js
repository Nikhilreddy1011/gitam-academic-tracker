import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { useToast } from '../components/Toast';

const isGitam = (e) =>
  /@gitam\.(in|edu)$|@student\.gitam\.edu$/.test((e || '').toLowerCase());

function StepInd({ cur }) {
  const steps = [{ l: 'Email' }, { l: 'Verify OTP' }, { l: 'Register' }];
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

const BRANCHES = ['CSE','ECE','EEE','MECH','CIVIL','IT','CSE-AI','CSE-DS','CSE-CS','CHEM','BIO'];

const Signup = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toast, showToast, dismissToast } = useToast();

  const [step, setStep]     = useState('email');
  const [email, setEmail]   = useState('');
  const [genOtp, setGenOtp] = useState('');
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [otpVals, setOtpVals] = useState(['','','','','','']);
  const [loading, setLoading] = useState(false);
  const [authErr, setAuthErr] = useState('');
  const [authOk, setAuthOk]   = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  // ── Send OTP ──
  const sendOtp = async () => {
    setAuthErr('');
    if (!email) { setAuthErr('Please enter your email address.'); return; }
    if (!isGitam(email)) {
      setAuthErr('Only GITAM email addresses are allowed.\nAccepted: @gitam.in · @gitam.edu · @student.gitam.edu');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.sendOtp(email);
      const demoOtp = res.data?.otp || res.data?.demo_otp || '';
      setGenOtp(demoOtp);
      setOtpExpiry(Date.now() + 10 * 60 * 1000);
      setStep('otp');
      setAuthOk(`OTP sent to ${email}${demoOtp ? `\n\n🔑 Demo OTP: ${demoOtp}` : ''}`);
      setOtpVals(['','','','','','']);
      setTimeout(() => document.getElementById('ot0')?.focus(), 50);
    } catch (err) {
      setAuthErr(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ──
  const verifyOtp = async () => {
    const entered = otpVals.join('');
    setAuthErr('');
    if (entered.length < 6) { setAuthErr('Please enter the complete 6-digit OTP.'); return; }
    if (otpExpiry && Date.now() > otpExpiry) {
      setAuthErr('OTP has expired. Please request a new one.'); return;
    }
    setLoading(true);
    try {
      await authAPI.verifyOtp(email, entered);
      setAuthOk('✓ Email verified successfully!');
      setStep('register');
    } catch (err) {
      if (genOtp && entered === genOtp) {
        setAuthOk('✓ Email verified successfully!');
        setStep('register');
      } else {
        setAuthErr(err.response?.data?.message || 'Incorrect OTP. Please check and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Register ──
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthErr('');
    const fd  = new FormData(e.target);
    const name   = (fd.get('name') || '').trim();
    const pass   = fd.get('pass') || '';
    const pass2  = fd.get('pass2') || '';
    const regNo  = (fd.get('regNo') || '').trim().toUpperCase();
    const branch = fd.get('branch') || '';
    const batch  = (fd.get('batch') || '').trim();
    const phone  = (fd.get('phone') || '').trim();

    if (!name)   { setAuthErr('Full name is required.'); return; }
    if (!regNo)  { setAuthErr('Registration number is required.'); return; }
    if (!branch) { setAuthErr('Please select your branch.'); return; }
    if (!batch)  { setAuthErr('Batch is required (e.g., 2021-25).'); return; }
    if (pass.length < 6) { setAuthErr('Password must be at least 6 characters.'); return; }
    if (pass !== pass2)  { setAuthErr('Passwords do not match.'); return; }
    if (!/^\d{6,}$/.test(regNo)) {
      setAuthErr('Registration number must be at least 6 digits and contain only numbers');
      return;
    }

    setLoading(true);
    try {
      const otp = otpVals.join('');

const res = await authAPI.signup({
  email,
  name,
  password: pass,
  confirmPassword: pass, // ✅ REQUIRED
  regNo,
  branch,
  batch,
  phone,
  otp // ✅ REQUIRED
});
      const { token, user: userData } = res.data;
      login(userData, token);
      showToast(`Welcome to GITAM Academic Tracker, ${name}! 🎉`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setAuthErr(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP helpers ──
  const handleOtpInput = (i, val) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    const next = [...otpVals]; next[i] = cleaned; setOtpVals(next);
    if (cleaned && i < 5) document.getElementById(`ot${i + 1}`)?.focus();
  };
  const handleOtpKeydown = (i, e) => {
    if (e.key === 'Backspace' && !otpVals[i] && i > 0) document.getElementById(`ot${i - 1}`)?.focus();
    if (e.key === 'Enter') verifyOtp();
  };
  const resendOtp = async () => {
    setAuthErr(''); setAuthOk(''); setLoading(true);
    try {
      const res = await authAPI.sendOtp(email);
      const demoOtp = res.data?.otp || res.data?.demo_otp || '';
      setGenOtp(demoOtp); setOtpExpiry(Date.now() + 10 * 60 * 1000);
      setOtpVals(['','','','','','']);
      setAuthOk(`New OTP sent to ${email}${demoOtp ? `\n\n🔑 Demo OTP: ${demoOtp}` : ''}`);
      setTimeout(() => { document.getElementById('ot0').value = ''; document.getElementById('ot0')?.focus(); }, 50);
    } catch { setAuthErr('Failed to resend OTP.'); }
    finally { setLoading(false); }
  };

  const stepIdx = step === 'email' ? 0 : step === 'otp' ? 1 : 2;

  return (
    <div className="awrap">
      <div className="acard">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
          <div className="licon" style={{ width: '38px', height: '38px', fontSize: '17px' }}>G</div>
          <div>
            <div className="ltxt" style={{ fontSize: '15px', fontWeight: 700 }}>GITAM Academic Tracker</div>
            <div className="lsub">Student Productivity System · v3.0</div>
          </div>
        </div>

        <StepInd cur={stepIdx} />

        {/* ── EMAIL STEP ── */}
        {step === 'email' && (
          <>
            <div className="atit">Create your account</div>
            <div className="asub">Register with your official GITAM email to get started</div>
            {authErr && <div className="aerr" style={{ whiteSpace: 'pre-line' }}>{authErr}</div>}
            {authOk  && <div className="aok">{authOk}</div>}
            <div className="fg">
              <label className="fl">GITAM Email Address</label>
              <input
                id="emailInp" className="fi" type="email"
                placeholder="yourname@gitam.in" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
              />
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '5px', lineHeight: 1.5 }}>
                ✓ Accepted:{' '}
                {['@gitam.in','@gitam.edu','@student.gitam.edu'].map(d => (
                  <code key={d} style={{ background:'var(--bg3)',padding:'1px 5px',borderRadius:'3px',fontSize:'11px',marginRight:'4px' }}>{d}</code>
                ))}
              </div>
            </div>
            <button className="bp" disabled={loading} onClick={sendOtp}>
              {loading ? '⏳ Sending OTP...' : '📧 Send Verification OTP →'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '13px', fontSize: '12px', color: 'var(--text3)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent3)' }}>Sign in</Link>
            </div>
          </>
        )}

        {/* ── OTP STEP ── */}
        {step === 'otp' && (
          <>
            <div className="atit">Verify your email</div>
            <div className="asub">
              A 6-digit OTP has been sent to <strong style={{ color: 'var(--text)' }}>{email}</strong>
            </div>
            {authErr && <div className="aerr">{authErr}</div>}
            {authOk  && <div className="aok" style={{ whiteSpace: 'pre-line' }}>{authOk}</div>}
            <div className="ainfo">
              <strong>Full MERN app:</strong> OTP delivered via <strong>Nodemailer</strong>.
            </div>
            <div className="otprow">
              {otpVals.map((v, i) => (
                <input key={i} id={`ot${i}`} className="otpi" maxLength={1} type="text"
                  inputMode="numeric" value={v}
                  onChange={(e) => handleOtpInput(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeydown(i, e)}
                />
              ))}
            </div>
            <button className="bp" style={{ marginBottom: '8px' }} onClick={verifyOtp}>✓ Verify OTP</button>
            <button className="bsec" disabled={loading} onClick={resendOtp}>
              {loading ? '⏳ Sending...' : '↺ Resend OTP'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px' }}>
              <a style={{ color: 'var(--text3)', cursor: 'pointer' }}
                onClick={() => { setStep('email'); setAuthErr(''); setAuthOk(''); }}>← Change email</a>
            </div>
          </>
        )}

        {/* ── REGISTER STEP ── */}
        {step === 'register' && (
          <>
            <div className="atit">Complete Registration</div>
            <div className="asub" style={{ color: 'var(--green3)', fontWeight: 600 }}>
              ✓ Email verified: {email}
            </div>
            {authErr && <div className="aerr">{authErr}</div>}
            <form onSubmit={handleRegister} autoComplete="off">
              <div className="fg">
                <label className="fl">Full Name *</label>
                <input name="name" className="fi" placeholder="Your full name" required autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="fg">
                  <label className="fl">Registration No. *</label>
                  <input name="regNo" className="fi" placeholder="2021XXXXX" required />
                </div>
                <div className="fg">
                  <label className="fl">Batch *</label>
                  <input name="batch" className="fi" placeholder="2021-25" required />
                </div>
              </div>
              <div className="fg">
                <label className="fl">Branch *</label>
                <select name="branch" className="fi" required>
                  <option value="">— Select your branch —</option>
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="fg">
                <label className="fl">Phone Number (optional)</label>
                <input name="phone" className="fi" placeholder="+91 XXXXX XXXXX" type="tel" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="fg">
                  <label className="fl">Password *</label>
                  <input name="pass" type="password" className="fi" placeholder="Min 6 characters" required />
                </div>
                <div className="fg">
                  <label className="fl">Confirm Password *</label>
                  <input name="pass2" type="password" className="fi" placeholder="Repeat password" required />
                </div>
              </div>
              <button type="submit" className="bp" disabled={loading}>
                {loading ? '⏳ Creating account...' : '🎓 Create Account'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px' }}>
              <a style={{ color: 'var(--text3)', cursor: 'pointer' }}
                onClick={() => { setStep('email'); setAuthErr(''); }}>← Back</a>
            </div>
          </>
        )}
      </div>
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
};

export default Signup;