import { readPhoto } from "@/lib/uploads";

export const dynamic = "force-dynamic";

/** Serves mentor photos from UPLOADS_DIR. File names carry a random suffix, so they can be cached forever. */
export async function GET(_request: Request, ctx: RouteContext<"/uploads/[name]">) {
  const photo = readPhoto((await ctx.params).name);
  if (!photo) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(photo.body), {
    headers: {
      "Content-Type": photo.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
