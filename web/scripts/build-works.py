# -*- coding: utf-8 -*-
"""Generates content/works.ts by merging the prose table below with the measured
page counts and byte sizes in content/works.seed.json. Every `pages` and `bytes`
value in the output is measured, never typed."""
import json, pathlib, sys

seed = {r["sourceFile"]: r for r in json.load(open("content/works.seed.json"))}
used = set()

# Populated by scripts/generate-ia-upload.py once scans are uploaded to
# archive.org, keyed by sourceFile. Absent entirely until the first upload —
# an empty mapping here is the normal, expected state for a fresh checkout.
IA_MAP_PATH = pathlib.Path("content/ia-map.json")
ia_map = json.loads(IA_MAP_PATH.read_text()) if IA_MAP_PATH.exists() else {}

RIGHTS_PD = ("Public domain in Pakistan, where copyright runs for the author's life plus fifty years. "
             "Rights in the scan itself may rest separately with the institution that produced it.")
RIGHTS_MODERN = ("The underlying text is in the public domain, but this printing carries modern editorial "
                 "apparatus that is likely still in copyright. Verify before redistribution.")
RIGHTS_COPYRIGHT = ("In copyright. Listed here as secondary scholarship for reference; not offered for download.")

# (slug, figure, title, urdu, year, kind, lang, sourceFile, intro, extras)
# extras keys: printed, rights, secondary, byline, scanNote, verify, editions
W = []
def w(slug, figure, title, urdu, year, kind, lang, src, intro, **extra):
    W.append(dict(slug=slug, figure=figure, title=title, titleUrdu=urdu, year=year,
                  kind=kind, lang=lang, sourceFile=src, intro=intro, **extra))

SS = "sir-syed-ahmad-khan"
w("asar-us-sanadid", SS, "Āsār us-Sanādīd", "آثار الصنادید", "1847", "History", "Urdu",
  "1. Sir Syed Ahmed Khan/Asar us Sanadid in Urdu.pdf",
  "An antiquarian survey of the monuments, inscriptions and scholars of Delhi, and the author's first substantial book. Many of the buildings it records were destroyed in and after 1857, which makes the lithographed plates the substance of the volume rather than its decoration. The English translation, held here as a second edition, runs considerably longer than the Urdu.",
  editions=[dict(label="English translation — The Remnants of Ancient Heroes", lang="English",
                 src="1. Sir Syed Ahmed Khan/Asar-us-Sanadid - (The Remnants of Ancient Heroes) -- Syed Ahmed Khan.pdf")],
  verify=["The 1847 date is from general knowledge; the work was substantially rewritten for a later edition and this scan's edition has not been identified.",
          "The English volume is treated here as a translation of the same work — confirm it is not an independent compilation."])
w("sarkashi-zila-bijnor", SS, "Tārīkh-e-Sarkashī-e-Ẓila Bijnor", "تاریخ سرکشی ضلع بجنور", "1858", "History", "Urdu",
  "1. Sir Syed Ahmed Khan/Sarkashi Zila Bijnor.pdf",
  "A district-level narrative of the events of 1857 in Bijnor, written from the author's own position there as a subordinate judge. It is one of very few contemporaneous accounts of the rebellion written in Urdu by a serving official, and it reads as testimony rather than as history.",
  verify=["The 1858 date is from general knowledge."])
w("causes-of-the-indian-revolt", SS, "Asbāb-e-Baghāwat-e-Hind", "اسباب بغاوت ہند", "1859", "Treatise", "English",
  "1. Sir Syed Ahmed Khan/Causes of the Indian revolt - three essays -- Ahmad Khan, Sayyid.pdf",
  "The best known of his political writings: an account of the causes of the rebellion, written for circulation among British officials and printed at the author's own expense. It argues that the rising had administrative and religious causes for which the Company's conduct was substantially responsible, and that the absence of Indian representation in the Legislative Council was the root failure.",
  editions=[dict(label="Translation and commentary by his European friends", lang="English",
                 src="1. Sir Syed Ahmed Khan/A Translation of Causes by His European Friends.pdf")],
  verify=["The 1859 date of composition is from general knowledge; this scan is of a later English printing.",
          "The second file is a translation with added commentary rather than a plain reprint, and is treated here as an edition of the same work."])
