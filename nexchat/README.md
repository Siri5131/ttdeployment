# NexChat — Frontend

A modern, full-featured real-time chat application built with React + Vite + WebSocket (STOMP over SockJS).

## 📁 Project Structure

```
nexchat/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx          ← React entry point
    ├── index.css         ← Global design tokens (dark/light theme)
    ├── App.jsx           ← Root router (Login → Rooms → Chat)
    └── Components/
        ├── Login.jsx     ← Login & Register page
        ├── Login.css
        ├── ChatRooms.jsx ← Room listing, CRUD, search
        ├── ChatRooms.css
        ├── Chat.jsx      ← Full chat page with all features
        └── Chat.css
```

## 🚀 Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# App runs at → http://localhost:5173
```

> **Note:** The app includes offline fallback mode — it works without a backend  
> for demo/testing. Connect your Spring Boot backend at `http://localhost:8081` for live features.

## 🔌 Backend Requirements

Your Spring Boot backend should expose:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/login` | POST | Login user |
| `/register` | POST | Register user |
| `/allRooms` | GET | Fetch all rooms |
| `/createRoom` | POST | Create a room |
| `/updateRoom/:id` | PUT | Rename a room |
| `/deleteRoom/:id` | DELETE | Delete a room |
| `/chat` | WS | SockJS WebSocket endpoint |
| `/topic/messages` | STOMP sub | Receive messages |
| `/topic/typing` | STOMP sub | Typing indicators |
| `/app/sendMessage` | STOMP pub | Send a message |
| `/app/typing` | STOMP pub | Send typing status |

## ✨ Features

### Login Page
- Sign In / Register tabs
- Password show/hide toggle
- Password strength meter
- Client-side validation
- Works offline (demo mode)

### Chat Rooms Page
- Responsive room grid with unique color accents
- Live search / filter rooms
- Create, Rename (modal), Delete rooms
- Skeleton loading state
- Toast notifications
- Room last-active timestamps

### Chat Page
- Real-time messaging via WebSocket (STOMP)
- **Emoji picker** — click to insert emojis
- **Message reactions** — hover to react, click to toggle, counts shown
- **Typing indicator** — animated dots
- **Online users sidebar** — collapsible members list
- **Message search** — search/filter messages in the current room
- **Copy message** — copy any message to clipboard
- **Timestamps** on every message
- **Read receipts** (✓✓) on own messages
- **Character counter** with SVG ring indicator
- Multi-line textarea (Shift+Enter for newlines)
- System join/leave messages

### Global
- 🌙 Dark / ☀️ Light theme toggle — persisted in `localStorage`
- Fully responsive (mobile-friendly)
- Smooth animations throughout
- Works without backend (demo fallback)
