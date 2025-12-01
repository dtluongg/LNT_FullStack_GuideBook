// Centralized theme styles for light and dark modes
// Export a helper to get the classname strings based on effective mode
export const stylesByMode = {
  dark: {
    headerBg: "bg-[#041026] text-[#e6eef8]",
    topBtnBg: "bg-[#07203a] hover:bg-[#083047]",
    searchBg: "bg-[#07203a]",
    subtitleClass: "text-[#cbd8ea]",
    arrowClass: "text-[#cbd8ea]",
    hoverNodeBg: "hover:bg-white/6",
    menuBgClass: "bg-[#07203a] text-[#e6eef8] border border-[#083047]",
    modalContainerClass:
      "relative max-w-6xl w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-2xl overflow-auto max-h-[86vh] z-10",
    modalLoadingClass: "text-sm text-[#cbd8ea]",
    modalCloseBtn: "text-sm px-3 py-1 rounded bg-[#07203a]/80 hover:bg-[#07203a]",
    modalSearchClass:
      "bg-[#07203a] text-sm text-white placeholder-gray-300 outline-none rounded px-3 py-2",
    resultItemBg: "bg-slate-800/30",
    resultPathClass: "text-xs text-[#cbd8ea]",
    moduleCardClass: "bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-4 shadow-md",
    moduleTitleClass:
      "inline-block px-3 py-1 rounded-md bg-gradient-to-r from-blue-600/70 to-indigo-600/60 text-white font-semibold text-sm shadow-sm",
    moduleDescClass: "text-xs text-gray-300 mt-1",
    noTopClass: "text-xs text-gray-400",

    // additional for small inline conditionals
    selectClass: "bg-[#07203a] text-[#e6eef8] border border-[#083047]",
    menuBtnHoverClass: "hover:bg-[#083047]",
    avatarBgClass: "bg-[#07203a]",
    avatarTextClass: "text-[#e6eef8]",
    menuItemHoverClass: "hover:bg-[#083047]",
    menuDangerTextClass: "",
    menuPrimaryTextClass: "",
  },
  light: {
    headerBg: "bg-white text-gray-900",
    topBtnBg: "bg-[#05b7f7] hover:bg-[#04a6db] text-white",
    searchBg: "bg-white border border-gray-200",
    subtitleClass: "text-gray-500",
    arrowClass: "text-gray-500",
    hoverNodeBg: "hover:bg-gray-100",
    menuBgClass: "bg-white text-gray-900",
    modalContainerClass:
      "relative max-w-6xl w-full bg-white text-gray-900 rounded-2xl shadow-lg overflow-auto max-h-[86vh] z-10",
    modalLoadingClass: "text-sm text-gray-600",
    modalCloseBtn: "text-sm px-3 py-1 rounded bg-[#05b7f7] hover:bg-[#04a6db] text-white",
    modalSearchClass:
      "w-full max-w-lg bg-white text-sm text-gray-700 placeholder-gray-400 outline-none rounded px-3 py-2 border border-gray-200",
    resultItemBg: "bg-gray-50",
    resultPathClass: "text-xs text-gray-500",
    moduleCardClass: "bg-white rounded-xl p-4 shadow-sm border",
    moduleTitleClass: "inline-block px-3 py-1 rounded-md bg-[#05b7f7] text-white font-semibold text-sm",
    moduleDescClass: "text-xs text-gray-500 mt-1",
    noTopClass: "text-xs text-gray-500",

    // additional for small inline conditionals
    selectClass: "bg-white text-[#05b7f7] border border-[#05b7f7]",
    menuBtnHoverClass: "hover:bg-gray-100",
    avatarBgClass: "bg-[#e8f9ff]",
    avatarTextClass: "text-[#05b7f7]",
    menuItemHoverClass: "hover:bg-gray-100",
    menuDangerTextClass: "text-red-600",
    menuPrimaryTextClass: "text-[#05b7f7]",
  },
};

export function getThemeStyles(effective) {
  return effective === "dark" ? stylesByMode.dark : stylesByMode.light;
}