w("khutbat-e-ahmadiyya", SS, "Khutbāt-e-Aḥmadiyya", "خطبات احمدیہ", "1870", "Religious", "Urdu",
  "1. Sir Syed Ahmed Khan/Khutbat Al Ahmadia - Khan, Sir Syed Ahmad.pdf",
  "A point-by-point answer to William Muir's Life of Mahomet, researched and largely printed in London during the author's visit of 1869 to 1870 and at his own expense. The English edition was issued under the title A Series of Essays on the Life of Mohammed, and is held here as a second edition.",
  editions=[dict(label="English edition — Life of Muhammad and subjects subsidiary thereto", lang="English",
                 src="1. Sir Syed Ahmed Khan/Life of Muhammad and subjects subsidiary thereto = Khutbat -- Ahmad Khan, Sayyid, Sir.pdf")],
  verify=["The English volume is folded in here as an edition of the same work on the strength of its title, which reads '= Khutbat'. Confirm the two correspond before publishing; if they do not, split them into separate records."])
w("review-on-hunters-indian-musalmans", SS, "Review on Dr Hunter's Indian Musalmans", None, "1872", "Review", "English",
  "1. Sir Syed Ahmed Khan/Sir Syed's Review on Dr. Hunters 'Indian Musalamaan'.pdf",
  "A review contesting W. W. Hunter's claim that Indian Muslims were bound by religious obligation to rebel, and disputing his reading of the Wahhabi trials. Short, sharp, and the clearest statement of the author's argument that loyalty and faith were not in conflict.",
  verify=["The 1872 date is from general knowledge."])
w("tabyin-ul-kalam", SS, "A Muhammadan Commentary on the Holy Bible", "تبیین الکلام", "", "Religious", "English",
  "1. Sir Syed Ahmed Khan/A Muhammadan Commentary on the Holy Bible.pdf",
  "An unfinished commentary on the Book of Genesis and the Gospels, written to argue that the Muslim scriptures and the Biblical ones could be read as continuous rather than as rivals. It is the most unusual thing he wrote, and it found almost no audience on either side.",
  verify=["Undated here. The work is usually given as Tabyīn ul-Kalām and dated to the early 1860s, but the date could not be established from the scan."])
w("ain-e-akbari", SS, "Āʾīn-e-Akbarī", "آئینِ اکبری", "", "History", "Urdu",
  "1. Sir Syed Ahmed Khan/Sir Syeds Ain e Akbari.pdf",
  "His edition of Abū'l Faẓl's sixteenth-century administrative gazetteer of the Mughal empire, prepared with his own annotations. The editing of Persian chronicles was the scholarly work that preceded his political writing, and it is the reason the later argument is so heavily documented.",
  verify=["Undated here; the edition year could not be established from the scan.",
          "The extent of his own annotation versus the original text has not been checked."])
w("safarnama-e-london", SS, "Safarnāma-e-London", "سفرنامۂ لندن", "", "Letters", "Urdu",
  "1. Sir Syed Ahmed Khan/Safarnama e London - Sir Syed.pdf",
  "The record of the visit to England of 1869 to 1870 — the journey that produced the Khutbāt, the plan for Tahzīb ul-Akhlāq, and eventually the college at Aligarh. Written largely as letters home, it is candid about money, illness and homesickness in a way none of his public writing is.",
  verify=["Undated here; this is a later collected printing and its year could not be established."])
w("safarnama-e-panjab", SS, "Safarnāma-e-Panjāb", "سفرنامۂ پنجاب", "", "Letters", "Urdu",
  "1. Sir Syed Ahmed Khan/Safarnama e Panjab - Sir Syed.pdf",
  "An account of a tour of the Punjab undertaken to raise support and funds for the Aligarh college. It is a fundraising diary as much as a travelogue, and it shows the institution being assembled town by town.",
  verify=["Undated here; the tour is usually placed in the 1880s but the year could not be established from the scan."])
w("essays-advancement-for-learning", SS, "Essays on the Advancement of Learning and Education for the Muslims of India", None, "", "Essays", "English",
  "1. Sir Syed Ahmed Khan/Essays - Advancement for Learning & Education for Mooslims of India.pdf",
  "A gathered volume of the essays and addresses on education that make the case Aligarh was built on: that the community's problem was not political disadvantage but the absence of modern instruction, and that the two could not be argued about separately.",
  verify=["Undated compilation; neither the year of publication nor the compiler could be established from the scan."])
w("writings-and-speeches", SS, "Writings and Speeches of Sir Syed Ahmad Khan", None, "", "Compilation", "English",
  "1. Sir Syed Ahmed Khan/Writings and Speeches of Sir Syed Ahmad Khan - Compiled by Shan Mohammad.pdf",
  "A modern compilation edited by Shan Mohammad, gathering the political speeches and public letters into one volume. It is the most convenient single point of entry to his political writing, and — as with any compilation — its selection is itself an argument about what he was.",
  rights=RIGHTS_MODERN,
  verify=["Publication year of this compilation could not be established from the scan.",
          "Modern editorial apparatus is likely in copyright; check before uploading to a public archive."])
