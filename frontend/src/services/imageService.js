import {
  uploadImage,
  getImagesByContent,
  getImagesByCategory,
  updateImage,
  deleteImage
} from "../api/images";

export const imageService = {
  upload: async (contentId, file, filename) =>
    (await uploadImage(contentId, file, filename)).data,
  listByContent: async (contentId) =>
    (await getImagesByContent(contentId)).data.data,
  listByCategory: async (categoryId) =>
    (await getImagesByCategory(categoryId)).data,
  update: async (id, file, filename) =>
    (await updateImage(id, file, filename)).data,
  remove: async (id) => (await deleteImage(id)).data
};
