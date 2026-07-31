import { describe, expect, it } from 'vitest';
import { cssVariables } from './css-variables.ts';

describe('cssVariables', () => {
  it('gera uma custom property por token, prefixada pelo grupo', () => {
    const css = cssVariables({ color: { paper: '#F7F4ED' } });
    expect(css).toContain('--color-paper: #F7F4ED;');
  });

  it('converte camelCase em kebab-case', () => {
    const css = cssVariables({ color: { paperDeep: '#EDE6D8', lineStrong: '#8F8166' } });
    expect(css).toContain('--color-paper-deep: #EDE6D8;');
    expect(css).toContain('--color-line-strong: #8F8166;');
  });

  it('mantém chaves numéricas e alfanuméricas intactas', () => {
    const css = cssVariables({ space: { '1': '0.5rem' }, fontSize: { '2xl': '1.875rem' } });
    expect(css).toContain('--space-1: 0.5rem;');
    expect(css).toContain('--font-size-2xl: 1.875rem;');
  });

  it('preserva aspas simples de font-family, que o CSS precisa', () => {
    const css = cssVariables({ font: { body: "'Source Serif 4', Georgia, serif" } });
    expect(css).toContain("--font-body: 'Source Serif 4', Georgia, serif;");
  });

  it('emite uma declaração por linha, na ordem de declaração dos tokens', () => {
    const css = cssVariables({ color: { ink: '#2A241C', paper: '#F7F4ED' } });
    expect(css.trim().split('\n')).toEqual(['--color-ink: #2A241C;', '--color-paper: #F7F4ED;']);
  });

  it('é determinístico: a mesma entrada gera exatamente a mesma saída', () => {
    const input = { color: { ink: '#2A241C' }, space: { '2': '1rem' } };
    expect(cssVariables(input)).toBe(cssVariables(input));
  });

  it('devolve string vazia para um conjunto de tokens vazio', () => {
    expect(cssVariables({})).toBe('');
  });
});
