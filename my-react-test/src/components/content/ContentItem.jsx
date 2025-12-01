// components/content/ContentItem.jsx
import React from "react";
import ContentForm from "./ContentForm";
import ImageManager from "./ImageManager";
import { useTheme } from "../../contexts/ThemeContext";
import { getContentStyles } from "./contentConfig/contentStyles";

export default function ContentItem({
  item, isOpen, isFirst, isLast, isEditing,
  onToggle, onEdit, onDelete, onMoveUp, onMoveDown,
  onCreateChild,
  editBindings,
  isReadOnly = false,
}) {
  const { effective } = useTheme();
  const theme = getContentStyles(effective);

  return (
    <div id={`content-${item.id}`} className={theme.itemCard} data-content-id={item.id}>
      <div className="flex justify-between items-center">
        <button
          onClick={onToggle}
          className={`px-3 py-1 rounded-md text-sm font-medium transition ${isOpen ? theme.itemToggleOpenOn : theme.itemToggleOpenOff}`}
        >
          {item.title}
        </button>
        <div className="flex gap-2">
          {!isReadOnly && (
            <>
              <button onClick={onMoveUp} disabled={isFirst} className={`${theme.actionText} disabled:opacity-30 text-sm`}>⬆️</button>
              <button onClick={onMoveDown} disabled={isLast} className={`${theme.actionText} disabled:opacity-30 text-sm`}>⬇️</button>
              <button onClick={onCreateChild} className={`${theme.actionText} text-sm`} title="Add child">＋ Child</button>
              <button onClick={onEdit} className={`${theme.actionBlue} text-sm`}>✏️ Edit</button>
              <button onClick={onDelete} className={`${theme.actionDanger} text-sm`}>🗑️ Delete</button>
            </>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="mt-3">
          {isEditing ? (
            <ContentForm {...editBindings} />
          ) : (
            <div className="content-body">
              <div className={theme.editorText} dangerouslySetInnerHTML={{ __html: item.html_content }} />
            </div>
          )}

          <ImageManager contentId={item.id} />
        </div>
      )}
    </div>
  );
}
