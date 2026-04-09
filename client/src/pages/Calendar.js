import React, { useState, useEffect, useContext } from 'react';
import { eventsAPI } from '../services/api';
import { ToastContext } from '../components/Layout';

const esc = (s) => String(s || '');
const dk = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const MN_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function CalGrid({ events, calM, calY, calSel, onSelect }) {
  const today = new Date();

  const calDays = () => {
    const first = new Date(calY, calM, 1).getDay();
    const last = new Date(calY, calM + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < first; i++) days.push({ date: new Date(calY, calM, -(first - i - 1)), other: true });
    for (let i = 1; i <= last; i++) days.push({ date: new Date(calY, calM, i), other: false });
    while (days.length % 7 !== 0) days.push({ date: new Date(calY, calM + 1, days.length - last - first + 1), other: true });
    return days;
  };

  return (
    <div className="cgrid">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
        <div key={d} className="cdh">{d}</div>
      ))}
      {calDays().map(({ date, other }, idx) => {
        const k = dk(date);
        const isT = dk(date) === dk(today);
        const hasEv = !!events[k];
        const isSel = k === calSel;
        return (
          <div
            key={idx}
            className={`cd${other ? ' om' : ''}${isT ? ' today' : ''}${hasEv ? ' hev' : ''}${isSel && !isT ? ' sel' : ''}`}
            onClick={() => onSelect(k)}
            title={events[k] || ''}
          >
            {date.getDate()}
          </div>
        );
      })}
    </div>
  );
}

const Calendar = () => {
  const showToast = useContext(ToastContext);
  const [events, setEvents] = useState({});
  const [rawList, setRawList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calM, setCalM] = useState(new Date().getMonth());
  const [calY, setCalY] = useState(new Date().getFullYear());
  const [calSel, setCalSel] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');

  const handleSelectDate = (dateKey) => {
    setCalSel(dateKey);
    setNewDate(dateKey);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getAll();
      const list = res.data?.events || res.data || [];
      setRawList(list);
      const map = {};
      list.forEach((e) => {
        const dateStr = String(e.date || e.eventDate || dk(new Date(e.createdAt))).slice(0, 10);
        map[dateStr] = e.title || e.name || e.description;
      });
      setEvents(map);
    } catch {
      showToast && showToast('Failed to load events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const selectedEvent = calSel
    ? rawList.find((e) => String(e.date || e.eventDate).slice(0, 10) === calSel)
    : null;

  const addEvent = async () => {
    const selectedDate = newDate || calSel;
    if (!newName.trim()) { showToast('Please enter an event name.', 'error'); return; }
    if (!selectedDate) { showToast('Please select a date.', 'error'); return; }
    setSaving(true);
    try {
      const res = await eventsAPI.create({
        title: newName.trim(),
        date: selectedDate,
        description: newDesc.trim()
      });
      const created = res.data?.event || res.data;
      setRawList((prev) => [...prev, created]);
      setEvents((prev) => ({ ...prev, [selectedDate]: newName }));
      setCalSel(selectedDate);
      setNewName('');
      setNewDesc('');
      showToast('Event added!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add event.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (dateKey) => {
    if (!window.confirm('Remove this event?')) return;
    const ev = rawList.find((e) => String(e.date || e.eventDate).slice(0, 10) === dateKey);
    const id = ev?._id || ev?.id;
    if (!id) return;
    try {
      await eventsAPI.delete(id);
      setRawList((prev) => prev.filter((e) => e._id !== id && e.id !== id));
      setEvents((prev) => { const next = { ...prev }; delete next[dateKey]; return next; });
      setCalSel(null);
      showToast('Event removed.', 'info');
    } catch {
      showToast('Failed to remove event.', 'error');
    }
  };

  const prevMonth = () => { if (calM === 0) { setCalM(11); setCalY((y) => y - 1); } else setCalM((m) => m - 1); };
  const nextMonth = () => { if (calM === 11) { setCalM(0); setCalY((y) => y + 1); } else setCalM((m) => m + 1); };

  return (
    <>
      <div className="ph">
        <div className="ptit">Calendar</div>
        <div className="psub">Manage exams, assignments, and academic events</div>
      </div>

      <div className="g2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button onClick={prevMonth} className="ibtn">‹</button>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '16px' }}>
              {MN_LONG[calM]} {calY}
            </span>
            <button onClick={nextMonth} className="ibtn">›</button>
          </div>
          <CalGrid events={events} calM={calM} calY={calY} calSel={calSel} onSelect={handleSelectDate} />
        </div>

        <div className="card">
          <div className="ctit">📋 Events</div>
          {calSel && events[calSel] && (
            <div style={{ background: 'rgba(31,111,235,.1)', border: '1px solid var(--accent)', borderRadius: 'var(--r)', padding: '12px', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--accent3)', marginBottom: '3px', fontWeight: 600 }}>{calSel}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{esc(events[calSel])}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '10px' }}>
                {esc(selectedEvent?.description) || 'No description'}
              </div>
              <button onClick={() => deleteEvent(calSel)} style={{ padding: '4px 10px', background: 'none', border: '1px solid var(--red)', borderRadius: '4px', fontSize: '11px', color: 'var(--red2)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                🗑 Remove Event
              </button>
            </div>
          )}

          <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '14px' }}>
            {loading && <div style={{ fontSize: '12px', color: 'var(--text3)', padding: '8px' }}>Loading events...</div>}
            {Object.entries(events).sort().map(([d, e]) => (
              <div key={d} onClick={() => setCalSel(d)} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 10px', borderRadius: 'var(--r)', cursor: 'pointer', marginBottom: '3px', background: d === calSel ? 'var(--bg3)' : 'transparent' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green3)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{esc(e)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{d}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="div" />
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '9px' }}>Add New Event</div>
          <div style={{ display: 'flex', gap: '7px', marginBottom: '8px' }}>
            <input className="fi" placeholder="Event name" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ flex: 2, fontSize: '12px' }} />
            <input type="date" className="fi" value={newDate || calSel || ''} onChange={(e) => setNewDate(e.target.value)} style={{ flex: 1.2, fontSize: '12px' }} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <input
              className="fi"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{ fontSize: '12px' }}
            />
          </div>
          <button className="bp bgreen" style={{ fontSize: '12px', padding: '9px' }} onClick={addEvent} disabled={saving}>
            {saving ? '⏳ Adding...' : 'Add Event'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Calendar;