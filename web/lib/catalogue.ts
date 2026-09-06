import { figures, figureBySlug } from "@/content/figures";
import { works } from "@/content/works";
import type { Figure, Work } from "@/content/types";

export { figures, works };

/** Right-to-left scripts. Urdu and Persian reverse the page order in the viewer. */
export function isRtl(work: Pick<Work, "lang">): boolean {
  return work.lang === "Urdu" || work.lang === "Persian" || work.lang === "Arabic";
}

export function getFigure(slug: string): Figure | undefined {
  return figureBySlug.get(slug);
}

/** Everything held for a figure, in catalogue order, secondary material last. */
export function worksFor(figureSlug: string): Work[] {
  const held = works.filter((w) => w.figure === figureSlug);
  return [...held].sort((a, b) => Number(!!a.secondary) - Number(!!b.secondary));
}

export function getWork(figureSlug: string, workSlug: string): Work | undefined {
  return works.find((w) => w.figure === figureSlug && w.slug === workSlug);
}

/** Works by the figure, excluding scholarship about them. */
export function primaryWorks(figureSlug: string): Work[] {
  return worksFor(figureSlug).filter((w) => !w.secondary);
}

/** The next work on the same shelf, for the foot of the work page. */
export function nextWork(figureSlug: string, workSlug: string): Work | undefined {
  const shelf = worksFor(figureSlug);
  const i = shelf.findIndex((w) => w.slug === workSlug);
  return i >= 0 ? shelf[i + 1] : undefined;
}

/**
 * Scans, not catalogue entries. A work with two editions is one row on the shelf
 * but two files in the archive, and the counts on the site distinguish the two.
 */
export function scanCount(work: Work): number {
  return 1 + (work.editions?.length ?? 0);
}

export const totalWorks = works.length;
export const totalScans = works.reduce((n, w) => n + scanCount(w), 0);

/** Earliest and latest year of birth and death across the ten. */
export const lifespan = {
  from: Math.min(...figures.map((f) => f.born)),
  to: Math.max(...figures.map((f) => f.died)),
};

/** Every routable (figure, work) pair, for generateStaticParams. */
export function allWorkParams(): { figure: string; work: string }[] {
  return works.map((w) => ({ figure: w.figure, work: w.slug }));
}
