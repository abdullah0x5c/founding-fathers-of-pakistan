import type { Metadata } from "next";
import { Bodoni_Moda, Spectral, IBM_Plex_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import GrainOverlay from "@/components/GrainOverlay";
import "./globals.css";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
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
      <body className={`${display.variable} ${body.variable} ${mono.variable} ${urdu.variable}`}>
        <GrainOverlay />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
