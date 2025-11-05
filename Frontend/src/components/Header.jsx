import React, { useState } from "react";
import { Trophy, ClipboardList, PlusCircle, Building2, Menu, X } from "lucide-react";
import { useAuth } from "./AuthContext";
import AuthModal from "./AuthModal";

export default function Header({ activeTab, onChange }) {
  const { user, login, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const commonTabs = [
    { key: "report", label: "Report", icon: PlusCircle },
    { key: "feed", label: "Community Feed", icon: ClipboardList },
    { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const municipalTab = { key: "municipal", label: "Municipal Dashboard", icon: Building2 };
  const visibleTabs = user?.role === "municipal" ? [...commonTabs, municipalTab] : commonTabs;

  return (
    <>
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white grid place-items-center font-bold">
              CS
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">Civic-Sense</h1>
              <p className="text-xs text-gray-500 -mt-0.5 hidden sm:block">
                Crowdsourced Urban Resilience Platform
              </p>
            </div>
          </div>

          {/* Hamburger Button (Mobile Only) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-emerald-600 transition"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onChange(key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === key
                    ? "bg-emerald-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-current={activeTab === key ? "page" : undefined}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Auth Section (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-700 truncate max-w-[120px]">
                  Hi, {user.name || user.email}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Login / Signup
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-sm animate-in">
            <nav className="flex flex-col px-4 py-2 space-y-1">
              {visibleTabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    onChange(key);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeTab === key
                      ? "bg-emerald-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}

              {/* Auth Section (Mobile) */}
              <div className="pt-3 border-t border-gray-100">
                {user ? (
                  <>
                    <span className="block text-sm text-gray-700 mb-2">
                      Hi, {user.name || user.email}
                    </span>
                    <button
                      onClick={logout}
                      className="w-full px-3 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuth(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Login / Signup
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          open={showAuth}
          onClose={() => setShowAuth(false)}
          onLogin={login}
        />
      )}
    </>
  );
}
