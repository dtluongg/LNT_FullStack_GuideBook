import CategoryManager from "./components/CategoryManager";
import ModuleManager from "./components/ModuleManager";
import ContentManager from "./components/ContentManager";
import ImageManager from "./components/ImageManager";

function App() {
  return (
    <div className="max-w-xl mx-auto mt-10">
      <ModuleManager />
      <CategoryManager moduleId={1} />
      <ContentManager categoryId={1} />
      <ImageManager contentId={3} />
    </div>
  );
}

export default App;
