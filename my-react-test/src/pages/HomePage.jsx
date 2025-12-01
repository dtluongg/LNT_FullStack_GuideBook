import React, { useState } from "react";
import Header from "../components/Header";
import CategoryContainer from "../components/category/CategoryContainer";
import ContentContainer from "../components/content/ContentContainer";

export default function HomePage({ user }) {
  const [activeModule, setActiveModule] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [titleCategory, setTitleCategory] = useState("");
  const [scrollToContentId, setScrollToContentId] = useState(null);

  const handleHeaderSelectCategory = (catOrId, mod, contentId) => {
    if (mod) setActiveModule(mod);
    const id = typeof catOrId === "object" ? Number(catOrId.id) : Number(catOrId);
    setActiveCategory(id);
    if (typeof catOrId === "object") {
      setTitleCategory(catOrId.title || catOrId.name || "");
    }
    if (contentId) {
      console.log('[HomePage] header select contentId', contentId, 'categoryId', id, 'module', mod?.id);
      setScrollToContentId(Number(contentId));
    }
  };

  const handleHeaderSelectModule = (m) => setActiveModule(m);

  // NOTE: `handleOpenContent` removed — use `handleHeaderSelectCategory` which
  // sets `scrollToContentId` so ContentContainer can open and scroll.

  return (
    <div className="h-screen flex flex-col">
      <Header user={user} onSelectModule={handleHeaderSelectModule} onSelectCategory={handleHeaderSelectCategory} />

      <div className="flex flex-1 overflow-hidden">
        <CategoryContainer
          moduleId={activeModule?.id}
          onSelectCategory={setActiveCategory}
          selectedCategoryId={activeCategory}
          nameModuleSelected={activeModule?.name}
          iconModuleSelected={activeModule?.icon}
          userRole={user.role}
          titleCategorySelected={setTitleCategory}
        />

          <ContentContainer
            categoryId={activeCategory}
            moduleId={activeModule?.id}
            titleCategory={titleCategory}
            userRole={user.role}
            scrollToContentId={scrollToContentId}
            onScrolledToContent={() => setScrollToContentId(null)}
          />
      </div>
    </div>
  );
}
