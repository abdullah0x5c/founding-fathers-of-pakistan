export type Lang = "English" | "Urdu" | "Persian" | "Arabic";

export type WorkKind =
  | "Treatise"
  | "History"
  | "Essays"
  | "Speeches"
  | "Letters"
  | "Poetry"
  | "Religious"
  | "Law"
  | "Memoir"
  | "Pamphlet"
  | "Review"
  | "Periodical"
  | "Compilation"
  | "Testimony"
  | "About";

/**
 * A second printing, translation or reissue of the same work. Editions render as
 * indented sub-rows inside the parent work's card rather than as separate works,
 * because listing a translation beside its original doubles the apparent size of
 * the shelf without adding anything to it.
 */
export interface Edition {
  label: string;
  lang: Lang;
  pages: number;
  bytes: number;
  sourceFile: string;
  iaIdentifier?: string;
  iaFilename?: string;
}

export interface Work {
  slug: string;
  /** slug of the figure this work belongs to */
  figure: string;
  title: string;
  titleUrdu?: string;
  /** "1859", "1870–97", or "" where the date of composition is not established */
  year: string;
  kind: WorkKind;
  lang: Lang;
  pages: number;
  /** measured file size, drives the download button's stated weight */
  bytes: number;
  printed?: string;
  holder?: string;
  rights: string;
  /** 40–90 words on what the document is and why it matters */
  intro: string;
  /** archive.org item identifier — the single field to fill after upload */
  iaIdentifier?: string;
  /** filename within the archive.org item, for the direct download link */
  iaFilename?: string;
  /** path under content/, so every record can be traced back to its scan */
  sourceFile: string;
  /** plain statement of scan quality where it is worth warning about */
  scanNote?: string;
  /** true for scholarship *about* the figure rather than *by* them */
  secondary?: boolean;
  /** for secondary material, whose work it is */
  byline?: string;
  editions?: Edition[];
  /** claims not verified against the scans; surfaced in development only */
  verify?: string[];
}

export interface Figure {
  slug: string;
  /** "01" … "11" — the collection's own order, roughly chronological by activity */
  n: string;
  name: string;
  nameUrdu: string;
  born: number;
  died: number;
  /** one word for what they were: "Educationist", "Jurist", … */
  role: string;
  /** "Delhi · Bijnor · Aligarh" */
  places: string;
  portrait: string;
  /** 2–3 paragraphs */
  bio: string[];
  /** a standing caveat shown above the works list */
  note?: string;
  verify?: string[];
}
