/**
 * iOS Safari fires a native "Undo Typing?" alert whenever the device is
 * shaken and there's recent text-input undo history in the WebView. Since
 * our shake-to-roll feature *also* listens to devicemotion, the two gestures
 * collide and the alert interrupts the ritual.
 *
 * There's no documented opt-out, but two tricks combine to kill it reliably:
 *
 * 1. A global capture-phase `beforeinput` listener that cancels events with
 *    inputType `historyUndo`/`historyRedo`. If the user DOES tap "Undo" in
 *    the native alert, nothing happens in the page.
 *
 * 2. A hidden ghost input focused+blurred via a user gesture. On iOS, this
 *    transfers the first-responder text context to an input with no undo
 *    history, so the shake-to-undo alert has nothing to offer and is
 *    suppressed entirely. `inputMode="none"` prevents the keyboard from
 *    flashing open during the microsecond of focus.
 *
 * Both are safe no-ops on non-iOS browsers.
 */

let installed = false;

function handleBeforeInput(e: Event) {
  const ie = e as InputEvent;
  if (ie.inputType === "historyUndo" || ie.inputType === "historyRedo") {
    e.preventDefault();
    e.stopPropagation();
  }
}

/** Install the global undo-blocker once per page. */
export function installIosUndoBlocker(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("beforeinput", handleBeforeInput, { capture: true });
}

/**
 * Create and briefly focus a hidden ghost input to clear iOS's recent
 * first-responder tracking. MUST be called from inside a user-gesture
 * handler (e.g. an onClick) or iOS will ignore the focus call.
 */
export function consumeIosFirstResponder(): void {
  if (typeof document === "undefined") return;
  (document.activeElement as HTMLElement | null)?.blur();

  const ghost = document.createElement("input");
  ghost.type = "text";
  ghost.setAttribute("inputmode", "none");
  ghost.setAttribute("aria-hidden", "true");
  ghost.tabIndex = -1;
  ghost.style.cssText =
    "position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;";
  document.body.appendChild(ghost);
  try {
    ghost.focus({ preventScroll: true });
    ghost.blur();
  } catch {
    // Ignore — best-effort mitigation
  }
  window.setTimeout(() => {
    if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
  }, 0);
}
