/**
 * The live Lenis instance, in a module of its own so that anything needing to
 * move the page can reach it without importing the component that owns it —
 * [[SmoothScroll]] sets it on mount and clears it on unmount.
 *
 * Null whenever smooth scroll is off, which is the case under
 * `prefers-reduced-motion`. Callers treat that as "use the native scroll",
 * never as an error.
 */

let instance = null

export const getLenis = () => instance

export const setLenis = (lenis) => {
  instance = lenis
}
