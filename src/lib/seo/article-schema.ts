import type { Locale } from '../i18n/locales.ts';
import { PERSON_ID } from './person-schema.ts';

export interface ArticleOptions {
  site: string;
  locale: Locale;
  title: string;
  description: string;
  /** Caminho da página, já com a barra final. */
  path: string;
  published: Date;
  modified?: Date;
  tags?: readonly string[];
  image?: string;
}

/**
 * Dados estruturados de um post.
 *
 * Sem isto, um post é para o buscador um texto sem data e sem autor — e para
 * um assistente, um texto sem procedência, que ele tem menos motivo para
 * citar. É o nó que mais rende num blog.
 *
 * O autor é uma referência por `@id`, e não uma cópia do `Person`: o mesmo
 * identificador em todas as páginas é o que faz o buscador entender que é
 * sempre a mesma pessoa, em vez de um autor novo por artigo.
 */
export function articleSchema(options: ArticleOptions) {
  const { site, locale, title, description, path, published, modified, tags = [], image } = options;

  const url = new URL(path, site).href;

  return {
    '@type': 'BlogPosting',
    '@id': url,
    headline: title,
    description,
    /*
     * `mainEntityOfPage` diz que este artigo é o assunto principal da página, e
     * não algo citado de passagem. É o que separa o post da lista de posts.
     */
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    datePublished: isoDate(published),
    // Sem data de modificação, o buscador assume a de publicação. Declará-la
    // igual não é mentira e evita que ele adivinhe.
    dateModified: isoDate(modified ?? published),
    inLanguage: locale,
    author: { '@id': new URL(PERSON_ID, site).href },
    publisher: { '@id': new URL(PERSON_ID, site).href },
    ...(tags.length > 0 ? { keywords: [...tags] } : {}),
    ...(image ? { image: new URL(image, site).href } : {}),
  };
}

/**
 * Só a data, sem hora.
 *
 * O post tem data de publicação, não horário — `toISOString()` inteiro
 * inventaria um `00:00:00Z` que ninguém decidiu, e que muda de dia dependendo
 * do fuso de quem lê.
 */
function isoDate(date: Date): string {
  const iso = date.toISOString();
  return iso.slice(0, iso.indexOf('T'));
}
