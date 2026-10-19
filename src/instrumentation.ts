/*
  Runs once when the server starts.

  A stop is a clean exit: on SIGTERM Next.js finishes in-flight requests, then exits with 143. With a volume
  attached, Railway stops the old deployment while it is still the live one, and counts any non-zero exit as a
  crash (and emails about it), so a stop exits with 0 instead. `exec` in the start script makes Next.js the
  process npm signals, rather than a shell that would die without passing the signal on.

  If the uploads check throws, the server answers every request with a 500, so on Railway a deploy without the
  uploads volume fails its healthcheck (/) rather than saving mentor photos to a disk the next deploy wipes. With
  no volume, Railway keeps the previous deployment serving. With a volume attached but UPLOADS_DIR outside it, the
  old one is already stopped, so the site is down until UPLOADS_DIR is fixed.
*/
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  let stopping = false;
  process.once("SIGTERM", () => (stopping = true));
  process.on("exit", (code) => {
    if (stopping && code === 143) process.exitCode = 0;
  });

  const { uploadsVolumeProblem } = await import("./lib/uploads");
  const problem = uploadsVolumeProblem();
  if (problem) throw new Error(problem);
}
