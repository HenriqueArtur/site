import { escapeXml } from './escape-xml.ts';

export interface FeedItem {
  title: string;
  description: string;
  /** Caminho relativo à raiz do site, começando com barra. */
  path: string;
  date: Date;
}

export interface FeedOptions {
  title: string;
  description: string;
  /** Origem do site, sem barra final. */
  site: string;
  /** Caminho do próprio feed, para o atom:link rel="self". */
  feedPath: string;
  language: string;
  items: readonly FeedItem[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Data no formato RFC 822 que o RSS exige.
 *
 * Montada à mão, e não com `toUTCString()`, porque o RSS pede nomes em inglês
 * independentemente do idioma do feed — e para não depender do locale do
 * runtime, pela mesma razão de format-period.ts.
 */
function rfc822(date: Date): string {
  const day = DAYS[date.getUTCDay()];
  const month = MONTHS[date.getUTCMonth()];

  return (
    `${day}, ${pad(date.getUTCDate())} ${month} ${date.getUTCFullYear()} ` +
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} GMT`
  );
}

/** Feed RSS 2.0. Escrito à mão por ser XML simples, evitando uma dependência. */
export function rssFeed(options: FeedOptions): string {
  const { title, description, site, feedPath, language, items } = options;

  const entries = items.map((item) => {
    const url = `${site}${item.path}`;
    return [
      '    <item>',
      `      <title>${escapeXml(item.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <description>${escapeXml(item.description)}</description>`,
      `      <pubDate>${rfc822(item.date)}</pubDate>`,
      '    </item>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(site)}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    `    <language>${escapeXml(language)}</language>`,
    `    <atom:link href="${escapeXml(`${site}${feedPath}`)}" rel="self" type="application/rss+xml"/>`,
    ...entries,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
