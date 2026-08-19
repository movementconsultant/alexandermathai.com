/**
 * Contact intake Worker — alexandermathai.com
 *
 * Standalone Cloudflare Worker, NOT part of the Astro site build. This file
 * is written source code only; it has not been deployed by this session (no
 * Cloudflare account/dashboard access exists here). See ../README.md for the
 * exact deployment steps and docs/mark-18-contact-intake-implementation.md
 * (site repo root) for the full governance/design record.
 *
 * Accepts POST /  with JSON: { name, email, organization?, message, hp_confirm? }
 * Validates + sanitizes the payload, rate-limits by IP (if RATE_LIMIT_KV is
 * bound — see README), formats a plain HTML email, and sends it via Resend
 * to NOTIFY_EMAIL. Every secret is read from `env`, never hardcoded here.
 */

export interface Env {
  /** Resend API key. Set via `wrangler secret put RESEND_API_KEY` — never in wrangler.toml. */
  RESEND_API_KEY: string;
  /** Destination inbox for every submission, e.g. "movementconsultant@gmail.com". */
  NOTIFY_EMAIL: string;
  /** Verified Resend sending address, e.g. "intake@alexandermathai.com". */
  FROM_EMAIL: string;
  /** Exact origin allowed to call this Worker, e.g. "https://alexandermathai.com". */
  ALLOWED_ORIGIN: string;
  /**
   * Optional KV namespace for IP-based rate limiting. If unbound, rate
   * limiting is skipped entirely (fails open) and a warning is logged — see
   * README "Rate limiting" for why this binding is required for real
   * protection, and how to create it.
   */
  RATE_LIMIT_KV?: KVNamespace;
}

const MAX_REQUESTS_PER_WINDOW = 5;
const WINDOW_SECONDS = 600; // 10 minutes

const MAX_LENGTHS = {
  name: 200,
  email: 320,
  organization: 200,
  message: 5000,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Payload {
  name: string;
  email: string;
  organization?: string;
  message: string;
  hp_confirm?: string;
}

function corsHeaders(origin: string, allowedOrigin: string): HeadersInit {
  const headers: HeadersInit = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (origin === allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }
  return headers;
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  origin: string,
  env: Env,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin, env.ALLOWED_ORIGIN),
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strips control characters and caps length. Never throws. */
function sanitizeField(raw: unknown, maxLen: number): string {
  if (typeof raw !== "string") return "";
  // eslint-disable-next-line no-control-regex
  const stripped = raw.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "").trim();
  return stripped.slice(0, maxLen);
}

interface ValidationResult {
  ok: true;
  payload: { name: string; email: string; organization: string; message: string };
}
interface ValidationError {
  ok: false;
  error: string;
}

function validate(raw: unknown): ValidationResult | ValidationError {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const body = raw as Partial<Payload>;

  const name = sanitizeField(body.name, MAX_LENGTHS.name);
  const email = sanitizeField(body.email, MAX_LENGTHS.email);
  const organization = sanitizeField(body.organization, MAX_LENGTHS.organization);
  const message = sanitizeField(body.message, MAX_LENGTHS.message);

  if (!name) return { ok: false, error: "Name is required." };
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "A valid email address is required." };
  }
  if (!message) return { ok: false, error: "A message is required." };

  return { ok: true, payload: { name, email, organization, message } };
}

/**
 * Fixed-window IP rate limit via KV. Fails OPEN (allows the request) if no
 * KV binding exists — see README "Rate limiting" for why this is a
 * documented limitation, not a silent one.
 */
async function checkRateLimit(env: Env, ip: string): Promise<boolean> {
  if (!env.RATE_LIMIT_KV) {
    console.warn("[contact-intake] RATE_LIMIT_KV not bound — rate limiting is inactive.");
    return true;
  }
  const key = `ratelimit:${ip}`;
  const current = await env.RATE_LIMIT_KV.get(key);
  const count = current ? Number.parseInt(current, 10) : 0;
  if (count >= MAX_REQUESTS_PER_WINDOW) return false;
  await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: WINDOW_SECONDS });
  return true;
}

async function sendEmail(env: Env, payload: ValidationResult["payload"]): Promise<boolean> {
  const html = `
    <h2>New inquiry from alexandermathai.com</h2>
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    <p><strong>Organization:</strong> ${escapeHtml(payload.organization || "(not provided)")}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(payload.message).replace(/\n/g, "<br>")}</p>
  `.trim();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: env.NOTIFY_EMAIL,
      reply_to: payload.email,
      subject: `Contact form: ${payload.name}`,
      html,
    }),
  });

  return response.ok;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env.ALLOWED_ORIGIN) });
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed." }, 405, origin, env);
    }

    if (origin !== env.ALLOWED_ORIGIN) {
      return jsonResponse({ ok: false, error: "Origin not allowed." }, 403, origin, env);
    }

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const allowed = await checkRateLimit(env, ip);
    if (!allowed) {
      return jsonResponse(
        { ok: false, error: "Too many requests. Try again later." },
        429,
        origin,
        env,
      );
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400, origin, env);
    }

    // Honeypot: if filled, pretend success without sending anything.
    if (typeof raw === "object" && raw !== null && (raw as Payload).hp_confirm) {
      return jsonResponse({ ok: true }, 200, origin, env);
    }

    const result = validate(raw);
    if (!result.ok) {
      return jsonResponse({ ok: false, error: result.error }, 400, origin, env);
    }

    try {
      const sent = await sendEmail(env, result.payload);
      if (!sent) {
        return jsonResponse(
          { ok: false, error: "Delivery failed. Try again shortly." },
          502,
          origin,
          env,
        );
      }
      return jsonResponse({ ok: true }, 200, origin, env);
    } catch (err) {
      console.error("[contact-intake] send failure:", err);
      return jsonResponse({ ok: false, error: "Delivery failed. Try again shortly." }, 502, origin, env);
    }
  },
};
