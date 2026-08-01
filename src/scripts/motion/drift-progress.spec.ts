import { describe, expect, it } from 'vitest';
import { driftProgress } from './drift-progress.ts';

describe('driftProgress', () => {
  it('é zero antes de o elemento grudar', () => {
    // Topo ainda abaixo do ponto onde ele para: nada de deslocamento.
    expect(driftProgress({ boxTop: 400, stickyTop: 80, ramp: 500 })).toBe(0);
  });

  it('é zero no exato instante em que gruda', () => {
    expect(driftProgress({ boxTop: 80, stickyTop: 80, ramp: 500 })).toBe(0);
  });

  it('cresce conforme a rolagem avança depois de grudar', () => {
    const pouco = driftProgress({ boxTop: -50, stickyTop: 80, ramp: 500 });
    const muito = driftProgress({ boxTop: -300, stickyTop: 80, ramp: 500 });

    expect(pouco).toBeGreaterThan(0);
    expect(muito).toBeGreaterThan(pouco);
  });

  it('chega a um no fim da rampa e não passa disso', () => {
    expect(driftProgress({ boxTop: -420, stickyTop: 80, ramp: 500 })).toBe(1);
    expect(driftProgress({ boxTop: -5000, stickyTop: 80, ramp: 500 })).toBe(1);
  });

  it('é metade no meio da rampa', () => {
    expect(driftProgress({ boxTop: -170, stickyTop: 80, ramp: 500 })).toBeCloseTo(0.5, 5);
  });

  it('trata rampa zero como troca imediata, sem dividir por zero', () => {
    expect(driftProgress({ boxTop: 100, stickyTop: 80, ramp: 0 })).toBe(0);
    expect(driftProgress({ boxTop: 79, stickyTop: 80, ramp: 0 })).toBe(1);
  });

  it('nunca sai do intervalo 0..1', () => {
    for (const boxTop of [1000, 80, 0, -1000, -99999]) {
      const p = driftProgress({ boxTop, stickyTop: 80, ramp: 400 });
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });
});
