import { useEffect, useState } from "react";
import { api } from "./lib/api";
import { setAccessToken, getAccessToken, clearAccessToken, setOrgId, getOrgId, clearOrgId } from "./lib/auth";

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


  useEffect(() => {
    if (!token) return;
    loadMe().then(loadOrgs).then(loadCurrentOrg).then(loadProjects).catch(() => logout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Cloud SaaS Platform</h1>

      {!token ? (
        <form onSubmit={login} style={{ display: "grid", gap: 12, maxWidth: 380 }}>
          <h2>Login</h2>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
          <button type="submit">Login</button>
          <p style={{ fontSize: 12, opacity: 0.8 }}>
            Use the test user you created in backend, or update email/password.
          </p>
        </form>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div><b>User:</b> {me?.email}</div>
              <div><b>Current Org:</b> {currentOrg ? `${currentOrg.name} (${currentOrg.role})` : "None selected"}</div>
            </div>
            <button onClick={logout}>Logout</button>
          </div>

          <hr style={{ margin: "16px 0" }} />

          <h2>Your Organizations</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {orgs.map((o) => {
              const selected = getOrgId() === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => chooseOrg(o.id)}
                  style={{
                    textAlign: "left",
                    padding: 12,
                    borderRadius: 12,
                    border: selected ? "2px solid #fff" : "1px solid #444",
                    opacity: selected ? 1 : 0.9,
                  }}
                >
                  <b>{o.name}</b> - role: {o.role} {selected ? " (selected)" : ""}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <input value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="New org name" />
            <button onClick={createOrg}>Create Org</button>
          </div>

          <hr style={{ margin: "16px 0" }} />
          <h2>Projects</h2>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="New project name" />
            <button onClick={createProject}>Create Project</button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {projects.map((p) => (
              <div key={p.id} style={{ padding: 12, border: "1px solid #444", borderRadius: 12 }}>
                {p.name}
              </div>
            ))}
          </div>

          <hr style={{ margin: "16px 0" }} />
          <h2>Invite Member</h2>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Email to invite" />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              <option value="member">member</option>
              <option value="admin">admin</option>
              <option value="owner">owner</option>
            </select>
            <button onClick={invite}>Invite</button>
          </div>
          <p style={{ fontSize: 12, opacity: 0.8 }}>
            Owner/Admin only. If user doesn't exist, API returns 202 (email sending later).
          </p>
        </>
      )}
    </div>
  );
}

