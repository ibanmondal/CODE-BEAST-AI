/**
 * CodeBeast AI - Production API & WebSocket URL Helper
 *
 * Resolves API endpoints dynamically across local development, Docker containers,
 * Vercel edge deployments, Render, Railway, or VPS reverse proxies.
 */

export function getApiBaseUrl(): string {
  // 1. Explicitly configured production backend URL (e.g., https://codebeast-api.onrender.com)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // 2. Client-side browser execution
  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;

    // Localhost development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }

    // Local network dev (e.g. testing from mobile or another machine on LAN)
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname)) {
      return `${protocol}//${hostname}:8000`;
    }

    // Production environment without NEXT_PUBLIC_API_URL:
    // If running under standard web ports (80/443), assume Next.js rewrites proxy /api/v1/
    // or standard same-origin reverse proxy.
    if (!port || port === "80" || port === "443" || port === "3000") {
      // In cloud (e.g. Vercel), return empty string so relative URLs like /api/v1/...
      // are routed through Next.js rewrites or same-domain proxy
      return "";
    }

    return `${protocol}//${hostname}:8000`;
  }

  // 3. Server-side rendering (SSR) fallback
  return process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";
}

export function getWsBaseUrl(): string {
  // 1. Explicitly configured WebSocket URL
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL.replace(/\/$/, "");
  }

  const apiBase = getApiBaseUrl();

  // If apiBase is absolute URL
  if (apiBase.startsWith("https://")) {
    return apiBase.replace("https://", "wss://");
  } else if (apiBase.startsWith("http://")) {
    return apiBase.replace("http://", "ws://");
  }

  // If apiBase is relative or running in browser
  if (typeof window !== "undefined") {
    const isHttps = window.location.protocol === "https:";
    const wsProto = isHttps ? "wss:" : "ws:";
    const host = window.location.hostname;

    if (host === "localhost" || host === "127.0.0.1") {
      return "ws://localhost:8000";
    }

    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host)) {
      return `${wsProto}//${host}:8000`;
    }

    // Hosted domain fallback
    return `${wsProto}//${window.location.host}`;
  }

  return "ws://localhost:8000";
}

/**
 * Returns a fully-qualified URL for an API endpoint.
 * @example apiUrl('/api/v1/stats/dashboard')
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return `${base}${cleanPath}`;
}

/**
 * Returns a fully-qualified URL for a WebSocket endpoint.
 * @example wsUrl('/api/v1/ws/updates')
 */
export function wsUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const base = getWsBaseUrl();
  return `${base}${cleanPath}`;
}
