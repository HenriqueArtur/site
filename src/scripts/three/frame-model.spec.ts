import { describe, expect, it } from 'vitest';
import { frameModel } from './frame-model.ts';

const cube = { x: 2, y: 2, z: 2 };

describe('frameModel', () => {
  it('devolve uma distância positiva para um modelo qualquer', () => {
    expect(frameModel({ size: cube, fov: 35, aspect: 1 })).toBeGreaterThan(0);
  });

  it('afasta a câmera quando o modelo é maior', () => {
    const perto = frameModel({ size: cube, fov: 35, aspect: 1 });
    const longe = frameModel({ size: { x: 4, y: 4, z: 4 }, fov: 35, aspect: 1 });
    expect(longe).toBeGreaterThan(perto);
  });

  it('é proporcional ao tamanho: dobrar o modelo dobra a distância', () => {
    const um = frameModel({ size: cube, fov: 35, aspect: 1 });
    const dois = frameModel({ size: { x: 4, y: 4, z: 4 }, fov: 35, aspect: 1 });
    expect(dois).toBeCloseTo(um * 2, 5);
  });

  it('aproxima a câmera quando o campo de visão é mais aberto', () => {
    const estreito = frameModel({ size: cube, fov: 25, aspect: 1 });
    const aberto = frameModel({ size: cube, fov: 60, aspect: 1 });
    expect(aberto).toBeLessThan(estreito);
  });

  it('afasta a câmera em viewport retrato, onde a largura é o limite', () => {
    // Este é o caso que quebra em silêncio: enquadra bem no desktop e corta as
    // laterais no celular, porque só a altura foi considerada.
    const paisagem = frameModel({ size: cube, fov: 35, aspect: 16 / 9 });
    const retrato = frameModel({ size: cube, fov: 35, aspect: 0.5 });
    expect(retrato).toBeGreaterThan(paisagem);
  });

  it('não muda a distância quando o viewport é mais largo que quadrado', () => {
    // Acima de 1:1 a altura passa a ser o limite, então alargar não afeta mais.
    const quadrado = frameModel({ size: cube, fov: 35, aspect: 1 });
    const largo = frameModel({ size: cube, fov: 35, aspect: 3 });
    expect(largo).toBeCloseTo(quadrado, 5);
  });

  it('aplica a folga pedida', () => {
    const justo = frameModel({ size: cube, fov: 35, aspect: 1, padding: 1 });
    const folgado = frameModel({ size: cube, fov: 35, aspect: 1, padding: 1.5 });
    expect(folgado).toBeCloseTo(justo * 1.5, 5);
  });

  it('usa a diagonal, para o modelo caber em qualquer ângulo de rotação', () => {
    // O objeto gira. Enquadrar pela maior aresta faria os cantos saírem do
    // quadro ao girar 45°; enquadrar pela esfera que o contém, não.
    const distancia = frameModel({ size: { x: 2, y: 1, z: 1 }, fov: 90, aspect: 1, padding: 1 });
    const raio = Math.sqrt(2 ** 2 + 1 ** 2 + 1 ** 2) / 2;
    expect(distancia).toBeCloseTo(raio / Math.tan(Math.PI / 4), 5);
  });

  it('recusa modelo sem volume em vez de devolver distância zero ou infinita', () => {
    expect(() => frameModel({ size: { x: 0, y: 0, z: 0 }, fov: 35, aspect: 1 })).toThrowError(
      /volume/,
    );
  });

  it('recusa campo de visão impossível', () => {
    expect(() => frameModel({ size: cube, fov: 0, aspect: 1 })).toThrowError(/campo de visão/);
    expect(() => frameModel({ size: cube, fov: 180, aspect: 1 })).toThrowError(/campo de visão/);
  });

  it('recusa proporção não positiva', () => {
    expect(() => frameModel({ size: cube, fov: 35, aspect: 0 })).toThrowError(/proporção/);
  });
});
