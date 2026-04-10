export type MotionPermissionState = "granted" | "denied" | "unsupported";

interface DeviceMotionEventWithPermission {
  requestPermission?: () => Promise<"granted" | "denied">;
}

/**
 * Request accelerometer access.
 *
 * On iOS 13+ this triggers the native permission prompt and MUST be called
 * from a synchronous user gesture handler. On Android/other browsers the
 * DeviceMotionEvent API is available without an explicit grant.
 */
export async function requestMotionPermission(): Promise<MotionPermissionState> {
  if (typeof window === "undefined") return "unsupported";

  const DME = (
    window as unknown as { DeviceMotionEvent?: DeviceMotionEventWithPermission }
  ).DeviceMotionEvent;

  if (DME && typeof DME.requestPermission === "function") {
    try {
      const result = await DME.requestPermission();
      return result === "granted" ? "granted" : "denied";
    } catch {
      return "denied";
    }
  }

  if (typeof window.DeviceMotionEvent !== "undefined") return "granted";
  return "unsupported";
}

/**
 * Whether the DeviceMotionEvent API exists at all. A `true` result does NOT
 * guarantee a physical accelerometer is present (desktop Chrome exposes the
 * API without a sensor) — use a first-event probe to confirm live readings.
 */
export function hasMotionApi(): boolean {
  return typeof window !== "undefined" && "DeviceMotionEvent" in window;
}

/**
 * Whether the browser requires an explicit permission request (iOS 13+).
 * Used to decide if we need to show a "grant motion" primer.
 */
export function requiresMotionPermission(): boolean {
  if (typeof window === "undefined") return false;
  const DME = (
    window as unknown as { DeviceMotionEvent?: DeviceMotionEventWithPermission }
  ).DeviceMotionEvent;
  return !!DME && typeof DME.requestPermission === "function";
}
