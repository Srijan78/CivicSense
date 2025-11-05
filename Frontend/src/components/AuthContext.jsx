import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // {name,email,role,points,token}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // restore from localStorage
    const raw = localStorage.getItem("civic_auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        // optional: verify token with backend /me
        (async () => {
          try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ""}/me`, {
              headers: { Authorization: `Bearer ${parsed.token}` },
            });
            if (!res.ok) {
  localStorage.removeItem("civic_auth");
  setUser(null);
} else {
  const updated = await res.json();
  // Preserve token but refresh name, email, role, points
  saveUser({
    ...parsed,
    ...updated,
  });
}

          } catch {
            // network issues -> keep cached user but you may want to revalidate later
          } finally {
            setLoading(false);
          }
        })();
      } catch {
        localStorage.removeItem("civic_auth");
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  function saveUser(u) {
    setUser(u);
    if (u) localStorage.setItem("civic_auth", JSON.stringify(u));
    else localStorage.removeItem("civic_auth");
  }

const login = (payload) => {
  // payload should be { name, email, role, token, points? }
  saveUser(payload);
  // 🔁 Force reload so the /me endpoint refreshes name/email
  window.location.reload();
};

  const logout = () => {
    saveUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
