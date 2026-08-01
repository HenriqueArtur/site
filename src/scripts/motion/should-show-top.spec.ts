import { describe, expect, it } from 'vitest';
import { shouldShowTop } from './should-show-top.ts';

const base = { threshold: 1000, hysteresis: 80 };

describe('shouldShowTop', () => {
  it('fica escondido antes do limiar', () => {
    expect(shouldShowTop({ ...base, scrollY: 400, visible: false })).toBe(false);
    expect(shouldShowTop({ ...base, scrollY: 999, visible: false })).toBe(false);
  });

  it('aparece ao passar do limiar', () => {
    expect(shouldShowTop({ ...base, scrollY: 1001, visible: false })).toBe(true);
  });

  it('continua visível ao voltar um pouco, dentro da histerese', () => {
    // Sem isso, rolar de leve em torno do limiar faz o botão piscar.
    expect(shouldShowTop({ ...base, scrollY: 960, visible: true })).toBe(true);
    expect(shouldShowTop({ ...base, scrollY: 921, visible: true })).toBe(true);
  });

  it('some ao voltar além da histerese', () => {
    expect(shouldShowTop({ ...base, scrollY: 919, visible: true })).toBe(false);
  });

  it('não aparece dentro da histerese se ainda não estava visível', () => {
    // A folga serve para não sumir, não para antecipar o aparecimento.
    expect(shouldShowTop({ ...base, scrollY: 960, visible: false })).toBe(false);
  });

  it('sem histerese, o limiar vale nos dois sentidos', () => {
    const semFolga = { threshold: 1000, hysteresis: 0 };
    expect(shouldShowTop({ ...semFolga, scrollY: 1001, visible: false })).toBe(true);
    expect(shouldShowTop({ ...semFolga, scrollY: 999, visible: true })).toBe(false);
  });

  it('trata o topo da página como escondido, em qualquer estado anterior', () => {
    expect(shouldShowTop({ ...base, scrollY: 0, visible: true })).toBe(false);
    expect(shouldShowTop({ ...base, scrollY: 0, visible: false })).toBe(false);
  });

  it('aguenta limiar zero sem ficar preso visível', () => {
    expect(shouldShowTop({ threshold: 0, hysteresis: 80, scrollY: 0, visible: false })).toBe(false);
  });
});
