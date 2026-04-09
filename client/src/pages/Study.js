import React, { useState, useEffect, useContext } from 'react';
import { studyAPI } from '../services/api';
import { ToastContext } from '../components/Layout';

const esc = (s) => String(s || '');

const Study = () => {
  const showToast = useContext(ToastContext);

  const [planS, setPlanS] = useState([]);
  const [planSched, setPlanSched] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await studyAPI.getAll();
        console.log("Study API response:", res.data);
        const list = res.data || [];

        const formatted = list.map((p) => ({
          _id: p._id,
          name: p.subject || p.topic || '',
          examDate: p.examDate ? String(p.examDate).slice(0, 10) : '',
          hours: String(p.dailyHours ?? p.duration ?? 2),
        }));

        setPlanS(formatted);
        generateSchedule(formatted);

      } catch (err) {
        console.log(err);
        showToast("Failed to load study plans", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ================= GENERATE SCHEDULE =================
  const generateSchedule = (list) => {
    const today = new Date();

    const sched = list.map((s) => {
      const ex = new Date(s.examDate);
      const days = Math.ceil((ex - today) / 86400000);
      const hrs = parseFloat(s.hours || s.dailyHours || 1);

      return {
        subject: s.name,
        daysLeft: Math.max(0, days),
        dailyHrs: hrs,
        total: Math.max(0, days * hrs).toFixed(0)
      };
    }).sort((a, b) => a.daysLeft - b.daysLeft);

    setPlanSched(sched);
  };

  // ================= UPDATE FIELD =================
  const updatePlan = (i, field, value) => {
    setPlanS((prev) =>
      prev.map((p, idx) =>
        idx === i ? { ...p, [field]: value } : p
      )
    );
  };

  // ================= ADD SUBJECT =================
  const addRow = async () => {
    const subject = prompt("Enter subject name");
    if (!subject || !subject.trim()) return;

    const normalized = subject.trim().toUpperCase();

    // prevent duplicates
    if (planS.some(p => p.name === normalized)) {
      showToast("Subject already exists", "error");
      return;
    }

    try {
      const res = await studyAPI.create({
        subject: normalized,
        topic: normalized,
        duration: 2,
        examDate: new Date(),
        dailyHours: 2
      });

      const newPlan = res.data;

      const newItem = {
        _id: newPlan._id,
        name: newPlan.subject,
        examDate: newPlan.examDate?.slice(0, 10),
        hours: String(newPlan.dailyHours)
      };

      setPlanS(prev => {
        const updated = [...prev, newItem];
        generateSchedule(updated);
        return updated;
      });

      showToast("Subject added", "success");

    } catch {
      showToast("Failed to add subject", "error");
    }
  };

  // ================= DELETE =================
  const removeRow = async (id) => {
    try {
      await studyAPI.delete(id);

      setPlanS(prev => {
        const updated = prev.filter(p => p._id !== id);
        generateSchedule(updated);
        return updated;
      });

      showToast("Deleted successfully", "info");

    } catch {
      showToast("Delete failed", "error");
    }
  };

  // ================= SAVE (UPDATE ALL) =================
  const savePlans = async () => {
    setSaving(true);
    try {
      // No dedicated update endpoint exists; replace user's plans with latest edited data.
      await Promise.all(planS.filter((s) => s._id).map((s) => studyAPI.delete(s._id)));
      const recreated = await Promise.all(
        planS.map((s) =>
          studyAPI.create({
            subject: s.name,
            topic: s.name,
            duration: parseFloat(s.hours),
            examDate: s.examDate || null,
            dailyHours: parseFloat(s.hours)
          })
        )
      );
      const updatedList = recreated.map((r) => r.data).map((p) => ({
        _id: p._id,
        name: p.subject || p.topic || '',
        examDate: p.examDate ? String(p.examDate).slice(0, 10) : '',
        hours: String(p.dailyHours ?? p.duration ?? 2),
      }));
      setPlanS(updatedList);
      generateSchedule(updatedList);

      showToast("Saved successfully", "success");
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // ================= UI =================
  return (
    <>
      <div className="ph">
        <div className="ptit">Study Planner</div>
        <div className="psub">
          Plan your subjects and generate a smart study schedule
        </div>
      </div>

      <div className="g2">

        {/* ================= LEFT: INPUT ================= */}
        <div className="card">
          <div className="ctit">📚 Study Plan</div>

          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading...</p>
          ) : (
            planS.map((s, i) => (
              <div key={s._id} className="asub2">

                <input
                  value={esc(s.name)}
                  placeholder="Subject"
                  onChange={(e) => updatePlan(i, 'name', e.target.value.toUpperCase())}
                  className="fi"
                />

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>

                  <input
                    type="date"
                    value={esc(s.examDate)}
                    onChange={(e) => updatePlan(i, 'examDate', e.target.value)}
                    className="fi"
                  />

                  <input
                    type="number"
                    value={esc(s.hours)}
                    min="1"
                    onChange={(e) => updatePlan(i, 'hours', e.target.value)}
                    className="fi"
                  />

                  <button onClick={() => removeRow(s._id)} className="dbtn">
                    🗑
                  </button>

                </div>
              </div>
            ))
          )}

          <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
            <button className="bp" onClick={addRow}>
              + Add Subject
            </button>

            <button className="bp bgreen" onClick={savePlans} disabled={saving}>
              {saving ? "Saving..." : "Save Plan"}
            </button>
          </div>
        </div>

        {/* ================= RIGHT: SCHEDULE ================= */}
        <div className="card">
          <div className="ctit">📅 Study Schedule</div>

          {planSched && planSched.length > 0 ? (
            planSched.map((p, i) => (
              <div key={i} className="pslot">
                <div className="psub2">{p.subject}</div>
                <div className="ptim">
                  {p.daysLeft} days left · {p.dailyHrs} hrs/day
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center' }}>
              Add subjects to generate schedule
            </p>
          )}
        </div>

      </div>
    </>
  );
};

export default Study;