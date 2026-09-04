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
  /** set once scripts/check-r2-upload.py has confirmed this exact key is live in
   * the bucket, with a byte size matching the local scan — never written by hand */
  r2Key?: string;
  /** an external citation only; not used to build the embedded viewer or the
   * download link, both of which come from r2Key */
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
  /** an external citation only (e.g. a matching Internet Archive item found by
   * chance); not used to build the embedded viewer or the download link */
  iaIdentifier?: string;
  iaFilename?: string;
  /** path under content/, so every record can be traced back to its scan —
   * also the exact object key this file was uploaded to R2 under */
  sourceFile: string;
  /** set once scripts/check-r2-upload.py has confirmed sourceFile is live in
   * the bucket, with a byte size matching the local scan — never written by
   * hand. Its value is always identical to sourceFile; its presence is what
   * the viewer checks to decide whether the document can be embedded. */
  r2Key?: string;
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
