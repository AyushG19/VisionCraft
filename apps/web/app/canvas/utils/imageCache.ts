export const imageCache = new Map<string, ImageBitmap | Promise<ImageBitmap>>();

export const setImage = (
  id: string,
  bitmap: ImageBitmap | Promise<ImageBitmap>,
) => {
  imageCache.set(id, bitmap);
};

export const getImage = (id: string) => {
  return imageCache.get(id);
};

export const removeImage = (id: string) => {
  const cached = imageCache.get(id);
  if (cached instanceof ImageBitmap) cached.close(); // free GPU memory
  imageCache.delete(id);
};

export const clearImageCache = () => {
  for (const [, bitmap] of imageCache) {
    if (bitmap instanceof ImageBitmap) bitmap.close();
  }
  imageCache.clear();
};
