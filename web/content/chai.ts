/**
 * Where support for the archive goes.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FILL THESE IN BEFORE THE SITE IS PUBLIC.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * They are deliberately left empty rather than filled with the placeholder
 * digits the design carried ("0300 000 0000", "PK00 0000 …"). A payment page
 * that displays a plausible-looking but wrong account number is worse than one
 * that displays none: someone will send money into it. Any field left empty
 * here renders as "not yet published" in the same italic the rest of the
 * catalogue uses for a fact the archive does not hold, which is the same rule
 * the about page states — where something is not known, the page says so
 * rather than guessing.
 */
export interface ChaiAccount {
  /** shown in Latin small caps as the card's heading */
  label: string;
  /** the same heading in Urdu */
  labelUrdu: string;
  fields: { label: string; value: string; wide?: boolean }[];
}

export const chaiAccounts: ChaiAccount[] = [
  {
    label: "Easypaisa",
    labelUrdu: "ایزی پیسہ",
    fields: [
      { label: "Number", value: "", wide: true },
      { label: "Title", value: "" },
    ],
  },
  {
    label: "Bank transfer",
    labelUrdu: "بینک منتقلی",
    fields: [
      { label: "IBAN", value: "", wide: true },
      { label: "Title", value: "" },
      { label: "Bank", value: "" },
    ],
  },
];
