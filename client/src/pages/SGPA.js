import React, { useState, useContext} from 'react';
import { ToastContext } from '../components/Layout';
import { sgpaAPI } from '../services/api';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const esc = (s) => String(s || '');

const GRADES = ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'];
const GRADE_POINTS = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, F: 0 };

const SGPA = () => {
  const showToast = useContext(ToastContext);

  const [subjects, setSubjects] = useState([]);
 
  const [sgpaR, setSgpaR] = useState(null);

  const updateSubject = async (i, field, val) => {
    const updated = subjects.map((s, idx) =>
      idx === i ? { ...s, [field]: val } : s
    );
  
    setSubjects(updated);
    setSgpaR(null);
  
    
  };

  const addSubject = () => {
    setSubjects((prev) => [...prev, { name: '', cr: '0', grade: 'O' }]);
  };

  const removeSubject = (i) => {
    setSubjects((prev) => prev.filter((_, idx) => idx !== i));
    setSgpaR(null);
  };

  const calcSGPA = async () => {
    if (subjects.length === 0) {
      showToast('Please add at least one subject.', 'error');
      return;
    }
  
    // ✅ ADD THIS HERE
    const payload = subjects.map(s => ({
      credits: Number(s.cr),
      grade: GRADE_POINTS[s.grade]
    }));
  
    try {
      const res = await sgpaAPI.calculate({ subjects: payload }); // ✅ USE payload
  
      setSgpaR(res.data.sgpa);
  
      const val = parseFloat(res.data.sgpa);
      const label =
        val >= 9 ? 'Outstanding!' :
        val >= 8 ? 'Excellent!' :
        val >= 7 ? 'Good!' :
        'Keep working!';
  
      showToast(`SGPA Calculated: ${res.data.sgpa} — ${label}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to calculate SGPA', 'error');
    }
  };
  const downloadPDF = () => {
    if (!sgpaR) {
      showToast("Please calculate SGPA first", "error");
      return;
    }
  
    const doc = new jsPDF();
  
    // Title
    doc.setFontSize(18);
    doc.text("GITAM SGPA Report", 14, 20);
  
    // Summary
    doc.setFontSize(12);
  
    const totalCredits = subjects.reduce(
      (sum, s) => sum + Number(s.cr || 0),
      0
    );
  
    doc.text(`SGPA: ${sgpaR}`, 14, 35);
    doc.text(`Total Credits: ${totalCredits}`, 14, 45);
    doc.text(`Subjects: ${subjects.length}`, 14, 55);
  
    // ✅ TABLE DATA
    const tableData = subjects.map((s, i) => [
      i + 1,
      s.name,
      s.cr,
      s.grade
    ]);
  
    // ✅ TABLE
    autoTable(doc, {
      startY: 65,
      head: [['#', 'Subject', 'Credits', 'Grade']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 123, 255]
      }
    });
  
    doc.save("SGPA_Report.pdf");
  };

  const totalCredits = Array.isArray(subjects)
  ? subjects.reduce((a, s) => a + (parseFloat(s.cr) || 0), 0)
  : 0;

  return (
    <>
      <div className="ph">
        <div className="ptit">SGPA Calculator</div>
        <div className="psub">Calculate your Semester Grade Point Average · SGPA = Σ(Credit × GradePoint) / Σ Credits</div>
      </div>

      <div className="g2">
        {/* Subject input */}
        <div className="card">
          <div className="ctit">📝 Add Subject Grades</div>

          {subjects.map((s, i) => (
            <div key={i} className="srow2">
              <input
  placeholder="subject name"
  value={s.name || ""}
  onChange={(e) => updateSubject(i, 'name', e.target.value.toUpperCase())} // ✅ CAPS
  style={{
    flex: 2,
    textTransform: 'uppercase' // ✅ show CAPS while typing
  }}
/>
              <input
                type="number" placeholder="Credits"
                value={s.cr || ""} min="1" max="6"
                onChange={(e) => updateSubject(i, 'cr', e.target.value)}
                style={{ flex: .6, minWidth: '60px' }}
              />
              <select
                value={s.grade}
                onChange={(e) => updateSubject(i, 'grade', e.target.value)}
                style={{ flex: .8 }}
              >
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
              <button className="dbtn" onClick={() => removeSubject(i)} title="Remove subject">✕</button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', marginTop: '9px' }}>
            <button className="bsec" style={{ flex: 1, padding: '9px', fontSize: '12px', margin: 0 }} onClick={addSubject}>
              + Add Subject
            </button>
            <button className="bp bgreen" style={{ flex: 1, padding: '9px', fontSize: '12px' }} onClick={calcSGPA}>
              Calculate SGPA
            </button>
          </div>

          {subjects.length > 0 && (
            <>
              <div className="div" />
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
                Total Credits: <strong style={{ color: 'var(--text)' }}>{totalCredits}</strong>
                {' '}· Subjects: <strong style={{ color: 'var(--text)' }}>{subjects.length}</strong>
              </div>
            </>
          )}
        </div>

        {/* Result + Grade scale */}
        <div>
          <div className="card" style={{ marginBottom: '13px' }}>
            <div className="ctit">📊 Calculated Result</div>
            {sgpaR ? (
              <>
                <div style={{ textAlign: 'center', padding: '18px 0 12px' }}>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '58px', fontWeight: 700, color: 'var(--accent3)', lineHeight: 1 }}>
                    {sgpaR}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '6px' }}>Semester Grade Point Average</div>
                  <div style={{ marginTop: '10px' }}>
                    <span
                      className={`chip ${parseFloat(sgpaR)>=9?'cg':parseFloat(sgpaR)>=8?'cb':parseFloat(sgpaR)>=7?'cy':'cr'}`}
                      style={{ fontSize: '13px', padding: '4px 12px' }}
                    >
                      {parseFloat(sgpaR)>=9?'🏆 Outstanding':parseFloat(sgpaR)>=8?'⭐ Excellent':parseFloat(sgpaR)>=7?'👍 Good':'📚 Keep Going'}
                    </span>
                  </div>
                </div>
                <div className="div" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)' }}>
                  <span>Total Credits: <strong style={{ color: 'var(--text)' }}>{totalCredits}</strong></span>
                  <span>Subjects: <strong style={{ color: 'var(--text)' }}>{subjects.length}</strong></span>
                </div>
                <button
  className="bp"
  style={{ marginTop: '12px', fontSize: '12px', padding: '9px' }}
  onClick={downloadPDF}
>
  ⬇ Download PDF Report
</button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text3)', fontSize: '13px' }}>
                Add subjects with grades and click Calculate SGPA
              </div>
            )}
          </div>

          {/* Grade Scale */}
          <div className="card">
            <div className="ctit">📖 GITAM Grading Scale</div>
            <table className="dtbl">
              <thead>
                <tr><th>Grade</th><th>Grade Points</th><th>Classification</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>O</strong></td><td>10</td><td><span className="chip cg">Outstanding</span></td></tr>
                <tr><td><strong>A+</strong></td><td>9</td><td><span className="chip cb">Excellent</span></td></tr>
                <tr><td><strong>A</strong></td><td>8</td><td><span className="chip cb">Very Good</span></td></tr>
                <tr><td><strong>B+</strong></td><td>7</td><td><span className="chip cy">Good</span></td></tr>
                <tr><td><strong>B</strong></td><td>6</td><td><span className="chip cy">Above Average</span></td></tr>
                <tr><td><strong>C</strong></td><td>5</td><td><span className="chip cr">Average</span></td></tr>
                <tr><td><strong>F</strong></td><td>0</td><td><span className="chip cr">Fail</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default SGPA;