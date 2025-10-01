import React, { useState, useEffect } from "react";
import {
  uploadImage,
  getImagesByContent,
  updateImage,
  deleteImage
} from "../api/images";

const ImageManager = ({ contentId }) => {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [images, setImages] = useState([]);

  const loadImages = async () => {
    const res = await getImagesByContent(contentId);
    setImages(res.data.data);
  };

  const handleUpload = async () => {
    if (!file) return alert("Chọn file trước đã");
    await uploadImage(contentId, file, filename);
    setFile(null);
    setFilename("");
    loadImages();
  };

  const handleUpdate = async (id) => {
    if (!file) return alert("Chọn file để update");
    await updateImage(id, file, filename);
    loadImages();
  };

  const handleDelete = async (id) => {
    await deleteImage(id);
    loadImages();
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold mb-2">Image Manager (Content {contentId})</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input
        type="text"
        placeholder="Custom filename (optional)"
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
      />
      <button onClick={handleUpload} className="px-2 py-1 bg-blue-500 text-white">
        Upload
      </button>

      <div className="mt-4 space-y-2">
        {images.map((img) => (
          <div key={img.id} className="flex items-center gap-2">
            <img src={`http://localhost:4000${img.image_url}`} alt="" className="w-24 h-24 object-cover border" />
            <button onClick={() => handleUpdate(img.id)} className="px-2 py-1 bg-yellow-500 text-white">
              Update
            </button>
            <button onClick={() => handleDelete(img.id)} className="px-2 py-1 bg-red-500 text-white">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageManager;
