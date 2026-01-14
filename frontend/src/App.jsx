import { useEffect, useState } from "react";
import { api } from "./lib/api";
import "./App.css";
import {
  setAccessToken,
  setRefreshToken,
  getAccessToken,
  clearAccessToken,
  clearRefreshToken,
  setOrgId,
  getOrgId,
  clearOrgId,
} from "./lib/auth";

export default function App() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("Pass1234!");
  const [me, setMe] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [newOrgName, setNewOrgName] = useState("");

  const token = getAccessToken();

  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");


  async function loadMe() {
    const res = await api.get("/api/auth/me/");
    setMe(res.data);
  }

  async function loadOrgs() {
    const res = await api.get("/api/orgs/");
    setOrgs(res.data);

    // if selected org not in list anymore, clear it
    const selected = getOrgId();
    if (selected && !res.data.some((o) => o.id === selected)) {
      clearOrgId();
    }
  }


  async function loadCurrentOrg() {
    const orgId = getOrgId();
    if (!orgId) {
      setCurrentOrg(null);
      return;
    }
    const res = await api.get("/api/orgs/current/");
    setCurrentOrg(res.data);
  }

  async function login(e) {
    e.preventDefault();
    const res = await api.post("/api/auth/login/", { email, password });
    setAccessToken(res.data.access);
    setRefreshToken(res.data.refresh);

    await loadMe();
    const orgRes = await api.get("/api/orgs/");
    setOrgs(orgRes.data);

    // Auto-select first org if none selected
    if (!getOrgId() && orgRes.data.length > 0) {
      setOrgId(orgRes.data[0].id);
    }

    await loadCurrentOrg();
  }


  function logout() {
    clearAccessToken();
    clearRefreshToken();
    clearOrgId();
    setMe(null);
    setOrgs([]);
    setCurrentOrg(null);
  }

  async function chooseOrg(id) {
    setOrgId(id);
    await loadCurrentOrg();
    await loadProjects();
  }


  async function createOrg() {
    if (!newOrgName.trim()) return;
    await api.post("/api/orgs/", { name: newOrgName.trim() });
    setNewOrgName("");
    await loadOrgs();
  }


  async function loadProjects() {
    const res = await api.get("/api/projects/");
    setProjects(res.data);
  }

  async function createProject() {
    if (!newProjectName.trim()) return;
    await api.post("/api/projects/", { name: newProjectName.trim() });
    setNewProjectName("");
    await loadProjects();
  }

  async function invite() {
    if (!inviteEmail.trim()) return;
    await api.post("/api/orgs/invite/", { email: inviteEmail.trim(), role: inviteRole });
    setInviteEmail("");
  }

  function noopClick(e) {
    e.preventDefault();
  }


  useEffect(() => {
    if (!token) return;
    loadMe().then(loadOrgs).then(loadCurrentOrg).then(loadProjects).catch(() => logout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app">
      <div className="app-bg" aria-hidden="true" />
      <div className="shell">
        <header className="topbar">
          <button className="brand clickable" type="button" onClick={noopClick}>
            <span className="brand-logo" aria-hidden="true">
              <svg viewBox="0 0 64 40" role="img" aria-label="">
                <path
                  d="M21 32h26a11 11 0 0 0 1-22 14 14 0 0 0-27-2A10 10 0 0 0 21 32Z"
                  fill="white"
                />
                <path
                  d="M16 32h6a12 12 0 0 1-1-24 16 16 0 0 1 30 2 10 10 0 0 1-4 19"
                  fill="none"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            CloudSaaS
          </button>
          {token && (
            <>
              <nav className="nav">
                <button className="nav-item is-active clickable" type="button" onClick={noopClick}>Dashboard</button>
                <button className="nav-item clickable" type="button" onClick={noopClick}>Projects</button>
                <button className="nav-item clickable" type="button" onClick={noopClick}>Reports</button>
                <button className="nav-item clickable" type="button" onClick={noopClick}>Admin</button>
              </nav>
              <div className="user-chip">
                <button className="icon-button clickable bell" type="button" onClick={noopClick} aria-label="Notifications">
                  <svg viewBox="0 0 24 24" role="img" aria-label="">
                    <path
                      d="M12 21a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 21Zm6-6V11a6 6 0 1 0-12 0v4l-2 2v1h16v-1l-2-2Z"
                      fill="white"
                    />
                  </svg>
                </button>
                <button className="icon-button clickable avatar" type="button" onClick={noopClick}>
                  {(me?.email ?? "J").slice(0, 1).toUpperCase()}
                </button>
                <button className="menu-button clickable" type="button" onClick={noopClick}>
                  <span className="user-name">
                    {me?.email?.split("@")[0] ?? "John Doe"} | {currentOrg?.name ?? "Acme Corp"}
                  </span>
                  <span className="caret" aria-hidden="true">v</span>
                </button>
                <button className="ghost-button" type="button" onClick={logout}>Logout</button>
              </div>
            </>
          )}
        </header>

        {!token ? (
          <main className="auth">
            <div className="auth-card">
              <div className="auth-hero">
                <p className="eyebrow">Cloud-native platform</p>
                <h1>Welcome back</h1>
                <p className="muted">
                  Sign in to manage orgs, projects, and access control.
                </p>
              </div>
              <form onSubmit={login} className="form-card">
                <h2>Login</h2>
                <label className="field">
                  <span>Email</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
                </label>
                <label className="field">
                  <span>Password</span>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
                </label>
                <button type="submit" className="primary-button">Login</button>
                <p className="helper">
                  Use the test user you created in backend, or update email/password.
                </p>
              </form>
            </div>
          </main>
        ) : (
          <main className="dashboard">
            <section className="welcome">
              <div>
                <h1>Welcome, Admin!</h1>
                <p className="muted">Manage your cloud-native SaaS application.</p>
              </div>
            </section>

            <section className="stat-grid">
              <div className="stat-card">
                <div className="stat-icon stat-blue" />
                <div>
                  <p>Active Projects</p>
                  <h3>{projects.length}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-gold" />
                <div>
                  <p>Open Tasks</p>
                  <h3>42</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-indigo" />
                <div>
                  <p>Monthly Revenue</p>
                  <h3>$12,500</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-green" />
                <div>
                  <p>System Uptime</p>
                  <h3>99.9%</h3>
                </div>
              </div>
            </section>

            <section className="grid-2">
              <div className="panel">
                <div className="panel-header">
                  <h2>Recent Projects</h2>
                  <button className="secondary-button clickable" type="button" onClick={noopClick}>View All Projects</button>
                </div>
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.length === 0 ? (
                      <tr>
                        <td colSpan="3">No projects yet</td>
                      </tr>
                    ) : (
                      projects.slice(0, 3).map((p, index) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>
                            <span className={`pill ${index % 3 === 0 ? "pill-blue" : index % 3 === 1 ? "pill-green" : "pill-gold"}`}>
                              {index % 3 === 0 ? "In Progress" : index % 3 === 1 ? "Completed" : "Pending"}
                            </span>
                          </td>
                          <td>{index === 0 ? "Today" : index === 1 ? "1 day ago" : "2 days ago"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="panel">
                <h2>System Metrics</h2>
                <div className="chart-block">
                  <div className="chart-title">CPU Usage</div>
                  <div className="chart-line" />
                </div>
                <div className="chart-block">
                  <div className="chart-title">Response Time</div>
                  <div className="chart-bars" />
                </div>
              </div>
            </section>

            <section className="grid-2">
              <div className="panel">
                <div className="panel-header">
                  <h2>Tasks Overview</h2>
                  <button className="secondary-button clickable" type="button" onClick={noopClick}>View All Tasks</button>
                </div>
                <div className="task-list">
                  <label><input type="checkbox" /> Fix API endpoint error</label>
                  <label><input type="checkbox" /> Update user permissions</label>
                  <label><input type="checkbox" /> Backup database</label>
                </div>
              </div>
              <div className="panel">
                <div className="panel-header">
                  <h2>Alerts & Logs</h2>
                  <button className="secondary-button clickable" type="button" onClick={noopClick}>View Logs</button>
                </div>
                <div className="alert-list">
                  <div className="alert alert-high">High CPU Usage Alert - 10 mins ago</div>
                  <div className="alert alert-ok">Database Backup Completed - 1 hour ago</div>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <h2>Your Organizations</h2>
                <div className="inline-form">
                  <input value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="New org name" />
                  <button onClick={createOrg} className="primary-button">Create Org</button>
                </div>
              </div>
              <div className="panel-grid">
                {orgs.map((o) => {
                  const selected = getOrgId() === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => chooseOrg(o.id)}
                      className={`org-card${selected ? " is-selected" : ""}`}
                    >
                      <div>
                        <h4>{o.name}</h4>
                        <p>Role: {o.role}</p>
                      </div>
                      <span className="chip">{selected ? "Selected" : "Select"}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="panel split">
              <div>
                <div className="panel-header">
                  <h2>Projects</h2>
                  <div className="inline-form">
                    <input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="New project name" />
                    <button onClick={createProject} className="primary-button">Create Project</button>
                  </div>
                </div>
                <div className="panel-grid">
                  {projects.map((p) => (
                    <div key={p.id} className="project-card">
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="invite">
                <h2>Invite Member</h2>
                <div className="inline-form">
                  <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Email to invite" />
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                    <option value="owner">owner</option>
                  </select>
                  <button onClick={invite} className="primary-button">Invite</button>
                </div>
                <p className="helper">
                  Owner/Admin only. If user doesn't exist, API returns 202 (email sending later).
                </p>
              </div>
            </section>
          </main>
        )}
      </div>
    </div>
  );
}