w("tafsir-ul-quran", SS, "Tafsīr ul-Qurʾān", "تفسیر القرآن", "", "Religious", "Urdu",
  "1. Sir Syed Ahmed Khan/Religious/Tafseer ul Quraan - Sir Syed.pdf",
  "The unfinished commentary that reads revelation as consistent with natural law, and the work that earned him the polemical label nechari. It attracted more published refutation in his lifetime than anything else he wrote. At over thirteen hundred pages this is the largest single document in the collection.",
  verify=["Undated here; the commentary appeared in volumes over roughly fifteen years and this scan's coverage has not been established."])
w("seerat-e-fareedia", SS, "Sīrat-e-Farīdiyya", "سیرت فریدیہ", "", "Religious", "Urdu",
  "1. Sir Syed Ahmed Khan/Religious/Seerat e Fareedia by Sir Syed Ahmad Khan.pdf",
  "A life of the Mughal noble and scholar Farīd ud-Dīn, written as family history as much as biography — the author's own ancestry ran through the same Delhi service milieu. An early work, and one of the few places his antiquarian and religious interests meet directly.",
  verify=["Undated, and the attribution of subject is inferred from the title. Confirm both before publishing."])
w("jila-ul-quloob", SS, "Jilā ul-Qulūb bi Zikr il-Maḥbūb", "جلاء القلوب بذکر المحبوب", "", "Religious", "Urdu",
  "1. Sir Syed Ahmed Khan/Religious/Jila ul Quloob Ba Zikr e Mahmood.pdf",
  "A short devotional treatise on the remembrance of the Prophet, and among the earliest of his surviving writings. Read against the commentary of forty years later, it marks how far the argument travelled.",
  verify=["Undated. The title is transliterated here from the filename and should be checked against the title page."])
w("gospel-according-to-sayyid-ahmad-khan", SS, "The Gospel According to Sayyid Ahmad Khan", None, "1978", "About", "English",
  "1. Sir Syed Ahmed Khan/The Gospel According to Sayyid Ahmad Khan (1817-1898) Christian Troll.pdf",
  "A study of Sir Syed's religious thought by the Jesuit scholar Christian W. Troll, concentrating on the theology rather than the politics. This is scholarship about him rather than writing by him, and it is catalogued separately for that reason.",
  secondary=True, byline="Christian W. Troll", rights=RIGHTS_COPYRIGHT,
  verify=["Publication year given as 1978 from the filename; confirm against the title page.",
          "In copyright. Decide whether it can be hosted before uploading it anywhere."])

AA = "syed-ameer-ali"
w("the-spirit-of-islam", AA, "The Spirit of Islam", None, "1891", "Treatise", "English",
  "2. Ameer Ali/The Spirit Of Islam_ A History Of The Evolution And Ideals -- Ameer Ali.pdf",
  "The most widely read book by any of the eleven: a life of the Prophet and an account of the faith written for a sceptical English readership. It went through many editions and remains in print. Its readiness to argue on the ground of reason rather than authority made it a formative text for a generation of Indian Muslim students.",
  verify=["The 1891 date is from general knowledge; this scan is of a later edition and its year has not been identified.",
          "This file was found misfiled in the Sir Syed Ahmad Khan folder and has been moved."])
w("a-short-history-of-the-saracens", AA, "A Short History of the Saracens", None, "1899", "History", "English",
  "2. Ameer Ali/A Short History of the Saracens - Ameer Ali.pdf",
  "A single-volume political history of the Muslim world from the seventh century onward, written to supply what the author regarded as an absent counterweight to European narratives of decline. It is a work of advocacy in the shape of a textbook, and was used as one for decades.",
  verify=["The 1899 date is from general knowledge."])
w("mohammedan-law", AA, "Mohammedan Law", None, "", "Law", "English",
  "2. Ameer Ali/Mohammedan law (Ali, Syed Ameer, 1849-1928).pdf",
  "A systematic treatment of Muslim personal law for use in Anglo-Indian courts, and the work that made his professional reputation. It became a standard authority and is still cited in South Asian judgments. At eight hundred and sixty pages it is the longest English volume in the collection.",
  verify=["Undated here; the treatise ran to several revised editions and this scan's edition has not been identified."])
