import { describe, expect, it } from 'vitest';
import { underlineWidth } from './underline-width.ts';

describe('underlineWidth', () => {
  it('acompanha a largura da linha quando o título tem uma só', () => {
    expect(underlineWidth([240])).toBe(240);
  });

  it('acompanha a ÚLTIMA linha quando o título quebra', () => {
    // É onde o texto termina — um traço da largura total, com a última linha
    // curta, fica solto no ar à direita.
    expect(underlineWidth([320, 180])).toBe(180);
  });

  it('acompanha a última mesmo com três linhas', () => {
    expect(underlineWidth([320, 300, 90], 0)).toBe(90);
  });

  it('não deixa o traço encolher demais quando a última linha é uma palavra', () => {
    // Sem piso, "Vamos\nconversar" daria um risco minúsculo, que lê como
    // defeito e não como sublinhado.
    expect(underlineWidth([300, 40])).toBe(120);
  });

  it('usa a linha mais larga como referência do piso, não a primeira', () => {
    expect(underlineWidth([100, 300, 30])).toBe(120);
  });

  it('aceita outro piso', () => {
    expect(underlineWidth([300, 40], 0.5)).toBe(150);
    expect(underlineWidth([300, 40], 0)).toBe(40);
  });

  it('devolve null quando não há linha nenhuma', () => {
    // Título ainda não medido: o chamador mantém a largura padrão do CSS.
    expect(underlineWidth([])).toBeNull();
  });

  it('ignora linhas de largura zero, que aparecem em quebras vazias', () => {
    expect(underlineWidth([300, 0, 150])).toBe(150);
  });

  it('devolve null quando todas as linhas têm largura zero', () => {
    expect(underlineWidth([0, 0])).toBeNull();
  });
});
