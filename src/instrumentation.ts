/*
  Runs once when the server starts. If it throws, the server answers every request with a 500, so on Railway a
  deploy without the uploads volume fails its healthcheck (/) and the previous deployment keeps serving, rather
  than saving mentor photos to a disk the next deploy wipes.
*/
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { uploadsVolumeProblem } = await import("./lib/uploads");
  const problem = uploadsVolumeProblem();
  if (problem) throw new Error(problem);
}
