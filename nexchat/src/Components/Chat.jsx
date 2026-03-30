import { useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import "./Chat.css";

let stompClient = null;

/* ── Constants ────────────────────────────────────────────── */
const AVATAR_PALETTES = [
  ["#6366f1","#8b5cf6"], ["#ec4899","#f43f5e"], ["#06b6d4","#0ea5e9"],
  ["#f59e0b","#f97316"], ["#22c55e","#10b981"], ["#a855f7","#d946ef"],
];
const EMOJIS = [
  "😀","😂","😍","🥺","😎","🔥","👍","❤️","💯","🎉",
  "😮","😢","🤔","🙌","✨","🚀","💬","⚡","🎨","🌊",
  "😅","🤣","😊","🥳","😤","😴","🤯","🫡","💀","🫶",
];
const QUICK_REACTS = ["👍","❤️","😂","😮","🙌","🔥"];
const DEMO_USERS   = ["Alice","Bob","Charlie","Dana"];
const MAX_CHARS    = 500;

/* ── Helpers ──────────────────────────────────────────────── */
const avatarGrad = name =>
  AVATAR_PALETTES[(name||"").split("").reduce((a,c)=>a+c.charCodeAt(0),0)%AVATAR_PALETTES.length];

const initials = n => (n||"?").slice(0,2).toUpperCase();

const fmtTime = d =>
  d instanceof Date ? d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : "";

const fmtDate = d => {
  if (!(d instanceof Date)) return "";
  const today=new Date(), yest=new Date(); yest.setDate(today.getDate()-1);
  if (d.toDateString()===today.toDateString()) return "Today";
  if (d.toDateString()===yest.toDateString())  return "Yesterday";
  return d.toLocaleDateString([],{month:"short",day:"numeric"});
};

/* ── Component ────────────────────────────────────────────── */
export default function Chat({ user, room, theme, toggleTheme, onBack }) {
  const [message,    setMessage]    = useState("");
  const [messages,   setMessages]   = useState([]);
  const [connected,  setConnected]  = useState(false);
  const [onlineUsers,setOnlineUsers]= useState([user.username, ...DEMO_USERS]);
  const [typing,     setTyping]     = useState(null);
  const [showEmoji,  setShowEmoji]  = useState(false);
  const [showSidebar,setShowSidebar]= useState(true);
  const [reactTarget,setReactTarget]= useState(null);
  const [toast,      setToast]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const typingTimer = useRef(null);

  /* ── Fetch existing messages ── */
  useEffect(() => {
    fetch(`http://localhost:8081/messages/${room.id}`)
      .then(r => r.json())
      .then(data => setMessages(data))
      .catch(console.error);
  }, [room.id]);

  /* ── WebSocket connect ── */
  useEffect(() => {
    try {
      const socket = new SockJS("http://localhost:8081/chat");
      stompClient = over(socket);
      stompClient.debug = null;
      stompClient.connect({}, () => {
        setConnected(true);
        stompClient.subscribe("/topic/messages", msg => {
          const m = JSON.parse(msg.body);
          setMessages(p => [...p, { ...m, ts: new Date(), reactions: {} }]);
        });
        stompClient.subscribe("/topic/typing", msg => {
          const { username: u, isTyping } = JSON.parse(msg.body);
          if (u !== user.username) setTyping(isTyping ? u : null);
        });
        pushSystem(`${user.username} joined #${room.name}`);
      }, () => setConnected(false));
    } catch {
      setConnected(false);
    }
    return () => { try { stompClient?.disconnect(); } catch {} };
  }, []);

  /* ── Auto-scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* ── Close popups on click-away ── */
  const closePopups = () => { setShowEmoji(false); setReactTarget(null); };

  /* ── Toast ── */
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  /* ── Helpers ── */
  const pushSystem = text =>
    setMessages(p => [...p, { sender:"system", content:text, ts:new Date(), reactions:{} }]);

  /* ── Send message ── */
  const send = useCallback(() => {
    if (!message.trim() || message.length > MAX_CHARS) return;
    const payload = { 
      content: message.trim(), 
      sender: user.username, 
      roomId: room.id,
      chatRoom: { id: room.id }
    };

    fetch("http://localhost:8081/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(savedMessage => {
        if (!connected || !stompClient?.connected) {
          setMessages(p => [...p, { ...savedMessage, ts: new Date(), reactions:{} }]);
        }
      })
      .catch(() => {
        setMessages(p => [...p, { ...payload, ts: new Date(), reactions:{} }]);
      });

    if (connected && stompClient?.connected) {
      stompClient.send("/app/sendMessage", {}, JSON.stringify(payload));
      stompClient.send("/app/typing", {}, JSON.stringify({ username: user.username, isTyping: false }));
    } 
    setMessage("");
    setShowEmoji(false);
    inputRef.current?.focus();
  }, [message, connected, user.username]);

  /* ── Typing indicator ── */
  const handleInput = val => {
    setMessage(val);
    if (!connected || !stompClient?.connected) return;
    stompClient.send("/app/typing", {}, JSON.stringify({ username: user.username, isTyping: true }));
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      stompClient.send("/app/typing", {}, JSON.stringify({ username: user.username, isTyping: false }));
    }, 1500);
  };

  const onKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  /* ── Emoji insert ── */
  const insertEmoji = emoji => { setMessage(m => m + emoji); inputRef.current?.focus(); };

  /* ── Reactions ── */
  const toggleReaction = (idx, emoji) => {
    setMessages(p => p.map((m,i) => {
      if (i !== idx) return m;
      const reacts = { ...m.reactions };
      if (!reacts[emoji]) reacts[emoji] = new Set();
      else reacts[emoji] = new Set(reacts[emoji]);
      if (reacts[emoji].has(user.username)) reacts[emoji].delete(user.username);
      else reacts[emoji].add(user.username);
      if (reacts[emoji].size === 0) delete reacts[emoji];
      return { ...m, reactions: reacts };
    }));
    setReactTarget(null);
  };

  /* ── Copy ── */
  const copyMsg = text => {
    navigator.clipboard?.writeText(text).catch(()=>{});
    showToast("✓ Copied to clipboard");
  };

  /* ── Search filter ── */
  const visibleMessages = search.trim()
    ? messages.filter(m => m.content?.toLowerCase().includes(search.toLowerCase()))
    : messages;

  /* ── Group by date ── */
  const grouped = (() => {
    const out = [];
    let lastDate = null;
    visibleMessages.forEach((m, i) => {
      const d = m.ts instanceof Date ? fmtDate(m.ts) : "";
      if (d && d !== lastDate) { out.push({ type:"date", label:d }); lastDate=d; }
      out.push({ type:"msg", msg:m, idx:messages.indexOf(m) });
    });
    return out;
  })();

  const isOwn = m => m.sender === user.username;
  const isSys = m => m.sender === "system";

  const [g1,g2] = avatarGrad(user.username);
  const charPct = message.length / MAX_CHARS;

  return (
    <div className="ch-wrap" onClick={closePopups}>
      {/* Toast */}
      {toast && <div className="ch-toast">{toast}</div>}

      {/* ── TOP BAR ── */}
      <div className="ch-top">
        <button className="ch-top-btn ch-back" onClick={onBack} title="Back">←</button>
        <div className="ch-room-info">
          <div className="ch-room-name"># {room.name}</div>
          <div className={`ch-room-status ${connected ? "online" : "offline"}`}>
            {connected ? `● Live · ${onlineUsers.length} online` : "○ Connecting…"}
          </div>
        </div>
        <div className="ch-top-actions">
          <button
            className={`ch-top-btn${showSearch?" active":""}`}
            onClick={e=>{e.stopPropagation();setShowSearch(s=>!s);if(showSearch)setSearch("");}}
            title="Search messages"
          >🔍</button>
          <button
            className={`ch-top-btn${showSidebar?" active":""}`}
            onClick={e=>{e.stopPropagation();setShowSidebar(s=>!s);}}
            title="Members"
          >👥</button>
          <button className="ch-top-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <div className="ch-top-avatar" style={{background:`linear-gradient(135deg,${g1},${g2})`}}>
            {initials(user.username)}
          </div>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="ch-search-bar" onClick={e=>e.stopPropagation()}>
          <span>🔍</span>
          <input
            className="ch-search-input"
            placeholder="Search messages…"
            value={search}
            onChange={e=>setSearch(e.target.value)}
            autoFocus
          />
          {search && <button className="ch-search-clear" onClick={()=>setSearch("")}>✕</button>}
          {search && <span className="ch-search-count">{visibleMessages.filter(m=>!isSys(m)).length} result(s)</span>}
        </div>
      )}

      {/* ── BODY ── */}
      <div className="ch-body">

        {/* ── SIDEBAR ── */}
        <div className={`ch-sidebar${showSidebar?"":" collapsed"}`}>
          <div className="ch-sidebar-inner">
            <div className="ch-sidebar-title">
              <span className="ch-online-dot"/>
              Members — {onlineUsers.length}
            </div>
            {onlineUsers.map((u, i) => {
              const [c1,c2] = avatarGrad(u);
              return (
                <div key={i} className="ch-user-item">
                  <div className="ch-user-av" style={{background:`linear-gradient(135deg,${c1},${c2})`}}>
                    {initials(u)}
                  </div>
                  <span className="ch-user-name">{u}</span>
                  {u === user.username && <span className="ch-you-badge">you</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MESSAGES ── */}
        <div className="ch-messages" onClick={closePopups}>
          {grouped.length === 0 ? (
            <div className="ch-empty">
              <div className="ch-empty-icon">{search ? "🔍" : "💬"}</div>
              <p>{search ? `No results for "${search}"` : "No messages yet. Say hello!"}</p>
            </div>
          ) : (
            grouped.map((item, gi) => {
              if (item.type === "date") return (
                <div key={`d${gi}`} className="ch-date-badge">
                  <span>{item.label}</span>
                </div>
              );
              const { msg:m, idx } = item;
              if (isSys(m)) return (
                <div key={idx} className="ch-row ch-sys-row">
                  <span className="ch-sys-msg">{m.content}</span>
                </div>
              );
              const own = isOwn(m);
              const [av1,av2] = avatarGrad(m.sender);
              return (
                <div key={idx} className={`ch-row${own?" own":""}`}>
                  {!own && (
                    <div className="ch-av" style={{background:`linear-gradient(135deg,${av1},${av2})`}}>
                      {initials(m.sender)}
                    </div>
                  )}
                  <div className="ch-bwrap">
                    {!own && <span className="ch-sender">{m.sender}</span>}

                    <div className="ch-bubble" onClick={e=>e.stopPropagation()}>
                      {m.content}
                      {/* Hover action bar */}
                      <div className="ch-actions">
                        {QUICK_REACTS.slice(0,3).map(e => (
                          <button key={e} className="ch-act-btn" onClick={()=>toggleReaction(idx,e)}>{e}</button>
                        ))}
                        <button className="ch-act-btn" title="More"
                          onClick={e=>{e.stopPropagation();setReactTarget(reactTarget===idx?null:idx);}}>＋</button>
                        <button className="ch-act-btn" title="Copy" onClick={()=>copyMsg(m.content)}>📋</button>
                      </div>
                      {/* Quick react picker */}
                      {reactTarget === idx && (
                        <div className="ch-quick-picker" onClick={e=>e.stopPropagation()}>
                          {QUICK_REACTS.map(e => (
                            <button key={e} className="ch-quick-btn" onClick={()=>toggleReaction(idx,e)}>{e}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reactions */}
                    {Object.keys(m.reactions||{}).length > 0 && (
                      <div className="ch-reactions">
                        {Object.entries(m.reactions).map(([emoji,users]) => users.size > 0 && (
                          <button
                            key={emoji}
                            className={`ch-react${users.has(user.username)?" mine":""}`}
                            onClick={()=>toggleReaction(idx,emoji)}
                          >
                            {emoji} <span className="ch-react-n">{users.size}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="ch-meta">
                      <span className="ch-time">{fmtTime(m.ts)}</span>
                      {own && <span className="ch-read">✓✓</span>}
                    </div>
                  </div>

                  {own && (
                    <div className="ch-av" style={{background:`linear-gradient(135deg,${av1},${av2})`}}>
                      {initials(m.sender)}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef}/>
        </div>
      </div>

      {/* ── TYPING ── */}
      <div className="ch-typing-bar">
        {typing && (
          <div className="ch-typing-txt">
            <div className="ch-dots">
              <div className="ch-dot"/><div className="ch-dot"/><div className="ch-dot"/>
            </div>
            {typing} is typing…
          </div>
        )}
      </div>

      {/* ── INPUT BAR ── */}
      <div className="ch-inputbar" onClick={e=>e.stopPropagation()}>
        <div className="ch-input-row">
          {/* Emoji btn */}
          <div style={{position:"relative",flexShrink:0}}>
            <button
              className={`ch-input-btn${showEmoji?" active":""}`}
              title="Emoji"
              onClick={e=>{e.stopPropagation();setShowEmoji(s=>!s);}}
            >😊</button>
            {showEmoji && (
              <div className="ch-emoji-picker" onClick={e=>e.stopPropagation()}>
                <div className="ch-emoji-grid">
                  {EMOJIS.map(e => (
                    <button key={e} className="ch-emoji-btn" onClick={()=>insertEmoji(e)}>{e}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            className="ch-input"
            placeholder={`Message #${room.name}…`}
            value={message}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={onKey}
            rows={1}
          />

          {/* Char ring + send */}
          <div className="ch-send-wrap">
            {message.length > MAX_CHARS * 0.7 && (
              <svg className="ch-char-ring" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--surface3)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none"
                  stroke={charPct >= 1 ? "var(--danger)" : charPct > 0.85 ? "var(--warn)" : "var(--accent)"}
                  strokeWidth="3" strokeDasharray={`${charPct*94.25} 94.25`}
                  strokeLinecap="round" transform="rotate(-90 18 18)"/>
              </svg>
            )}
            <button
              className="ch-send-btn"
              onClick={send}
              disabled={!message.trim() || message.length > MAX_CHARS}
              title="Send (Enter)"
            >➤</button>
          </div>
        </div>

        {/* Char count (near limit) */}
        {message.length > MAX_CHARS * 0.8 && (
          <div className="ch-char-count" style={{color: message.length >= MAX_CHARS ? "var(--danger)" : "var(--text-muted)"}}>
            {message.length}/{MAX_CHARS}
          </div>
        )}
      </div>
    </div>
  );
}
