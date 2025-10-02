import React, { useState } from "react";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import CategoryList from "./components/CategoryList";
import ContentViewer from "./components/ContentViewer";

const App = () => {
  const [user] = useState({ name: "Demo Admin" });
  const [activeModule, setActiveModule] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [titleCategory, setTitleCategory] = useState("");

  return (
    <div className="h-screen flex flex-col">
      <Header user={user} />
      <Navbar onSelectModule={setActiveModule} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar category */}
        <CategoryList
          moduleId={activeModule?.id}
          onSelectCategory={setActiveCategory}
          titleCategorySelected={setTitleCategory}
        />

        {/* Main content area */}
        <ContentViewer categoryId={activeCategory} titleCategory={titleCategory} />
      </div>
    </div>
  );
};

export default App;
