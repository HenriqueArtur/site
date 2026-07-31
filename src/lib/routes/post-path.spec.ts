import { describe, expect, it } from 'vitest';
import { postPath } from './post-path.ts';

describe('postPath', () => {
  it('monta a URL em pt-BR sem prefixo de idioma', () => {
    expect(postPath({ year: 2026, month: 7, day: 30, slug: 'meu-post', locale: 'pt-BR' })).toBe(
      '/2026/07/30/meu-post/',
    );
  });

  it('monta a URL em inglês sob o prefixo /en', () => {
    expect(postPath({ year: 2026, month: 7, day: 30, slug: 'my-post', locale: 'en' })).toBe(
      '/en/2026/07/30/my-post/',
    );
  });

  it('preenche mês e dia com zero à esquerda', () => {
    expect(postPath({ year: 2026, month: 1, day: 5, slug: 'ano-novo', locale: 'pt-BR' })).toBe(
      '/2026/01/05/ano-novo/',
    );
  });

  it('mantém dois dígitos quando mês e dia já têm dois dígitos', () => {
    expect(postPath({ year: 1999, month: 12, day: 31, slug: 'virada', locale: 'pt-BR' })).toBe(
      '/1999/12/31/virada/',
    );
  });

  it('recusa mês fora do intervalo', () => {
    expect(() =>
      postPath({ year: 2026, month: 13, day: 1, slug: 'x', locale: 'pt-BR' }),
    ).toThrowError(/mês/);
  });

  it('recusa dia fora do intervalo', () => {
    expect(() =>
      postPath({ year: 2026, month: 7, day: 0, slug: 'x', locale: 'pt-BR' }),
    ).toThrowError(/dia/);
  });

  it('recusa slug vazio', () => {
    expect(() =>
      postPath({ year: 2026, month: 7, day: 30, slug: '', locale: 'pt-BR' }),
    ).toThrowError(/slug/);
  });

  it('recusa slug que não seja kebab-case, para não gerar URL quebrada', () => {
    expect(() =>
      postPath({ year: 2026, month: 7, day: 30, slug: 'Meu Post!', locale: 'pt-BR' }),
    ).toThrowError(/slug/);
  });
});
