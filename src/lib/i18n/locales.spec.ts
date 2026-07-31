import { describe, expect, it } from 'vitest';
import { defaultLocale, isLocale, locales } from './locales.ts';

describe('locales', () => {
  it('suporta exatamente português e inglês', () => {
    expect(locales).toEqual(['pt-BR', 'en']);
  });

  it('tem português como padrão, que é o idioma servido na raiz', () => {
    expect(defaultLocale).toBe('pt-BR');
    expect(locales).toContain(defaultLocale);
  });
});

describe('isLocale', () => {
  it('aceita os idiomas suportados', () => {
    expect(isLocale('pt-BR')).toBe(true);
    expect(isLocale('en')).toBe(true);
  });

  it('recusa qualquer outra coisa, inclusive variantes próximas', () => {
    expect(isLocale('pt')).toBe(false);
    expect(isLocale('pt-PT')).toBe(false);
    expect(isLocale('en-US')).toBe(false);
    expect(isLocale('es')).toBe(false);
    expect(isLocale('')).toBe(false);
  });

  it('é case-sensitive, porque o valor vai para o atributo lang do HTML', () => {
    expect(isLocale('PT-BR')).toBe(false);
    expect(isLocale('EN')).toBe(false);
  });
});
