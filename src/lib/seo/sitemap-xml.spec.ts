import { describe, expect, it } from 'vitest';
import { sitemapXml } from './sitemap-xml.ts';

const site = 'https://henriqueartur.com';

describe('sitemapXml', () => {
  it('gera um sitemap bem formado', () => {
    const xml = sitemapXml(site, [{ path: '/' }]);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });

  it('transforma cada caminho em URL absoluta', () => {
    const xml = sitemapXml(site, [{ path: '/' }, { path: '/en/blog/' }]);

    expect(xml).toContain('<loc>https://henriqueartur.com/</loc>');
    expect(xml).toContain('<loc>https://henriqueartur.com/en/blog/</loc>');
  });

  it('inclui lastmod apenas quando há data', () => {
    const comData = sitemapXml(site, [
      { path: '/2026/07/31/post/', lastModified: new Date('2026-07-31T00:00:00Z') },
    ]);
    const semData = sitemapXml(site, [{ path: '/' }]);

    expect(comData).toContain('<lastmod>2026-07-31</lastmod>');
    expect(semData).not.toContain('<lastmod>');
  });

  it('usa o formato de data que o protocolo exige, sem hora', () => {
    const xml = sitemapXml(site, [{ path: '/x/', lastModified: new Date('2026-01-05T18:30:00Z') }]);
    expect(xml).toContain('<lastmod>2026-01-05</lastmod>');
  });

  it('remove URLs duplicadas, que o protocolo não admite', () => {
    const xml = sitemapXml(site, [{ path: '/' }, { path: '/' }, { path: '/blog/' }]);
    expect(xml.match(/<loc>https:\/\/henriqueartur\.com\/<\/loc>/g)).toHaveLength(1);
  });

  it('escapa caracteres especiais no caminho', () => {
    const xml = sitemapXml(site, [{ path: '/busca/?q=a&b/' }]);
    expect(xml).toContain('&amp;');
    expect(xml).not.toContain('?q=a&b');
  });

  it('gera sitemap válido mesmo sem nenhuma URL', () => {
    const xml = sitemapXml(site, []);
    expect(xml).toContain('<urlset');
    expect(xml).not.toContain('<url>');
  });

  it('é determinístico: mesma entrada, mesma saída', () => {
    const urls = [{ path: '/' }, { path: '/blog/' }];
    expect(sitemapXml(site, urls)).toBe(sitemapXml(site, urls));
  });
});
