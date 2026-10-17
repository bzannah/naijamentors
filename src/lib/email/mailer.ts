import { email as config } from "../env";

/*
  Outgoing email behind a tiny interface.
  - RESEND_API_KEY set → Resend (https://resend.com) over its HTTP API.
  - otherwise → printed to the server console, so every flow can be tried locally without an account.
  To use another provider (Postmark, SES, SMTP…), add a Mailer and pick it in getMailer().
*/

export type Email = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  /** Lets the provider drop accidental duplicates (e.g. a retried digest). */
  idempotencyKey?: string;
};

export interface Mailer {
  readonly name: string;
  send(email: Email): Promise<void>;
}

class ResendMailer implements Mailer {
  readonly name = "resend";
  constructor(
    private apiKey: string,
    private from: string,
  ) {}

  async send(email: Email) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...(email.idempotencyKey ? { "Idempotency-Key": email.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: this.from,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        reply_to: email.replyTo ?? config.replyTo(),
      }),
    });
    if (!res.ok) throw new Error(`Resend rejected the email to ${email.to}: ${res.status} ${await res.text()}`);
  }
}

class ConsoleMailer implements Mailer {
  readonly name = "console";
  constructor(private from: string) {}

  async send(email: Email) {
    const rule = "─".repeat(64);
    console.info(
      [
        "",
        `┌${rule}`,
        `│ ✉  Email (console mailer, not sent)`,
        `│ From:    ${this.from}`,
        `│ To:      ${email.to}`,
        `│ Subject: ${email.subject}`,
        `├${rule}`,
        ...email.text.split("\n").map((l) => `│ ${l}`),
        `└${rule}`,
        "",
      ].join("\n"),
    );
  }
}

let override: Mailer | null = null;

/** Swap the mailer, e.g. in tests. Pass null to go back to the configured one. */
export function setMailer(m: Mailer | null) {
  override = m;
}

export function getMailer(): Mailer {
  if (override) return override;
  const key = config.resendApiKey();
  if (key) return new ResendMailer(key, config.from());
  if (process.env.NODE_ENV === "production") {
    console.warn("[email] RESEND_API_KEY is not set, so emails are only logged. See README → Email.");
  }
  return new ConsoleMailer(config.from());
}

/** Send without ever throwing: a failed notification must not break the action that triggered it. */
export async function deliver(email: Email) {
  try {
    await getMailer().send(email);
    return true;
  } catch (err) {
    console.error("[email]", err);
    return false;
  }
}
