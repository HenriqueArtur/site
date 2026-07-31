import { describe, expect, it } from 'vitest';
import { stackOffsets } from './stack-offsets.ts';

describe('stackOffsets', () => {
  it('devolve deslocamento zero para o primeiro, que é a base da pilha', () => {
    expect(stackOffsets([100, 300, 500])[0]).toBe(0);
  });

  it('puxa cada elemento até a posição do primeiro', () => {
    // Todos precisam terminar em 100, que é onde o primeiro está.
    expect(stackOffsets([100, 300, 500])).toEqual([0, -200, -400]);
  });

  it('funciona com espaçamento irregular entre os elementos', () => {
    expect(stackOffsets([0, 150, 500, 520])).toEqual([0, -150, -500, -520]);
  });

  it('devolve lista vazia para entrada vazia', () => {
    expect(stackOffsets([])).toEqual([]);
  });

  it('devolve só o zero quando há um elemento', () => {
    expect(stackOffsets([42])).toEqual([0]);
  });

  it('não assume que a lista está ordenada', () => {
    // Se a ordem do DOM não corresponder à ordem visual, a pilha ainda se forma
    // em torno do primeiro elemento do DOM — que é o que fica por cima.
    expect(stackOffsets([500, 100])).toEqual([0, 400]);
  });

  it('lida com posições negativas, quando a seção já rolou para cima', () => {
    expect(stackOffsets([-200, 0, 200])).toEqual([0, -200, -400]);
  });
});
