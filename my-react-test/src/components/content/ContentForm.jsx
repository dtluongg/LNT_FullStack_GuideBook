// components/content/admin/AdminContentForm.jsx

import React from "react";
import ReactQuill from "react-quill-new";
import { quillModules, quillFormats } from "../../config/quillConfigWordLike";
import { convertService } from "../../services/convertService";
import { useTheme } from "../../contexts/ThemeContext";
import { getContentStyles } from "./contentConfig/contentStyles";

export default function AdminContentForm({
    editTitle,
    setEditTitle,
    editActive,
    setEditActive,
    editHtml,
    setEditHtml,
    editRef,
    onSaveEdit,
    onCancelEdit,
}) {
    async function onImportDocx() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".docx";
        input.onchange = async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
                const { html } = await convertService.docxToHtml(f /*, { contentId: 'edit' }*/);
                // Có thể sanitize tại đây nếu bạn muốn.
                setEditHtml(html || "");
                // focus lại editor (tuỳ thích)
                setTimeout(() => {
                    const quill = editRef?.current?.getEditor?.();
                    quill?.focus();
                }, 0);
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
        <div>
            <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={theme.input}
                placeholder="Title"
            />
            {/* order_index is managed by backend; hide order input */}
            <label className={`flex items-center gap-2 text-sm mb-2 ${theme.labelText}`}>
                <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                />
                Published
            </label>
            <div className="mb-2">
                <button
                    type="button"
                    onClick={onImportDocx}
                    className={theme.buttonPrimarySmall}
                >
                    📄 Import DOCX
                </button>
            </div>

            <ReactQuill
                ref={editRef}
                theme="snow"
                value={editHtml}
                onChange={setEditHtml}
                modules={quillModules}
                formats={quillFormats}
            />
            <div className="flex gap-2 mt-2">
                <button onClick={onSaveEdit} className={theme.buttonSave}>
                    Save
                </button>
                <button onClick={onCancelEdit} className={theme.buttonCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
