import React, { useState, useEffect, useContext, useRef } from 'react';
import { aptitudeAPI } from '../services/api';
import { ToastContext } from '../components/Layout';

const esc = (s) => String(s || '');

const QUESTIONS = [
  { q: 'If FRIEND is coded as HUMJTK, how is CANDLE coded?', opts: ['EDRIRL','EDOMNK','DCQNQK','EDOMLK'], ans: 1 },
  { q: 'A train travels 360 km at uniform speed. If 5 km/h faster, it would take 1 hour less. Find the original speed.', opts: ['40 km/h','45 km/h','36 km/h','50 km/h'], ans: 0 },
  { q: 'Find the next number: 2, 6, 12, 20, 30, ?', opts: ['40','42','44','48'], ans: 1 },
  { q: 'Two pipes can fill a tank in 20 and 30 minutes respectively. Both opened together — how many minutes to fill?', opts: ['10 min','12 min','15 min','25 min'], ans: 1 },
  { q: 'If A:B = 3:4 and B:C = 5:6, find A:C.', opts: ['5:8','5:9','3:8','5:10'], ans: 0 },
  { q: 'A man walks 3 km north, then 4 km east. How far is he from the starting point?', opts: ['5 km','7 km','6 km','4 km'], ans: 0 },
  { q: 'What is the probability of getting a sum of 7 when two dice are rolled?', opts: ['1/6','7/36','1/9','5/36'], ans: 0 },
];

const Aptitude = () => {
  const showToast = useContext(ToastContext);
  const timerRef = useRef(null);

  const [aptCur,   setAptCur]   = useState(0);
  const [aptSel,   setAptSel]   = useState(null);
  const [aptShow,  setAptShow]  = useState(false);
  const [aptScore, setAptScore] = useState(0);
  const [aptDone,  setAptDone]  = useState(false);
  const [aptTimer, setAptTimer] = useState(30);

  // ── Load existing score from API ──
  useEffect(() => {
    aptitudeAPI.get()
      .then((res) => {
        const data = res.data;
        if (data?.score !== undefined) setAptScore(data.score);
      })
      .catch(() => {});
  }, []);

  // ── Start timer ──
  const startTimer = () => {
    clearInterval(timerRef.current);
    setAptTimer(30);
    timerRef.current = setInterval(() => {
      setAptTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setAptShow(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (!aptDone) startTimer();
    return () => clearInterval(timerRef.current);
  }, [aptCur, aptDone]);

  const pickApt = (i) => {
    if (aptShow) return;
    setAptSel(i);
    setAptShow(true);
    clearInterval(timerRef.current);
    if (i === QUESTIONS[aptCur].ans) setAptScore((s) => s + 1);
  };

  const nextApt = () => {
    if (aptCur < QUESTIONS.length - 1) {
      setAptCur((c) => c + 1);
      setAptSel(null);
      setAptShow(false);
    } else {
      setAptDone(true);
      clearInterval(timerRef.current);
      // Save score to API
      aptitudeAPI.update({ score: aptScore + (aptSel === QUESTIONS[aptCur].ans ? 0 : 0), total: QUESTIONS.length })
        .catch(() => {});
    }
  };

  const resetApt = () => {
    clearInterval(timerRef.current);
    setAptCur(0); setAptSel(null); setAptShow(false);
    setAptScore(0); setAptDone(false); setAptTimer(30);
    startTimer();
  };

  // ── Done screen ──
  if (aptDone) {
    const pct = Math.round(aptScore / QUESTIONS.length * 100);
    return (
      <>
        <div className="ph"><div className="ptit">Aptitude Practice</div></div>
        <div className="card" style={{ maxWidth:'500px', margin:'0 auto', textAlign:'center', padding:'40px 32px' }}>
          <div style={{ fontSize:'52px', marginBottom:'12px' }}>
            {pct===100?'🏆':pct>=60?'🥈':'📚'}
          </div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'52px', fontWeight:700, color:'var(--accent3)', lineHeight:1 }}>
            {aptScore}<span style={{ fontSize:'24px', color:'var(--text2)' }}> / {QUESTIONS.length}</span>
          </div>
          <div style={{ fontSize:'14px', color:'var(--text2)', margin:'10px 0 6px' }}>
            {pct===100?'Perfect score! Outstanding! 🎉':pct>=80?'Excellent work!':pct>=60?'Good job! Keep practicing!':"Keep working at it — you'll improve!"}
          </div>
          <div style={{ marginBottom:'24px' }}>
            <span className={`chip ${pct>=80?'cg':pct>=50?'cy':'cr'}`} style={{ fontSize:'14px', padding:'5px 14px' }}>
              {pct}% accuracy
            </span>
          </div>
          <button className="bp" style={{ maxWidth:'200px', margin:'0 auto' }} onClick={resetApt}>↺ Practice Again</button>
        </div>
      </>
    );
  }

  const q = QUESTIONS[aptCur];

  return (
    <>
      <div className="ph">
        <div className="ptit">Aptitude Practice</div>
        <div className="psub">Quantitative · Logical · Verbal Reasoning — 30 seconds per question</div>
      </div>

      <div style={{ maxWidth:'600px', margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
          <span style={{ fontSize:'12px', color:'var(--text3)' }}>Question {aptCur + 1} of {QUESTIONS.length}</span>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span id="aptTimer" style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'17px', fontWeight:700, color: aptTimer<=10?'var(--red2)':'var(--y3)' }}>
              {aptTimer}s
            </span>
            <span className="chip cb">Score: {aptScore} / {aptCur}</span>
          </div>
        </div>

        <div className="pbar" style={{ marginBottom:'18px' }}>
          <div className="pfill" style={{ width:`${aptCur/QUESTIONS.length*100}%`, background:'var(--accent)' }} />
        </div>

        <div className="card" style={{ marginBottom:'14px' }}>
          <div style={{ fontSize:'14px', fontWeight:500, lineHeight:1.7, color:'var(--text)' }}>{esc(q.q)}</div>
        </div>

        {q.opts.map((o, i) => (
          <div
            key={i}
            className={`mopt${aptShow ? (i===q.ans?' correct':aptSel===i?' wrong':'') : ''}`}
            onClick={() => pickApt(i)}
          >
            <strong style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{String.fromCharCode(65+i)}.</strong> {esc(o)}
          </div>
        ))}

        {aptShow && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'14px' }}>
            <div style={{ fontSize:'13px', fontWeight:600, color: aptSel===q.ans?'var(--green3)':'var(--red2)' }}>
              {aptSel===q.ans ? '✓ Correct!' : `✗ Correct answer: ${String.fromCharCode(65+q.ans)}. ${esc(q.opts[q.ans])}`}
            </div>
            <button className="bp" style={{ width:'auto', padding:'9px 24px', fontSize:'13px' }} onClick={nextApt}>
              {aptCur===QUESTIONS.length-1 ? 'See Results →' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Aptitude;