import React, { useState } from "react";
import { buildCategoryTree } from "../category/categoryConfig/categoryHelper";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeStyles } from "../../config/themeStyles";

export default function ModulesModal({ open, onClose, modulesList, loadingModules, modulesError, onSelectCategory }) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const { effective } = useTheme();
  const theme = getThemeStyles(effective);

  const renderCategoryNode = (node, module, level = 0) => {
    const padding = { paddingLeft: `${level * 12}px` };
    const isExpanded = expandedIds.has(node.id);
    return (
      <li key={node.id} className="relative">
        <div className="flex items-center justify-between" style={padding}>
          <button
            onClick={() => onSelectCategory && onSelectCategory(node, module)}
            className={`text-left w-full px-2 py-1 rounded-md ${theme.hoverNodeBg} transition`}
          >
            <span className="truncate">{node.title || node.name || node.label}</span>
          </button>

          {node.children && node.children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedIds((prev) => {
                  const s = new Set(prev);
                  if (s.has(node.id)) s.delete(node.id);
                  else s.add(node.id);
                  return s;
                });
              }}
              aria-expanded={isExpanded}
              className={`ml-2 ${theme.arrowClass} transform transition-transform ${isExpanded ? "rotate-90" : "rotate-0"}`}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              ▸
            </button>
          )}
        </div>

        {node.children && node.children.length > 0 && isExpanded && (
          <ul className="mt-1 space-y-1">
            {node.children.map((ch) => renderCategoryNode(ch, module, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={theme.modalContainerClass}>
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-lg font-semibold">All Modules</h3>
          <div className="flex items-center gap-3">
            {loadingModules && <div className={theme.modalLoadingClass}>Loading...</div>}
            <button onClick={onClose} className={theme.modalCloseBtn}>Close</button>
          </div>
        </div>

        <div className="px-6 pb-6">
          {modulesError && <div className="text-red-400 mb-3">{modulesError}</div>}

          <div className="mb-4">
            {/* simple search box is in header TopBar; modal keeps full modules view */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulesList.map((m) => {
              const cats = Array.isArray(m.categories) ? m.categories : [];
              const roots = buildCategoryTree(cats);
              return (
                <div key={m.id} className={theme.moduleCardClass}>
                  <div className="mb-3">
                    <div className="inline-block px-3 py-1 rounded-md bg-gradient-to-r from-blue-600/70 to-indigo-600/60 text-white font-semibold text-sm shadow-sm">
                      {m.name}
                    </div>
                    {m.description && <div className={theme.moduleDescClass}>{m.description}</div>}
                  </div>

                  <div className="text-sm">
                    {roots && roots.length ? (
                      <ul className="space-y-1">{roots.map((c) => renderCategoryNode(c, m, 0))}</ul>
                    ) : (
                      <div className={theme.noTopClass}>No top-level categories</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
