import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'dashboard',  path: '/dashboard',  ic: '🏠', lb: 'Dashboard' },
  { id: 'sgpa',       path: '/sgpa',       ic: '🎓', lb: 'SGPA Calculator' },
  { id: 'attendance', path: '/attendance', ic: '📊', lb: 'Attendance Tracker' },
  { id: 'tasks',      path: '/tasks',      ic: '⏱️', lb: 'Tasks ' },
  { id: 'planner',    path: '/planner',    ic: '📅', lb: 'Study Planner' },
  { id: 'aptitude',   path: '/aptitude',   ic: '🧮', lb: 'Aptitude Practice' },
  { id: 'materials',  path: '/materials',  ic: '📚', lb: 'Study Materials' },
  { id: 'calendar',   path: '/calendar',   ic: '🗓️', lb: 'Calendar' },
  { id: 'profile',    path: '/profile',    ic: '👤', lb: 'Profile' },
];

const Sidebar = ({ pendingTasksCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="sidebar" id="sidebar">
      <div className="slogo">
        <div className="licon">G</div>
        <div>
          <div className="ltxt">GITAM</div>
          <div className="lsub">Academic Tracker</div>
        </div>
      </div>
      <div className="ssec">
        <div className="slbl">Navigation</div>
        {navItems.map((n) => (
          <div
            key={n.id}
            className={`ni${location.pathname === n.path ? ' active' : ''}`}
            onClick={() => navigate(n.path)}
          >
            <span className="ic">{n.ic}</span>
            <span>{n.lb}</span>
            {n.id === 'tasks' && pendingTasksCount > 0 && (
              <span className="nbadge">{pendingTasksCount}</span>
            )}
          </div>
        ))}
        <div className="sdiv" />
        <a
          href="https://login.gitam.edu/"
          target="_blank"
          rel="noreferrer"
          className="ni"
          style={{ textDecoration: 'none' }}
        >
          <span className="ic">🔗</span>
          <span>GITAM Portal</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;