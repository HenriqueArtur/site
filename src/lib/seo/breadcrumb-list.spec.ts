import { describe, expect, it } from 'vitest';
import { breadcrumbList } from './breadcrumb-list.ts';

const site = 'https://henriqueartur.com';

describe('breadcrumbList', () => {
  it('se declara como trilha', () => {
    expect(breadcrumbList([{ name: 'Blog', path: '/blog/' }], site)['@type']).toBe(
      'BreadcrumbList',
    );
  });

  it('numera a partir de 1', () => {
    // `position: 0` faz o item ser descartado em silêncio.
    const { itemListElement } = breadcrumbList(
      [
        { name: 'Blog', path: '/blog/' },
        { name: '2026', path: '/blog/2026/' },
      ],
      site,
    );
    expect(itemListElement.map((item) => item.position)).toEqual([1, 2]);
  });

  it('torna cada item absoluto', () => {
    const { itemListElement } = breadcrumbList([{ name: '2026', path: '/blog/2026/' }], site);
    expect(itemListElement[0]?.item).toBe('https://henriqueartur.com/blog/2026/');
  });

  it('preserva a ordem, que é o significado da trilha', () => {
    const { itemListElement } = breadcrumbList(
      [
        { name: 'Blog', path: '/blog/' },
        { name: '2026', path: '/blog/2026/' },
        { name: 'julho', path: '/blog/2026/07/' },
      ],
      site,
    );
    expect(itemListElement.map((item) => item.name)).toEqual(['Blog', '2026', 'julho']);
  });

  it('recusa trilha vazia', () => {
    expect(() => breadcrumbList([], site)).toThrowError(/vazia/);
  });
});
