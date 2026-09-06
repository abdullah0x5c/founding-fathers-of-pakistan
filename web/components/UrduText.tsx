import type { CSSProperties } from "react";

/**
 * Every Urdu string on the site goes through here.
 *
 * `dir` and `lang` belong on the container element, never on an inline span, and
 * Nastaliq needs a line height of roughly 2.1 or more: the script descends steeply
 * across the line and anything near the Latin default collides.
 *
 * `size` is left unset by default so a caller's own class controls it. Where no
 * class is supplied the `.urdu` fallback sets 1.2em, because Urdu has to sit
 * larger than the Latin beside it to read as equivalent.
 *
 * Urdu and Latin are never mixed inline anywhere in this site — their baselines do
 * not align and it always looks broken. They sit in parallel blocks instead.
 */
export default function UrduText({
  children,
  as: Tag = "div",
  size,
  align = "right",
  className,
  style,
}: {
  children: React.ReactNode;
  as?: "div" | "span" | "p" | "h1" | "h2" | "h3";
  size?: string;
  align?: "right" | "left" | "center";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Tag
      dir="rtl"
      lang="ur"
      className={className ? `urdu ${className}` : "urdu"}
      style={{ textAlign: align, ...(size ? { fontSize: size } : null), ...style }}
    >
      {children}
    </Tag>
  );
}
