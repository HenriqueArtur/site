export interface DatedPost {
  year: number;
  month: number;
  day: number;
  slug: string;
}

export interface MonthGroup<T> {
  month: number;
  posts: T[];
}

export interface YearGroup<T> {
  year: number;
  months: MonthGroup<T>[];
}

/**
 * Agrupa posts por ano e mês, do mais recente para o mais antigo.
 *
 * Posts do mesmo dia são desempatados pelo slug: sem isso, a ordem viria da
 * ordem de leitura do sistema de arquivos e o HTML gerado poderia variar entre
 * máquinas sem ninguém mexer no conteúdo.
 */
export function groupPosts<T extends DatedPost>(posts: readonly T[]): YearGroup<T>[] {
  const byYear = new Map<number, Map<number, T[]>>();

  for (const post of posts) {
    let months = byYear.get(post.year);
    if (!months) {
      months = new Map();
      byYear.set(post.year, months);
    }

    const bucket = months.get(post.month);
    if (bucket) {
      bucket.push(post);
    } else {
      months.set(post.month, [post]);
    }
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort(([a], [b]) => b - a)
        .map(([month, posts]) => ({
          month,
          posts: [...posts].sort((a, b) => b.day - a.day || a.slug.localeCompare(b.slug)),
        })),
    }));
}
