import { describe, expect, it } from 'vitest';
import { monthName } from './month-name.ts';

describe('monthName', () => {
  it('dá o nome por extenso em português', () => {
    expect(monthName(1, 'pt-BR')).toBe('janeiro');
    expect(monthName(7, 'pt-BR')).toBe('julho');
    expect(monthName(12, 'pt-BR')).toBe('dezembro');
  });

  it('dá o nome por extenso em inglês, com a maiúscula que o idioma pede', () => {
    expect(monthName(1, 'en')).toBe('January');
    expect(monthName(7, 'en')).toBe('July');
    expect(monthName(12, 'en')).toBe('December');
  });

  it('cobre os doze meses nos dois idiomas, sem repetir nome', () => {
    for (const locale of ['pt-BR', 'en'] as const) {
      const nomes = Array.from({ length: 12 }, (_, i) => monthName(i + 1, locale));
      expect(new Set(nomes).size, locale).toBe(12);
      expect(nomes.every((nome) => nome.length > 0)).toBe(true);
    }
  });

  it('recusa mês fora do intervalo em vez de devolver undefined na página', () => {
    expect(() => monthName(0, 'pt-BR')).toThrowError(/mês/);
    expect(() => monthName(13, 'pt-BR')).toThrowError(/mês/);
    expect(() => monthName(1.5, 'pt-BR')).toThrowError(/mês/);
  });
});
