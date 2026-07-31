export type Locale = 'pt-BR' | 'en';

export interface PostPathInput {
  year: number;
  month: number;
  day: number;
  slug: string;
  locale: Locale;
}

/** Slug de URL: minúsculas, dígitos e hífens simples entre eles. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * Constrói o caminho canônico de um post.
 *
 * pt-BR é o idioma padrão e vive na raiz; inglês vive sob `/en`. O caminho
 * termina em barra porque o build gera `<rota>/index.html`.
 */
export function postPath({ year, month, day, slug, locale }: PostPathInput): string {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`mês inválido: ${month}`);
  }
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error(`dia inválido: ${day}`);
  }
  if (!SLUG.test(slug)) {
    throw new Error(`slug inválido: ${JSON.stringify(slug)}`);
  }

  const prefix = locale === 'en' ? '/en' : '';
  return `${prefix}/${year}/${pad(month)}/${pad(day)}/${slug}/`;
}
