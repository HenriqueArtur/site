import { describe, expect, it } from 'vitest';
import { locales } from '../i18n/locales.ts';
import { profile } from './profile.ts';

describe('profile', () => {
  it('tem tagline e localização nos dois idiomas, sem campo vazio', () => {
    for (const locale of locales) {
      expect(profile.tagline[locale].length).toBeGreaterThan(0);
      expect(profile.location[locale].length).toBeGreaterThan(0);
      expect(profile.role[locale].length).toBeGreaterThan(0);
    }
  });

  it('tem todos os parágrafos de resumo traduzidos', () => {
    expect(profile.summary.length).toBeGreaterThan(0);
    for (const paragraph of profile.summary) {
      for (const locale of locales) {
        expect(paragraph[locale].length).toBeGreaterThan(0);
      }
    }
  });

  it('usa o e-mail do próprio domínio', () => {
    expect(profile.email).toBe('contato@henriqueartur.com');
  });

  it('não repete id entre os links', () => {
    const ids = profile.links.map((link) => link.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('só tem link com esquema seguro: https ou mailto', () => {
    for (const link of profile.links) {
      expect(link.href).toMatch(/^(https:\/\/|mailto:)/);
    }
  });
});
