import { useEffect, useState } from "react";
import { moduleService } from "../services/moduleService";

export default function ModuleManager() {
  const [modules, setModules] = useState([]);
  const [newModule, setNewModule] = useState({ name: "", icon: "" });
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);

  const loadModules = async () => {
    setModules(await moduleService.list());
  };

  useEffect(() => {
    loadModules();
  }, []);

  const handleCreate = async () => {
    if (!newModule.name.trim()) return alert("Name required!");
    await moduleService.create(newModule);
    setNewModule({ name: "", icon: "" });
    loadModules();
  };

  const handleUpdate = async (id) => {
    await moduleService.update(id, editing);
    setEditing(null);
    loadModules();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this module?")) {
      await moduleService.remove(id);
      loadModules();
    }
  };

  const handleDetail = async (id) => {
    setDetail(await moduleService.detail(id));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📦 Modules Manager</h2>

      {/* Form thêm module */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Module name"
          value={newModule.name}
          onChange={(e) =>
            setNewModule((prev) => ({ ...prev, name: e.target.value }))
          }
          className="border rounded px-2 py-1 flex-1"
        />
        <input
          type="text"
          placeholder="Icon"
          value={newModule.icon}
          onChange={(e) =>
            setNewModule((prev) => ({ ...prev, icon: e.target.value }))
          }
          className="border rounded px-2 py-1 flex-1"
        />
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          ➕ Add
        </button>
      </div>

      {/* Danh sách modules */}
      <ul className="space-y-3">
        {modules.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between border p-3 rounded"
          >
            {editing?.id === m.id ? (
              <div className="flex gap-2 flex-1">
                <input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="border rounded px-2 py-1 flex-1"
                />
                <input
                  value={editing.icon}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  className="border rounded px-2 py-1 flex-1"
                />
                <button
                  onClick={() => handleUpdate(m.id)}
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                >
                  💾 Save
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1">
                  {m.icon && <i className={`mr-2 ${m.icon}`}></i>}
                  <b>{m.name}</b>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDetail(m.id)}
                    className="text-indigo-600 hover:underline"
                  >
                    👁 View
                  </button>
                  <button
                    onClick={() => setEditing(m)}
                    className="text-blue-600 hover:underline"
                  >
                    ✏ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-red-600 hover:underline"
                  >
                    🗑 Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Chi tiết module */}
      {detail && (
        <div className="mt-6 border p-4 rounded bg-gray-50">
          <h3 className="text-lg font-bold mb-2">📋 Module Detail</h3>
          <pre className="text-sm">{JSON.stringify(detail, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