w("the-ethics-of-islam", AA, "The Ethics of Islam", None, "1893", "Essays", "English",
  "2. Ameer Ali/Ethics of Islam - Syed Ameer Ali.pdf",
  "A lecture arguing that Islamic ethics rest on individual moral responsibility rather than on ritual compliance — the same case as the larger books, compressed to an evening's address.",
  verify=["The 1893 date is from general knowledge.",
          "A second file in this folder, 'Islam by Syed Ameer Ali.pdf', is byte-for-byte identical to this one. It is catalogued once. Consider deleting the duplicate from the source collection."])
w("the-moslem-festivities", AA, "The Moslem Festivities", None, "1892", "Essays", "English",
  "2. Ameer Ali/The Moslem Festivities (1892) Syed Ameer Ali.pdf",
  "A short descriptive account of the festivals of the Muslim year, written for readers with no prior knowledge of them. Slight beside the treatises, but it shows the register he reached for when explaining rather than arguing.",
  verify=["The 1892 date is taken from the filename; confirm against the title page."])
w("memoirs-and-other-writings", AA, "Memoirs and Other Writings", None, "", "Memoir", "English",
  "2. Ameer Ali/Memoirs-And-Other-Writings-Of-Syed-Ameer-Ali - Digital Library of India.pdf",
  "The autobiographical fragment he left, printed with a selection of letters and occasional pieces. The memoir breaks off well before the Privy Council years, so the most consequential part of his life is the part he did not write down.",
  rights=RIGHTS_MODERN,
  verify=["Undated; this is a posthumous compilation and neither its year nor its editor could be established from the scan.",
          "Scanned by the Digital Library of India — check their terms before redistributing."])

MM = "nawab-mohsin-ul-mulk"
w("aayaat-e-bayyenat", MM, "Āyāt-e-Bayyināt", "آیات بینات", "", "Religious", "Urdu",
  "3. Mohsin ul Mulk/Aayaat E Bayyenat - Nawab Mohsin ul Mulk.pdf",
  "The most substantial book he produced: a theological work written partly in defence of Sir Syed's naturalist reading of the Qur'an and partly to hold the Aligarh position back from its more extreme formulations. It is the clearest statement of what the movement's second generation thought it was defending.",
  verify=["Undated; the year could not be established from the scan."])
w("taqleed-aur-amal-bil-hadees", MM, "Taqlīd aur ʿAmal bil-Ḥadīth", "تقلید اور عمل بالحدیث", "", "Religious", "Urdu",
  "3. Mohsin ul Mulk/Taqleed aur Amal bil Hadees.pdf",
  "An argument on the limits of following established juristic authority and the conditions under which the ḥadīth may be acted on directly — the central methodological question of the Aligarh reform programme, argued in its own vocabulary rather than in the reformers'.",
  verify=["Undated; the year could not be established from the scan."])
w("kitabul-mohabbat-wal-shauq", MM, "Kitāb ul-Maḥabbat wa'l-Shauq", "کتاب المحبت والشوق", "", "Religious", "Urdu",
  "3. Mohsin ul Mulk/Kitabul Mohabbat Wal Shauq - Nawab Mohsin ul Mulk.pdf",
  "A treatise on love and longing in the devotional sense, standing somewhat apart from the controversialist writing that occupies the rest of his shelf. Evidence that the Aligarh administrator had a contemplative register he rarely used in public.",
  verify=["Undated, and the attribution rests on the filename. Confirm authorship against the title page."])
w("makateeb", MM, "Makātīb", "مکاتیب", "", "Letters", "Urdu",
  "3. Mohsin ul Mulk/Makateeb - Nawab Mohsin ul Mulk.pdf",
  "Collected letters. The correspondence of the man who ran Aligarh after Sir Syed's death is candid about money, factions and the political calculation behind the Simla Deputation in a way none of the public documents are.",
  verify=["Undated; this is a collected printing and neither its year nor its editor could be established."])
w("response-to-lepel-griffin", MM, "Response to Lepel Griffin on the Indian Muhammadans", None, "", "Review", "English",
  "3. Mohsin ul Mulk/Response to Lepel Griffin on Indian Muhammadans.pdf",
  "A reply to Sir Lepel Griffin's characterisation of Indian Muslims in the British press. It belongs to the same genre as Sir Syed's answer to Hunter — a rebuttal written in English, for English readers, contesting a description before it hardened into policy.",
  verify=["Undated; the year and the original publication being answered could not be established from the scan."])
