import React, { useEffect, useState } from "react";
import { getContentsByCategory } from "../api/contents";
import { getImagesByContent } from "../api/images";
import { IMAGE_BASE_URL } from "../config/config";

const ContentViewer = ({ categoryId, titleCategory }) => {
  const [contents, setContents] = useState([]);
  const [openItems, setOpenItems] = useState({}); // nhiều cái mở cùng lúc
  const [images, setImages] = useState({}); // lưu ảnh cho từng content

  useEffect(() => {
    if (categoryId) {
      getContentsByCategory(categoryId).then((res) => {
        const data = res.data.data || [];
        setContents(data);
        // mặc định mở cái đầu tiên
        if (data.length > 0) {
          setOpenItems({ [data[0].id]: true });
          fetchImages(data[0].id);
        }
      });
    }
  }, [categoryId]);

  const fetchImages = (contentId) => {
    getImagesByContent(contentId).then((res) => {
      setImages((prev) => ({
        ...prev,
        [contentId]: res.data.data || [],
      }));
    });
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

  if (!categoryId) {
    return <p className="p-4 text-gray-500">Please select a category</p>;
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto h-full">
      <h2 className="text-xl font-bold mb-6 text-gray-800">{titleCategory}</h2>

      <div className="space-y-4">
        {contents.map((c) => {
          const isOpen = openItems[c.id];
          return (
            <div key={c.id} className="bg-white rounded-md shadow-sm p-3">
              {/* Tiêu đề gọn gàng */}
              <button
                onClick={() => toggleItem(c.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition
                  ${isOpen ? "bg-blue-200 text-blue-800" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              >
                {c.title}
              </button>

              {/* Nội dung xổ xuống */}
              {isOpen && (
                <div className="mt-3 text-gray-700">
                  <div
                    className="prose max-w-none mb-4"
                    dangerouslySetInnerHTML={{ __html: c.html_content }}
                  />
                  {images[c.id] && images[c.id].length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {images[c.id].map((img) => (
                        <img
                          key={img.id}
                          src={`${IMAGE_BASE_URL}${img.image_url}`}
                          alt={img.caption || ""}
                          className="rounded-lg shadow-sm"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContentViewer;
