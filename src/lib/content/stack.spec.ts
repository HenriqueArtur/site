import { describe, expect, it } from 'vitest';
import { locales } from '../i18n/locales.ts';
import { stack } from './stack.ts';

describe('stack', () => {
  it('não repete id entre os grupos atuais', () => {
    const ids = stack.current.map((group) => group.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('traduz o rótulo de todo grupo', () => {
    for (const group of stack.current) {
      for (const locale of locales) {
        expect(group.label[locale].length, `rótulo de ${group.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('não deixa grupo vazio nem item repetido dentro do grupo', () => {
    for (const group of stack.current) {
      expect(group.items.length, `itens de ${group.id}`).toBeGreaterThan(0);
      expect(new Set(group.items).size).toBe(group.items.length);
    }
  });

  it('não repete a mesma tecnologia em dois grupos atuais', () => {
    const all = stack.current.flatMap((group) => group.items);
    expect(new Set(all).size).toBe(all.length);
  });

  it('não lista como passado algo que também está no presente', () => {
    // Se uma tecnologia voltou a ser usada, ela sai da lista de passado —
    // senão o leitor recebe dois sinais contraditórios sobre a mesma coisa.
    const current = new Set(stack.current.flatMap((group) => group.items));
    for (const item of stack.past) {
      expect(current.has(item), `${item} aparece nos dois`).toBe(false);
    }
  });

  it('não repete item dentro da lista de passado', () => {
    expect(new Set(stack.past).size).toBe(stack.past.length);
  });
});
