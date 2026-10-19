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

/**
  Says why photos saved now would be lost, or returns null. Railway wipes a container's disk on every deploy, so
  there UPLOADS_DIR must be on the attached volume (Railway sets RAILWAY_VOLUME_MOUNT_PATH when one is attached).
  Railway doesn't enforce requiredMountPath, so src/instrumentation.ts checks this at startup. Other hosts aren't checked.
*/
export function uploadsVolumeProblem() {
  if (process.env.NODE_ENV !== "production" || !process.env.RAILWAY_ENVIRONMENT) return null;
  const mount = process.env.RAILWAY_VOLUME_MOUNT_PATH?.trim();
  if (!mount) return `No Railway volume is attached, so photos saved to ${dir()} would be lost on the next deploy. Attach one at /data.`;
  const inside = path.relative(path.resolve(mount), dir());
  if (inside.startsWith("..") || path.isAbsolute(inside)) {
    return `UPLOADS_DIR (${dir()}) isn't on the Railway volume mounted at ${mount}, so photos would be lost on the next deploy.`;
  }
  return null;
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
