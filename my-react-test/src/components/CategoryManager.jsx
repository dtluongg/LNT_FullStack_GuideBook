import { useEffect, useState } from "react";
import { categoryService } from "../services/categoryService";

export default function CategoryManager({ moduleId }) {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ title: "", description: "" });
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);

  const loadCategories = async () => {
    if (!moduleId) return;
    setCategories(await categoryService.list(moduleId));
  };

  useEffect(() => {
    loadCategories();
  }, [moduleId]);

  const handleCreate = async () => {
    if (!newCat.title.trim()) return alert("Title required!");
    await categoryService.create({ ...newCat, module_id: moduleId });
    setNewCat({ title: "", description: "" });
    loadCategories();
  };

  const handleUpdate = async (id) => {
    await categoryService.update(id, editing);
    setEditing(null);
    loadCategories();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      await categoryService.remove(id);
      loadCategories();
    }
  };

  const handleDetail = async (id) => {
    setDetail(await categoryService.detail(id));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📂 Categories Manager</h2>

      {/* Form thêm category */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Title"
          value={newCat.title}
          onChange={(e) =>
            setNewCat((prev) => ({ ...prev, title: e.target.value }))
          }
          className="border rounded px-2 py-1 flex-1"
        />
        <input
          type="text"
          placeholder="Description"
          value={newCat.description}
          onChange={(e) =>
            setNewCat((prev) => ({ ...prev, description: e.target.value }))
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

      {/* Danh sách categories */}
      <ul className="space-y-3">
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between border p-3 rounded"
          >
            {editing?.id === c.id ? (
              <div className="flex gap-2 flex-1">
                <input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="border rounded px-2 py-1 flex-1"
                />
                <input
                  value={editing.description || ""}
                  onChange={(e) =>
                    setEditing((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="border rounded px-2 py-1 flex-1"
                />
                <button
                  onClick={() => handleUpdate(c.id)}
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                >
                  💾 Save
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1">
                  <b>{c.title}</b> — {c.description}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDetail(c.id)}
                    className="text-indigo-600 hover:underline"
                  >
                    👁 View
                  </button>
                  <button
                    onClick={() => setEditing(c)}
                    className="text-blue-600 hover:underline"
                  >
                    ✏ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
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

      {/* Chi tiết category */}
      {detail && (
        <div className="mt-6 border p-4 rounded bg-gray-50">
          <h3 className="text-lg font-bold mb-2">📋 Category Detail</h3>
          <pre className="text-sm">{JSON.stringify(detail, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
