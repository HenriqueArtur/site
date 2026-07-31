export interface FrameOptions {
  /** Dimensões da caixa que envolve o modelo. */
  size: { x: number; y: number; z: number };
  /** Campo de visão vertical da câmera, em graus. */
  fov: number;
  /** Largura dividida por altura do canvas. */
  aspect: number;
  /** Folga em volta do modelo. 1 = colado nas bordas. */
  padding?: number;
}

/**
 * A que distância a câmera precisa estar para o modelo caber inteiro.
 *
 * Duas armadilhas que esta função existe para evitar:
 *
 * 1. **Enquadrar só pela altura.** Fica perfeito no desktop e corta as laterais
 *    no celular, onde a proporção é retrato. Aqui a largura entra na conta.
 * 2. **Enquadrar pela maior aresta.** O objeto gira; enquadrado pela aresta, os
 *    cantos saem do quadro ao passar por 45°. Por isso a conta usa a esfera que
 *    contém a caixa, e não a caixa.
 */
export function frameModel(options: FrameOptions): number {
  const { size, fov, aspect, padding = 1.2 } = options;

  if (fov <= 0 || fov >= 180) {
    throw new Error(`campo de visão precisa estar entre 0 e 180 graus, recebi ${fov}`);
  }
  if (aspect <= 0) {
    throw new Error(`proporção precisa ser positiva, recebi ${aspect}`);
  }

  const radius = Math.hypot(size.x, size.y, size.z) / 2;
  if (radius === 0) {
    throw new Error('modelo sem volume: a caixa que o envolve tem tamanho zero');
  }

  const verticalFov = (fov * Math.PI) / 180;
  const distanceForHeight = radius / Math.tan(verticalFov / 2);

  // Numa tela mais alta que larga, é a largura que limita.
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
  const distanceForWidth = radius / Math.tan(horizontalFov / 2);

  return Math.max(distanceForHeight, distanceForWidth) * padding;
}
