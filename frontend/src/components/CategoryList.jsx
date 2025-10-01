import React, { useEffect, useState } from "react";
import { getCategoriesByModule } from "../api/categories";

const CategoryList = ({ moduleId, onSelectCategory, titleCategorySelected }) => {
  const [categories, setCategories] = useState([]);   // state chứa toàn bộ categories lấy từ API
  const [search, setSearch] = useState("");           // state lưu text người dùng gõ trong ô search
  const [selectedCategory, setSelectedCategory] = useState(null); // ✅ category đang chọn
  const handleSelect = (id, title) => {
    setSelectedCategory(id);  // ✅ cập nhật category đang chọn
    onSelectCategory(id); // báo cho App biết category đang chọn
    titleCategorySelected(title); // gọi hàm từ App để cập nhật title category
  };

  // gọi API khi moduleId thay đổi
  useEffect(() => {
    if (moduleId) {
      getCategoriesByModule(moduleId).then((res) => {
        setCategories(res.data.data || []);
        setSelectedCategory(null); // reset khi đổi module
      });
    }
  }, [moduleId]);

  if (!moduleId) {
    return <p className="p-4 text-gray-500">Please select a module</p>;
  }

  // Tách categories thành 2 nhóm:
  // 1. topLevel: category cha (không có parent_title)
  const topLevel = categories.filter((c) => !c.parent_title);

  // 2. childrenMap: object dạng { "Tên cha": [danh sách con] }
  const childrenMap = categories.reduce((map, c) => {
    if (c.parent_title) {
      if (!map[c.parent_title]) map[c.parent_title] = [];
      map[c.parent_title].push(c);
    }
    return map;
  }, {});

  // Hàm xử lý lọc theo search
  const filterCategory = (text) => {
    // Nếu ô search rỗng -> trả lại nguyên dữ liệu
    if (!text) return { topLevel, childrenMap };

    // Đưa text về lowercase để so sánh không phân biệt hoa/thường
    const lower = text.toLowerCase();

    // B1: lọc ra danh sách cha cần hiển thị
    // - Nếu tên cha match search
    // - HOẶC có ít nhất một category con match search
    const filteredParents = topLevel.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        (childrenMap[p.title] &&
          childrenMap[p.title].some((c) =>
            c.title.toLowerCase().includes(lower)
          ))
    );

    // B2: với mỗi cha đã giữ lại, lọc con theo search
    const filteredChildren = {};
    filteredParents.forEach((p) => {
      filteredChildren[p.title] = (childrenMap[p.title] || []).filter((c) =>
        c.title.toLowerCase().includes(lower)
      );
    });

    // Trả ra danh sách cha + con đã lọc
    return { topLevel: filteredParents, childrenMap: filteredChildren };
  };

  // Áp dụng filter mỗi lần search thay đổi
  const { topLevel: filteredParents, childrenMap: filteredChildren } =
    filterCategory(search);

  return (
    <aside className="w-64 border-r bg-gray-50 p-3 overflow-y-auto h-full">
      {/* Ô search */}
      <input
        type="text"
        placeholder="Search category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}   // cập nhật state search khi gõ
        className="w-full mb-3 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
      />

      <ul className="space-y-2">
        {filteredParents.map((parent) => (
          <li key={parent.id}>
            {/* Hiển thị category cha */}
            <div 
                onClick={() => handleSelect(parent.id, parent.title)}   // thêm dòng này
                className={`px-3 py-2 text-sm font-medium border rounded-md cursor-pointer transition
                ${selectedCategory === parent.id 
                ? "bg-blue-500 text-white border-blue-600"  // style khi chọn
                : "bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 hover:from-blue-100 hover:to-blue-200"}
            `}>
              {parent.title}
            </div>

            {/* Hiển thị category con (nếu có) */}
            {filteredChildren[parent.title] &&
              filteredChildren[parent.title].length > 0 && (
                <ul className="mt-1 space-y-1">
                  {filteredChildren[parent.title].map((child) => (
                    <li
                      key={child.id}
                      onClick={() => handleSelect(child.id, child.title)}   // thêm dòng này
                      className={`px-3 py-2 text-xs border rounded-md cursor-pointer transition
                        ${selectedCategory === child.id
                          ? "bg-blue-500 text-white border-blue-600"  // style khi chọn
                          : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200"}
                      `}
                    >
                      {child.title}
                    </li>
                  ))}
                </ul>
              )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CategoryList;
