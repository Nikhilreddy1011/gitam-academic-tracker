import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Toast from './Toast';
import { useToast } from './Toast';
import { tasksAPI } from '../services/api';

// Global toast context so pages can trigger toasts
export const ToastContext = React.createContext(null);

const pageTitles = {
  '/dashboard':  'Dashboard',
  '/sgpa':       'SGPA Calculator',
  '/attendance': 'Attendance Tracker',
  '/tasks':      'Tasks (Timer)',
  '/planner':    'Study Planner',
  '/aptitude':   'Aptitude Practice',
  '/materials':  'Study Materials',
  '/calendar':   'Calendar',
  '/profile':    'My Profile',
};

const Layout = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('gat_theme') || 'dark');
  const [pendingCount, setPendingCount] = useState(0);
  const { toast, showToast, dismissToast } = useToast();

  const pathname = window.location.pathname;
  const title = pageTitles[pathname] || 'Dashboard';

  // Apply theme to body
  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('gat_theme', theme);
  }, [theme]);

  // Fetch pending tasks count for sidebar badge
  useEffect(() => {
    tasksAPI.getAll()
      .then((res) => {
        const tasks = res.data?.tasks || res.data || [];
        setPendingCount(tasks.filter((t) => !t.done && !t.completed).length);
      })
      .catch(() => {});
  }, [pathname]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ToastContext.Provider value={showToast}>
      <div className="app">
        <Sidebar pendingTasksCount={pendingCount} />
        <div className="main">
          <Topbar
            title={title}
            theme={theme}
            onToggleTheme={toggleTheme}
            onNotify={() => showToast('No new notifications', 'info')}
          />
          <main className="content" id="mainContent">
            {children}
          </main>
        </div>
      </div>
      <Toast toast={toast} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export default Layout;