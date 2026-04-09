import React, { useState, useEffect, useContext } from 'react';
import { tasksAPI } from '../services/api';
import { ToastContext } from '../components/Layout';

const esc = (s) => String(s || '');

// ✅ Capitalize helper
const capitalizeWords = (text) =>
  text.replace(/\b\w/g, (c) => c.toUpperCase());

const Tasks = () => {
  const showToast = useContext(ToastContext);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newTask, setNewTask] = useState({
    title: ''
  });

  // ✅ FETCH TASKS
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await tasksAPI.getAll();
      setTasks(res.data?.tasks || res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ✅ ADD TASK
  const addTask = async () => {
    if (!newTask.title.trim()) {
      showToast('Task title required', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await tasksAPI.create({
        title: newTask.title,
        status: "pending"
      });

      const created = res.data?.task || res.data;

      setTasks((prev) => [created, ...prev]);

      setNewTask({ title: '' });

      showToast('Task added successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to add task', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ✅ TOGGLE STATUS
  const toggleDone = async (task) => {
    const id = task._id || task.id;
  
    const newStatus =
      task.status === "completed" ? "pending" : "completed";
  
    try {
      // ✅ Call PUT API
      await tasksAPI.update(id, { status: newStatus });
  
      // ✅ Refresh tasks from backend
      await fetchTasks();
  
      showToast(
        newStatus === "completed"
          ? "Task marked as completed ✅"
          : "Task marked as pending ⏳",
        "info"
      );
    } catch (err) {
      console.error(err);
      showToast('Update failed', 'error');
    }
  };
  // ✅ DELETE
  const removeTask = async (task) => {
    const id = task._id || task.id;

    try {
      await tasksAPI.delete(id);
      setTasks((prev) =>
        prev.filter((t) => t._id !== id && t.id !== id)
      );
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const pending = tasks.filter((t) => t.status !== "completed");
  const done = tasks.filter((t) => t.status === "completed");

  return (
    <>
      <div className="ph">
        <div className="ptit">Tasks</div>
        <div className="psub">Manage your tasks</div>
      </div>

      <div className="g2">

        {/* ADD TASK */}
        <div className="card">
          <div className="ctit">➕ Add Task</div>

          <div className="fg">
            <label className="fl">Title *</label>
            <input
              className="fi"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({
                  title: capitalizeWords(e.target.value)
                })
              }
              placeholder="Enter task..."
            />
          </div>

          <button className="bp" onClick={addTask} disabled={saving}>
            {saving ? 'Adding...' : 'Add Task'}
          </button>
        </div>

        {/* TASK LIST */}
        <div className="card">
          <div className="ctit">
            Tasks
            <span className="badge">{pending.length} pending</span>
            {done.length > 0 && (
              <span className="badge">{done.length} done</span>
            )}
          </div>

          {loading && <p>Loading...</p>}

          {!loading && tasks.length === 0 && (
            <p>No tasks found</p>
          )}

          {tasks.map((t) => {
            const id = t._id || t.id;
            const isDone = t.status === "completed";

            return (
              <div key={id} className="titem">

                <div className="ttit">
                  <span style={isDone ? { textDecoration: 'line-through' } : {}}>
                    {esc(t.title)}
                  </span>
                </div>

                <div className="tmeta">
                  Status: {isDone ? "✅ Completed" : "⏳ Pending"}
                </div>

                {/* ✅ ACTION BUTTONS */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>

                  <button
                    onClick={() => toggleDone(t)}
                    className="bsec"
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px'
                    }}
                  >
                    {isDone ? "↩ Mark Pending" : "✔ Mark Complete"}
                  </button>

                  <button
                    onClick={() => removeTask(t)}
                    className="delbtn2"
                  >
                    🗑 Delete
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Tasks;