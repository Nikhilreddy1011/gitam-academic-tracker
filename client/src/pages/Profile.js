import React, { useState, useEffect, useContext } from 'react';
import { profileAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../components/Layout';
import PasswordStrength, { getPasswordStrength } from '../components/PasswordStrength';

const esc = (s) => String(s || '');
const ini = (n) => (n || '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const BRANCHES = ['CSE','ECE','EEE','MECH','CIVIL','IT','CSE-AI','CSE-DS','CSE-CY','CHEM','BIO'];
const SEMS = [1,2,3,4,5,6,7,8];

// View row — same markup as original
function ViewRow({ label, value, locked = false }) {
  return (
    <div className="fg">
      <label className="fl">{label}{locked ? ' 🔒' : ''}</label>
      <div style={{ padding:'9px 12px', background: locked ? 'var(--bg4)' : 'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r)', fontSize:'13px', color: locked ? 'var(--text3)' : 'var(--text)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span>{esc(value) || '—'}</span>
        {locked && <span className="chip cr" style={{ fontSize:'10px' }}>Locked</span>}
      </div>
    </div>
  );
}

// Edit row — same markup
function EditRow({ label, field, type = 'text', draft, onChange }) {
  return (
    <div className="fg">
      <label className="fl">{label}</label>
      <input
        type={type} className="ei"
        value={esc(draft[field] || '')}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={label}
      />
    </div>
  );
}

const Profile = () => {
  const { user, updateUser } = useAuth();
  const showToast = useContext(ToastContext);

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [profEdit, setProfEdit] = useState(false);
  const [draft, setDraft]       = useState({});
  const [theme, setTheme]       = useState(() => localStorage.getItem('gat_theme') || 'dark');

  // ── Change password (logged in, no OTP/logout) ──
  const [pwdOpen, setPwdOpen]       = useState(false);
  const [pwdSaving, setPwdSaving]   = useState(false);
  const [pwdErr, setPwdErr]         = useState('');
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew]         = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');

  const fetchProfile = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await profileAPI.get();
      const profileData = res.data?.user || res.data?.profile || res.data;
      if (profileData) updateUser(profileData);
      return profileData;
    } catch {
      return null;
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // ── Fetch profile ──
  useEffect(() => {
    fetchProfile(true);

    // Keep profile/semester synced without manual refresh -- but not while
    // the tab is backgrounded, and not every 10s (each tick is a real API
    // call/serverless invocation; polling that aggressively adds up fast).
    const interval = setInterval(() => {
      if (!profEdit && document.visibilityState === 'visible') fetchProfile(false);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // ── Start edit ──
  const startEdit = () => {
    setProfEdit(true);
    setDraft({ ...user });
  };

  const handleDraftChange = (field, val) => {
    setDraft((prev) => ({ ...prev, [field]: val }));
  };

  // ── Save profile ──
  const saveProf = async () => {
    if (!draft.name?.trim())  { showToast('Full name cannot be empty.', 'error'); return; }
    if (!draft.regNo?.trim()) { showToast('Registration number is required.', 'error'); return; }
    if (!draft.branch)        { showToast('Please select your branch.', 'error'); return; }
    if (!draft.batch?.trim()) { showToast('Batch is required.', 'error'); return; }

    setSaving(true);
    try {
      // Update basic profile
      const basicRes = await profileAPI.update({
        name:  draft.name,
        phone: draft.phone,
        bio:   draft.bio,
      });

      // Update academic details separately
      await profileAPI.updateAcademic({
        regNo:    draft.regNo,
        branch:   draft.branch,
        semester: draft.semester,
        batch:    draft.batch,
        cgpa:     draft.cgpa,
        sgpa:     draft.sgpa,
      });

      const updated = basicRes.data?.user || basicRes.data || draft;
      updateUser({ ...draft, ...updated, email: user.email });
      await fetchProfile(false);
      setProfEdit(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => { setProfEdit(false); setDraft({}); };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.body.classList.toggle('light', next === 'light');
    localStorage.setItem('gat_theme', next);
  };

  const openPwdForm = () => {
    setPwdOpen(true);
    setPwdErr('');
    setPwdCurrent(''); setPwdNew(''); setPwdConfirm('');
  };
  const closePwdForm = () => {
    setPwdOpen(false);
    setPwdErr('');
    setPwdCurrent(''); setPwdNew(''); setPwdConfirm('');
  };

  const submitChangePassword = async (e) => {
    e.preventDefault();
    setPwdErr('');

    if (!pwdCurrent) { setPwdErr('Enter your current password.'); return; }
    if (!getPasswordStrength(pwdNew).meetsMinimum) {
      setPwdErr('New password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      return;
    }
    if (pwdNew !== pwdConfirm) { setPwdErr('New passwords do not match.'); return; }

    setPwdSaving(true);
    try {
      await authAPI.changePassword(pwdCurrent, pwdNew, pwdConfirm);
      showToast('Password updated successfully!', 'success');
      closePwdForm();
    } catch (err) {
      setPwdErr(err.response?.data?.msg || err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPwdSaving(false);
    }
  };

  const u = profEdit ? draft : user;

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'40vh', color:'var(--text3)', fontSize:'13px' }}>
        Loading profile...
      </div>
    );
  }

  // Stats from user data
  const stats = [
    [user?.tasksDone ?? 0, 'Tasks Done', 'var(--accent3)'],
    [user?.tasksPending ?? 0, 'Pending Tasks', 'var(--green3)'],
    [user?.cgpa || '—', 'CGPA', 'var(--y3)'],
    [user?.sgpa || '—', 'Latest SGPA', 'var(--p2)'],
    [user?.subjects || 6, 'Subjects', 'var(--o2)'],
    [user?.semester, 'Semester', 'var(--accent3)'],
  ];

  return (
    <>
      <div className="ph">
        <div className="ptit">My Profile</div>
        <div className="psub">View and edit your academic information</div>
      </div>

      <div className="g2">
        {/* Profile Card */}
        <div className="card">
          {/* Avatar header */}
          <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px', paddingBottom:'18px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'linear-gradient(135deg,#1f6feb,#a371f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:700, color:'#fff', fontFamily:"'Space Grotesk',sans-serif", flexShrink:0 }}>
              {ini(user?.name)}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'19px', fontWeight:700, marginBottom:'3px' }}>{esc(user?.name)}</div>
              <div style={{ fontSize:'12px', color:'var(--text2)', marginBottom:'6px' }}>{esc(user?.email)}</div>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                <span className="chip cb">{esc(user?.regNo)}</span>
                <span className="chip cp">{esc(user?.branch)}</span>
                <span className="chip cy">Sem {user?.semester}</span>
              </div>
            </div>
          </div>

          {profEdit ? (
            <>
              <EditRow label="Full Name"        field="name"   draft={draft} onChange={handleDraftChange} />
              <ViewRow label="Email Address (permanent)" value={user?.email} locked />
              <EditRow label="Registration Number" field="regNo" draft={draft} onChange={handleDraftChange} />

              <div className="fg">
                <label className="fl">Branch</label>
                <select className="ei" value={draft.branch || ''} onChange={(e) => handleDraftChange('branch', e.target.value)}>
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>

              <div className="fg">
                <label className="fl">Current Semester</label>
                <select className="ei" value={draft.semester || ''} onChange={(e) => handleDraftChange('semester', parseInt(e.target.value))}>
                  {SEMS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <EditRow label="Batch"           field="batch"  draft={draft} onChange={handleDraftChange} />
              <EditRow label="Phone Number"    field="phone"  type="tel" draft={draft} onChange={handleDraftChange} />
              <EditRow label="CGPA"            field="cgpa"   draft={draft} onChange={handleDraftChange} />
              <EditRow label="SGPA (Latest)"   field="sgpa"   draft={draft} onChange={handleDraftChange} />
              <EditRow label="Bio"             field="bio"    draft={draft} onChange={handleDraftChange} />

              <div className="div" />
              <div style={{ display:'flex', gap:'8px' }}>
                <button className="bp bgreen" style={{ flex:1 }} onClick={saveProf} disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
                <button className="bsec" style={{ flex:.6, margin:0 }} onClick={cancelEdit}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <ViewRow label="Full Name"        value={u?.name} />
              <ViewRow label="Email Address"    value={u?.email} locked />
              <ViewRow label="Registration Number" value={u?.regNo} />
              <ViewRow label="Branch"           value={`B.Tech ${u?.branch}`} />
              <ViewRow label="Current Semester" value={`Semester ${u?.semester}`} />
              <ViewRow label="Batch"            value={u?.batch} />
              <ViewRow label="Phone Number"     value={u?.phone || 'Not provided'} />
              <ViewRow label="CGPA"             value={u?.cgpa} />
              <ViewRow label="SGPA (Latest)"    value={u?.sgpa} />
              <ViewRow label="Bio"              value={u?.bio} />
              <div className="div" />
              <button className="bp" style={{ background:'var(--accent2)' }} onClick={startEdit}>✏️ Edit Profile</button>
            </>
          )}
        </div>

        {/* Settings + Stats */}
        <div>
          <div className="card" style={{ marginBottom:'13px' }}>
            <div className="ctit">⚙️ Settings</div>

            {/* Theme */}
            <div style={{ padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:500 }}>App Theme</div>
                  <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'2px' }}>Currently: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
                </div>
                <button className="ibtn" style={{ width:'auto', padding:'7px 14px', fontSize:'12px' }} onClick={toggleTheme}>
                  {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
              </div>
            </div>

            {/* GITAM Portal */}
            <div style={{ padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:500 }}>GITAM Student Portal</div>
                  <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'2px' }}>Open official GITAM portal</div>
                </div>
                <a href="https://login.gitam.edu/" target="_blank" rel="noreferrer" className="pbtn">🔗 Open Portal</a>
              </div>
            </div>

            {/* Update Password */}
            <div style={{ padding:'11px 0' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:500 }}>Update Password</div>
                  <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'2px' }}>Change your password without logging out</div>
                </div>
                {!pwdOpen && (
                  <button
                    className="ibtn"
                    style={{ width:'auto', padding:'7px 14px', fontSize:'12px', color:'var(--y3)', borderColor:'var(--y3)' }}
                    onClick={openPwdForm}
                  >
                    🔑 Update
                  </button>
                )}
              </div>

              {pwdOpen && (
                <form onSubmit={submitChangePassword} style={{ marginTop:'12px' }} autoComplete="off">
                  {pwdErr && <div className="aerr" style={{ marginBottom:'10px' }}>{pwdErr}</div>}

                  <div className="fg">
                    <label className="fl">Current Password</label>
                    <input
                      type="password" className="fi" placeholder="Enter current password"
                      value={pwdCurrent} onChange={(e) => setPwdCurrent(e.target.value)}
                      autoFocus required
                    />
                  </div>

                  <div className="fg">
                    <label className="fl">New Password</label>
                    <input
                      type="password" className="fi" placeholder="8+ chars, mixed case, number, symbol"
                      value={pwdNew} onChange={(e) => setPwdNew(e.target.value)}
                      required
                    />
                    <PasswordStrength password={pwdNew} />
                  </div>

                  <div className="fg">
                    <label className="fl">Confirm New Password</label>
                    <input
                      type="password" className="fi" placeholder="Repeat new password"
                      value={pwdConfirm} onChange={(e) => setPwdConfirm(e.target.value)}
                      required
                    />
                    {pwdConfirm && pwdNew !== pwdConfirm && (
                      <div style={{ fontSize:'11px', color:'var(--red2)', marginTop:'4px' }}>Passwords do not match</div>
                    )}
                  </div>

                  <div style={{ display:'flex', gap:'8px' }}>
                    <button type="submit" className="bp bgreen" style={{ flex:1 }} disabled={pwdSaving}>
                      {pwdSaving ? '⏳ Updating...' : '💾 Update Password'}
                    </button>
                    <button type="button" className="bsec" style={{ flex:.6, margin:0 }} onClick={closePwdForm}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          
        </div>
      </div>
    </>
  );
};

export default Profile;