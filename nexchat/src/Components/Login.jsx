import { useState } from "react";
import "./Login.css";

const API = "http://localhost:8081";

export default function Login({ setUser, theme, toggleTheme }) {
  const [tab,     setTab]     = useState("login");
  const [form,    setForm]    = useState({ username: "", email: "", password: "", confirm: "" });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const switchTab = t => { setTab(t); setError(""); setSuccess(""); };

  const validate = () => {
    const { username, email, password, confirm } = form;
    if (!username.trim())              return "Username is required.";
    if (username.trim().length < 3)    return "Username must be at least 3 characters.";
    if (tab === "register") {
      if (!email.trim() || !email.includes("@")) return "A valid email is required.";
      if (password.length < 6)         return "Password must be at least 6 characters.";
      if (password !== confirm)        return "Passwords do not match.";
    } else {
      if (!password)                   return "Password is required.";
    }
    return null;
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const endpoint = tab === "login" ? `${API}/login` : `${API}/register`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      if (tab === "register") {
        setSuccess("Account created! Signing you in…");
        setTimeout(() => setUser({ username: data.username || form.username, email: data.email || form.email }), 900);
      } else {
        setUser({ username: data.username || form.username, email: data.email || form.email });
      }
    } catch {
      // Offline demo: proceed without backend
      if (tab === "register") {
        setSuccess("Account created! Signing you in…");
        setTimeout(() => setUser({ username: form.username, email: form.email }), 900);
      } else {
        setUser({ username: form.username, email: form.email || `${form.username}@chat.app` });
      }
    } finally {
      setLoading(false);
    }
  };

  const onKey = e => e.key === "Enter" && handleSubmit();

  return (
    <div className="lp-wrap">
      {/* Ambient orbs */}
      <div className="lp-orb lp-orb1" />
      <div className="lp-orb lp-orb2" />

      {/* Theme toggle */}
      <button className="lp-theme-btn" onClick={toggleTheme} title="Toggle theme">
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div className="lp-card">
        {/* Brand */}
        <div className="lp-brand">
          <div className="lp-logo">💬</div>
          <span className="lp-brand-name">NexChat</span>
        </div>

        <h1 className="lp-heading">
          {tab === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="lp-sub">
          {tab === "login" ? "Sign in to your workspace" : "Join NexChat today — it's free"}
        </p>

        {/* Tabs */}
        <div className="lp-tabs">
          <button className={`lp-tab${tab === "login" ? " active" : ""}`} onClick={() => switchTab("login")}>
            Sign In
          </button>
          <button className={`lp-tab${tab === "register" ? " active" : ""}`} onClick={() => switchTab("register")}>
            Register
          </button>
        </div>

        {/* Alerts */}
        {error   && <div className="lp-alert lp-alert-error">⚠ {error}</div>}
        {success && <div className="lp-alert lp-alert-success">✓ {success}</div>}

        {/* Username */}
        <div className="lp-field">
          <label className="lp-label">Username</label>
          <input
            className="lp-input"
            placeholder="your_handle"
            value={form.username}
            onChange={e => set("username", e.target.value)}
            onKeyDown={onKey}
            autoComplete="username"
          />
        </div>

        {/* Email (register only) */}
        {tab === "register" && (
          <div className="lp-field">
            <label className="lp-label">Email</label>
            <input
              className="lp-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              onKeyDown={onKey}
              autoComplete="email"
            />
          </div>
        )}

        {/* Password */}
        <div className="lp-field">
          <label className="lp-label">Password</label>
          <div className="lp-pw-wrap">
            <input
              className="lp-input lp-pw-input"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={e => set("password", e.target.value)}
              onKeyDown={onKey}
              autoComplete={tab === "login" ? "current-password" : "new-password"}
            />
            <button className="lp-pw-toggle" onClick={() => setShowPw(s => !s)} type="button">
              {showPw ? "🙈" : "👁"}
            </button>
          </div>
          {/* Strength bar (register only) */}
          {tab === "register" && form.password.length > 0 && (
            <div className="lp-strength">
              {[1,2,3,4].map(n => {
                const strength = form.password.length >= 12 ? 4 : form.password.length >= 8 ? 3 : form.password.length >= 6 ? 2 : 1;
                return <div key={n} className={`lp-strength-bar${n <= strength ? ` s${strength}` : ""}`} />;
              })}
              <span className="lp-strength-lbl">
                {form.password.length >= 12 ? "Strong" : form.password.length >= 8 ? "Good" : form.password.length >= 6 ? "Fair" : "Weak"}
              </span>
            </div>
          )}
        </div>

        {/* Confirm password (register only) */}
        {tab === "register" && (
          <div className="lp-field">
            <label className="lp-label">Confirm Password</label>
            <input
              className="lp-input"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={form.confirm}
              onChange={e => set("confirm", e.target.value)}
              onKeyDown={onKey}
              autoComplete="new-password"
            />
          </div>
        )}

        {/* Submit */}
        <button className="lp-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait…" : tab === "login" ? "Sign In →" : "Create Account →"}
        </button>

        {/* Footer hint */}
        <p className="lp-foot">
          {tab === "login"
            ? <>Don't have an account? <button className="lp-link" onClick={() => switchTab("register")}>Register</button></>
            : <>Already have an account? <button className="lp-link" onClick={() => switchTab("login")}>Sign in</button></>
          }
        </p>
      </div>
    </div>
  );
}