w("the-first-lecture", MM, "The First Lecture", None, "", "Speeches", "Urdu",
  "3. Mohsin ul Mulk/The First Lecture - Nawab Mohsin ul Mulk.pdf",
  "An address, printed as a pamphlet, of the kind the Muhammadan Educational Conference existed to circulate. The lecture was the movement's characteristic form: delivered to a few hundred, printed for a few thousand.",
  verify=["Undated, and the occasion of the lecture is not identified in the filename. Confirm both from the document."])
w("kaifiyat-tashreef-aawari", MM, "Kaifiyat-e-Tashrīf Āwarī-e-Sir Habībullāh Khān", "کیفیت تشریف آوری سر حبیب اللہ خاں", "", "Letters", "Urdu",
  "3. Mohsin ul Mulk/Kaifiyat Tashreef Aawari Sir Habibullah Khan - Nawab Mohsin ul Mulk.pdf",
  "A twenty-page account of a visit by Sir Habibullah Khan, printed as an occasional pamphlet. The smallest item on this shelf, and a reminder that much of the Aligarh paper trail consists of exactly this kind of thing.",
  verify=["Undated; the visit is not dated in the filename."])

VM = "nawab-viqar-ul-mulk"
w("letters-of-viqar-ul-mulk-and-mohsin-ul-mulk", VM, "Letters of Viqar ul Mulk and Mohsin ul Mulk", "خط و کتابت", "", "Letters", "Urdu",
  "4. Viqar ul Mulk/Letters of Viqar ul Mulk & Mohsin ul Mulk.pdf",
  "A working correspondence between the two men who ran Aligarh after Sir Syed. It is candid about money, factions and political calculation, and it is the best surviving record in this collection of how the Simla Deputation was actually assembled.",
  verify=["Undated; this is a collected printing and neither its year nor its editor could be established."])
w("aimu-se-mutaliq-raye", VM, "Nawāb Viqār ul-Mulk kī Rāʾe: Aligarh Muslim University", "علی گڑھ مسلم یونیورسٹی سے متعلق نواب وقار الملک کی رائے", "", "Speeches", "Urdu",
  "4. Viqar ul Mulk/AIMU se Mutaliq Nawab Viqar ul Mulk ki Raye.pdf",
  "His stated position on the Muslim university question — the campaign to turn the Aligarh college into a degree-granting university independent of government control, and the issue on which he eventually resigned the trust secretaryship.",
  verify=["Undated; the year could not be established from the scan."])
w("muslim-university-aur-mazhabi-taleem", VM, "Muslim University aur Musalmānoṉ kī Maẕhabī Taʿlīm o Tarbiyat", "مسلم یونیورسٹی اور مسلمانوں کی مذہبی تعلیم و تربیت", "", "Pamphlet", "Urdu",
  "4. Viqar ul Mulk/Muslim University Aur Musalmanon Ki Mazhabi Taleem-o-tarbiyat - Viqar ul Mulk.pdf",
  "Sixteen pages arguing that a Muslim university had to provide religious instruction as well as modern subjects, against the view that it should confine itself to the second. The smallest document in the collection, and the sharpest statement of the disagreement that ran through Aligarh's second generation.",
  verify=["Undated; the year could not be established from the scan."])

AK = "aga-khan-iii"
w("india-in-transition", AK, "India in Transition", None, "1918", "Treatise", "English",
  "5. Agha Khan III/India In Transition - Aga Khan III.pdf",
  "A study of Indian constitutional futures written during the First World War, proposing a federated South Asia of largely self-governing provinces within the Empire. Read after 1940 it is a document from a road not taken, and its author lived long enough to see the alternative.",
  printed="London, Philip Lee Warner",
  ia="indiaintransitio00agakuoft", iaFile="indiaintransitio00agakuoft.pdf",
  verify=["Pointed at an existing Internet Archive copy (indiaintransitio00agakuoft, 1918, marked NOT_IN_COPYRIGHT) rather than at an upload of the local scan. Replace the identifier if you would rather serve your own copy; the local file is 324 pp. against the Archive item's 336 images, so the two printings may differ."])
w("memoirs-world-enough-and-time", AK, "The Memoirs of Aga Khan: World Enough and Time", None, "1954", "Memoir", "English",
  "5. Agha Khan III/The memoirs of Aga Khan - World Enough and Time - Aga Khan III, 1877-1957.pdf",
  "Written near the end of a long public life, and the only sustained first-person account by any of the eleven of the negotiations that produced separate electorates, the Round Table Conferences and partition. He was present at all of them, which is a claim none of the others can make.",
  rights=RIGHTS_MODERN,
  verify=["The 1954 date is from general knowledge.",
          "Published 1954; its author died in 1957, so it is likely still in copyright in Pakistan. Check before uploading."])

