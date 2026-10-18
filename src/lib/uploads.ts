import fs from "node:fs";
import path from "node:path";
import { uploadsDir } from "./env";
import { PHOTO_EXTENSIONS } from "./photo-types";

/*
  Mentor photos uploaded through the application form.

  They live in UPLOADS_DIR rather than public/: in production Next.js only serves the public files that
  existed when the server started, and public/ is rebuilt on every deploy. /uploads/[name] serves them.
*/

const TYPE_FOR = Object.fromEntries(Object.entries(PHOTO_EXTENSIONS).map(([type, ext]) => [ext, type]));

function dir() {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), uploadsDir());
}

/** Saves a photo as `<baseName>.<ext>` and returns its public path, or null if it isn't a supported image. */
export async function savePhoto(file: File, baseName: string) {
  const ext = PHOTO_EXTENSIONS[file.type];
  if (!ext) return null;
  const name = `${baseName}.${ext}`;
  fs.mkdirSync(dir(), { recursive: true });
  fs.writeFileSync(path.join(/*turbopackIgnore: true*/ dir(), name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

/** Reads a saved photo, or returns null if the name isn't one savePhoto could have produced or the file is gone. */
export function readPhoto(name: string) {
  const ext = /^[a-z0-9-]+\.([a-z]+)$/.exec(name)?.[1];
  const type = ext ? TYPE_FOR[ext] : undefined;
  if (!type) return null;
  try {
    return { body: fs.readFileSync(path.join(/*turbopackIgnore: true*/ dir(), name)), type };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}
