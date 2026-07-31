import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast-ratio.ts';

describe('contrastRatio', () => {
  it('dá 21 para o par de maior contraste possível', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
  });

  it('dá 1 para duas cores iguais', () => {
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(contrastRatio('#E2571E', '#E2571E')).toBeCloseTo(1, 5);
  });

  it('é simétrico: a ordem das cores não muda o resultado', () => {
    const claro = '#F7F4ED';
    const escuro = '#2A241C';
    expect(contrastRatio(claro, escuro)).toBeCloseTo(contrastRatio(escuro, claro), 10);
  });

  it('calcula o valor conhecido de cinza médio sobre branco', () => {
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
  });

  it('aceita hex em minúsculas', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5);
  });

  it('recusa hex de formato inválido em vez de devolver número errado', () => {
    expect(() => contrastRatio('#FFF', '#000000')).toThrowError(/hex/i);
    expect(() => contrastRatio('FFFFFF', '#000000')).toThrowError(/hex/i);
    expect(() => contrastRatio('#GGGGGG', '#000000')).toThrowError(/hex/i);
    expect(() => contrastRatio('', '#000000')).toThrowError(/hex/i);
  });
});
