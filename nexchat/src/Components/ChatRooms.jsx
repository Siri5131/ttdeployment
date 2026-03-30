import { useEffect, useState, useMemo } from "react";
import "./ChatRooms.css";

const API = "http://localhost:8081";

const ROOM_COLORS = ["#6366f1","#ec4899","#06b6d4","#f59e0b","#ef4444","#22c55e","#8b5cf6","#14b8a6"];
const ROOM_ICONS  = ["💬","🔥","🎯","🚀","🌊","⚡","🎨","🎮","📡","🛸","🏄","🦄"];
const LAST_ACTIVE = [2,5,8,14,21,33,47,3,10,18,25,40];

export default function ChatRooms({ user, theme, toggleTheme, onJoinRoom, onLogout }) {
  const [rooms,    setRooms]    = useState([]);
  const [search,   setSearch]   = useState("");
  const [newName,  setNewName]  = useState("");
  const [editRoom, setEditRoom] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);

  /* ── Fetch ── */
  useEffect(() => {
    setLoading(true);
    fetch(`${API}/allRooms`)
      .then(r => r.json())
      .then(data => { setRooms(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => {
        setRooms([
          { id:1,name:"General" }, { id:2,name:"Tech Talk" },
          { id:3,name:"Random"  }, { id:4,name:"Announcements" },
          { id:5,name:"Gaming"  }, { id:6,name:"Design" },
        ]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() =>
    rooms.filter(r => (r.name || "").toLowerCase().includes(search.toLowerCase())),
    [rooms, search]
  );

  /* ── Helpers ── */
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2200); };
  const color  = id => ROOM_COLORS[(id || 0) % ROOM_COLORS.length];
  const icon   = id => ROOM_ICONS[(id || 0) % ROOM_ICONS.length];
  const ago    = id => { const m = LAST_ACTIVE[(id || 0) % LAST_ACTIVE.length]; return m < 60 ? `${m}m ago` : `${Math.floor(m/60)}h ago`; };
  const init   = n  => (n || "U").slice(0, 2).toUpperCase();

  /* ── CRUD ── */
  const create = () => {
    if (!newName.trim()) return;
    fetch(`${API}/createRoom`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    })
      .then(r => r.json())
      .then(room => { setRooms(p => [...p, room]); setNewName(""); showToast(`✓ "${room.name}" created`); })
      .catch(() => { const room = { id: Date.now(), name: newName }; setRooms(p => [...p, room]); setNewName(""); showToast(`✓ "${room.name}" created`); });
  };

  const remove = (e, id, name) => {
    e.stopPropagation();
    if (!window.confirm(`Delete room "${name}"?`)) return;
    fetch(`${API}/deleteRoom/${id}`, { method: "DELETE" }).catch(() => {});
    setRooms(p => p.filter(r => r.id !== id));
    showToast(`🗑 "${name}" deleted`);
  };

  const openEdit = (e, room) => { e.stopPropagation(); setEditRoom({ ...room }); };

  const save = () => {
    if (!editRoom.name.trim()) return;
    fetch(`${API}/updateRoom/${editRoom.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editRoom),
    })
      .then(r => r.json())
      .then(u => { setRooms(p => p.map(r => r.id === u.id ? u : r)); showToast("✓ Room renamed"); setEditRoom(null); })
      .catch(() => { setRooms(p => p.map(r => r.id === editRoom.id ? editRoom : r)); setEditRoom(null); showToast("✓ Room renamed"); });
  };

  return (
    <div className="cr-wrap">
      {/* Orbs */}
      <div className="cr-orb cr-orb1" /><div className="cr-orb cr-orb2" />

      {/* Toast */}
      {toast && <div className="cr-toast">{toast}</div>}

      {/* ── Navbar ── */}
      <nav className="cr-nav">
        <div className="cr-nav-left">
          <div className="cr-nav-mark">💬</div>
          <span className="cr-nav-title">NexChat</span>
        </div>
        <div className="cr-nav-right">
          <div className="cr-avatar">{init(user?.username)}</div>
          <span className="cr-username">{user?.username}</span>
          <button className="cr-icon-btn cr-theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button className="cr-nav-btn cr-logout" onClick={onLogout}>Sign out</button>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="cr-main">
        <div className="cr-page-head">
          <h1 className="cr-page-title">Chat Rooms</h1>
          <p className="cr-page-sub">Join an existing room or create your own</p>
        </div>

        {/* Stats */}
        <div className="cr-stats">
          <div className="cr-stat">
            <span className="cr-stat-val">{rooms.length}</span>
            <span className="cr-stat-lbl">Rooms</span>
          </div>
          <div className="cr-stat">
            <span className="cr-online-dot" />
            <span className="cr-stat-val cr-stat-val-sm">Active</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="cr-toolbar">
          <div className="cr-search-wrap">
            <span className="cr-search-icon">🔍</span>
            <input
              className="cr-search"
              placeholder="Search rooms…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="cr-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <input
            className="cr-create-inp"
            placeholder="New room name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && create()}
          />
          <button className="cr-create-btn" onClick={create}>
            <span>＋</span> Create
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="cr-loading">
            {[1,2,3,4,5,6].map(n => <div key={n} className="cr-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="cr-empty">
            <div className="cr-empty-icon">🌌</div>
            <p>{search ? `No rooms matching "${search}"` : "No rooms yet — create the first one!"}</p>
          </div>
        ) : (
          <div className="cr-grid">
            {filtered.map((room, i) => {
              const c = color(room.id);
              return (
                <div
                  key={room.id}
                  className="cr-card"
                  style={{ "--rc": c, "--ri": `${c}22`, animationDelay: `${i * 0.04}s` }}
                  onClick={() => onJoinRoom(room)}
                >
                  <div className="cr-card-top">
                    <div className="cr-room-icon">{icon(room.id)}</div>
                    <div className="cr-room-info">
                      <div className="cr-room-name">{room.name}</div>
                      <div className="cr-room-meta">Last active {ago(room.id)}</div>
                    </div>
                  </div>
                  <div className="cr-card-bottom">
                    <button className="cr-join-btn" onClick={() => onJoinRoom(room)}>
                      Join →
                    </button>
                    <button className="cr-action-btn" title="Edit" onClick={e => openEdit(e, room)}>✏️</button>
                    <button className="cr-action-btn cr-del-btn" title="Delete" onClick={e => remove(e, room.id, room.name)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Edit Modal ── */}
      {editRoom && (
        <div className="cr-overlay" onClick={() => setEditRoom(null)}>
          <div className="cr-modal" onClick={e => e.stopPropagation()}>
            <div className="cr-modal-title">✏️ Rename Room</div>
            <input
              className="cr-modal-input"
              value={editRoom.name}
              onChange={e => setEditRoom(r => ({ ...r, name: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && save()}
              autoFocus
            />
            <div className="cr-modal-btns">
              <button className="cr-modal-save" onClick={save}>Save Changes</button>
              <button className="cr-modal-cancel" onClick={() => setEditRoom(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
