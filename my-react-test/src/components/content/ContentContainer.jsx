// components/content/ContentContainer.jsx
import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { quillModules, quillFormats } from "../../config/quillConfigWordLike";
import { contentService } from "../../services/contentService";
import ContentList from "./ContentList";
import AdminContentTree from "./AdminContentTree";
import UserContentContainer from "./UserContentContainer";
import { sortByOrder, attachEnterKeepsInlineFormats } from "./contentConfig/contentHelper";
import { convertService } from "../../services/convertService";
import { useTheme } from "../../contexts/ThemeContext";
import { getContentStyles } from "./contentConfig/contentStyles";

import { categoryService } from "../../services/categoryService";

export default function ContentContainer({ categoryId, moduleId, titleCategory, userRole, scrollToContentId, onScrolledToContent }) {
    const [items, setItems] = useState([]);
    const [openMap, setOpenMap] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [trees, setTrees] = useState([]); // hierarchical trees per selected categories

    // create
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newParentId, setNewParentId] = useState(null);
    const [newActive, setNewActive] = useState(true);
    const [newHtml, setNewHtml] = useState("");
    const createRef = useRef(null);

    // edit
    const [editTitle, setEditTitle] = useState("");
    const [editActive, setEditActive] = useState(true);
    const [editHtml, setEditHtml] = useState("");
    const editRef = useRef(null);

    async function load() {
        if (!categoryId) return;

        // If moduleId provided, load categories for module, compute descendants
        let ids = [Number(categoryId)];
        try {
            if (moduleId) {
                const cats = await categoryService.list(moduleId);
                const map = {};
                cats.forEach((c) => { map[c.id] = [] });
                cats.forEach((c) => {
                    const pid = c.parent_id ?? c.parentId ?? null;
                    if (pid && map[pid]) map[pid].push(c.id);
                });
                // DFS to collect descendants
                // DFS pre-order traversal preserving original child order
                const collect = (start) => {
                    const out = [];
                    const stack = [start];
                    while (stack.length) {
                        const cur = stack.pop();
                        out.push(Number(cur));
                        const childs = map[cur] || [];
                        // push children in reverse so first child is processed first
                        for (let i = childs.length - 1; i >= 0; i--) stack.push(childs[i]);
                    }
                    return out;
                };
                ids = Array.from(new Set(collect(Number(categoryId))));
            }
        } catch (err) {
            // fallback: just use the single category
            ids = [Number(categoryId)];
        }

        // Fetch contents for each id and combine
            // Use tree endpoint for each category id, keep tree for admin render and flatten to a single list (pre-order)
            const flatten = (nodes) => {
                const out = [];
                const walk = (nList) => {
                    if (!nList || !nList.length) return;
                    // sort siblings by order_index before walking
                    nList.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
                    for (const n of nList) {
                        // push node (shallow copy without children to avoid nested structure)
                        const { children, ...rest } = n;
                        out.push(rest);
                        if (children && children.length) walk(children);
                    }
                };
                walk(nodes);
                return out;
            };
            const fetches = ids.map((id) => contentService.tree(id, true).then((data) => {
                return Array.isArray(data) ? data : [];
            }).catch((e) => { console.error('fetch tree error', e); return []; }));
            const lists = await Promise.all(fetches); // lists: array of tree arrays per category id
            const mergedTrees = lists.flat(); // roots in order
            const mergedFlat = flatten(mergedTrees);
            setItems(sortByOrder(mergedFlat || []));
            // store trees for admin rendering
            setTrees(mergedTrees);
        setOpenMap({});
        setEditingId(null);
    }
    useEffect(() => {
        load();
    }, [categoryId, moduleId]);

    // If scrollToContentId (request from header/search) is provided and items loaded, ensure it's opened
    useEffect(() => {
        if (!scrollToContentId) return;
        if (!items || items.length === 0) return;
        const idNum = Number(scrollToContentId);
        const found = items.find((i) => i.id === idNum);
        if (found) {
            setOpenMap((s) => ({ ...s, [idNum]: true }));
        }
    }, [scrollToContentId, items]);

    useEffect(() => {
        const q1 = createRef.current?.getEditor?.();
        const q2 = editRef.current?.getEditor?.();
        attachEnterKeepsInlineFormats(q1);
        attachEnterKeepsInlineFormats(q2);
    }, [showCreate, editingId]);

    const onToggleOpen = (id) => setOpenMap((s) => ({ ...s, [id]: !s[id] }));

    const isReadOnly = userRole === "customer";

    // If customer, render the user-facing content UI instead of admin UI
    if (isReadOnly) {
        return (
            <UserContentContainer
                categoryId={categoryId}
                moduleId={moduleId}
                titleCategory={titleCategory}
                scrollToContentId={scrollToContentId}
                onScrolledToContent={onScrolledToContent}
            />
        );
    }

    async function onCreate() {
        if (!newTitle.trim() || !newHtml.trim()) return;

        await contentService.create({
            category_id: categoryId,
            parent_id: newParentId || null,
            title: newTitle,
            html_content: newHtml,
            plain_content: newHtml.replace(/<[^>]+>/g, ""),
            is_published: newActive,
        });

        setNewTitle("");
        setNewActive(true);
        setNewHtml("");
        setShowCreate(false);
        setNewParentId(null);
        await load();
    }

    // Open create dialog for a specific parent
    function onCreateChild(parentId) {
        setNewParentId(parentId || null);
        setShowCreate(true);
        // focus title input later when available (optional)
    }

    function onStartEdit(it) {
        setEditingId(it.id);
        setEditTitle(it.title || "");
        setEditActive(it.is_published ?? true);
        setEditHtml(it.html_content || "");
    }

    async function onSaveEdit() {
        if (!editingId) return;
        await contentService.update(editingId, {
            title: editTitle,
            html_content: editHtml,
            plain_content: editHtml.replace(/<[^>]+>/g, ""),
            is_published: editActive,
        });
        setEditingId(null);
        setEditHtml("");
        await load();
    }

    async function onDelete(id) {
        if (!window.confirm("Bạn có chắc muốn xoá content này?")) return;
        await contentService.remove(id);
        await load();
    }

        // move operation disabled: backend update ignores order_index
        async function onMove(item, dir) {
            return; 
        }

    async function onImportDocxToCreate(setNewHtml) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".docx";
        input.onchange = async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
                const { html } = await convertService.docxToHtml(f, { contentId: "new-content" });
                setNewHtml(html || "");
            } catch (err) {
                console.error(err);
                alert("Convert DOCX thất bại");
            }
        };
        input.click();
    }

    const { effective } = useTheme();
    const theme = getContentStyles(effective);

    return (
        <div className={theme.container}>
            <h2 className={theme.title}>{titleCategory}</h2>

            <AdminContentTree
                items={items}
                tree={trees}
                openMap={openMap}
                editingId={editingId}
                onToggleOpen={onToggleOpen}
                onEdit={!isReadOnly ? onStartEdit : undefined}
                onDelete={!isReadOnly ? onDelete : undefined}
                onMove={undefined}
                onCreateChild={!isReadOnly ? onCreateChild : undefined}
                // Edit form bindings
                editBindings={{
                    editTitle,
                    setEditTitle,
                    editActive,
                    setEditActive,
                    editHtml,
                    setEditHtml,
                    editRef,
                    onSaveEdit,
                    onCancelEdit: () => {
                        setEditingId(null);
                        setEditHtml("");
                    },
                }}
                isReadOnly={isReadOnly}
            />

            {/* Create New */}
            <div className={theme.panel}>
                {!isReadOnly && (showCreate ? (
                    <div>
                        <p className={`mb-2 font-medium ${theme.labelText}`}>Thêm Content mới</p>
                        <input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Content title"
                            className={theme.input}
                        />
                        <label className={`block text-sm mb-2 ${theme.labelText}`}>
                            Parent
                            <select
                                value={newParentId ?? ''}
                                onChange={(e) => setNewParentId(e.target.value ? Number(e.target.value) : null)}
                                className={`${theme.input} mt-1`}
                            >
                                <option value="">(Root)</option>
                                {trees && trees.length > 0 && (function renderOpts(nodes, depth = 0) {
                                    return nodes.flatMap((n) => {
                                        const prefix = Array(depth).fill("—").join("");
                                        const opt = (
                                            <option key={n.id} value={n.id}>{prefix} {n.title}</option>
                                        );
                                        const children = n.children && n.children.length ? renderOpts(n.children, depth + 1) : [];
                                        return [opt, ...children];
                                    });
                                })(trees)}
                            </select>
                        </label>
                        <label className={`flex items-center gap-2 text-sm mb-2 ${theme.labelText}`}>
                            <input
                                type="checkbox"
                                checked={newActive}
                                onChange={(e) => setNewActive(e.target.checked)}
                            />
                            Published
                        </label>
                        <div className="mb-2">
                            <button
                                type="button"
                                onClick={() => onImportDocxToCreate(setNewHtml)}
                                className={theme.buttonPrimarySmall}
                            >
                                📄 Import DOCX
                            </button>
                        </div>
                        <ReactQuill
                            ref={createRef}
                            theme="snow"
                            value={newHtml}
                            onChange={setNewHtml}
                            modules={quillModules}
                            formats={quillFormats}
                        />
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={onCreate}
                                className={theme.buttonSave}
                            >
                                💾 Save
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreate(false);
                                    setNewTitle("");
                                    setNewHtml("");
                                }}
                                className={theme.buttonCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                        <div className="flex justify-center">
                        <button
                            onClick={() => { setNewParentId(null); setShowCreate(true); }}
                            className={theme.buttonPrimary}
                        >
                            ＋ Add New Content
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
