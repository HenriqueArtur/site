import { describe, expect, it } from 'vitest';
import { headingLevel } from './heading-level.ts';

describe('headingLevel', () => {
  it('devolve a tag do nível pedido', () => {
    expect(headingLevel(2)).toBe('h2');
    expect(headingLevel(4)).toBe('h4');
  });

  it('recusa nível fora de h1..h6', () => {
    // Um `<h7>` não existe: o navegador o trata como elemento desconhecido e a
    // tecnologia assistiva não o vê como título nenhum.
    expect(() => headingLevel(0)).toThrowError(/entre 1 e 6/);
    expect(() => headingLevel(7)).toThrowError(/entre 1 e 6/);
  });

  it('recusa nível fracionário', () => {
    expect(() => headingLevel(2.5)).toThrowError(/inteiro/);
  });

  it('cobre os seis níveis', () => {
    expect([1, 2, 3, 4, 5, 6].map(headingLevel)).toEqual(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
  });
});
