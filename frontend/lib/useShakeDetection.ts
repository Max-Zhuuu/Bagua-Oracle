import { useEffect, useRef, useState } from "react";

interface UseShakeOptions {
  /** Only listen when true. Flipping to false resets internal state. */
  enabled: boolean;
  /** Total acceleration magnitude threshold in m/s² (incl. gravity ~9.8). */
  threshold?: number;
  /** Number of above-threshold peaks required within windowMs to fire. */
  requiredPeaks?: number;
  /** Time window for counting peaks. */
  windowMs?: number;
  /** Fires once when threshold+count is satisfied. */
  onShakeComplete: () => void;
}

/**
 * Listens to `devicemotion` and reports:
 *  - isShaking: true while motion magnitude is above threshold (for
 *    visual/audio feedback during the shake).
 *  - hasReceivedEvents: true once any valid motion event has arrived (lets
 *    the caller probe whether a real accelerometer is present).
 *
 * Fires onShakeComplete() once when `requiredPeaks` above-threshold peaks
 * occur within a sliding `windowMs` window. Peaks are debounced to 80ms
 * so a single physical shake doesn't count twice.
 */
export function useShakeDetection({
  enabled,
  threshold = 18,
  requiredPeaks = 3,
  windowMs = 1200,
  onShakeComplete,
}: UseShakeOptions) {
  const [isShaking, setIsShaking] = useState(false);
  const [hasReceivedEvents, setHasReceivedEvents] = useState(false);
  const peakTimesRef = useRef<number[]>([]);
  const firedRef = useRef(false);
  const cbRef = useRef(onShakeComplete);
  cbRef.current = onShakeComplete;

  useEffect(() => {
    if (!enabled) {
      setIsShaking(false);
      peakTimesRef.current = [];
      firedRef.current = false;
      return;
    }

    let shakingOffTimer: number | null = null;

    const handle = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;

      setHasReceivedEvents(true);

      const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
      const now = performance.now();

      if (mag > threshold) {
        setIsShaking(true);

        const peaks = peakTimesRef.current;
        const last = peaks[peaks.length - 1] ?? 0;
        if (now - last > 80) {
          peaks.push(now);
          while (peaks.length && now - peaks[0] > windowMs) peaks.shift();
          if (peaks.length >= requiredPeaks && !firedRef.current) {
            firedRef.current = true;
            peakTimesRef.current = [];
            cbRef.current();
          }
        }

        if (shakingOffTimer !== null) window.clearTimeout(shakingOffTimer);
        shakingOffTimer = window.setTimeout(() => setIsShaking(false), 250);
      }
    };

    window.addEventListener("devicemotion", handle);
    return () => {
      window.removeEventListener("devicemotion", handle);
      if (shakingOffTimer !== null) window.clearTimeout(shakingOffTimer);
    };
  }, [enabled, threshold, requiredPeaks, windowMs]);

  return { isShaking, hasReceivedEvents };
}
