import { useState, useEffect } from "react";
import Canvas from "./components/Canvas";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login"); // 'login', 'register', 'canvas'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setView("canvas");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setView("canvas");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setView("login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (view === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setView("register")}
      />
    );
  }

  if (view === "register") {
    return (
      <Register
        onRegister={handleLogin}
        onSwitchToLogin={() => setView("login")}
      />
    );
  }

  return (
    <div className="canvas-container">
      <Canvas user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;
