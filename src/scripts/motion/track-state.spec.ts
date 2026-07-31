import { describe, expect, it } from 'vitest';
import { markerOffsets, reachedMarkers, trackProgress } from './track-state.ts';

describe('trackProgress', () => {
  const rect = (top: number, height: number) => ({ top, height });

  it('é zero antes de o limiar alcançar o topo da linha', () => {
    // Limiar padrão em 85% de 1000 = 850. A linha começa em 900, ainda abaixo.
    expect(trackProgress(rect(900, 400), 1000)).toBe(0);
  });

  it('começa perto da borda de baixo, não no centro da tela', () => {
    // O que estava errado antes: com limiar no meio, a parada só acendia depois
    // de já estar bem visível, e o cargo escondido deixava um buraco no layout.
    expect(trackProgress(rect(840, 400), 1000)).toBeGreaterThan(0);
  });

  it('é um depois de o limiar passar do fim da linha', () => {
    expect(trackProgress(rect(-500, 400), 1000)).toBe(1);
  });

  it('é meio quando o limiar está na metade da linha', () => {
    // Limiar em 850; linha de 400px começando em 650 → metade em 850.
    expect(trackProgress(rect(650, 400), 1000)).toBeCloseTo(0.5, 5);
  });

  it('cresce conforme a página rola', () => {
    const antes = trackProgress(rect(700, 400), 1000);
    const depois = trackProgress(rect(500, 400), 1000);
    expect(depois).toBeGreaterThan(antes);
  });

  it('aceita outro limiar', () => {
    // Com limiar em 100%, o gatilho é a borda de baixo da janela.
    expect(trackProgress(rect(1000, 400), 1000, 1)).toBe(0);
    expect(trackProgress(rect(800, 400), 1000, 1)).toBeCloseTo(0.5, 5);
  });

  it('nunca sai do intervalo 0..1', () => {
    for (const top of [-9999, -100, 0, 600, 9999]) {
      const p = trackProgress(rect(top, 400), 1000);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });

  it('devolve 1 para linha sem altura, em vez de dividir por zero', () => {
    expect(trackProgress(rect(0, 0), 1000)).toBe(1);
  });
});

describe('markerOffsets', () => {
  it('normaliza as posições entre o primeiro e o último marcador', () => {
    // Centros em 10, 60 e 110: a linha vai de 10 a 110.
    expect(markerOffsets([10, 60, 110])).toEqual([0, 0.5, 1]);
  });

  it('põe o primeiro em 0 e o último em 1, sempre', () => {
    const offsets = markerOffsets([7, 23, 99, 400]);
    expect(offsets[0]).toBe(0);
    expect(offsets.at(-1)).toBe(1);
  });

  it('reflete espaçamento irregular', () => {
    expect(markerOffsets([0, 10, 100])).toEqual([0, 0.1, 1]);
  });

  it('devolve zeros quando todos os marcadores estão na mesma altura', () => {
    // Divisão por zero silenciosa daria NaN, que vira `scaleY(NaN)` e some.
    expect(markerOffsets([50, 50, 50])).toEqual([0, 0, 0]);
  });

  it('aguenta lista vazia e de um', () => {
    expect(markerOffsets([])).toEqual([]);
    expect(markerOffsets([42])).toEqual([0]);
  });
});

describe('reachedMarkers', () => {
  const offsets = [0, 0.5, 1];

  it('não acende nada antes de a linha começar', () => {
    expect(reachedMarkers(0, offsets)).toEqual([false, false, false]);
  });

  it('acende o primeiro assim que a linha sai do zero', () => {
    expect(reachedMarkers(0.01, offsets)).toEqual([true, false, false]);
  });

  it('acende em sequência conforme a linha desce', () => {
    expect(reachedMarkers(0.5, offsets)).toEqual([true, true, false]);
    expect(reachedMarkers(1, offsets)).toEqual([true, true, true]);
  });

  it('acende exatamente quando a linha chega, não antes', () => {
    expect(reachedMarkers(0.49, offsets)[1]).toBe(false);
    expect(reachedMarkers(0.5, offsets)[1]).toBe(true);
  });

  it('nunca apaga um marcador já aceso ao continuar rolando', () => {
    let anterior = reachedMarkers(0, offsets);
    for (let p = 0.05; p <= 1; p += 0.05) {
      const atual = reachedMarkers(p, offsets);
      atual.forEach((aceso, i) => {
        if (anterior[i]) expect(aceso).toBe(true);
      });
      anterior = atual;
    }
  });

  it('aguenta lista vazia', () => {
    expect(reachedMarkers(0.5, [])).toEqual([]);
  });
});
