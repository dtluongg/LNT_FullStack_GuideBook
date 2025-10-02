import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';

const CategoryList = ({ moduleId, onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Search
  const [search, setSearch] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editOrder, setEditOrder] = useState(0);
  const [editActive, setEditActive] = useState(true);

  // Add state
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newParent, setNewParent] = useState(null);
  const [newOrder, setNewOrder] = useState(0);
  const [newActive, setNewActive] = useState(true);

  // Load categories khi đổi module
  useEffect(() => {
    if (moduleId) {
      categoryService.list(moduleId).then(setCategories);
    }
  }, [moduleId]);

  const handleEdit = async (id) => {
    if (!editTitle.trim()) return;
    await categoryService.update(id, {
      title: editTitle,
      order_index: editOrder,
      is_active: editActive,
    });
    const refreshed = await categoryService.list(moduleId);
    setCategories(refreshed);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá category này?')) {
      await categoryService.remove(id);
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;

    // lấy danh sách cùng cấp
    const sameLevel = categories.filter(
      (c) => (c.parent_id || null) === (newParent || null)
    );
    const maxOrder =
      sameLevel.length > 0
        ? Math.max(...sameLevel.map((c) => c.order_index || 0))
        : 0;

    await categoryService.create({
      module_id: moduleId,
      parent_id: newParent || null,
      title: newTitle,
      order_index: maxOrder + 1, // ✅ auto tăng
      is_active: newActive,
    });

    const refreshed = await categoryService.list(moduleId);
    setCategories(refreshed);
    setAdding(false);
    setNewTitle('');
    setNewParent(null);
    setNewOrder(0);
    setNewActive(true);
  };

  // Tách cha/con
  const topLevel = categories.filter((c) => !c.parent_title);
  const childrenMap = categories.reduce((map, c) => {
    if (c.parent_title) {
      if (!map[c.parent_title]) map[c.parent_title] = [];
      map[c.parent_title].push(c);
    }
    return map;
  }, {});

  // Lọc search
  const filterCategory = (text) => {
    if (!text) return { topLevel, childrenMap };
    const lower = text.toLowerCase();

    const filteredParents = topLevel.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        (childrenMap[p.title] &&
          childrenMap[p.title].some((c) =>
            c.title.toLowerCase().includes(lower)
          ))
    );

    const filteredChildren = {};
    filteredParents.forEach((p) => {
      filteredChildren[p.title] = (childrenMap[p.title] || []).filter((c) =>
        c.title.toLowerCase().includes(lower)
      );
    });

    return { topLevel: filteredParents, childrenMap: filteredChildren };
  };

  const { topLevel: filteredParents, childrenMap: filteredChildren } =
    filterCategory(search);

  const handleMove = async (cat, direction) => {
    // lấy danh sách cùng cấp
    const sameLevel = categories.filter(
      (c) => (c.parent_id || null) === (cat.parent_id || null)
    );
    // sort theo order_index
    const sorted = [...sameLevel].sort((a, b) => a.order_index - b.order_index);

    const index = sorted.findIndex((c) => c.id === cat.id);
    let swapWith = null;

    if (direction === 'up' && index > 0) {
      swapWith = sorted[index - 1];
    } else if (direction === 'down' && index < sorted.length - 1) {
      swapWith = sorted[index + 1];
    }

    if (!swapWith) return; // ko swap đc

    // hoán đổi order_index
    await categoryService.update(cat.id, { order_index: swapWith.order_index });
    await categoryService.update(swapWith.id, { order_index: cat.order_index });

    const refreshed = await categoryService.list(moduleId);
    setCategories(refreshed);
  };

  return (
    <aside className='w-[25%] border-r bg-gray-50 p-3 overflow-y-auto h-full'>
      {/* Search box */}
      <input
        type='text'
        placeholder='Search category...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='w-full mb-3 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none'
      />

      {/* Danh sách category */}
      <ul className='space-y-2'>
        {filteredParents.map((parent) => (
          <li key={parent.id}>
            <div
              onClick={() => {
                setSelectedCategory(parent.id);
                onSelectCategory?.(parent.id);
              }}
              className={`px-3 py-2 text-sm font-medium border rounded-md cursor-pointer transition flex justify-between items-center
                ${
                  selectedCategory === parent.id
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 hover:from-blue-100 hover:to-blue-200'
                }`}
            >
              {editingId === parent.id ? (
                <div className='flex flex-col gap-2 w-full'>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className='border px-2 py-1 text-sm rounded'
                    placeholder='Title'
                  />
                  <input
                    type='number'
                    value={editOrder}
                    onChange={(e) => setEditOrder(Number(e.target.value))}
                    className='border px-2 py-1 text-sm rounded'
                    placeholder='Order index'
                  />
                  <label className='flex items-center gap-2 text-sm'>
                    <input
                      type='checkbox'
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                    />
                    Active
                  </label>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleEdit(parent.id)}
                      className='flex-1 px-3 py-1 bg-green-500 text-white text-sm rounded-md'
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)} // ✅ huỷ edit
                      className='flex-1 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-sm rounded-md'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <span>{parent.title}</span>
              )}

              <div className='flex gap-1 ml-2'>
                <button
                  onClick={() => handleMove(parent, 'up')}
                  disabled={
                    categories
                      .filter((c) => (c.parent_id || null) === null)
                      .sort((a, b) => a.order_index - b.order_index)[0]?.id ===
                    parent.id
                  }
                  className='p-1 rounded hover:bg-gray-100 text-gray-500 text-xs disabled:opacity-30'
                  title='Move up'
                >
                  ⬆️
                </button>
                <button
                  onClick={() => handleMove(parent, 'down')}
                  disabled={
                    categories
                      .filter((c) => (c.parent_id || null) === null)
                      .sort((a, b) => a.order_index - b.order_index)
                      .at(-1)?.id === parent.id
                  }
                  className='p-1 rounded hover:bg-gray-100 text-gray-500 text-xs disabled:opacity-30'
                  title='Move down'
                >
                  ⬇️
                </button>
                <button
                  onClick={() => {
                    setEditingId(parent.id);
                    setEditTitle(parent.title);
                    setEditOrder(parent.order_index || 0);
                    setEditActive(parent.is_active);
                  }}
                  className='p-1 rounded hover:bg-blue-100 text-blue-500 text-xs'
                  title='Edit'
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(parent.id)}
                  className='p-1 rounded hover:bg-red-100 text-red-500 text-xs'
                  title='Delete'
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Category con */}
            {filteredChildren[parent.title] &&
              filteredChildren[parent.title].length > 0 && (
                <ul className='mt-1 space-y-1'>
                  {filteredChildren[parent.title].map((child) => (
                    <li
                      key={child.id}
                      onClick={() => {
                        setSelectedCategory(child.id);
                        onSelectCategory?.(child.id);
                      }}
                      className={`px-3 py-2 text-xs border rounded-md cursor-pointer transition flex justify-between items-center
                        ${
                          selectedCategory === child.id
                            ? 'bg-blue-500 text-white border-blue-600'
                            : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200'
                        }`}
                    >
                      {editingId === child.id ? (
                        <div className='flex flex-col gap-2 w-full'>
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className='border px-2 py-1 text-sm rounded'
                            placeholder='Title'
                          />
                          <input
                            type='number'
                            value={editOrder}
                            onChange={(e) =>
                              setEditOrder(Number(e.target.value))
                            }
                            className='border px-2 py-1 text-sm rounded'
                            placeholder='Order index'
                          />
                          <label className='flex items-center gap-2 text-sm'>
                            <input
                              type='checkbox'
                              checked={editActive}
                              onChange={(e) => setEditActive(e.target.checked)}
                            />
                            Active
                          </label>
                          <div className='flex gap-2'>
                            <button
                              onClick={() => handleEdit(child.id)}
                              className='flex-1 px-3 py-1 bg-green-500 text-white text-sm rounded-md'
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)} // ✅ huỷ edit
                              className='flex-1 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-sm rounded-md'
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span>{child.title}</span>
                      )}

                      <div className='flex gap-1 ml-2'>
                        {/* Move Up */}
                        <button
                          onClick={() => handleMove(child, 'up')}
                          disabled={
                            categories
                              .filter((c) => c.parent_id === parent.id) // ✅ chỉ cùng cấp con
                              .sort((a, b) => a.order_index - b.order_index)[0]
                              ?.id === child.id
                          }
                          className='p-1 rounded hover:bg-gray-100 text-gray-500 text-xs disabled:opacity-30'
                          title='Move up'
                        >
                          ⬆️
                        </button>

                        {/* Move Down */}
                        <button
                          onClick={() => handleMove(child, 'down')}
                          disabled={
                            categories
                              .filter((c) => c.parent_id === parent.id) // ✅ cùng cấp con
                              .sort((a, b) => a.order_index - b.order_index)
                              .at(-1)?.id === child.id
                          }
                          className='p-1 rounded hover:bg-gray-100 text-gray-500 text-xs disabled:opacity-30'
                          title='Move down'
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(child.id);
                            setEditTitle(child.title);
                            setEditOrder(child.order_index || 0);
                            setEditActive(child.is_active);
                          }}
                          className='p-1 rounded hover:bg-blue-100 text-blue-500 text-xs'
                          title='Edit'
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(child.id)}
                          className='p-1 rounded hover:bg-red-100 text-red-500 text-xs'
                          title='Delete'
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </li>
        ))}
      </ul>

      {/* Add form */}
      {adding ? (
        <div className='mt-4 space-y-2 border p-3 rounded-md bg-white shadow-sm'>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder='New category title'
            className='w-full border px-2 py-1 text-sm rounded'
          />
          <select
            value={newParent || ''}
            onChange={(e) => setNewParent(e.target.value || null)}
            className='w-full border px-2 py-1 text-sm rounded'
          >
            <option value=''>-- No parent (Level 1) --</option>
            {categories
              .filter((c) => !c.parent_id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
          </select>
          <input
            type='number'
            value={newOrder}
            onChange={(e) => setNewOrder(Number(e.target.value))}
            placeholder='Order index'
            className='w-full border px-2 py-1 text-sm rounded'
          />
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={newActive}
              onChange={(e) => setNewActive(e.target.checked)}
            />
            Active
          </label>
          <div className='flex gap-2'>
            <button
              onClick={handleAdd}
              className='flex-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md'
            >
              Save
            </button>
            <button
              onClick={() => setAdding(false)}
              className='flex-1 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-sm rounded-md'
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className='mt-4 w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition'
        >
          + Add Category
        </button>
      )}
    </aside>
  );
};

export default CategoryList;
