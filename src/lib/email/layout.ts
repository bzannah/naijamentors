import { BRAND } from "../brand";
import { safeguardingEmail } from "../env";

/*
  One email layout in the Village palette: warm paper, a card, forest green call to action, gold rule.
  Inline styles and tables only, because that's what email clients render reliably.
  Every piece of content is escaped, so names and messages can be passed straight in.
*/

const C = {
  paper: "#f6f1e7",
  card: "#fffcf6",
  ink: "#17140f",
  ink2: "#4b443a",
  ink3: "#847b6d",
  forest: "#0e3b2e",
  clay: "#b4552d",
  gold: "#c39a4b",
  goldSoft: "#f2e6c9",
  line: "#e9e2d4",
};
const SERIF = "Fraunces, Georgia, 'Times New Roman', serif";
const SANS = "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export type EmailContent = {
  /** Shown in the inbox list after the subject. */
  preheader: string;
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  /** Label / value rows, e.g. date and topic. */
  details?: [string, string][];
  /** A quoted note from the other person. */
  quote?: { text: string; by: string };
  /** Short list of items, e.g. conversations in a digest. */
  items?: { title: string; meta: string; body: string; href: string }[];
  cta?: { label: string; href: string };
  footnote?: string;
};

export function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const p = (html: string, style = "") =>
  `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.ink2};${style}">${html}</p>`;

export function renderEmail(c: EmailContent): { html: string; text: string } {
  const guard = safeguardingEmail();

  const details = c.details?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border-top:1px solid ${C.line};">
        ${c.details
          .map(
            ([k, v]) => `<tr>
              <td style="padding:12px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${C.ink3};width:34%;vertical-align:top;">${esc(k)}</td>
              <td style="padding:12px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:15px;color:${C.ink};vertical-align:top;">${esc(v)}</td>
            </tr>`,
          )
          .join("")}
      </table>`
    : "";

  const quote = c.quote
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 24px;">
        <tr><td style="background:${C.goldSoft};border-radius:16px;padding:20px 22px;">
          <p style="margin:0;font-family:${SERIF};font-size:18px;line-height:1.5;font-style:italic;color:${C.ink};">“${esc(c.quote.text)}”</p>
          <p style="margin:10px 0 0;font-family:${SANS};font-size:13px;color:${C.ink3};">${esc(c.quote.by)}</p>
        </td></tr>
      </table>`
    : "";

  const items = c.items?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 24px;border-top:1px solid ${C.line};">
        ${c.items
          .map(
            (i) => `<tr><td style="padding:16px 0;border-bottom:1px solid ${C.line};">
              <a href="${esc(i.href)}" style="text-decoration:none;">
                <p style="margin:0;font-family:${SANS};font-size:15px;font-weight:600;color:${C.ink};">${esc(i.title)} <span style="font-weight:400;color:${C.ink3};">· ${esc(i.meta)}</span></p>
                <p style="margin:6px 0 0;font-family:${SANS};font-size:14px;line-height:1.5;color:${C.ink2};">${esc(i.body)}</p>
              </a>
            </td></tr>`,
          )
          .join("")}
      </table>`
    : "";

  const cta = c.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 8px;">
        <tr><td style="background:${C.forest};border-radius:999px;">
          <a href="${esc(c.cta.href)}" style="display:inline-block;padding:14px 26px;font-family:${SANS};font-size:15px;font-weight:600;color:${C.paper};text-decoration:none;">${esc(c.cta.label)} &rarr;</a>
        </td></tr>
      </table>`
    : "";

  const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(c.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${C.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <tr><td style="padding:0 8px 22px;">
        <span style="font-family:${SERIF};font-size:26px;letter-spacing:-0.02em;color:${C.forest};">${esc(BRAND.name)}</span>
      </td></tr>
      <tr><td style="background:${C.card};border-radius:28px;border:1px solid ${C.line};padding:36px 32px 32px;">
        <p style="margin:0 0 14px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${C.clay};">${esc(c.eyebrow)}</p>
        <h1 style="margin:0 0 18px;font-family:${SERIF};font-size:30px;line-height:1.15;font-weight:400;letter-spacing:-0.02em;color:${C.ink};">${esc(c.heading)}</h1>
        <div style="width:44px;height:2px;background:${C.gold};border-radius:2px;margin:0 0 22px;"></div>
        ${c.paragraphs.map((x) => p(esc(x))).join("")}
        ${quote}${details}${items}${cta}
        ${c.footnote ? p(esc(c.footnote), `margin:22px 0 0;font-size:13px;color:${C.ink3};`) : ""}
      </td></tr>
      <tr><td style="padding:22px 8px 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.ink3};">
        ${esc(BRAND.tagline)} Worried about a young person? Contact our safeguarding lead at
        <a href="mailto:${esc(guard)}" style="color:${C.forest};">${esc(guard)}</a>.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    c.heading,
    "",
    ...c.paragraphs.flatMap((x) => [x, ""]),
    ...(c.quote ? [`“${c.quote.text}”`, `— ${c.quote.by}`, ""] : []),
    ...(c.details ?? []).map(([k, v]) => `${k}: ${v}`),
    ...(c.details?.length ? [""] : []),
    ...(c.items ?? []).flatMap((i) => [`${i.title} · ${i.meta}`, `  ${i.body}`, `  ${i.href}`, ""]),
    ...(c.cta ? [`${c.cta.label}: ${c.cta.href}`, ""] : []),
    ...(c.footnote ? [c.footnote, ""] : []),
    `${BRAND.tagline} Safeguarding: ${guard}`,
  ].join("\n");

  return { html, text };
}
