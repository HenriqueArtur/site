import type { Locale } from '../i18n/locales.ts';

export interface PostId {
  year: number;
  month: number;
  day: number;
  slug: string;
  locale: Locale;
}

/** `<ano>/<mês>/<dia>/<slug>/index.md` ou `.../index.en.md`. */
const PATH =
  /^(\d{4})\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/([a-z0-9]+(?:-[a-z0-9]+)*)\/index(\.en)?\.md$/;

function daysInMonth(year: number, month: number): number {
  // O dia 0 do mês seguinte é o último dia deste.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Lê data, slug e idioma do caminho de um post.
 *
 * O caminho no disco é a fonte da verdade da URL, então um caminho fora do
 * padrão precisa quebrar o build em vez de virar uma rota estranha em produção.
 */
export function parsePostId(id: string): PostId {
  const match = PATH.exec(id);
  if (!match) {
    throw new Error(
      `post fora da estrutura esperada <ano>/<mês>/<dia>/<slug>/index[.en].md: ${JSON.stringify(id)}`,
    );
  }

  const [, rawYear, rawMonth, rawDay, slug, english] = match;
  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);

  if (day > daysInMonth(year, month)) {
    throw new Error(`o dia ${rawDay} não existe em ${rawYear}-${rawMonth}: ${JSON.stringify(id)}`);
  }

  return {
    year,
    month,
    day,
    slug: slug as string,
    locale: english ? 'en' : 'pt-BR',
  };
}