SA = "maulana-shaukat-ali"
w("paigham-e-amal", SA, "Paighām-e-ʿAmal", "پیغامِ عمل", "", "Speeches", "Urdu",
  "6. Shawkat Ali/Paigham e Amal - by Maulana Shaukat Ali Khan.pdf",
  "Twenty-four pages, and the only item held for him. A call to action in the Khilafat register — the form he worked in, which was the meeting and the pamphlet rather than the book. That this shelf is nearly empty is a fact about how he worked, not a gap in the archive.",
  verify=["Undated; the year could not be established from the scan."])

MJ = "maulana-muhammad-ali-jauhar"
w("selected-writings-and-speeches-vol-1", MJ, "Selected Writings and Speeches, Volume 1", None, "", "Compilation", "English",
  "7. Maulana Muhammad Ali Jawhar/Selected Writings And Speeches Of Mauluna Mohamed Ali, Volume 1.pdf",
  "The first of two volumes gathering the English journalism and the platform speeches. The prose is the reason he is remembered as a writer: fast, ironic, addressed to English readers in their own register and entirely unintimidated by them.",
  rights=RIGHTS_MODERN,
  verify=["Undated; neither the year nor the editor of this compilation could be established from the scan."])
w("selected-writings-and-speeches-vol-2", MJ, "Selected Writings and Speeches, Volume 2", None, "", "Compilation", "English",
  "7. Maulana Muhammad Ali Jawhar/Selected Writings And Speeches - Volume 2.pdf",
  "The second volume, running into the Khilafat years and the break with Congress. Read against the first, it tracks a writer moving from argument inside a shared polity to argument about whether one existed.",
  rights=RIGHTS_MODERN,
  verify=["Undated; neither the year nor the editor of this compilation could be established from the scan."])
w("speeches", MJ, "Speeches of Maulana Muhammad Ali Jauhar", None, "", "Speeches", "English",
  "7. Maulana Muhammad Ali Jawhar/Speeches of Maulana Muhammad Ali Jawhar.pdf",
  "A short volume of the platform speeches, taken down as delivered. He was among the most effective orators of the period and the transcripts carry the timing, which the edited compilations tend to smooth away.",
  scanNote="Scanned at very high resolution: seventy-two pages occupy nearly four hundred megabytes. Expect the download to be slow, and read it in the viewer rather than downloading it unless you need the full-resolution image.",
  verify=["Undated; the year could not be established from the scan."])
w("essays", MJ, "Essays of Maulana Muhammad Ali Jauhar", None, "", "Essays", "English",
  "7. Maulana Muhammad Ali Jawhar/Essays of Molana Muhammad Ali Jawhar.pdf",
  "Five hundred pages of collected essays and leading articles, the bulk of his surviving prose in one volume. This is where the journalism sits when it is read as a body of work rather than as a run of newspapers.",
  rights=RIGHTS_MODERN,
  verify=["Undated; neither the year nor the editor of this compilation could be established from the scan."])
w("problem-of-hijaz-and-the-ibn-sauds", MJ, "The Problem of the Hijaz and the Ibn Sauds", None, "", "Treatise", "English",
  "7. Maulana Muhammad Ali Jawhar/Problem of Hijaz and the Ibn Sauds.pdf",
  "On the Saudi conquest of the Hijaz and the question of who should hold custody of the holy cities — the issue that occupied the Khilafat movement after the caliphate itself was abolished, and that split it.",
  verify=["Undated; the events described place it in the mid-1920s but the year could not be established from the scan."])
w("majmua-kalam", MJ, "Majmūʿa-e-Kalām", "مجموعۂ کلام", "", "Poetry", "Urdu",
  "7. Maulana Muhammad Ali Jawhar/Majmua Kalam of Muhammad Ali Jawhar.pdf",
  "His collected verse. He took the pen-name Jauhar and wrote seriously in Urdu throughout, though the poetry has always been read in the shadow of the journalism rather than beside it.",
  verify=["Undated; the year of this collected printing could not be established."])
w("jazbaat-e-jauhar", MJ, "Jazbāt-e-Jauhar: Poetry Written in Jail", "جذباتِ جوہر", "", "Poetry", "Urdu",
  "7. Maulana Muhammad Ali Jawhar/Poetry whilst in Jail - Jazbaat e Jawhar.pdf",
  "Verse written during imprisonment. Twenty-six pages, and the most personal document on this shelf — the same voice as the leading articles, with the audience removed.",
  scanNote="Scanned at very high resolution: twenty-six pages occupy a hundred and seventy megabytes. Read it in the viewer rather than downloading it unless you need the full-resolution image.",
  verify=["Undated; the imprisonment is not identified in the filename."])

