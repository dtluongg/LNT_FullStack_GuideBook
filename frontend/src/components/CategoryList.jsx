import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';

const CategoryList = ({
  moduleId,
  onSelectCategory,
  titleCategorySelected,
}) => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openParents, setOpenParents] = useState({}); // ✅ track cha nào đang mở

  const handleSelect = (id, title) => {
    setSelectedCategory(id);
    onSelectCategory(id);
    titleCategorySelected(title);
  };

  const toggleParent = (parentTitle) => {
    setOpenParents((prev) => ({
      ...prev,
      [parentTitle]: !prev[parentTitle], // mở/đóng
    }));
  };

  useEffect(() => {
    if (moduleId) {
      categoryService.list(moduleId).then((res) => {
        setCategories(res || []);
        setSelectedCategory(null);
        setOpenParents({}); // reset khi đổi module
      });
    }
  }, [moduleId]);

  if (!moduleId) {
    return <p className='p-4 text-gray-500'>Please select a module</p>;
  }

  const topLevel = categories.filter((c) => !c.parent_title);
  const childrenMap = categories.reduce((map, c) => {
    if (c.parent_title) {
      if (!map[c.parent_title]) map[c.parent_title] = [];
      map[c.parent_title].push(c);
    }
    return map;
  }, {});

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

  return (
    <aside className='w-[20%] border-r bg-gray-50 p-3 overflow-y-auto h-full'>
      <input
        type='text'
        placeholder='Search category...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='w-full mb-3 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none'
      />

      <ul className='space-y-2'>
        {filteredParents.map((parent) => (
          <li key={parent.id}>
            {/* Cha */}
            <div
              onClick={() => {
                toggleParent(parent.title);
                handleSelect(parent.id, parent.title);
              }}
              className={`px-3 py-2 text-sm font-medium border rounded-md cursor-pointer transition flex justify-between
                ${
                  selectedCategory === parent.id
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 hover:from-blue-100 hover:to-blue-200'
                }
              `}
            >
              {parent.title}
              <span className='ml-2'>
                {openParents[parent.title] ? '▼' : '▶'}
              </span>
            </div>

            {/* Con: chỉ render nếu cha mở HOẶC đang search */}
            {(search || openParents[parent.title]) &&
              filteredChildren[parent.title] &&
              filteredChildren[parent.title].length > 0 && (
                <ul className='mt-1 space-y-1'>
                  {filteredChildren[parent.title].map((child) => (
                    <li
                      key={child.id}
                      onClick={() => handleSelect(child.id, child.title)}
                      className={`px-3 py-2 text-xs border rounded-md cursor-pointer transition
                        ${
                          selectedCategory === child.id
                            ? 'bg-blue-500 text-white border-blue-600'
                            : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200'
                        }
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
