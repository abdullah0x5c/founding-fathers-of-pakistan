# Portrait credits

Profile pictures for the Founding Fathers of Pakistan site.

Most images are **512×512 JPEG**, square-cropped from the sources below and centred on the
face. Two are not: `allama-iqbal.jpg` and `viqar-ul-mulk.jpg` are the unmodified Wikimedia
originals, at their own dimensions. See the notes on image quality below.

Every source is in the **public domain**. Attribution is not legally required for these,
but it is recorded here so the images can be re-fetched, verified, or replaced later.

| # | Person | File | Source | Author | Date | Licence |
|---|--------|------|--------|--------|------|---------|
| 1 | Sir Syed Ahmed Khan | `sir-syed-ahmed-khan.jpg` | [Syed Ahmad Khan 1907.jpg](https://commons.wikimedia.org/wiki/File:Syed_Ahmad_Khan_1907.jpg) | Unknown | 1907 | Public domain |
| 2 | Ameer Ali | `ameer-ali.jpg` | [Syed Ameer Ali – Stoneman photograph.png](https://en.wikipedia.org/wiki/File:Syed_Ameer_Ali_-_Stoneman_photograph.png) | Walter Stoneman (1876–1958), National Photographic Record | 1917 | PD-US |
| 3 | Mohsin ul Mulk | `mohsin-ul-mulk.jpg` | [Mohsinulmulk.jpg](https://commons.wikimedia.org/wiki/File:Mohsinulmulk.jpg) | Unknown | c. 1907 | Public domain |
| 4 | Viqar ul Mulk | `viqar-ul-mulk.jpg` | [NawabMushtaqHussain.jpg](https://commons.wikimedia.org/wiki/File:NawabMushtaqHussain.jpg) | Unknown | 19th century | Public domain |
| 5 | Agha Khan III | `agha-khan-iii.jpg` | [Aqa Khan in Chicago.jpg](https://commons.wikimedia.org/wiki/File:Aqa_Khan_in_Chicago.jpg) | Unknown | early 20th c. | Public domain |
| 6 | Shawkat Ali | `shawkat-ali.jpg` | [Maulana Shaukat Ali 1932.jpg](https://commons.wikimedia.org/wiki/File:Maulana_Shaukat_Ali_1932.jpg) | Planet News / Agence Mondial | 1932 | Public domain |
| 7 | Maulana Muhammad Ali Jawhar | `maulana-muhammad-ali-jawhar.jpg` | [Molana-Muhammad-Ali.jpg](https://commons.wikimedia.org/wiki/File:Molana-Muhammad-Ali.jpg) | Unknown | before 1931 | Public domain |
| 8 | Ch. Rahmat Ali | `ch-rahmat-ali.jpg` | [Choudhry Rahmat Ali.jpg](https://commons.wikimedia.org/wiki/File:Choudhry_Rahmat_Ali.jpg) | Unknown | Unknown | Public domain |
| 9 | Allama Iqbal | `allama-iqbal.jpg` | [Allama Iqbal.jpg](https://commons.wikimedia.org/wiki/File:Allama_Iqbal.jpg) | Iqbal Academy Pakistan | by 1938 | Public domain |
| 10 | Quaid e Azam | `quaid-e-azam.jpg` | [Jinnah1945c.jpg](https://commons.wikimedia.org/wiki/File:Jinnah1945c.jpg) | Unknown | 1945 | Public domain |

## Notes on image quality

Some portraits are limited by their sources. These are the best free images that exist of
these men, not processing errors:

- **`viqar-ul-mulk.jpg`** is the Wikimedia original at **200×200**, unmodified. It is the
  smallest portrait in the set and is visibly soft in the plates, which render at roughly
  175 px wide and so ask for about 350 px on a high-density screen. It is used at its own
  size on purpose: the file it replaced was a 512×512 upscale of the same photograph, which
  invented detail that was never in the source and showed it as blotching across the face.
  A soft portrait is an honest one; a sharpened one is a fabricated one.
- **`ch-rahmat-ali.jpg`** — only a 277×366 source exists; upscaled ~1.9× to 512. This has
  the same problem as the file above and should be replaced with its unmodified original.
- **`shawkat-ali.jpg`** — cropped from a coarse 1932 press photo; sharp enough at 512 but
  grainy.

**`allama-iqbal.jpg`** is the Wikimedia original at **1491×2136**, unmodified and by some
distance the best portrait in the set. It is a tall three-quarter profile rather than a
square crop, so unlike the others it does need `object-position` tuning: the head sits high
in the frame.

## Suggested CSS

The 512×512 files are square and face-centred, so they need no `object-position` tuning.
The two unmodified originals are not square, and the site sets `object-position` per plate
to keep the face in the arch.
