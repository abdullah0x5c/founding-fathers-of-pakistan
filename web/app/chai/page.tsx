import Link from "next/link";
import type { Metadata } from "next";
import UrduText from "@/components/UrduText";
import { chaiAccounts } from "@/content/chai";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Chai",
  description:
    "The collection is kept without institutional support. If you would like to help with hosting and the next scan, the details are here.",
};

export default function ChaiPage() {
  return (
    <main className={`${styles.main} soft-in`}>
      <div className={styles.top}>
        <Link href="/" className={styles.back}>
          ← back to the album
        </Link>
        <span className="folio">f. 5r</span>
      </div>

      <div className="mount">
        <div className={styles.mountInner}>
          {/* the headpiece */}
          <div className={`${styles.panel} speck`}>
            <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
            <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

            <UrduText as="h1" className={`urdu-display ${styles.title}`} align="center">
              ہادی کو ایک چائے پلائیں
            </UrduText>

            <div className={`illum ${styles.titleRule}`} aria-hidden="true" />

            <UrduText as="p" className={styles.blurb}>
              یہ مجموعہ کسی ادارے کی مدد کے بغیر، فرصت کے وقت میں تیار کیا گیا ہے۔ اسکین جمع کرنے،
              محفوظ رکھنے اور صفحہ بہ صفحہ درست کرنے کا کام جاری ہے۔ اگر آپ چاہیں تو ایک چائے کے
              برابر مدد بھیج سکتے ہیں — اِس سے ہوسٹنگ کا خرچ اور اگلے اسکین کی گنجائش نکلتی ہے۔
            </UrduText>
          </div>

          {/* the accounts */}
          <div className={styles.accounts}>
            {chaiAccounts.map((account) => (
              <div key={account.label} className={`${styles.account} mounted speck`}>
                <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
                <span className={`${styles.corner} ${styles.cornerBR2}`} aria-hidden="true" />

                <div className={`display ${styles.accountLabel}`}>{account.label}</div>
                <UrduText className={styles.accountLabelUrdu} align="left">
                  {account.labelUrdu}
                </UrduText>

                <div className={`illum ${styles.accountRule}`} aria-hidden="true" />

                <div className={styles.fields}>
                  {account.fields.map((field) =>
                    field.wide ? (
                      <div key={field.label}>
                        <div className={styles.fieldLabelWide}>{field.label}</div>
                        <div className={styles.fieldValueWide}>
                          {field.value || <em className={styles.unset}>not yet published</em>}
                        </div>
                      </div>
                    ) : (
                      <div key={field.label} className={styles.field}>
                        <span className={styles.fieldLabel}>{field.label}</span>
                        <span>
                          {field.value || <em className={styles.unset}>not yet published</em>}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* the note. On the ground rather than on paper: it is an instruction
              from the compiler, not a record of an account. */}
          <div className={styles.note}>
            <div className={styles.noteHead}>
              <span className="diamond" aria-hidden="true" />
              <span className={`display ${styles.noteTitle}`}>Please write a note</span>
              <span className={styles.noteFill} aria-hidden="true" />
            </div>

            <p className={styles.noteEn}>
              Put your name in the transfer note, and the name of anything you would like to see
              scanned next. Every note is read, and the requests decide which folder is worked on
              first. Nothing here is a subscription and nothing is owed — the collection stays open
              to read either way.
            </p>

            <UrduText as="p" className={styles.noteUr}>
              رقم بھیجتے وقت نوٹ میں اپنا نام ضرور لکھیں، اور اگر کوئی کتاب اسکین کروانا چاہتے ہوں
              تو اُس کا نام بھی۔ ہر نوٹ پڑھا جاتا ہے۔
            </UrduText>
          </div>

          <div className={styles.ornament} aria-hidden="true">
            <span className={styles.pip} />
            <span className="diamond" />
            <span className={styles.pip} />
          </div>

          <p className={styles.close}>
            Chai is what this costs. The scans are public domain; the hosting is not.
          </p>
        </div>
      </div>
    </main>
  );
}
