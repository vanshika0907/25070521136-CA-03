import { useEffect, useMemo, useState } from "react";
import { GraduationCap, LayoutDashboard, ClipboardList, CheckCircle2, Plus, Search, CalendarDays, LogOut, Trash2, Pencil, X, ArrowRight, Sparkles, Activity, Clock3, ShieldCheck, Check, Circle, BookOpen } from "lucide-react";

const API = "http://localhost:5000/api";
async function request(path, options = {}, token = "") {
  const response = await fetch(API + path, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}
const blank = { title: "", description: "", priority: "Medium", dueDate: "" };

export default function App() {
  const [session, setSession] = useState(() => { try { return JSON.parse(localStorage.getItem("studyflow-session") || "null"); } catch { return null; } });
  const [mode, setMode] = useState("login");
  const [auth, setAuth] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);

  async function loadTasks(token = session?.token) {
    if (!token) return;
    setLoading(true);
    try { setTasks(await request("/tasks", {}, token)); setNotice(""); }
    catch (e) { setNotice(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (session?.token) loadTasks(session.token); }, [session?.token]);

  function logout() { localStorage.removeItem("studyflow-session"); setSession(null); setTasks([]); setNotice(""); }
  async function authenticate(e) {
    e.preventDefault(); setBusy(true); setAuthError("");
    try {
      const data = await request(`/auth/${mode}`, { method: "POST", body: JSON.stringify(auth) });
      localStorage.setItem("studyflow-session", JSON.stringify(data)); setSession(data); setAuth({ name: "", email: "", password: "" });
    } catch (e) { setAuthError(e.message); } finally { setBusy(false); }
  }
  function openNew() { setEditing(null); setForm(blank); setModal(true); }
  function openEdit(task) { setEditing(task._id); setForm({ title: task.title, description: task.description || "", priority: task.priority, dueDate: task.dueDate || "" }); setModal(true); }
  async function saveTask(e) {
    e.preventDefault(); setBusy(true);
    try {
      const isEdit = Boolean(editing);
      const task = await request(isEdit ? `/tasks/${editing}` : "/tasks", { method: isEdit ? "PATCH" : "POST", body: JSON.stringify(form) }, session.token);
      setTasks(old => isEdit ? old.map(t => t._id === editing ? task : t) : [task, ...old]);
      setModal(false); setForm(blank); setNotice(isEdit ? "Task updated." : "Task created.");
    } catch (e) { setNotice(e.message); } finally { setBusy(false); }
  }
  async function toggle(task) {
    try { const updated = await request(`/tasks/${task._id}`, { method: "PATCH", body: JSON.stringify({ completed: !task.completed }) }, session.token); setTasks(old => old.map(t => t._id === updated._id ? updated : t)); }
    catch (e) { setNotice(e.message); }
  }
  async function remove(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try { await request(`/tasks/${task._id}`, { method: "DELETE" }, session.token); setTasks(old => old.filter(t => t._id !== task._id)); setNotice("Task deleted."); }
    catch (e) { setNotice(e.message); }
  }

  const stats = useMemo(() => ({ total: tasks.length, done: tasks.filter(t => t.completed).length, pending: tasks.filter(t => !t.completed).length, high: tasks.filter(t => !t.completed && t.priority === "High").length }), [tasks]);
  const visible = useMemo(() => tasks.filter(t => (filter === "All" || (filter === "Pending" ? !t.completed : t.completed)) && `${t.title} ${t.description}`.toLowerCase().includes(search.toLowerCase())), [tasks, filter, search]);
  const progress = stats.total ? Math.round(stats.done / stats.total * 100) : 0;
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || "there";

  if (!session?.token) return <main className="auth-page"><section className="hero"><div className="brand light"><span className="logo"><GraduationCap/></span>studyflow<span className="dot">.</span></div><div className="hero-copy"><span className="eyebrow"><Sparkles size={14}/> YOUR SPACE TO GROW</span><h1>Make room for<br/><em>what matters.</em></h1><p>A calmer way to plan your study sessions, track your progress, and turn small steps into big wins.</p><div className="hero-points"><span><CheckCircle2/> One clear plan</span><span><CheckCircle2/> Progress you can see</span></div></div><div className="hero-bottom"><CheckCircle2/><div><b>Small steps count</b><small>Keep showing up for yourself.</small></div></div></section><section className="auth-side"><div className="auth-box"><div className="auth-icon"><ShieldCheck/></div><h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2><p className="sub">{mode === "login" ? "Pick up where you left off." : "Your next chapter starts with one small step."}</p><form onSubmit={authenticate}>{mode === "register" && <label>Full name<input value={auth.name} onChange={e=>setAuth({...auth,name:e.target.value})} placeholder="Your name" required maxLength="60"/></label>}<label>Email address<input type="email" value={auth.email} onChange={e=>setAuth({...auth,email:e.target.value})} placeholder="you@example.com" required/></label><label>Password<input type="password" value={auth.password} onChange={e=>setAuth({...auth,password:e.target.value})} placeholder="At least 8 characters" minLength="8" required/></label>{authError&&<div className="error">{authError}</div>}<button className="primary wide" disabled={busy}>{busy?"Please wait…":mode==="login"?"Log in to StudyFlow":"Create account"} <ArrowRight size={17}/></button></form><p className="switch">{mode==="login"?"New to StudyFlow?":"Already have an account?"} <button onClick={()=>{setMode(mode==="login"?"register":"login");setAuthError("");}}>{mode==="login"?"Create an account":"Log in"}</button></p><div className="secure"><ShieldCheck size={14}/> Your tasks are saved to your account.</div></div><span className="auth-footer">STUDY SMARTER, ONE DAY AT A TIME</span></section></main>;

  return <div className="shell"><aside className="sidebar"><div className="brand"><span className="logo"><GraduationCap/></span>studyflow<span className="dot">.</span></div><div className="side-label">WORKSPACE</div><button className="nav active"><LayoutDashboard/> Overview</button><button className="nav" onClick={()=>setFilter("Pending")}><ClipboardList/> My tasks <span className="count">{stats.pending}</span></button><button className="nav" onClick={()=>setFilter("Completed")}><CheckCircle2/> Completed</button><div className="side-bottom"><div className="tip"><Sparkles/><b>A little reminder</b><p>Progress over perfection. Every completed task is a win.</p></div><div className="profile"><span className="avatar">{firstName[0].toUpperCase()}</span><div className="profile-text"><b>{session.user?.name}</b><small>{session.user?.email}</small></div><button className="icon-btn" onClick={logout} title="Log out"><LogOut/></button></div></div></aside><main className="main"><header className="topbar"><span className="crumb"><BookOpen/> Workspace <i>/</i> Overview</span><span className="today"><CalendarDays/> {new Date().toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}</span></header><div className="page"><section className="welcome"><div><span className="eyebrow"><Sparkles size={13}/> YOUR PERSONAL STUDY SPACE</span><h1>Good to see you, {firstName} ✨</h1><p>Let's make today a little more productive.</p></div><button className="primary" onClick={openNew}><Plus/> Add a task</button></section>{notice&&<div className="notice">{notice}<button onClick={()=>setNotice("")}><X/></button></div>}<section className="stats"><article><span>Total tasks <i className="stat-purple"><ClipboardList/></i></span><strong>{stats.total}</strong><small>Tasks in your workspace</small></article><article><span>Completed <i className="stat-green"><CheckCircle2/></i></span><strong>{stats.done}</strong><small>{progress}% of all tasks</small></article><article><span>In progress <i className="stat-blue"><Clock3/></i></span><strong>{stats.pending}</strong><small>Ready for your next step</small></article><article><span>High priority <i className="stat-amber"><Activity/></i></span><strong>{stats.high}</strong><small>Pending high-priority tasks</small></article></section><section className="columns"><article className="panel"><div className="panel-head"><div><h2>Your tasks</h2><p>Keep your next steps clear and achievable.</p></div><button className="small-primary" onClick={openNew}><Plus/> New task</button></div><div className="toolbar"><div className="filters">{["All","Pending","Completed"].map(f=><button className={filter===f?"selected":""} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div><label className="search"><Search/><input placeholder="Search tasks" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>{loading?<div className="empty">Loading tasks…</div>:visible.length?<div className="task-list">{visible.map(task=><div className="task" key={task._id}><button className={`task-check ${task.completed?"checked":""}`} onClick={()=>toggle(task)} aria-label="Toggle completion">{task.completed&&<Check/>}</button><div className="task-body"><b className={task.completed?"strike":""}>{task.title}</b>{task.description&&<p>{task.description}</p>}<div className="meta">{task.dueDate&&<span><CalendarDays/>{task.dueDate}</span>}<span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>{task.completed&&<span className="done-label">Completed</span>}</div></div><div className="task-tools"><button className="icon-btn" onClick={()=>openEdit(task)} title="Edit"><Pencil/></button><button className="icon-btn delete" onClick={()=>remove(task)} title="Delete"><Trash2/></button></div></div>)}</div>:<div className="empty"><span className="empty-icon"><Circle/></span><b>{search?"No matching tasks":filter==="Completed"?"Nothing completed yet":filter==="Pending"?"You're all caught up":"A fresh start"}</b><p>{search?"Try another search term.":"Add a task to make your plan for the day."}</p>{!search&&filter!=="Completed"&&<button className="text-btn" onClick={openNew}><Plus/> Create your first task</button>}</div>}</article><aside className="right-col"><article className="progress-card"><span className="progress-title"><Activity/> YOUR PROGRESS</span><h3>Every step adds up.</h3><p>You're building momentum, one task at a time.</p><div className="ring-wrap"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="47" className="ring-bg"/><circle cx="60" cy="60" r="47" className="ring-fill" style={{strokeDasharray:`${progress*2.953} 295.3`}}/></svg><div className="ring-label"><b>{progress}%</b><small>complete</small></div></div><div className="legend"><span><i/> Completed <b>{stats.done}</b></span><span><i/> Remaining <b>{stats.pending}</b></span></div></article><article className="quote"><span>“</span><p>You don't have to see the whole staircase. Just take the first step.</p><small>A GENTLE NUDGE</small></article></aside></section><footer>Made for your next little win. <span><ShieldCheck/> Your tasks are saved to your account</span></footer></div></main>{modal&&<div className="backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false);}}><section className="modal"><div className="modal-head"><div><small>{editing?"MAKE AN UPDATE":"MAKE A PLAN"}</small><h2>{editing?"Edit task":"Add a new task"}</h2></div><button className="icon-btn" onClick={()=>setModal(false)}><X/></button></div><form onSubmit={saveTask}><label>Task title<input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Revise graph theory" required maxLength="120"/></label><label>Description <small>(optional)</small><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Add a few details…" rows="3" maxLength="500"/></label><div className="two-fields"><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Due date <small>(optional)</small><input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setModal(false)}>Cancel</button><button className="primary" disabled={busy}>{busy?"Saving…":editing?"Save changes":"Create task"} <ArrowRight/></button></div></form></section></div>}</div>;
}
