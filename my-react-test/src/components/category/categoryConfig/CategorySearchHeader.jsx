import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { searchContents } from "../../../api/contents";

// Props:
// - placeholder
// - modulesList: optional initial modules list
// - ensureModulesLoaded: async function to call to load modules if needed
// - onSelectCategory(category, module)
// - onSelectContent(category, module, contentId)
export default function CategorySearchHeader({ placeholder = "Search...", modulesList = [], ensureModulesLoaded, onSelectCategory, onSelectContent, onQueryChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [contentResults, setContentResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const modulesRef = useRef(modulesList);

  useEffect(() => {
    modulesRef.current = modulesList;
  }, [modulesList]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const buildResults = (q) => {
    if (!q) return [];
    const lower = q.toLowerCase();
    const out = [];
    modulesRef.current.forEach((m) => {
      const cats = Array.isArray(m.categories) ? m.categories : [];
      const mapById = {};
      cats.forEach((c) => { mapById[c.id] = c; });
      cats.forEach((c) => {
        const title = (c.title || c.name || c.label || "").toString().toLowerCase();
        if (title.includes(lower)) {
          const path = [];
          let cur = c;
          while (cur) {
            path.unshift(cur.title || cur.name || cur.label);
            const pid = cur.parent_id ?? cur.parentId ?? null;
            cur = pid && mapById[pid] ? mapById[pid] : null;
          }
          out.push({ module: m, category: c, path: path.join(" > ") });
        }
      });
    });
    return out;
  };

  const handleChange = (v) => {
    setQuery(v);
    if (onQueryChange) onQueryChange(v);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      if (v.trim().length === 0) {
        setResults([]);
        setContentResults([]);
        if (onQueryChange) onQueryChange("");
        return;
      }
      if (ensureModulesLoaded) {
        setLoading(true);
        try {
          await ensureModulesLoaded();
        } finally {
          setLoading(false);
        }
      }
      const res = buildResults(v.trim());
      setResults(res);

      // server-side content search
      try {
        setLoading(true);
        const resp = await searchContents(v.trim());
        const data = resp && resp.data && resp.data.data ? resp.data.data : [];
        const mapped = data.map((item) => {
          const catId = item.category_id ?? item.categoryId ?? null;
          const module = modulesRef.current.find((mm) => Array.isArray(mm.categories) && mm.categories.some((c) => c.id === catId));
          let path = item.category_title || "";
          if (module) {
            const cats = Array.isArray(module.categories) ? module.categories : [];
            const mapById = {};
            cats.forEach((c) => { mapById[c.id] = c; });
            const catObj = mapById[catId];
            if (catObj) {
              const parts = [];
              let cur = catObj;
              while (cur) {
                parts.unshift(cur.title || cur.name || cur.label);
                const pid = cur.parent_id ?? cur.parentId ?? null;
                cur = pid && mapById[pid] ? mapById[pid] : null;
              }
              path = parts.join(" > ");
            }
          }
          return { content: item, module, path, categoryId: catId };
        });
        setContentResults(mapped);
      } catch (err) {
        setContentResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const handleFocus = async () => {
    setOpen(true);
    if (ensureModulesLoaded && modulesRef.current.length === 0) {
      setLoading(true);
      try {
        await ensureModulesLoaded();
      } finally {
        setLoading(false);
      }
    }
  };

  // close on ESC or click outside
  const wrapperRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onDown = (ev) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(ev.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  const handleSelect = (cat, mod) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setContentResults([]);
    if (onQueryChange) onQueryChange("");
    console.log('[CategorySearchHeader] handleSelect', { item: cat });
    if (onSelectCategory) onSelectCategory(cat, mod);
  };

  const handleSelectContent = (content, mod) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setContentResults([]);
    if (onQueryChange) onQueryChange("");
    const catId = content.category_id ?? content.categoryId ?? null;
    let catObj = null;
    if (mod && Array.isArray(mod.categories)) catObj = mod.categories.find((c) => c.id === catId) || null;
    console.log('[CategorySearchHeader] handleSelectContent', { contentId: content.id, categoryObj: catObj, moduleId: mod?.id });
    if (onSelectContent) onSelectContent(catObj, mod, content.id);
  };

  const { effective } = useTheme();
  const isDark = effective === "dark";

  const inputClass = isDark
    ? "bg-[#07203a] text-sm text-white placeholder-gray-300 outline-none rounded px-3 py-2 w-full"
    : "bg-white text-sm text-gray-900 placeholder-gray-500 outline-none rounded px-3 py-2 w-full";

  const dropdownClass = isDark
    ? "fixed left-1/2 top-24 transform -translate-x-1/2 z-50 bg-slate-800 rounded shadow-lg p-4 w-3/4 max-w-4xl max-h-[70vh] overflow-auto"
    : "fixed left-1/2 top-24 transform -translate-x-1/2 z-50 bg-white text-gray-900 rounded shadow-lg p-4 w-3/4 max-w-4xl max-h-[70vh] overflow-auto";

  const resultHover = isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100';

  return (
    <div ref={wrapperRef} className="relative" style={{ minWidth: 360 }}>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={inputClass}
      />

      {open && (query || results.length > 0 || contentResults.length > 0 || loading) && (
        <div className={dropdownClass}>
          {loading ? (
            <div className={isDark ? 'text-sm text-[#cbd8ea] p-2' : 'text-sm text-gray-600 p-2'}>Loading...</div>
          ) : null}

          {results.length > 0 && (
            <div>
              <div className={isDark ? 'text-sm text-[#cbd8ea] mb-2 font-semibold' : 'text-sm text-gray-700 mb-2 font-semibold'}>Categories <span className="text-xs text-gray-400">({results.length})</span></div>
              <ul className="space-y-2">
              {results.map((r, idx) => (
                <li key={`${r.module.id}-${r.category.id}-${idx}`} className={`flex items-center justify-between p-3 rounded ${resultHover}`}>
                  <div className="flex-1 flex items-center gap-4 min-w-0">
                    <div className="text-sm font-medium truncate">{r.category.title || r.category.name || r.category.label}</div>
                    <div className={isDark ? 'text-xs text-[#cbd8ea] truncate' : 'text-xs text-gray-500 truncate'}>{r.path}</div>
                    <div className="inline-block text-xs text-white bg-blue-600 px-2 py-0.5 rounded">{r.module.name}</div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button onClick={() => handleSelect(r.category, r.module)} className="text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700">Open</button>
                  </div>
                </li>
              ))}
              </ul>
            </div>
          )}

          {/* Content search results (from server) */}
          {!loading && contentResults && contentResults.length > 0 && (
            <div className="mt-3">
              <div className={isDark ? 'text-sm text-[#cbd8ea] mb-2 font-semibold' : 'text-sm text-gray-700 mb-2 font-semibold'}>Contents <span className="text-xs text-gray-400">({contentResults.length})</span></div>
              <ul className="space-y-2">
                {contentResults.map((r, idx) => (
                  <li key={`content-${r.content.id}-${idx}`} className={`p-3 rounded ${resultHover}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{r.content.title}</div>
                        <div className={isDark ? 'text-xs text-[#cbd8ea] truncate' : 'text-xs text-gray-500 truncate'}>{r.path}</div>
                        <div className={isDark ? 'text-xs text-[#cbd8ea] mt-1' : 'text-xs text-gray-500 mt-1'}>
                          <Snippet text={r.content.plain_content || r.content.plainContent || ''} q={query} />
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button onClick={() => handleSelectContent(r.content, r.module)} className="text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700">Open</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!loading && results.length === 0 && contentResults.length === 0 && (
            <div className={isDark ? 'text-sm text-[#cbd8ea] p-2' : 'text-sm text-gray-600 p-2'}>No results</div>
          )}
        </div>
      )}
    </div>
  );
}

function escapeHtml(str) {
  return str.replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function Snippet({ text = '', q = '' }) {
  if (!text) return null;
  const lower = (text || '').toLowerCase();
  const needle = (q || '').toLowerCase();
  if (!needle) {
    const short = text.length > 140 ? text.slice(0, 140) + '...' : text;
    return <span>{short}</span>;
  }
  const idx = lower.indexOf(needle);
  if (idx === -1) {
    const short = text.length > 140 ? text.slice(0, 140) + '...' : text;
    return <span>{short}</span>;
  }
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + needle.length + 80);
  const before = escapeHtml(text.slice(start, idx));
  const match = escapeHtml(text.slice(idx, idx + needle.length));
  const after = escapeHtml(text.slice(idx + needle.length, end));
  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';
  const html = `${prefix}${before}<mark class="search-highlight">${match}</mark>${after}${suffix}`;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
