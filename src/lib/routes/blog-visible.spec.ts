import { describe, expect, it } from 'vitest';
import { blogVisible } from './blog-visible.ts';

describe('blogVisible', () => {
  it('mostra o blog em desenvolvimento', () => {
    expect(blogVisible(true)).toBe(true);
  });

  it('mostra o blog no build publicado', () => {
    // Mudou em setembro de 2026, com o primeiro artigo de verdade. Antes era
    // `false` aqui, e este teste é o que obrigou a decisão a ser explícita em
    // vez de acontecer por acidente — vale nos dois sentidos.
    expect(blogVisible(false)).toBe(true);
  });

  it('devolve booleano, não valor truthy', () => {
    // Os pontos de uso alimentam atributos e condições de renderização; um
    // `undefined` vazando viraria atributo estranho no HTML.
    expect(typeof blogVisible(false)).toBe('boolean');
  });
});
