//src/components/category/CategoryContainer.jsx

import React, { useEffect, useState, useRef } from "react";
import { categoryService } from "../../services/categoryService";
import { buildCategoryTree, filterCategories } from "./categoryConfig/categoryHelper";
import CategorySearchBox from "./categoryConfig/CategorySearchBox";
import CategoryList from "./CategoryList";
import CategoryForm from "./CategoryForm";
import { useTheme } from "../../contexts/ThemeContext";
import { getCategoryStyles } from "./categoryConfig/categoryStyle";

export default function CategoryContainer({ moduleId, onSelectCategory, selectedCategoryId, nameModuleSelected, iconModuleSelected, userRole, titleCategorySelected }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  console.log(nameModuleSelected);

  // State edit
  const [editState, setEditState] = useState({
    editingId: null,
    editTitle: "",
    editOrder: 0,
    editActive: true,
  });

  // State add
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newParent, setNewParent] = useState(null);
  const [newOrder, setNewOrder] = useState(0);
  const [newActive, setNewActive] = useState(true);

  const [openParents, setOpenParents] = useState({}); // track category mở
  const initialOpenSet = useRef(false);

  // ✅ Lấy danh sách category theo module
  useEffect(() => {
    if (moduleId) {
      categoryService.list(moduleId).then(setCategories);
    }
  }, [moduleId]);

  // Nếu parent (App / Header) truyền selectedCategoryId, đồng bộ local selection và mở parents
  useEffect(() => {
    if (!selectedCategoryId) return;
    const idNum = Number(selectedCategoryId);
    setSelectedCategory(idNum);

    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.parent_id ?? c.parentId ?? null;
    });
    const newOpen = {};
    let cur = map[idNum] ?? null;
    while (cur) {
      newOpen[cur] = true;
      cur = map[cur] ?? null;
    }
    if (Object.keys(newOpen).length > 0) setOpenParents((prev) => ({ ...prev, ...newOpen }));
  }, [selectedCategoryId, categories]);

  // ✅ Cập nhật tree mỗi lần có data mới
  const tree = buildCategoryTree(categories);
  const filteredTree = filterCategories(search, tree);

  const refresh = async () => {
    if (moduleId) setCategories(await categoryService.list(moduleId));
  };

  const isReadOnly = userRole === "customer"; // === là so sánh bằng, nếu đúng thì là true

  const handleEditStart = (cat) => {
    setEditState({
      editingId: cat.id,
      editTitle: cat.title,
      editOrder: cat.order_index || 0,
      editActive: cat.is_active,
    });
  };

  const handleEditChange = (field, value) => {
    setEditState((prev) => ({
      ...prev,
      [`edit${field[0].toUpperCase() + field.slice(1)}`]: value,
    }));
  };

  const handleEditSave = async (id) => {
    await categoryService.update(id, {
      title: editState.editTitle,
      order_index: editState.editOrder,
      is_active: editState.editActive,
    });
    await refresh();
    setEditState({ editingId: null, editTitle: "", editOrder: 0, editActive: true });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xoá category này?")) {
      await categoryService.remove(id);
      await refresh();
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    const parentIdNum = newParent ? Number(newParent) : null;
    // ✅ Lấy cùng cấp
    const sameLevel = categories.filter(
      (c) => (c.parent_id || null) === parentIdNum
    );
    // ✅ Tính order_index max
    const maxOrder =
      sameLevel.length > 0
        ? Math.max(...sameLevel.map((c) => c.order_index || 0))
        : 0;

    await categoryService.create({
      module_id: moduleId,
      parent_id: newParent || null,
      title: newTitle,
      order_index: maxOrder + 1,
      is_active: newActive,
    });

    await refresh();
    setAdding(false);
    setNewTitle("");
    setNewParent(null);
    setNewOrder(0);
    setNewActive(true);
  };

  const handleMove = async (cat, direction) => {
    const sameLevel = categories.filter((c) => (c.parent_id || null) === (cat.parent_id || null));
    const sorted = [...sameLevel].sort((a, b) => a.order_index - b.order_index);
    const index = sorted.findIndex((c) => c.id === cat.id);
    let swapWith = null;
    if (direction === "up" && index > 0) swapWith = sorted[index - 1];
    else if (direction === "down" && index < sorted.length - 1) swapWith = sorted[index + 1];
    if (!swapWith) return;

    await categoryService.update(cat.id, { order_index: swapWith.order_index });
    await categoryService.update(swapWith.id, { order_index: cat.order_index });
    await refresh();
  };

  const toggleParent = (id) => {
    setOpenParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  useEffect(() => {
    if (search) {
      const newOpen = {};
      const openAll = (nodes) => {
        nodes.forEach((n) => {
          if (n.children?.length > 0) {
            newOpen[n.id] = true;
            openAll(n.children);
          }
        });
      };
      openAll(filteredTree);
      setOpenParents((prev) => ({ ...prev, ...newOpen }));
    }
  }, [search, filteredTree]);

  // Open all parent nodes by default once when the tree first loads so the
  // UI shows full content (as requested). We guard with a ref so user toggles
  // later are preserved and we don't re-open on every update.
  useEffect(() => {
    if (initialOpenSet.current) return;
    const newOpen = {};
    const openAll = (nodes) => {
      nodes.forEach((n) => {
        if (n.children?.length > 0) {
          newOpen[n.id] = true;
          openAll(n.children);
        }
      });
    };
    openAll(tree);
    setOpenParents((prev) => ({ ...prev, ...newOpen }));
    initialOpenSet.current = true;
  }, [tree]);

  // theme styles
  const { effective } = useTheme();
  const styles = getCategoryStyles(effective);

  return (
    <aside className={styles.listStyle}>
      {/* --- Header + Search cố định --- */}
      <div className={`sticky top-0 bg-transparent z-10 pb-1 ${styles.headerBorderClass}`}>
        <div className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition ${styles.titleTextClass}`}>
          <i className={`${iconModuleSelected} text-sm ${styles.titleTextClass}`}></i>
          <h2 className={`text-sm font-semibold ${styles.titleTextClass}`}>{nameModuleSelected}</h2>
        </div>

        <CategorySearchBox value={search} onChange={setSearch} dark={effective === "dark"} />
      </div>

      {/* --- Danh sách category --- */}
      {/* flex-1 + min-h-0 allows this area to shrink and produce a proper scrollbar inside the
        bounded aside (which has max-h set in styles). */}
      <div className="flex-1 overflow-y-auto mt-2 pr-1 min-h-0">
        <CategoryList
          tree={filteredTree}
          selectedCategory={selectedCategory}
          openParents={openParents}
          toggleParent={toggleParent}
          onSelectCategory={(id) => {
            setSelectedCategory(id);
            const found = categories.find((c) => Number(c.id) === Number(id));
            onSelectCategory?.(id);
            titleCategorySelected?.(found?.title || "");
          }}
          onEditStart={!isReadOnly ? handleEditStart : undefined}
          onEditChange={!isReadOnly ? handleEditChange : undefined}
          onEditSave={!isReadOnly ? handleEditSave : undefined}
          onEditCancel={!isReadOnly ? () => setEditState({ editingId: null, editTitle: "", editOrder: 0, editActive: true }) : undefined}
          editState={editState}
          onDelete={!isReadOnly ? handleDelete : undefined}
          onMove={!isReadOnly ? handleMove : undefined}
          isReadOnly={isReadOnly}
          styles={styles}
        />
      </div>

      {/* --- Form thêm category --- */}
      {!isReadOnly && (adding ? (
        <CategoryForm
          categories={categories}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newParent={newParent}
          setNewParent={setNewParent}
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
          dark={effective === "dark"}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 w-full px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition"
        >
          + Add Category
        </button>
      ))}
    </aside>
  );
}
