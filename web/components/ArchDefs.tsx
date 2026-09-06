/**
 * The pishtaq arch, as an objectBoundingBox clip path so any element can take it
 * regardless of its size.
 *
 * A pishtaq is the tall arched portal of a Mughal gateway, and it is the shape
 * every mounted portrait in this album is cut to. The curve is not a semicircle:
 * it rises straight from the foot to a little under half height, then breaks
 * inward on a shallow cubic to a slight point at the crown. A plain
 * `border-radius` cannot make that shape — it can only make a dome — which is
 * why this is a path and lives here rather than in CSS.
 *
 * Rendered once, in the root layout, in a zero-sized SVG.
 */
export default function ArchDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <clipPath id="pishtaq-arch" clipPathUnits="objectBoundingBox">
          <path d="M0,1 L0,0.44 C0,0.20 0.17,0.055 0.5,0 C0.83,0.055 1,0.20 1,0.44 L1,1 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