RA = "chaudhry-rahmat-ali"
w("now-or-never", RA, "Now or Never: Are We to Live or Perish Forever?", None, "1933", "Pamphlet", "English",
  "8. Ch. Rahmat Ali/Now_or_Never Pamphlet - Chaudhry Rahmat Ali.pdf",
  "Four pages, issued from Cambridge and signed by a handful of students. It is the first appearance in print of the name Pakistan and of the acronym its author built for it. The League's delegates to the Round Table Conference declined to take it up; within a decade it was the name of a national demand.",
  verify=["The January 1933 date is widely reported; confirm it against the pamphlet's own imprint, which is in this scan."])
w("the-millat-of-islam-and-the-menace-of-indianism", RA, "The Millat of Islam and the Menace of Indianism", None, "", "Pamphlet", "English",
  "8. Ch. Rahmat Ali/The Millat of Islam and the Menace of Indianism.pdf",
  "A restatement of the 1933 argument in far more absolute terms, rejecting any conception of a shared Indian nationality. Ten pages, and the distance between its tone and that of the first pamphlet is the whole history of the intervening years.",
  verify=["Undated; usually placed around 1940 but the year could not be established from the scan."])
w("pakistan-the-fatherland-of-the-pak-nation", RA, "Pakistan: The Fatherland of the Pak Nation", None, "", "Treatise", "English",
  "8. Ch. Rahmat Ali/Pakistan - Chaudhry Rahmat Ali.pdf",
  "The full elaboration of his scheme, complete with maps proposing further Muslim states across the subcontinent. It is the most complete statement of a plan that was, by the time it appeared, already overtaken by the events it had helped to name.",
  verify=["Undated; the book ran to several editions in the 1940s and this scan's edition has not been identified."])
w("complete-works-volume-1", RA, "Complete Works of Rahmat Ali, Volume 1", None, "1978", "Compilation", "English",
  "8. Ch. Rahmat Ali/Complete Works Of Rahmat Ali Vol 1 (1978).pdf",
  "A collected edition assembled long after his death, gathering the pamphlets with editorial apparatus. Useful as a single point of access, and worth reading as a document of how his reputation was being argued for in the 1970s.",
  rights=RIGHTS_MODERN,
  verify=["Year taken as 1978 from the filename; confirm against the title page.",
          "A 1978 compilation almost certainly carries editorial matter still in copyright. Check before uploading."])

IQ = "allama-muhammad-iqbal"
w("allahabad-address-1930", IQ, "Presidential Address, Allahabad", "خطبۂ الہ آباد", "1930", "Speeches", "English",
  "09. Allama Iqbal/Allama-Iqbal-Address-Allahbad-1930-Urdu-English-with-Background.pdf",
  "The address to the All-India Muslim League in December 1930 proposing the amalgamation of Punjab, the North-West Frontier Province, Sindh and Baluchistan into a single state. Whether that was a proposal for a separate country or for an autonomous unit within a federated India is still argued over. This volume prints the address in both Urdu and English with the surrounding context, which is the right way to read a disputed text.",
  verify=["The December 1930 date is from general knowledge.",
          "The volume is bilingual; it is catalogued as English because the editorial apparatus is in English, but roughly half the pages are Urdu."])

LK = "liaquat-ali-khan"
w("pakistan-the-heart-of-asia", LK, "Pakistan: The Heart of Asia", None, "1950", "Speeches", "English",
  "11. Liaquat Ali Khan/Pakistan The Heart of Asia - Speeches in the United States and Canada, May and June, 1950 by the Prime Minister of Pakistan.pdf",
  "The speeches of the tour of the United States and Canada in May and June 1950: a new country's prime minister explaining it to an audience that had barely heard of it. It is the only document in this collection written from inside the state rather than in argument for it.",
  rights=RIGHTS_MODERN,
  verify=["The 1950 date is taken from the title, which is explicit.",
          "Published 1950; its author died in 1951, so it is likely still in copyright in Pakistan. Check before uploading.",
          "This file was found unfiled at the root of the collection and has been moved into a folder for Liaquat Ali Khan."])

# ---------------------------------------------------------------- emit
def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')

def q(s):
    return '"' + esc(s) + '"'

def look(src):
    if src not in seed:
        sys.exit(f"NOT IN SEED: {src}")
    used.add(src)
    return seed[src]

