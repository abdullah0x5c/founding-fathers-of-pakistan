import type { Metadata } from "next";
import { Inter, Gulzar, Noto_Nastaliq_Urdu } from "next/font/google";
import JaliOverlay from "@/components/JaliOverlay";
import ArchDefs from "@/components/ArchDefs";
import "./globals.css";

// Inter, at 700/bold, carries the display role — headings and titles.
const display = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Inter also carries the running text and the catalogue labels: 400/regular for
// prose, 600/semibold for the small-caps labels and folio marks (Inter has no
// real small-caps glyphs, so those roles fall back to weight for distinction).
const body = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

// Gulzar is the Nastaliq display cut, for titles only. Loading it alongside Noto
// is justified by how much Urdu display type this site sets — every figure and
// every work carries a Nastaliq title — but it is never used for running text.
const urduDisplay = Gulzar({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-urdu-display",
  display: "swap",
});

// Nastaliq is a heavy face. Restricting it to the Arabic subset is what keeps it
// from dominating the payload — roughly half the corpus is Urdu and every route
// carries at least a name in it, so it cannot be deferred any further than this.
const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "600"],
  variable: "--font-urdu",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Founding Fathers of Pakistan",
    template: "%s · Founding Fathers of Pakistan",
  },
  description:
    "A reading archive of the primary writings of eleven figures in the making of Pakistan. Speeches, treatises, letters, poetry and pamphlets, in English and Urdu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} ${urduDisplay.variable} ${urdu.variable}`}
      >
        {/* No site header and no site footer, anywhere. Every route here is a
            leaf of an album, and a leaf does not carry a menu bar across its
            head or a strip of links along its foot. Navigation lives inside the
            content instead: the figure page opens on a breadcrumb, the work page
            on a running head that leads back to both the index and the figure. */}
        <ArchDefs />
        <JaliOverlay />
        {children}
      </body>
    </html>
  );
}
