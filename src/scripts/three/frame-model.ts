export interface FrameOptions {
  /** Dimensões da caixa que envolve o modelo. */
  size: { x: number; y: number; z: number };
  /** Campo de visão vertical da câmera, em graus. */
  fov: number;
  /** Largura dividida por altura do canvas. */
  aspect: number;
  /** Folga em volta do modelo. 1 = colado nas bordas. */
  padding?: number;
  /** Elevação da câmera em radianos. 0 = na altura do objeto. */
  elevation?: number;
}

/**
 * A que distância a câmera precisa estar para o modelo caber inteiro.
 *
 * Enquadra pela CAIXA do modelo, e não pela esfera que a contém.
 *
 * A versão anterior usava a esfera porque o objeto girava sem parar, e nesse
 * caso os cantos varrem um círculo — a esfera é a única medida segura. Hoje ele
 * assenta numa posição e só balança poucos graus, então a esfera passou a
 * reservar espaço para um movimento que não acontece mais: no terrário, ela é
 * mais que o dobro da altura real, e a sobra aparecia como vazio no topo do
 * quadro.
 *
 * A largura usa a maior dimensão do plano horizontal, porque o balanço é em
 * torno do eixo vertical e troca X por Z conforme oscila.
 *
 * A ELEVAÇÃO da câmera entra na conta da altura. Vista de cima, a silhueta
 * vertical do objeto não é a altura dele: é a altura projetada mais parte da
 * profundidade. Ignorar isso enquadra pela altura e corta a base — que foi
 * exatamente o que aconteceu quando a câmera passou a olhar de cima.
 *
 * A armadilha que continua valendo: enquadrar só pela altura fica perfeito no
 * desktop e corta as laterais no celular, onde a proporção é retrato.
 */
export function frameModel(options: FrameOptions): number {
  const { size, fov, aspect, padding = 1.2, elevation = 0 } = options;

  if (fov <= 0 || fov >= 180) {
    throw new Error(`campo de visão precisa estar entre 0 e 180 graus, recebi ${fov}`);
  }
  if (aspect <= 0) {
    throw new Error(`proporção precisa ser positiva, recebi ${aspect}`);
  }

  const halfHeight = size.y / 2;
  const halfWidth = Math.max(size.x, size.z) / 2;

  if (halfHeight === 0 && halfWidth === 0) {
    throw new Error('modelo sem volume: a caixa que o envolve tem tamanho zero');
  }

  // Altura da silhueta vista de uma câmera inclinada.
  const seenHeight = halfHeight * Math.cos(elevation) + halfWidth * Math.sin(elevation);

  const verticalFov = (fov * Math.PI) / 180;
  const distanceForHeight = seenHeight / Math.tan(verticalFov / 2);

  // Numa tela mais alta que larga, é a largura que limita.
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
  const distanceForWidth = halfWidth / Math.tan(horizontalFov / 2);

  return Math.max(distanceForHeight, distanceForWidth) * padding;
}
