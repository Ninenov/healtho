export const AUTH_EXPIRED_EVENT = "healthos:auth-expired";

export function emitAuthExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event(AUTH_EXPIRED_EVENT),
    );
  }
}