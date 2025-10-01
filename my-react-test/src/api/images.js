import api from "./client";

// Upload image (FormData)
export const uploadImage = (contentId, file, filename) => {
  const formData = new FormData();
  formData.append("file", file); // chỉ file thôi

  // nếu có filename thì thêm vào URL
  const url = filename
    ? `/images/content/${contentId}?filename=${encodeURIComponent(filename)}`
    : `/images/content/${contentId}`;

  return api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Lấy ảnh theo content
export const getImagesByContent = (contentId) =>
  api.get(`/images/content/${contentId}`);

// Lấy ảnh theo category
export const getImagesByCategory = (categoryId) =>
  api.get(`/images/category/${categoryId}`);

// Update (re-upload)
export const updateImage = (imageId, categoryId, file, filename = null) => {
  const formData = new FormData();
  formData.append("file", file);

  let url = `/images/${imageId}?categoryId=${categoryId}`;
  if (filename) url += `&filename=${filename}`;

  return api.put(url, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

// Delete image
export const deleteImage = (id) => api.delete(`/images/${id}`);
