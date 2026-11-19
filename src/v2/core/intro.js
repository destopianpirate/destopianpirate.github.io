// Signals when the opening loader / page-transition reveal has finished, so page intros
// (hero title etc.) start on a visible screen instead of behind the curtain.
let done = false;
const subs = new Set();

export function markIntroDone() {
  if (done) return;
  done = true;
  subs.forEach((f) => f());
  subs.clear();
}

/** Calls f once the intro is over (immediately if it already is). Returns an unsubscribe. */
export function onIntroDone(f) {
  if (done) {
    f();
    return () => {};
  }
  subs.add(f);
  return () => subs.delete(f);
}

// --- page-to-page transitions ---
let navigateImpl = (href) => {
  window.location.href = href;
};
export const setNavigator = (fn) => {
  navigateImpl = fn;
};
export const navigate = (href) => navigateImpl(href);
