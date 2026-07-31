import { describe, expect, it } from 'vitest';
import { shouldRender3d } from './should-render-3d.ts';

const ok = {
  reducedMotion: false,
  hasWebGL: true,
  viewportWidth: 1280,
  saveData: false,
};

describe('shouldRender3d', () => {
  it('renderiza quando tudo está favorável', () => {
    expect(shouldRender3d(ok)).toBe(true);
  });

  it('não renderiza sob prefers-reduced-motion', () => {
    // Requisito de acessibilidade, não otimização: um objeto girando é
    // exatamente o tipo de movimento que a preferência existe para evitar.
    expect(shouldRender3d({ ...ok, reducedMotion: true })).toBe(false);
  });

  it('não renderiza sem WebGL', () => {
    expect(shouldRender3d({ ...ok, hasWebGL: false })).toBe(false);
  });

  it('não renderiza quando o usuário pediu economia de dados', () => {
    // O modelo é o maior ativo da página por larga margem. Baixá-lo contra a
    // vontade declarada de economizar dados é hostil.
    expect(shouldRender3d({ ...ok, saveData: true })).toBe(false);
  });

  it('não renderiza em tela minúscula, onde o modelo não é legível', () => {
    expect(shouldRender3d({ ...ok, viewportWidth: 320 })).toBe(false);
    expect(shouldRender3d({ ...ok, viewportWidth: 359 })).toBe(false);
  });

  it('renderiza a partir de 360px, que cobre praticamente todo celular atual', () => {
    expect(shouldRender3d({ ...ok, viewportWidth: 360 })).toBe(true);
  });

  it('trata saveData ausente como não declarado, e portanto não impeditivo', () => {
    const { saveData: _, ...semSaveData } = ok;
    expect(shouldRender3d(semSaveData)).toBe(true);
  });

  it('basta um impedimento para recusar', () => {
    expect(shouldRender3d({ ...ok, reducedMotion: true, hasWebGL: true })).toBe(false);
    expect(shouldRender3d({ ...ok, saveData: true, viewportWidth: 1920 })).toBe(false);
  });
});
