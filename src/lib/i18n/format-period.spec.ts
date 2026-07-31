import { describe, expect, it } from 'vitest';
import { formatPeriod } from './format-period.ts';

describe('formatPeriod', () => {
  it('formata um período fechado em português', () => {
    expect(formatPeriod('2018-08', '2019-10', 'pt-BR')).toBe('ago/2018 — out/2019');
  });

  it('formata um período fechado em inglês', () => {
    expect(formatPeriod('2018-08', '2019-10', 'en')).toBe('Aug 2018 — Oct 2019');
  });

  it('marca período em aberto como atual, em cada idioma', () => {
    expect(formatPeriod('2024-05', null, 'pt-BR')).toBe('mai/2024 — hoje');
    expect(formatPeriod('2024-05', null, 'en')).toBe('May 2024 — present');
  });

  it('colapsa início e fim iguais em um mês só', () => {
    expect(formatPeriod('2018-02', '2018-02', 'pt-BR')).toBe('fev/2018');
    expect(formatPeriod('2018-02', '2018-02', 'en')).toBe('Feb 2018');
  });

  it('cobre os doze meses em português', () => {
    const meses = Array.from(
      { length: 12 },
      (_, i) => formatPeriod(`2024-${String(i + 1).padStart(2, '0')}`, null, 'pt-BR').split('/')[0],
    );
    expect(meses).toEqual([
      'jan',
      'fev',
      'mar',
      'abr',
      'mai',
      'jun',
      'jul',
      'ago',
      'set',
      'out',
      'nov',
      'dez',
    ]);
  });

  it('recusa mês inválido em vez de renderizar lixo na página', () => {
    expect(() => formatPeriod('2024-13', null, 'pt-BR')).toThrowError(/AAAA-MM/);
    expect(() => formatPeriod('2024-00', null, 'pt-BR')).toThrowError(/AAAA-MM/);
    expect(() => formatPeriod('2024', null, 'pt-BR')).toThrowError(/AAAA-MM/);
    expect(() => formatPeriod('', null, 'pt-BR')).toThrowError(/AAAA-MM/);
  });

  it('recusa fim anterior ao início', () => {
    expect(() => formatPeriod('2024-05', '2024-01', 'pt-BR')).toThrowError(/anterior/);
  });
});
