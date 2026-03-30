import { useState, useEffect } from "react";
import Login     from "./Components/Login";
import ChatRooms from "./Components/ChatRooms";
import Chat      from "./Components/Chat";

export default function App() {
  const [theme, setTheme]           = useState(() => localStorage.getItem("nc-theme") || "dark");
  const [user, setUser]             = useState(null);          // { username, email }
  const [activeRoom, setActiveRoom] = useState(null);          // { id, name }

  // Persist + apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nc-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const handleLogout = () => {
    setUser(null);
    setActiveRoom(null);
  };

  if (!user)
    return <Login setUser={setUser} theme={theme} toggleTheme={toggleTheme} />;

  if (activeRoom)
    return (
      <Chat
        user={user}
        room={activeRoom}
        theme={theme}
        toggleTheme={toggleTheme}
        onBack={() => setActiveRoom(null)}
      />
    );

  return (
    <ChatRooms
      user={user}
      theme={theme}
      toggleTheme={toggleTheme}
      onJoinRoom={setActiveRoom}
      onLogout={handleLogout}
    />
  );
}
