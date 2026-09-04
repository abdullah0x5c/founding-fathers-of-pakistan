# Portrait credits

Profile pictures for the Founding Fathers of Pakistan site.
All images are **512×512 JPEG**, square-cropped from the sources below and centred on the face.

Every source is in the **public domain**. Attribution is not legally required for these,
but it is recorded here so the images can be re-fetched, verified, or replaced later.

| # | Person | File | Source | Author | Date | Licence |
|---|--------|------|--------|--------|------|---------|
| 1 | Sir Syed Ahmed Khan | `sir-syed-ahmed-khan.jpg` | [Syed Ahmad Khan 1907.jpg](https://commons.wikimedia.org/wiki/File:Syed_Ahmad_Khan_1907.jpg) | Unknown | 1907 | Public domain |
| 2 | Ameer Ali | `ameer-ali.jpg` | [Syed Ameer Ali – Stoneman photograph.png](https://en.wikipedia.org/wiki/File:Syed_Ameer_Ali_-_Stoneman_photograph.png) | Walter Stoneman (1876–1958), National Photographic Record | 1917 | PD-US |
| 3 | Mohsin ul Mulk | `mohsin-ul-mulk.jpg` | [Mohsinul Mulk, Syed Ahmad Khan and Syed Mahmood.jpg](https://commons.wikimedia.org/wiki/File:Mohsinul_Mulk,_Syed_Ahmad_Khan_and_Syed_Mahmood.jpg) (leftmost figure, cropped from 1561×1157 group portrait) | Unknown | c. 1890s | Public domain |
| 4 | Viqar ul Mulk | `viqar-ul-mulk.jpg` | [Waqarulmulk2.jpg](https://commons.wikimedia.org/wiki/File:Waqarulmulk2.jpg) | Unknown | before 1917 | Public domain |
| 5 | Agha Khan III | `agha-khan-iii.jpg` | [Aqa Khan in Chicago.jpg](https://commons.wikimedia.org/wiki/File:Aqa_Khan_in_Chicago.jpg) | Unknown | early 20th c. | Public domain |
| 6 | Shawkat Ali | `shawkat-ali.jpg` | [Pan-Islamic conference gathers at Shunet Nimrin, Transjordan... LOC matpc.15764.jpg](https://commons.wikimedia.org/wiki/File:Pan-Islamic_conference_gathers_at_Shunet_Nimrin,_Transjordan._Mawalana_Shawket_Ali._Indian_delegate_LOC_matpc.15764.jpg) (cropped from 4669×3461 Library of Congress photo) | American Colony (Jerusalem) Photo Dept. | c. 1931 | Public domain |
| 7 | Maulana Muhammad Ali Jawhar | `maulana-muhammad-ali-jawhar.jpg` | [Molana-Muhammad-Ali.jpg](https://commons.wikimedia.org/wiki/File:Molana-Muhammad-Ali.jpg) | Unknown | before 1931 | Public domain |
| 8 | Ch. Rahmat Ali | `ch-rahmat-ali.jpg` | [Choudhry Rahmat Ali.jpg](https://commons.wikimedia.org/wiki/File:Choudhry_Rahmat_Ali.jpg) | Unknown | Unknown | Public domain |
| 9 | Liaquat Ali Khan | `liaquat-ali-khan.jpg` | [Liaquat Ali Khan 1945.jpg](https://commons.wikimedia.org/wiki/File:Liaquat_Ali_Khan_1945.jpg) | Unknown | 1945 | Public domain |
| 10 | Allama Iqbal | `allama-iqbal.jpg` | [Muhammad Iqbal in 1935.png](https://commons.wikimedia.org/wiki/File:Muhammad_Iqbal_in_1935.png) | Unknown | 1935 | Public domain |
| 11 | Quaid e Azam | `quaid-e-azam.jpg` | [Jinnah1945c.jpg](https://commons.wikimedia.org/wiki/File:Jinnah1945c.jpg) | Unknown | 1945 | Public domain |

## Notes on image quality

Two portraits are limited by their sources — these are the best free images that exist
of these men, not processing errors:

- **`viqar-ul-mulk.jpg`** — only a 365×684 grainy scan exists on Wikimedia Commons; visibly soft.
  Searched Commons on 2026-09-04 for a better source (including `NawabMushtaqHussain.jpg`,
  200×200) and found nothing sharper — this remains the best available.
- **`ch-rahmat-ali.jpg`** — only a 277×366 source exists; upscaled ~1.9× to 512.

The remaining nine were downscaled from larger originals and are crisp.

**2026-09-04 update:** `mohsin-ul-mulk.jpg` and `shawkat-ali.jpg` were replaced with crops from
higher-resolution group/press photos (see table above) — noticeably sharper than the previous
sources. `agha-khan-iii.jpg` was also investigated; alternate Commons files were either the same
underlying photo at lower resolution or too small to crop well, so it was left unchanged.

## Suggested CSS

Images are already square and face-centred, so no `object-position` tuning is needed:

```css
.profile-pic { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 50%; }
```
