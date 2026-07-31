import type { Locale } from '../i18n/locales.ts';
import { postPath } from '../routes/post-path.ts';
import { parsePostId } from './parse-post-id.ts';

/** O formato mínimo que uma entrada da coleção precisa ter. */
export interface PostEntry {
  id: string;
  data: {
    title: string;
    description: string;
    date: Date;
    tags: string[];
    draft: boolean;
  };
}

export interface Post {
  id: string;
  year: number;
  month: number;
  day: number;
  slug: string;
  locale: Locale;
  path: string;
  title: string;
  description: string;
  date: Date;
  tags: string[];
}

export interface SelectOptions {
  includeDrafts?: boolean;
}

function sameDay(date: Date, year: number, month: number, day: number): boolean {
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day
  );
}

/**
 * Escolhe os posts de um idioma, já validados e ordenados.
 *
 * Recebe as entradas por parâmetro em vez de chamar `getCollection` aqui: é o
 * que mantém esta camada testável em Node e livre do módulo virtual do Astro.
 *
 * A data aparece em dois lugares — no caminho do arquivo e no frontmatter — e
 * portanto pode divergir. Divergiu, o build quebra: a URL diria uma data e a
 * página diria outra.
 */
export function selectPosts(
  entries: readonly PostEntry[],
  locale: Locale,
  options: SelectOptions = {},
): Post[] {
  const { includeDrafts = false } = options;
  const posts: Post[] = [];

  for (const entry of entries) {
    const parsed = parsePostId(entry.id);

    if (!sameDay(entry.data.date, parsed.year, parsed.month, parsed.day)) {
      throw new Error(
        `a data do frontmatter (${entry.data.date.toISOString().slice(0, 10)}) não bate com a do caminho ${entry.id}`,
      );
    }

    if (parsed.locale !== locale) continue;
    if (entry.data.draft && !includeDrafts) continue;

    posts.push({
      id: entry.id,
      ...parsed,
      path: postPath(parsed),
      title: entry.data.title,
      description: entry.data.description,
      date: entry.data.date,
      tags: entry.data.tags,
    });
  }

  return posts.sort((a, b) => b.date.getTime() - a.date.getTime() || a.slug.localeCompare(b.slug));
}
