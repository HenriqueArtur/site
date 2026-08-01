import { describe, expect, it } from 'vitest';
import { blogVisible } from './blog-visible.ts';

describe('blogVisible', () => {
  it('mostra o blog em desenvolvimento', () => {
    expect(blogVisible(true)).toBe(true);
  });

  it('esconde o blog no build publicado', () => {
    // Enquanto não há conteúdo suficiente. Quando houver, esta expectativa
    // muda junto com a regra — e é o teste que obriga a decisão a ser
    // explícita em vez de acontecer por acidente.
    expect(blogVisible(false)).toBe(false);
  });

  it('devolve booleano, não valor truthy', () => {
    // Os pontos de uso alimentam atributos e condições de renderização; um
    // `undefined` vazando viraria atributo estranho no HTML.
    expect(typeof blogVisible(false)).toBe('boolean');
  });
});
