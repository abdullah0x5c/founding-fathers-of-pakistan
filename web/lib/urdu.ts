const EASTERN_ARABIC = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Western digits to the Eastern Arabic numerals Urdu is set with.
 *
 * Used only for ornament — leaf numerals on the portrait mounts and the numbers
 * running down the shelf. Catalogue values that a reader might want to compare,
 * search or copy (page counts, dates, file sizes) stay in Western digits, since
 * an archive that renders its own metadata in a form you cannot paste back into
 * a search box is decoration pretending to be a record.
 */
export function urduNumeral(n: number, pad = 2): string {
  return String(n)
    .padStart(pad, "0")
    .split("")
    .map((d) => EASTERN_ARABIC[Number(d)] ?? d)
    .join("");
}
