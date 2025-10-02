// src/components/ContentViewer.jsx
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import {
  getContentsByCategory,
  createContent,
  updateContent,
  deleteContent,
} from '../api/contents';
import {
  getImagesByContent,
  uploadImage,
  updateImage,
  deleteImage,
} from '../api/images';
import { IMAGE_BASE_URL } from '../config/config';

const ContentViewer = ({ categoryId, titleCategory }) => {
  const [contents, setContents] = useState([]);
  const [openItems, setOpenItems] = useState({});
  const [images, setImages] = useState({});
  const [editing, setEditing] = useState(null);

  // state cho editor
  const [editHtml, setEditHtml] = useState("");
  const [newHtml, setNewHtml] = useState("");

  // state cho edit content
  const [editTitle, setEditTitle] = useState('');
  const [editOrder, setEditOrder] = useState(0);
  const [editActive, setEditActive] = useState(true);

  // state cho create content
  const [newTitle, setNewTitle] = useState('');
  const [newActive, setNewActive] = useState(true);

  // state cho upload/update ảnh
  const [pendingImage, setPendingImage] = useState({});

  useEffect(() => {
    if (categoryId) {
      loadContents();
    }
  }, [categoryId]);

  const loadContents = async () => {
    const res = await getContentsByCategory(categoryId);
    const data = res.data.data || [];
    setContents(data);
    setOpenItems({});
    setEditing(null);
  };

  const fetchImages = async (contentId) => {
    const res = await getImagesByContent(contentId);
    setImages((prev) => ({
      ...prev,
      [contentId]: res.data.data || [],
    }));
  };

  const toggleItem = (contentId) => {
    setOpenItems((prev) => {
      const newState = { ...prev, [contentId]: !prev[contentId] };
      if (newState[contentId] && !images[contentId]) {
        fetchImages(contentId);
      }
      return newState;
    });
  };

  // Tạo content mới
  const handleCreate = async () => {
    if (!newTitle.trim() || !newHtml.trim()) return;

    const maxOrder =
      contents.length > 0
        ? Math.max(...contents.map((c) => c.order_index || 0))
        : 0;

    await createContent({
      category_id: categoryId,
      title: newTitle,
      html_content: newHtml,
      plain_content: newHtml.replace(/<[^>]+>/g, ''),
      is_published: newActive,
      order_index: maxOrder + 1,
    });

    setNewHtml('');
    setNewTitle('');
    setNewActive(true);
    await loadContents();
  };

  // Cập nhật content
  const handleUpdate = async (id) => {
    await updateContent(id, {
      title: editTitle,
      html_content: editHtml,
      plain_content: editHtml.replace(/<[^>]+>/g, ''),
      is_published: editActive,
      order_index: editOrder,
    });
    setEditing(null);
    setEditHtml("");
    await loadContents();
  };

  // Xoá content
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá content này?')) {
      await deleteContent(id);
      await loadContents();
    }
  };

  // Upload ảnh mới
  // Upload ảnh mới
  const handleUpload = async (contentId, file, caption) => {
    if (!file) {
      alert('Vui lòng chọn file trước khi upload!');
      return;
    }

    await uploadImage(contentId, file, caption || 'image');
    await fetchImages(contentId);

    // reset state
    setPendingImage((prev) => ({
      ...prev,
      [contentId]: null,
    }));
  };

  // Update ảnh
  const handleUpdateImage = async (imageId, file, caption, contentId) => {
    if (!file && !caption) {
      alert('Vui lòng chọn file hoặc nhập caption để cập nhật!');
      return;
    }

    await updateImage(imageId, contentId, file, caption || 'image');
    await fetchImages(contentId);

    // reset state
    setPendingImage((prev) => ({
      ...prev,
      [contentId]: null,
    }));
  };

  // Move up/down content
  const handleMove = async (content, direction) => {
    const sorted = [...contents].sort((a, b) => a.order_index - b.order_index);
    const index = sorted.findIndex((c) => c.id === content.id);
    let swapWith = null;

    if (direction === 'up' && index > 0) swapWith = sorted[index - 1];
    if (direction === 'down' && index < sorted.length - 1)
      swapWith = sorted[index + 1];

    if (!swapWith) return;

    await updateContent(content.id, { order_index: swapWith.order_index });
    await updateContent(swapWith.id, { order_index: content.order_index });
    await loadContents();
  };

  if (!categoryId) {
    return <p className='p-4 text-gray-500'>Please select a category</p>;
  }

  return (
    <div className='flex-1 p-6 overflow-y-auto h-full'>
      <h2 className='text-xl font-bold mb-6 text-gray-800'>{titleCategory}</h2>

      {/* Danh sách content */}
      <div className='space-y-4'>
        {contents.map((c) => {
          const isOpen = openItems[c.id];
          const isEditing = editing === c.id;

          return (
            <div key={c.id} className='bg-white rounded-md shadow-sm p-3'>
              {/* Header */}
              <div className='flex justify-between items-center'>
                <button
                  onClick={() => toggleItem(c.id)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition
                    ${
                      isOpen
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                >
                  {c.title}
                </button>
                <div className='flex gap-2'>
                  <button
                    onClick={() => handleMove(c, 'up')}
                    disabled={
                      contents.sort((a, b) => a.order_index - b.order_index)[0]
                        ?.id === c.id
                    }
                    className='text-gray-500 hover:text-black text-sm disabled:opacity-30'
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={() => handleMove(c, 'down')}
                    disabled={
                      contents
                        .sort((a, b) => a.order_index - b.order_index)
                        .at(-1)?.id === c.id
                    }
                    className='text-gray-500 hover:text-black text-sm disabled:opacity-30'
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => {
                      setEditing(c.id);
                      setEditTitle(c.title);
                      setEditOrder(c.order_index || 0);
                      setEditActive(c.is_published);
                      setEditHtml(c.html_content);
                    }}
                    className='text-blue-500 hover:text-blue-700 text-sm'
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className='text-red-500 hover:text-red-700 text-sm'
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Nội dung */}
              {isOpen && (
                <div className='mt-3 text-gray-700'>
                  {isEditing ? (
                    <div>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className='border px-2 py-1 text-sm rounded w-full mb-2'
                      />
                      <input
                        type='number'
                        value={editOrder}
                        onChange={(e) => setEditOrder(Number(e.target.value))}
                        className='border px-2 py-1 text-sm rounded w-full mb-2'
                        placeholder='Order index'
                      />
                      <label className='flex items-center gap-2 text-sm mb-2'>
                        <input
                          type='checkbox'
                          checked={editActive}
                          onChange={(e) => setEditActive(e.target.checked)}
                        />
                        Published
                      </label>
                      <ReactQuill
                        value={editHtml}
                        onChange={setEditHtml}
                      />
                      <div className='flex gap-2 mt-2'>
                        <button
                          onClick={() => handleUpdate(c.id)}
                          className='px-3 py-1 bg-green-500 text-white rounded'
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditing(null); setEditHtml(""); }}
                          className='px-3 py-1 bg-gray-300 rounded'
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className='prose max-w-none mb-4'
                      dangerouslySetInnerHTML={{ __html: c.html_content }}
                    />
                  )}

                  {/* Danh sách ảnh */}
                  {images[c.id] && images[c.id].length > 0 && (
                    <div className='space-y-4 mb-3'>
                      {images[c.id].map((img) => (
                        <div key={img.id} className='border rounded p-2'>
                          <div className='aspect-[16/9] overflow-hidden rounded'>
                            <img
                              src={`${IMAGE_BASE_URL}${img.image_url}`}
                              alt={img.caption || ''}
                              className='w-full h-full object-cover'
                            />
                          </div>
                          <p className='text-xs text-gray-600 mt-1'>
                            {img.caption || 'No caption'}
                          </p>
                          <div className='flex gap-2 mt-1'>
                            <button
                              onClick={() => {
                                setPendingImage((prev) => ({
                                  ...prev,
                                  [c.id]: {
                                    file: null,
                                    caption: img.caption,
                                    editing: img.id,
                                  },
                                }));
                              }}
                              className='text-blue-500 text-xs'
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Xoá ảnh này?')) {
                                  await deleteImage(img.id);
                                  await fetchImages(c.id);
                                }
                              }}
                              className='text-red-500 text-xs'
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload / Update ảnh */}
                  <div className='mt-2'>
                    <input
                      type='text'
                      placeholder='Tên ảnh (caption)'
                      value={pendingImage[c.id]?.caption || ''}
                      onChange={(e) =>
                        setPendingImage((prev) => ({
                          ...prev,
                          [c.id]: {
                            ...(prev[c.id] || {}),
                            caption: e.target.value,
                          },
                        }))
                      }
                      className='border px-2 py-1 text-xs rounded w-full mb-2'
                    />
                    <input
                      type='file'
                      onChange={(e) =>
                        setPendingImage((prev) => ({
                          ...prev,
                          [c.id]: {
                            ...(prev[c.id] || {}),
                            file: e.target.files[0],
                          },
                        }))
                      }
                      className='block text-xs'
                    />

                    {pendingImage[c.id] && (
                      <div className='flex gap-2 mt-2'>
                        {pendingImage[c.id].editing ? (
                          <button
                            onClick={async () => {
                              await handleUpdateImage(
                                pendingImage[c.id].editing,
                                pendingImage[c.id].file,
                                pendingImage[c.id].caption,
                                c.id
                              );
                              setPendingImage((prev) => ({
                                ...prev,
                                [c.id]: null,
                              }));
                            }}
                            className='px-3 py-1 bg-green-500 text-white text-xs rounded'
                          >
                            Update Image
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              await handleUpload(
                                c.id,
                                pendingImage[c.id].file,
                                pendingImage[c.id].caption
                              );
                              setPendingImage((prev) => ({
                                ...prev,
                                [c.id]: null,
                              }));
                            }}
                            className='px-3 py-1 bg-blue-500 text-white text-xs rounded'
                          >
                            Save Image
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setPendingImage((prev) => ({
                              ...prev,
                              [c.id]: null,
                            }))
                          }
                          className='px-3 py-1 bg-gray-300 text-xs rounded'
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Form thêm content mới */}
      <div className='p-4 border rounded bg-white mt-6'>
        <p className='text-gray-600 mb-2 font-medium'>Thêm Content mới</p>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder='Content title'
          className='w-full border px-2 py-1 text-sm rounded mb-2'
        />
        <label className='flex items-center gap-2 text-sm mb-2'>
          <input
            type='checkbox'
            checked={newActive}
            onChange={(e) => setNewActive(e.target.checked)}
          />
          Published
        </label>
        <ReactQuill value={newHtml} onChange={setNewHtml} />
        <button
          onClick={handleCreate}
          className='mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          + Save Content
        </button>
      </div>
    </div>
  );
};

export default ContentViewer;
