import React, { useState, useContext,  useEffect } from 'react';
import { attendanceAPI } from '../services/api'; 
import { ToastContext } from '../components/Layout';

const esc = (s) => String(s || '');

const DEFAULT_SUBJECTS = [
  { name: 'Data Structures',     total: 48, attended: 45 },
  { name: 'Operating Systems',   total: 40, attended: 36 },
  { name: 'Database Management', total: 42, attended: 34 },
  { name: 'Computer Networks',   total: 38, attended: 36 },
  { name: 'Software Engineering',total: 44, attended: 40 },
  { name: 'Web Technologies Lab',total: 20, attended: 18 },
];

const Attendance = () => {
  const showToast = useContext(ToastContext);
  const [attS, setAttS] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await attendanceAPI.get();
        setAttS(
          (res.data || [])
            .filter(s => s.subject && s.subject.trim() !== "")
            .map(s => ({
              id: s.id || s._id,            // ✅ ADD THIS
              name: s.subject,
              attended: Number(s.attended || s.attendedClasses || 0),
              total: Number(s.total || s.totalClasses || 0)         // ✅ FIX KEY
            }))
        );
      
      } catch (err) {
        console.log("API failed");
      }
    };
    fetchData();
  }, []);   
 
  const markPresent = async (i) => {
    const n = [...attS];
  
    n[i] = {
      ...n[i],
      attended: n[i].attended + 1,
      total: Math.max(n[i].total, n[i].attended + 1)
    };
  
    setAttS(n); // ✅ update UI
  
    try {
      await attendanceAPI.add({
        subject: n[i].name,
        totalClasses: n[i].total,
        attendedClasses: n[i].attended
      });
  
      showToast("Marked Present ✅", "success");
    } catch (err) {
      console.log(err);
      showToast("Update failed", "error");
    }
  };


  const markAbsent = async (i) => {
    const n = [...attS];
  
    n[i] = {
      ...n[i],
      total: n[i].total + 1
    };
  
    setAttS(n);
  
    try {
      await attendanceAPI.add({
        subject: n[i].name,
        totalClasses: n[i].total,
        attendedClasses: n[i].attended
      });
  
      showToast("Marked Absent ❌", "info");
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const undo = async (i) => {
    const n = [...attS];
  
    if (n[i].attended > 0 && n[i].total > 0) {
      n[i] = {
        ...n[i],
        attended: Math.max(0, n[i].attended - 1),
        total: Math.max(0, n[i].total - 1)
      };
  
      setAttS(n);
  
      try {
        await attendanceAPI.add({
          subject: n[i].name,
          totalClasses: n[i].total,
          attendedClasses: n[i].attended
        });
  
        showToast("Undo successful", "info");
      } catch (err) {
        showToast("Update failed", "error");
      }
    }
  };
  const remove = async (i) => {
    const id = attS[i].id;              // ✅ use id
    const subject = attS[i].name;
  
    if (window.confirm(`Remove ${subject}?`)) {
      setAttS(prev => prev.filter((_, idx) => idx !== i));
  
      try {
        await attendanceAPI.delete(id); // ✅ send id
        showToast("Subject removed 🗑️", "info");
      } catch {
        showToast("Delete failed", "error");
      }
    }
  };

 
  const addSubject = async () => {
    const newSub = prompt("Enter subject name");

    if (!newSub || !newSub.trim()) return;
    console.log("Adding subject:", newSub);
  
    // ✅ STRONG duplicate check (case-insensitive + trim)
    const normalized = newSub.trim().toUpperCase();

    if (attS.some(s => s.name.trim().toUpperCase() === normalized)) {
      showToast("Subject already exists", "error");
      return;
    }
  
    const newItem = {
      id: Date.now().toString(), // temporary id
      name: normalized,
      total: 0,
      attended: 0
    };
  
    // ✅ update UI FIRST (fast response)
    setAttS(prev => [...prev, newItem]);
  
    try {
      await attendanceAPI.add({
        subject: newSub,
        totalClasses: 0,
        attendedClasses: 0
      });
  
      showToast("Subject added", "success");
    } catch (err) {
      showToast("Failed to add subject", "error");
  
      // ❗ rollback if API fails
      setAttS(prev => prev.filter(s => s.name !== newSub));
    }
  };
  const total_p = attS.reduce((a, s) => a + s.attended, 0);
  const total_c = attS.reduce((a, s) => a + s.total, 0);
  const oa = total_c ? (total_p / total_c * 100).toFixed(1) : '0.0';

  return (
    <>
      <div className="ph">
        <div className="ptit">Attendance Tracker</div>
        <div className="psub">Track and monitor your attendance — Minimum 75% required</div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: '130px' }}>
          <div className="ctit">Overall</div>
          <div className="snum" style={{ color: parseFloat(oa) >= 75 ? 'var(--green3)' : 'var(--red2)' }}>{oa}%</div>
          <div className="slb">{parseFloat(oa) >= 75 ? '✓ You are safe' : '⚠ Below minimum'}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: '130px' }}>
          <div className="ctit">Present</div>
          <div className="snum" style={{ color: 'var(--accent3)' }}>{total_p}</div>
          <div className="slb">Classes attended</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: '130px' }}>
          <div className="ctit">Total Classes</div>
          <div className="snum">{total_c}</div>
          <div className="slb">Conducted so far</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: '130px' }}>
          <div className="ctit">Absent</div>
          <div className="snum" style={{ color: 'var(--red2)' }}>{total_c - total_p}</div>
          <div className="slb">Classes missed</div>
        </div>
      </div>

      {/* Subject breakdown */}
      <div className="card">
        <div className="ctit">Subject-wise Attendance</div>
        {attS.map((s, i) => {
          const pct = (s.attended / Math.max(s.total, 1) * 100).toFixed(1);
          const safe = parseFloat(pct) >= 75;
          const needed = Math.max(0, Math.ceil((0.75 * s.total - s.attended) / (1 - 0.75)));
          const canSkip = safe ? Math.floor((s.attended - 0.75 * s.total) / 0.75) : 0;

          return (
            <div key={i} className="asub2">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <input
  value={s.name || ""}
  placeholder="subject name"
  onChange={(e) => {
    const n = [...attS];
    n[i].name = e.target.value.toUpperCase();
    setAttS(n);
  }}
  onBlur={() => {}}
 
  style={{
    fontWeight: 600,
    fontSize: '13px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '4px 8px',
    color: 'var(--text1)',
    textTransform: 'uppercase' // ✅ CAPS while typing
  }}
/>
     <div className="apct" style={{ color: safe ? 'var(--green3)' : 'var(--red2)' }}>{pct}%</div>
              </div>
              <div className="pbar" style={{ marginBottom: '6px' }}>
                <div className="pfill" style={{ width: `${Math.min(parseFloat(pct), 100)}%`, background: safe ? 'var(--green2)' : 'var(--red)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text3)', marginBottom: '8px' }}>
                <span>{s.attended} / {s.total} classes attended</span>
                <span>{safe ? `Can skip ${canSkip} more safely` : `Need ${needed} more to reach 75%`}</span>
              </div>
              <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => markPresent(i)}
                  style={{ padding: '5px 12px', background: 'var(--green2)', color: '#fff', border: 'none', borderRadius: 'var(--r)', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                >
                  ✓ Present
                </button>
                <button
                  onClick={() => markAbsent(i)}
                  style={{ padding: '5px 12px', background: 'var(--bg4)', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                >
                  ✗ Absent
                </button>
                <button
                  onClick={() => undo(i)}
                  style={{ padding: '5px 12px', background: 'none', color: 'var(--text3)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                >
                  ↩ Undo
                </button>
                <button
                  onClick={() => remove(i)}
                  style={{ padding: '5px 12px', background: 'none', color: 'var(--red2)', border: '1px solid var(--red)', borderRadius: 'var(--r)', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          );
        })}
        <button className="bp" style={{ marginTop: '8px', fontSize: '12px', padding: '9px' }} onClick={addSubject}>
          + Add Subject
        </button>
      </div>
    </>
  );
};

export default Attendance;