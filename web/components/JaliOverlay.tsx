/**
 * A jali across the whole page — the pierced stone lattice of a Mughal screen,
 * drawn as two opposed diagonal rules and a dot at each intersection.
 *
 * It sits at a very low opacity and is meant to be felt rather than seen: it
 * gives the flat green ground a weave so it reads as a woven cloth binding
 * rather than as a filled rectangle. If you can identify it as a pattern
 * without looking for it, it is too strong.
 */
export default function JaliOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 3,
        opacity: 0.07,
        backgroundImage: [
          "repeating-linear-gradient(45deg, #C9A227 0 1px, transparent 1px 27px)",
          "repeating-linear-gradient(-45deg, #C9A227 0 1px, transparent 1px 27px)",
          "radial-gradient(circle at 50% 50%, #C9A227 1.4px, transparent 1.5px)",
        ].join(","),
        backgroundSize: "auto, auto, 27px 27px",
      }}
    />
  );
}
