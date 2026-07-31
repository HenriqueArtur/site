import { describe, expect, it } from 'vitest';
import { locales } from '../i18n/locales.ts';
import { openSource } from './open-source.ts';

describe('openSource', () => {
  it('não repete id', () => {
    const ids = openSource.map((repo) => repo.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('aponta todo repositório para o GitHub por https', () => {
    for (const repo of openSource) {
      expect(repo.href, `link de ${repo.id}`).toMatch(/^https:\/\/github\.com\/HenriqueArtur\//);
    }
  });

  it('traduz a descrição de todo repositório', () => {
    for (const repo of openSource) {
      for (const locale of locales) {
        expect(repo.description[locale].length, `descrição de ${repo.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('destaca exatamente um repositório', () => {
    // Mais de um destaque não é destaque. O archwarden é o projeto autoral
    // com mais superfície, então é ele quem abre a seção.
    const featured = openSource.filter((repo) => repo.featured);
    expect(featured).toHaveLength(1);
    expect(featured[0]?.id).toBe('archwarden');
  });

  it('nomeia a linguagem de todo repositório', () => {
    for (const repo of openSource) {
      expect(repo.language.length, `linguagem de ${repo.id}`).toBeGreaterThan(0);
    }
  });
});
