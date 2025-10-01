import { useEffect, useState } from "react";
import { contentService } from "../services/contentService";

export default function ContentManager({ categoryId }) {
  const [contents, setContents] = useState([]);
  const [newContent, setNewContent] = useState({ title: "", html_content: "" });
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);

  const loadContents = async () => {
    if (!categoryId) return;
    setContents(await contentService.list(categoryId));
  };

  useEffect(() => {
    loadContents();
  }, [categoryId]);

  const handleCreate = async () => {
    if (!newContent.title.trim()) return alert("Title required!");
    await contentService.create({ ...newContent, category_id: categoryId });
    setNewContent({ title: "", html_content: "" });
    loadContents();
  };

  const handleUpdate = async (id) => {
    await contentService.update(id, editing);
    setEditing(null);
    loadContents();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this content?")) {
      await contentService.remove(id);
      loadContents();
    }
  };

  const handleDetail = async (id) => {
    setDetail(await contentService.detail(id));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📝 Contents Manager</h2>

      {/* Form thêm content */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Title"
          value={newContent.title}
          onChange={(e) =>
            setNewContent((prev) => ({ ...prev, title: e.target.value }))
          }
          className="border rounded px-2 py-1 flex-1"
        />
        <input
          type="text"
          placeholder="HTML Content"
          value={newContent.html_content}
          onChange={(e) =>
            setNewContent((prev) => ({
              ...prev,
              html_content: e.target.value,
            }))
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

      {/* Danh sách contents */}
      <ul className="space-y-3">
        {contents.map((c) => (
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
                  value={editing.html_content || ""}
                  onChange={(e) =>
                    setEditing((prev) => ({
                      ...prev,
                      html_content: e.target.value,
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
                  <b>{c.title}</b>
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

      {/* Chi tiết content */}
      {detail && (
        <div className="mt-6 border p-4 rounded bg-gray-50">
          <h3 className="text-lg font-bold mb-2">📋 Content Detail</h3>
          <pre className="text-sm">{JSON.stringify(detail, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
