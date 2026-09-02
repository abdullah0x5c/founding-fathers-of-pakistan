/**
 * A very low-opacity dot grain across the whole page. It warms the flat green
 * ground without reading as a texture in its own right; if it is visible as an
 * effect it is too strong.
 */
export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 3,
        backgroundImage: "radial-gradient(rgba(236,239,230,.16) .5px, transparent .5px)",
        backgroundSize: "3px 3px",
        opacity: 0.5,
      }}
    />
  );
}
