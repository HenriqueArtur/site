import { describe, expect, it } from 'vitest';
import { locales } from '../i18n/locales.ts';
import { impact } from './impact.ts';

describe('impact', () => {
  it('não repete id', () => {
    const ids = impact.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tem título e descrição nos dois idiomas em todos os itens', () => {
    for (const item of impact) {
      for (const locale of locales) {
        expect(item.title[locale].length, `título de ${item.id}`).toBeGreaterThan(0);
        expect(item.description[locale].length, `descrição de ${item.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('quando há métrica, ela existe nos dois idiomas', () => {
    for (const item of impact) {
      if (!item.metric) continue;
      for (const locale of locales) {
        expect(item.metric[locale].length, `métrica de ${item.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('abre com resultados quantificados, que é o que sustenta a seção', () => {
    const [first, second] = impact;
    expect(first?.metric).toBeDefined();
    expect(second?.metric).toBeDefined();
  });

  it('usa id em kebab-case, porque vira âncora de URL', () => {
    for (const item of impact) {
      expect(item.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });
});
