import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

export default function UserMenu({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { effective } = useTheme();
  const isDark = effective === "dark";
  return (
    <div className="relative">
      <button onClick={() => setMenuOpen((s) => !s)} className={`flex items-center gap-2 px-2 py-1 rounded`}>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium`}>
          {user && user.name ? user.name.charAt(0) : "G"}
        </div>
        <span className="hidden sm:inline text-sm">{user ? user.name : "Guest"}</span>
      </button>

      {menuOpen && (
        <div className={`absolute right-0 mt-2 w-40 rounded shadow-lg z-50 bg-white dark:bg-slate-800`}>
          <div className="px-3 py-2 text-sm">{user ? user.email || user.name : "Not signed in"}</div>
          <div className="border-t" />
          <button className={`w-full text-left px-3 py-2 text-sm`}>Profile</button>
          {user ? (
            <button className={`w-full text-left px-3 py-2 text-sm`}>Logout</button>
          ) : (
            <button className={`w-full text-left px-3 py-2 text-sm`}>Login</button>
          )}
        </div>
      )}
    </div>
  );
}
