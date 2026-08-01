import { describe, expect, it } from 'vitest';
import { introMotion } from './intro-motion.ts';

const options = {
  durationMs: 1000,
  startScale: 1.8,
  startRotation: -1.2,
  targetRotation: 0.4,
  settleAt: 0.85,
  idleAmplitude: 0.06,
  idlePeriodMs: 5000,
};

describe('introMotion — a entrada', () => {
  it('começa longe e girado', () => {
    const state = introMotion(0, options);
    expect(state.distanceScale).toBe(1.8);
    expect(state.rotation).toBe(-1.2);
  });

  it('termina na distância final', () => {
    expect(introMotion(1000, options).distanceScale).toBeCloseTo(1, 5);
  });

  it('aproxima sem voltar atrás', () => {
    let anterior = Number.POSITIVE_INFINITY;
    for (let t = 0; t <= 1000; t += 50) {
      const atual = introMotion(t, options).distanceScale;
      expect(atual).toBeLessThanOrEqual(anterior + 1e-9);
      anterior = atual;
    }
  });

  it('desacelera na chegada, em vez de parar seco', () => {
    // Metade do tempo já cobriu bem mais que metade do caminho: é o que faz a
    // aproximação parecer freada e não corte.
    const meio = introMotion(500, options).distanceScale;
    const percorrido = (1.8 - meio) / (1.8 - 1);
    expect(percorrido).toBeGreaterThan(0.6);
  });
});

describe('introMotion — a rotação chega antes da câmera', () => {
  it('atinge a posição exata em settleAt, não no fim', () => {
    // O pedido era o objeto estar no lugar quando a câmera se aproxima da
    // posição final — não chegar junto com ela.
    expect(introMotion(850, options).rotation).toBeCloseTo(0.4, 6);
  });

  it('já está na posição final entre settleAt e o fim da entrada', () => {
    expect(introMotion(900, options).rotation).toBeCloseTo(0.4, 6);
    expect(introMotion(999, options).rotation).toBeCloseTo(0.4, 6);
  });

  it('gira sem voltar atrás', () => {
    let anterior = Number.NEGATIVE_INFINITY;
    for (let t = 0; t <= 850; t += 25) {
      const atual = introMotion(t, options).rotation;
      expect(atual).toBeGreaterThanOrEqual(anterior - 1e-9);
      anterior = atual;
    }
  });
});

describe('introMotion — o balanço depois da entrada', () => {
  it('mantém a distância final', () => {
    for (const t of [1000, 2500, 9000]) {
      expect(introMotion(t, options).distanceScale).toBe(1);
    }
  });

  it('começa o balanço a partir da posição exata, sem salto', () => {
    // Descontinuidade aqui apareceria como um tranco no fim da entrada.
    const fim = introMotion(1000, options).rotation;
    expect(fim).toBeCloseTo(0.4, 6);
  });

  it('oscila para os dois lados em torno da posição final', () => {
    const amostras: number[] = [];
    for (let t = 1000; t <= 1000 + 5000; t += 100) amostras.push(introMotion(t, options).rotation);

    expect(Math.max(...amostras)).toBeGreaterThan(0.4);
    expect(Math.min(...amostras)).toBeLessThan(0.4);
  });

  it('nunca passa da amplitude pedida', () => {
    for (let t = 1000; t <= 30000; t += 37) {
      const desvio = Math.abs(introMotion(t, options).rotation - 0.4);
      expect(desvio).toBeLessThanOrEqual(0.06 + 1e-9);
    }
  });

  it('nunca gira sem parar: o desvio não cresce com o tempo', () => {
    // O problema da versão anterior era exatamente este — rotação contínua,
    // sem posição de descanso.
    const cedo = Math.abs(introMotion(2000, options).rotation - 0.4);
    const tarde = Math.abs(introMotion(120000, options).rotation - 0.4);
    expect(tarde).toBeLessThanOrEqual(0.06);
    expect(cedo).toBeLessThanOrEqual(0.06);
  });
});

describe('introMotion — bordas', () => {
  it('trata tempo negativo como o instante zero', () => {
    expect(introMotion(-500, options)).toEqual(introMotion(0, options));
  });

  it('funciona com amplitude zero, deixando o objeto parado', () => {
    const parado = { ...options, idleAmplitude: 0 };
    expect(introMotion(4000, parado).rotation).toBeCloseTo(0.4, 6);
  });
});
