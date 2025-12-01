import React from "react";
import CategorySearchHeader from "../category/categoryConfig/CategorySearchHeader";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeStyles } from "../../config/themeStyles";
import UserMenu from "./UserMenu";

export default function TopBar({ user, openModulesModal, modulesList, ensureModulesLoaded, onSelectModule, onSelectCategory, onSelectContent, onQueryChange }) {
  const { mode, setMode, effective } = useTheme();
  const isDark = effective === "dark";
  const theme = getThemeStyles(effective);

  return (
    <div className="flex items-center justify-between px-4 py-2 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <img src="/LNT.png" alt="Logo" className="w-8 h-8 flex-shrink-0" />
        <div className="hidden sm:block">
          <div className="text-sm font-semibold">App Guide</div>
          <div className={`text-xs ${theme.subtitleClass}`}>by LNT Company</div>
        </div>
        <button
          onClick={openModulesModal}
          title="All modules"
          className={`ml-2 inline-flex items-center justify-center rounded px-2 py-1 text-xs ${theme.topBtnBg}`}
        >
          All
        </button>
      </div>

      <div className="flex-1 max-w-xl px-2 hidden sm:flex">
        <div className={`flex items-center w-full ${theme.searchBg} rounded-md px-2 py-1`}>
          <CategorySearchHeader
            placeholder="Search guides, modules..."
            modulesList={modulesList}
            ensureModulesLoaded={ensureModulesLoaded}
              onSelectCategory={(cat, mod, contentId) => {
                  console.log('[TopBar] onSelectCategory', { cat, mod, contentId });
                if (onSelectModule && mod) onSelectModule(mod);
                if (onSelectCategory && cat) onSelectCategory(cat, mod, contentId);
              }}
            onSelectContent={(cat, mod, contentId) => {
              if (onSelectModule && mod) onSelectModule(mod);
              if (onSelectContent) onSelectContent(cat, mod, contentId);
              if (onSelectCategory && cat) onSelectCategory(cat, mod, contentId);
            }}
            onQueryChange={(q) => { if (onQueryChange) onQueryChange(q); }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          aria-label="theme-select"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className={`hidden sm:inline-flex text-sm px-2 py-1 rounded ${theme.selectClass} `}
          title="Theme: Auto / Dark / Light"
        >
          <option value="auto">Auto</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>

        <UserMenu user={user} />
      </div>
    </div>
  );
}
