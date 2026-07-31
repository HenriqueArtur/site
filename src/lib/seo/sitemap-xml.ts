import { escapeXml } from './escape-xml.ts';

export interface SitemapUrl {
  /** Caminho relativo à raiz do site, começando com barra. */
  path: string;
  lastModified?: Date;
}

/**
 * Sitemap XML. Escrito à mão por ser XML trivial, evitando uma dependência.
 *
 * URLs repetidas são removidas: o protocolo não as admite, e é fácil produzi-las
 * ao concatenar as rotas de vários idiomas.
 */
export function sitemapXml(site: string, urls: readonly SitemapUrl[]): string {
  const seen = new Set<string>();
  const entries: string[] = [];

  for (const url of urls) {
    const loc = `${site}${url.path}`;
    if (seen.has(loc)) continue;
    seen.add(loc);

    const lastmod = url.lastModified
      ? `\n    <lastmod>${url.lastModified.toISOString().slice(0, 10)}</lastmod>`
      : '';

    entries.push(`  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmod}\n  </url>`);
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}
