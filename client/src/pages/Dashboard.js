
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dashboardAPI, tasksAPI, attendanceAPI, profileAPI, eventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../components/Layout';
import {
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { studyAPI } from '../services/api';

const esc = (s) => String(s || '');

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const showToast = useContext(ToastContext);
  const [studyPlans, setStudyPlans] = useState([]);
  const [events, setEvents] = useState([]);

  const [dashData, setDashData] = useState({});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH ALL DATA
  const fetchAll = async () => {
    try {
      const [dashRes, tasksRes, attRes, studyRes, profileRes, eventsRes] = await Promise.all([
        dashboardAPI.get(),
        tasksAPI.getAll(),
        attendanceAPI.get(),
        studyAPI.getAll(),
        profileAPI.get(),
        eventsAPI.getAll()
      ]);
      setStudyPlans(studyRes.data || []);
      const profileData = profileRes.data?.user || profileRes.data?.profile || profileRes.data;
      if (profileData) updateUser(profileData);

      // ✅ ATTENDANCE FIX (using percentage)
      const attendanceList = Array.isArray(attRes.data)
        ? attRes.data
        : attRes.data?.subjects || [];

        const totalAttended = attendanceList.reduce(
          (sum, s) => sum + Number(s.attended || s.attendedClasses || 0),
          0
        );
        
        const totalClasses = attendanceList.reduce(
          (sum, s) => sum + Number(s.total || s.totalClasses || 0),
          0
        );
        
        const percentage = totalClasses
          ? Number(((totalAttended / totalClasses) * 100).toFixed(1))
          : 0;
        
        const totalPresent = totalAttended;
        const totalAbsent = totalClasses - totalAttended;

      setDashData({
        ...(dashRes.data || {}),
        attendance: {
          present: totalPresent,
          absent: totalAbsent,
          percentage
        }
      });
      setEvents(eventsRes.data?.events || eventsRes.data || dashRes.data?.events || []);

      setTasks(tasksRes.data?.tasks || tasksRes.data || []);

    } catch (err) {
      console.error(err);
      showToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOAD DATA
  useEffect(() => {
    fetchAll();
  }, [location.pathname]);

  // 🔥 AUTO REFRESH -- not while backgrounded, and not every 10s. Each tick
  // fires 6 parallel API calls; on a serverless host those can each hit a
  // separate cold function instance, so polling this aggressively was
  // actively making the app feel slower, not keeping it fresher.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchAll();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // TASKS
  const pending = tasks.filter(t => t.status !== "completed");
  const completed = tasks.filter(t => t.status === "completed");

  // ATTENDANCE
  const attendance = dashData?.attendance || {
    present: 0,
    absent: 0,
    percentage: 0
  };

  const attendanceData = [
    { name: 'Present', value: attendance.present },
    { name: 'Absent', value: attendance.absent }
  ];

  const taskData = [
    { name: 'Pending', value: pending.length },
    { name: 'Completed', value: completed.length }
  ];

  const COLORS = ['#00C49F', '#FF4D4F'];

  if (loading) {
    return <p style={{ textAlign: 'center' }}>Loading...</p>;
  }

  return (
    <>
      {/* HEADER */}
      <div className="ph">
        <div className="ptit">
          Welcome back, {esc(user?.name?.split(' ')[0])} 👋
        </div>
        <div className="psub">
          {esc(user?.regNo)} · {esc(user?.branch)} · Semester {user?.semester}
        </div>
      </div>

      {/* NAV */}
      <div className="qnav">
        {[
          ['sgpa','🎓','SGPA Calc'],
          ['attendance','📊','Attendance'],
          ['tasks','⏱️','Tasks'],
          ['planner','📅','Study Plan'],
          ['aptitude','🧮','Aptitude'],
          ['materials','📚','Materials'],
          ['calendar','🗓️','Calendar'],
          ['profile','👤','Profile'],
        ].map(([p, ic, lb]) => (
          <div key={p} className="qnb" onClick={() => navigate(`/${p}`)}>
            {ic} {lb}
          </div>
        ))}
      </div>

      {/* STATS */}
      <div className="g4">

        {/* ATTENDANCE */}
        <div className="card">
          <div className="ctit">📊 Attendance</div>
          <div className="snum">{attendance.percentage}%</div>

          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={attendanceData} dataKey="value" outerRadius={50}>
                {attendanceData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* RESULTS */}
        <div className="card">
          <div className="ctit">🎓 Results</div>
          <div className="snum">
            SGPA: {dashData?.sgpa ?? user?.sgpa ?? '-'}
          </div>
        </div>

        {/* TASKS */}
        <div className="card">
          <div className="ctit">⏱️ Tasks</div>
          <div className="snum">{pending.length}</div>
          <div className="smini">{completed.length} Done</div>

          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={taskData} dataKey="value" outerRadius={50}>
                {taskData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* APTITUDE */}
        <div className="card">
          <div className="ctit">🧮 Aptitude</div>
          <div className="snum">{dashData?.aptitudeScore || 0}</div>
        </div>

      </div>

      {/* COURSES + TIMETABLE */}
      <div className="g2 dash-mid-grid">

        {/* COURSES */}
        <div className="card dash-mid-card">
          <div className="ctit">📚 Events </div>

          {!events.length ? (
            <p>No events available</p>
          ) : (
            <table className="dtbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e._id || e.id}>
                    <td>{e?.date ? new Date(e.date).toLocaleDateString() : '-'}</td>
                    <td>{esc(e?.title || e?.name)}</td>
                    <td>{esc(e?.description || '—')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* STUDY PLAN TIMETABLE */}
<div className="card dash-mid-card">
  <div className="ctit">📅 Study Plan</div>

  {studyPlans.length === 0 ? (
    <p>No study plans</p>
  ) : (
    studyPlans.map((s, i) => (
      <div key={i} className="ttc">
        <div className="tdot" style={{ background: '#58a6ff' }} />
        <div className="ttime">{s.dailyHours} hrs</div>
        <div>
          <div className="tcrs">{s.subject}</div>
          <div className="troom">
            Exam: {new Date(s.examDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    ))
  )}
</div>

       </div>

      {/* TASK PREVIEW */}
      <div className="card dash-bottom-card">
        <div className="ctit">⏱️ Recent Tasks</div>

        {pending.length === 0 ? (
          <p>No pending tasks</p>
        ) : (
          pending.slice(0, 5).map((t) => (
            <div key={t._id || t.id} className="titem">
              <div className="ttit">{esc(t.title)}</div>
              <div className="tmeta">
                {t.status === "completed"
                  ? "✅ Completed"
                  : "⏳ Pending"}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Dashboard;

