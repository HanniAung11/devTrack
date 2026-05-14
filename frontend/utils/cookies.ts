/** Safe read for cookie values that may contain '=' (JWT padding). */

export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${name}=`;
  const segments = document.cookie.split("; ");
  for (const segment of segments) {
    if (segment.startsWith(prefix)) {
      const raw = segment.slice(prefix.length);
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return undefined;
}

export function setAuthCookies(
  access: string,
  refresh: string,
  role?: string,
  maxAgeSeconds = 60 * 60 * 24 * 7
) {
  const opts = `Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
  document.cookie = `accessToken=${encodeURIComponent(access)}; ${opts}`;
  document.cookie = `refreshToken=${encodeURIComponent(refresh)}; ${opts}`;
  if (role) {
    document.cookie = `role=${encodeURIComponent(role)}; ${opts}`;
  }
}

export function clearAuthCookies() {
  document.cookie = "accessToken=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "refreshToken=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "role=; Path=/; Max-Age=0; SameSite=Lax";
}
