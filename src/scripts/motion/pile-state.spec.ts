import { describe, expect, it } from 'vitest';
import { pileProgress, pileState } from './pile-state.ts';

/** Seis slots igualmente espaçados, como a coluna de cartões no mobile. */
const slots = [0, 100, 200, 300, 400, 500];

describe('pileState — estado inicial', () => {
  it('põe todos os cartões no primeiro slot', () => {
    const state = pileState(0, slots);
    // Cada offset leva o cartão do seu slot de volta ao slot 0.
    expect(state.map((s) => s.offset)).toEqual([0, -100, -200, -300, -400, -500]);
  });

  it('dá profundidade crescente, para a pilha se ver como pilha', () => {
    expect(pileState(0, slots).map((s) => s.depth)).toEqual([0, 1, 2, 3, 4, 5]);
  });
});

describe('pileState — a pilha desce um slot por vez', () => {
  it('no passo 1, o primeiro está no lugar e o resto foi para o slot 2', () => {
    const state = pileState(1 / 6, slots);

    expect(state[0]?.offset).toBe(0);
    // Cartões 2..6 agora partem do slot 1 (posição 100), não mais do slot 0.
    expect(state[1]?.offset).toBe(0);
    expect(state[2]?.offset).toBe(-100);
    expect(state[3]?.offset).toBe(-200);
  });

  it('no passo 3, os três primeiros estão no lugar', () => {
    const state = pileState(3 / 6, slots);

    expect(state.slice(0, 4).map((s) => s.offset)).toEqual([0, 0, 0, 0]);
    expect(state[4]?.offset).toBe(-100);
    expect(state[5]?.offset).toBe(-200);
  });

  it('no fim, todos estão nos seus lugares', () => {
    expect(pileState(1, slots).map((s) => s.offset)).toEqual([0, 0, 0, 0, 0, 0]);
    expect(pileState(1, slots).map((s) => s.depth)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('interpola entre um passo e o seguinte, para a pilha deslizar', () => {
    // Meio caminho entre o passo 0 e o passo 1: a pilha está entre os slots.
    const state = pileState(0.5 / 6, slots);
    expect(state[2]?.offset).toBe(-150);
  });
});

describe('pileState — invariantes', () => {
  it('nunca empurra um cartão para baixo do próprio slot', () => {
    // Offset positivo significaria o cartão abaixo do lugar dele, que não é
    // parte do movimento: a pilha só sobe em relação ao destino.
    for (let p = 0; p <= 1; p += 0.05) {
      for (const { offset } of pileState(p, slots)) {
        expect(offset).toBeLessThanOrEqual(0);
      }
    }
  });

  it('o primeiro cartão nunca sai do lugar', () => {
    for (let p = 0; p <= 1; p += 0.1) {
      expect(pileState(p, slots)[0]?.offset).toBe(0);
    }
  });

  it('cada cartão só avança, nunca volta para a pilha', () => {
    let anterior = pileState(0, slots).map((s) => s.offset);
    for (let p = 0.05; p <= 1; p += 0.05) {
      const atual = pileState(p, slots).map((s) => s.offset);
      atual.forEach((offset, i) => {
        expect(offset).toBeGreaterThanOrEqual(anterior[i] as number);
      });
      anterior = atual;
    }
  });

  it('trata progresso fora do intervalo como as pontas', () => {
    expect(pileState(-5, slots)).toEqual(pileState(0, slots));
    expect(pileState(9, slots)).toEqual(pileState(1, slots));
  });

  it('aguenta lista vazia e lista de um', () => {
    expect(pileState(0.5, [])).toEqual([]);
    expect(pileState(0.5, [42])).toEqual([{ offset: 0, depth: 0 }]);
  });
});

describe('pileProgress', () => {
  const rect = (top: number, height: number) => ({ top, height });

  it('é zero antes de a pilha entrar na faixa de trabalho', () => {
    expect(pileProgress(rect(900, 600), 800)).toBe(0);
  });

  it('é um depois de a lista ter passado por completo', () => {
    expect(pileProgress(rect(-1200, 600), 800)).toBe(1);
  });

  it('cresce conforme a lista sobe na tela', () => {
    const meio = pileProgress(rect(260, 600), 800);
    expect(meio).toBeGreaterThan(0);
    expect(meio).toBeLessThan(1);
    expect(pileProgress(rect(100, 600), 800)).toBeGreaterThan(meio);
  });

  it('nunca sai do intervalo 0..1', () => {
    for (const top of [-5000, -600, 0, 400, 5000]) {
      const p = pileProgress(rect(top, 600), 800);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });

  it('devolve 1 para lista sem altura, em vez de dividir por zero', () => {
    expect(pileProgress(rect(0, 0), 800)).toBe(1);
  });
});
