import React, { useEffect, useState } from "react";
import { getModules } from "../api/modules";

const Navbar = ({ onSelectModule }) => {
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    getModules().then((res) => setModules(res.data.data));
  }, []);

  const handleSelect = (m) => {
    setActiveModule(m.id);
    onSelectModule(m);
  };

  return (
    <nav className="bg-gray-50 border-b p-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelect(m)}
            className={`flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-md border transition
              ${
                activeModule === m.id
                  ? "bg-blue-500 text-white border-blue-600 shadow"
                  : "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:border-blue-400"
              }`}
          >
            <i className={`${m.icon} text-sm`}></i>
            <span className="truncate">{m.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
