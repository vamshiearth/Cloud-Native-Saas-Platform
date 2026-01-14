import { useEffect, useState } from "react";
import { api } from "./lib/api";

export default function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    api
      .get("/health/")
      .then((res) => setStatus(res.data?.status ?? "unknown"))
      .catch(() => setStatus("down"));
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Cloud SaaS Platform</h1>
      <p>Backend health: <b>{status}</b></p>

      <div style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>Dashboard</h2>
        <ul>
          <li>Projects</li>
          <li>Users & Roles</li>
          <li>Deployments (later: Kubernetes)</li>
        </ul>
      </div>
    </div>
  );
}
