import { describe, expect, it } from 'vitest';
import { rssFeed } from './rss-feed.ts';

const base = {
  title: 'Henrique Artur',
  description: 'Notas sobre software.',
  site: 'https://henriqueartur.com',
  feedPath: '/rss.xml',
  language: 'pt-BR',
};

const item = {
  title: 'Contraste como teste',
  description: 'Sobre verificar contraste no build.',
  path: '/2026/07/31/contraste-como-teste/',
  date: new Date('2026-07-31T00:00:00Z'),
};

describe('rssFeed', () => {
  it('gera um documento RSS 2.0 bem formado', () => {
    const xml = rssFeed({ ...base, items: [item] });

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml.trimEnd().endsWith('</rss>')).toBe(true);
  });

  it('usa URL absoluta em link e guid, que é o que leitores de feed exigem', () => {
    const xml = rssFeed({ ...base, items: [item] });

    expect(xml).toContain(
      '<link>https://henriqueartur.com/2026/07/31/contraste-como-teste/</link>',
    );
    expect(xml).toContain('https://henriqueartur.com/2026/07/31/contraste-como-teste/</guid>');
  });

  it('formata a data no padrão RFC 822 exigido pelo RSS', () => {
    const xml = rssFeed({ ...base, items: [item] });
    expect(xml).toContain('<pubDate>Fri, 31 Jul 2026 00:00:00 GMT</pubDate>');
  });

  it('declara o idioma do feed', () => {
    expect(rssFeed({ ...base, items: [item] })).toContain('<language>pt-BR</language>');
    expect(rssFeed({ ...base, language: 'en', items: [item] })).toContain(
      '<language>en</language>',
    );
  });

  it('aponta o atom:link para o próprio feed', () => {
    const xml = rssFeed({ ...base, items: [item] });
    expect(xml).toContain('href="https://henriqueartur.com/rss.xml"');
    expect(xml).toContain('rel="self"');
  });

  it('escapa o conteúdo dos itens', () => {
    const xml = rssFeed({
      ...base,
      items: [{ ...item, title: 'Tipos & testes <sempre>' }],
    });

    expect(xml).toContain('<title>Tipos &amp; testes &lt;sempre&gt;</title>');
    expect(xml).not.toContain('<sempre>');
  });

  it('escapa também o título e a descrição do canal', () => {
    const xml = rssFeed({ ...base, title: 'A & B', items: [] });
    expect(xml).toContain('<title>A &amp; B</title>');
  });

  it('gera feed válido mesmo sem nenhum item', () => {
    const xml = rssFeed({ ...base, items: [] });
    expect(xml).toContain('<channel>');
    expect(xml).not.toContain('<item>');
  });

  it('mantém a ordem dos itens recebida, sem reordenar por conta própria', () => {
    const xml = rssFeed({
      ...base,
      items: [
        { ...item, title: 'Primeiro' },
        { ...item, title: 'Segundo' },
      ],
    });

    expect(xml.indexOf('Primeiro')).toBeLessThan(xml.indexOf('Segundo'));
  });

  it('é determinístico: mesma entrada, mesma saída', () => {
    const input = { ...base, items: [item] };
    expect(rssFeed(input)).toBe(rssFeed(input));
  });
});
