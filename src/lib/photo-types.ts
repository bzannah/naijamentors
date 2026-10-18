/** Image types accepted for mentor photos, with the file extension each is saved under. Safe to import in the browser. */
export const PHOTO_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/** For `<input type="file" accept>`. Listing JPEG also makes iPhones convert HEIC photos before upload. */
export const PHOTO_ACCEPT = Object.keys(PHOTO_EXTENSIONS).join(",");
