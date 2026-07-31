import { describe, expect, it } from 'vitest';
import { mostCentered } from './most-centered.ts';

/** Retângulo com o topo e a altura que importam para o cálculo. */
const box = (top: number, height = 200) => ({ top, height });

describe('mostCentered', () => {
  it('escolhe o elemento cujo centro está mais perto do centro da tela', () => {
    // Tela de 800: centro em 400.
    const boxes = [box(0), box(300), box(700)];
    expect(mostCentered(boxes, 800)).toBe(1);
  });

  it('devolve null quando não há elemento nenhum', () => {
    expect(mostCentered([], 800)).toBeNull();
  });

  it('devolve null quando nenhum elemento está visível', () => {
    // Um bem acima da tela, outro bem abaixo.
    expect(mostCentered([box(-900), box(1600)], 800)).toBeNull();
  });

  it('ignora elemento que saiu por cima e escolhe o que está na tela', () => {
    expect(mostCentered([box(-500), box(350)], 800)).toBe(1);
  });

  it('ignora elemento que ainda não entrou e escolhe o que está na tela', () => {
    expect(mostCentered([box(320), box(1400)], 800)).toBe(0);
  });

  it('desempata pelo primeiro, para o resultado não depender da ordem de leitura', () => {
    // Dois exatamente à mesma distância do centro, um acima e um abaixo.
    const boxes = [box(200), box(400)];
    expect(mostCentered(boxes, 800)).toBe(0);
  });

  it('considera a altura, não só o topo', () => {
    // O primeiro é alto e começa cedo, mas seu centro fica longe do meio;
    // o segundo é baixo e seu centro cai quase no meio exato.
    const boxes = [box(0, 900), box(380, 40)];
    expect(mostCentered(boxes, 800)).toBe(1);
  });

  it('aceita elemento parcialmente visível na borda de baixo', () => {
    expect(mostCentered([box(700, 300)], 800)).toBe(0);
  });

  it('aceita elemento parcialmente visível na borda de cima', () => {
    expect(mostCentered([box(-100, 300)], 800)).toBe(0);
  });

  it('funciona com um único elemento visível', () => {
    expect(mostCentered([box(300)], 800)).toBe(0);
  });
});
