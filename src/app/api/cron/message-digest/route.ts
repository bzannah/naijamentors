import { timingSafeEqual } from "node:crypto";
import { cronSecret } from "@/lib/env";
import { sendMessageDigests } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/*
  Emails unread-message digests. Call it on a schedule (every 15–60 minutes) with
    Authorization: Bearer <CRON_SECRET>
  Vercel Cron sends that header automatically when CRON_SECRET is set. In development the secret is optional.
*/

function authorised(request: Request) {
  const secret = cronSecret();
  if (!secret) return process.env.NODE_ENV !== "production";
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

async function run(request: Request) {
  if (!authorised(request)) return new Response("Unauthorised", { status: 401 });
  const result = await sendMessageDigests();
  return Response.json(result);
}

export const GET = run;
export const POST = run;
