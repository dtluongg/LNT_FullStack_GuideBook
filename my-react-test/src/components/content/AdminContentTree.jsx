import React, { useState } from "react";
import ContentItem from "./ContentItem";

// Recursive admin tree renderer
export default function AdminContentTree({ tree = [], items = [], openMap = {}, editingId, onToggleOpen, onEdit, onDelete, onMove, onCreateChild, editBindings, isReadOnly = false }) {
  const [expanded, setExpanded] = useState({});
  // helper to flatten nodes into array (pre-order) to compute sibling positions
  const flat = items || [];

  const renderNodes = (nodes, depth = 0) => {
    if (!nodes || !nodes.length) return null;
    return nodes.map((n, idx) => {
      const isFirst = (() => {
        // find siblings list
        // assume parent handled by recursion; here idx is position among siblings
        return idx === 0;
      })();
      const isLast = (() => idx === nodes.length - 1)();

      // find index in flat array for movement boundaries
      const flatIndex = flat.findIndex((f) => f.id === n.id);
      const up = flatIndex > 0 ? flat[flatIndex - 1] : null;
      const down = flatIndex >= 0 && flatIndex < flat.length - 1 ? flat[flatIndex + 1] : null;

      const hasChildren = n.children && n.children.length > 0;
      const isExpanded = expanded[n.id] ?? true;

      return (
        <div key={n.id} style={{ marginLeft: depth * 12 }} className="mb-2">
          <div className="flex items-start gap-2">
            {hasChildren ? (
              <button
                onClick={() => setExpanded((s) => ({ ...s, [n.id]: !isExpanded }))}
                className="w-6 h-6 flex items-center justify-center text-sm text-gray-600 hover:text-gray-800"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                style={{ flex: '0 0 auto' }}
              >
                <svg className={`w-3 h-3 transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6.293 4.293a1 1 0 011.414 0L13 9.586a1 1 0 010 1.414l-5.293 5.293a1 1 0 11-1.414-1.414L10.586 11 6.293 6.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <div style={{ width: 24 }} />
            )}

            <div style={{ flex: 1 }}>
              <ContentItem
                item={n}
                isOpen={!!openMap[n.id]}
                isFirst={!up}
                isLast={!down}
                isEditing={editingId === n.id}
                onToggle={() => onToggleOpen(n.id)}
                onEdit={onEdit ? () => onEdit(n) : undefined}
                onDelete={onDelete ? () => onDelete(n.id) : undefined}
                onMoveUp={onMove ? () => onMove(n, "up") : undefined}
                onMoveDown={onMove ? () => onMove(n, "down") : undefined}
                onCreateChild={onCreateChild ? () => onCreateChild(n.id) : undefined}
                editBindings={editBindings}
                isReadOnly={isReadOnly}
              />
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="mt-2">
              {renderNodes(n.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return <div>{renderNodes(tree)}</div>;
}