out = ['import type { Work } from "./types";', "",
       "/**", " * The catalogue. Every `pages` and `bytes` value here is measured from the scan",
       " * by scripts/scan-content.mjs and regenerated by scripts/build-works.py — do not",
       " * edit those two fields by hand.",
       " *", " * `iaIdentifier` is empty on every record until the scan is uploaded to",
       " * archive.org. Filling it in is the only change needed to bring a viewer online.",
       " */", "export const works: Work[] = ["]

for r in W:
    m = look(r["sourceFile"])
    out.append("  {")
    out.append(f'    slug: {q(r["slug"])},')
    out.append(f'    figure: {q(r["figure"])},')
    out.append(f'    title: {q(r["title"])},')
    if r.get("titleUrdu"):
        out.append(f'    titleUrdu: {q(r["titleUrdu"])},')
    out.append(f'    year: {q(r["year"])},')
    out.append(f'    kind: {q(r["kind"])},')
    out.append(f'    lang: {q(r["lang"])},')
    out.append(f'    pages: {m["pages"]},')
    out.append(f'    bytes: {m["bytes"]},')
    if r.get("printed"):
        out.append(f'    printed: {q(r["printed"])},')
    out.append(f'    rights: {q(r.get("rights", RIGHTS_PD))},')
    out.append(f'    intro:\n      {q(r["intro"])},')
    if r.get("scanNote"):
        out.append(f'    scanNote:\n      {q(r["scanNote"])},')
    # A manual `ia=`/`iaFile=` on the entry above wins (that's how the one demo
    # record points at an existing Internet Archive item instead of an upload
    # of the local scan); otherwise fall back to what the last bulk upload
    # recorded in content/ia-map.json.
    mapped = ia_map.get(r["sourceFile"], {})
    ia_id = r.get("ia") or mapped.get("identifier")
    ia_file = r.get("iaFile") or mapped.get("filename")
    if ia_id:
        out.append(f'    iaIdentifier: {q(ia_id)},')
    if ia_file:
        out.append(f'    iaFilename: {q(ia_file)},')
    out.append(f'    sourceFile: {q(r["sourceFile"])},')
    if r.get("secondary"):
        out.append("    secondary: true,")
    if r.get("byline"):
        out.append(f'    byline: {q(r["byline"])},')
    if r.get("editions"):
        out.append("    editions: [")
        for e in r["editions"]:
            em = look(e["src"])
            emapped = ia_map.get(e["src"], {})
            out.append("      {")
            out.append(f'        label: {q(e["label"])},')
            out.append(f'        lang: {q(e["lang"])},')
            out.append(f'        pages: {em["pages"]},')
            out.append(f'        bytes: {em["bytes"]},')
            out.append(f'        sourceFile: {q(e["src"])},')
            if emapped.get("identifier"):
                out.append(f'        iaIdentifier: {q(emapped["identifier"])},')
            if emapped.get("filename"):
                out.append(f'        iaFilename: {q(emapped["filename"])},')
            out.append("      },")
        out.append("    ],")
    if r.get("verify"):
        out.append("    verify: [")
        for v in r["verify"]:
            out.append(f"      {q(v)},")
        out.append("    ],")
    out.append("  },")

out.append("];")
out.append("")
pathlib.Path("content/works.ts").write_text("\n".join(out) + "\n")

# A machine-readable dump of the same catalogue, for scripts/generate-ia-upload.py
# to read without having to parse the generated TypeScript. Not used by the site
# itself and not something to hand-edit — it exists purely as a handoff between
# these two scripts.
catalog = []
for r in W:
    m = seed[r["sourceFile"]]
    entry = {
        "slug": r["slug"], "figure": r["figure"], "title": r["title"],
        "titleUrdu": r.get("titleUrdu"), "year": r.get("year", ""), "kind": r["kind"],
        "lang": r["lang"], "pages": m["pages"], "bytes": m["bytes"],
        "intro": r["intro"], "sourceFile": r["sourceFile"], "secondary": bool(r.get("secondary")),
        "alreadyMapped": r["sourceFile"] in ia_map or bool(r.get("ia")),
        "editions": [],
    }
    for e in r.get("editions", []):
        entry["editions"].append({
            "label": e["label"], "lang": e["lang"], "sourceFile": e["src"],
            "alreadyMapped": e["src"] in ia_map,
        })
    catalog.append(entry)
pathlib.Path("content/works.catalog.json").write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")

missing = set(seed) - used
print(f"{len(W)} catalogue entries covering {len(used)} scans")
if missing:
    print("UNCATALOGUED SCANS:")
    for m_ in sorted(missing):
        print("  ", m_)
if ia_map:
    print(f"{len(ia_map)} scans already mapped to archive.org identifiers (content/ia-map.json)")
