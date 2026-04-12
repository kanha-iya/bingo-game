/**
 * CORS for Express + Socket.IO.
 *
 * Set CLIENT_URL or ALLOWED_ORIGINS (comma-separated), e.g.:
 *   http://localhost:5173,https://your-app.vercel.app
 *
 * One wildcard segment for previews, e.g.:
 *   https://*.vercel.app
 */

function normalizeOrigin(url) {
  return (url || "").trim().replace(/\/+$/, "");
}

function parseAllowedList() {
  const raw = process.env.CLIENT_URL || process.env.ALLOWED_ORIGINS || "";
  return raw
    .split(",")
    .map((s) => normalizeOrigin(s))
    .filter(Boolean);
}

function originMatchesPattern(allowedEntry, requestOrigin) {
  const o = normalizeOrigin(requestOrigin);
  const e = allowedEntry;

  if (!e.includes("*")) {
    return e === o;
  }

  const parts = e.split("*");
  const regexBody = parts
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join("[^.]+");
  return new RegExp(`^${regexBody}$`).test(o);
}

function isOriginAllowed(requestOrigin, allowedList) {
  if (!requestOrigin) return true;
  const o = normalizeOrigin(requestOrigin);
  return allowedList.some((entry) => originMatchesPattern(entry, o));
}

function corsOriginCallback(allowed) {
  return (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowed.length === 0) {
      console.warn(
        "[cors] CLIENT_URL / ALLOWED_ORIGINS is empty. Allowing this origin — set CLIENT_URL in production (comma-separated)."
      );
      return callback(null, true);
    }

    if (isOriginAllowed(origin, allowed)) {
      return callback(null, true);
    }

    console.warn(
      `[cors] Blocked origin: ${origin}. Allowed list: ${allowed.join(" | ")}`
    );
    callback(new Error("Not allowed by CORS"));
  };
}

export function getAllowedOrigins() {
  return parseAllowedList();
}

export function createExpressCorsOptions() {
  const allowed = parseAllowedList();
  return {
    origin: corsOriginCallback(allowed),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}

export function createSocketIoCorsConfig() {
  const allowed = parseAllowedList();
  return {
    origin: corsOriginCallback(allowed),
    methods: ["GET", "POST"],
    credentials: true,
  };
}
