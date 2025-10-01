import React from "react";

const Header = ({ user }) => {
  return (
    <header className="flex items-center justify-between bg-gray-800 text-white px-6 py-3">
      {/* Logo & company name */}
      <div className="flex items-center gap-3">
        <img
          src="/LNT.png" // đặt logo trong public/logo.png
          alt="Company Logo"
          className="w-10 h-10"
        />
        <span className="text-xl font-bold">Book Guide by LNT Company</span>
      </div>

      {/* User info + login/logout */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span>{user.name}</span>
            <button className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
              Logout
            </button>
          </>
        ) : (
          <button className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600">
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
