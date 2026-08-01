export interface IntroOptions {
  durationMs: number;
  /** Multiplicador da distância da câmera no instante zero. */
  startScale: number;
  startRotation: number;
  targetRotation: number;
  /** Fração da entrada em que a rotação já chegou ao destino. */
  settleAt: number;
  idleAmplitude: number;
  idlePeriodMs: number;
}

export interface IntroState {
  /** Multiplica a distância de enquadramento. 1 = posição final. */
  distanceScale: number;
  /** Rotação em torno do eixo vertical, em radianos. */
  rotation: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Desaceleração na chegada. Aproximação linear parece corte, não movimento. */
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * Onde a câmera e o objeto estão em cada instante.
 *
 * A entrada é uma aproximação: a câmera começa afastada e chega à distância de
 * enquadramento enquanto o objeto gira até uma posição exata. Depois disso o
 * objeto não gira mais — apenas balança poucos graus em torno dessa posição.
 *
 * A rotação termina ANTES da câmera (`settleAt`), e isso é o ponto do
 * movimento: o objeto precisa já estar posto quando a câmera se aproxima da
 * posição final, senão os dois chegam juntos e a entrada perde o sentido de
 * "assentar".
 *
 * O balanço só começa quando a câmera chega, e parte exatamente da posição
 * final — `sin(0) = 0` —, então não há salto entre a entrada e o repouso.
 */
export function introMotion(elapsedMs: number, options: IntroOptions): IntroState {
  const {
    durationMs,
    startScale,
    startRotation,
    targetRotation,
    settleAt,
    idleAmplitude,
    idlePeriodMs,
  } = options;

  const elapsed = Math.max(elapsedMs, 0);

  const approach = easeOut(clamp(elapsed / durationMs, 0, 1));
  const distanceScale = startScale + (1 - startScale) * approach;

  const spin = easeOut(clamp(elapsed / (durationMs * settleAt), 0, 1));
  const settled = startRotation + (targetRotation - startRotation) * spin;

  // O balanço só começa quando a CÂMERA chega, não quando a rotação assenta.
  // Entre um e outro o objeto fica parado na posição exata — é essa pausa que
  // faz a entrada terminar em "assentou" e não em "continua se mexendo".
  if (elapsed < durationMs) {
    return { distanceScale, rotation: settled };
  }

  const idlePhase = ((elapsed - durationMs) / idlePeriodMs) * Math.PI * 2;

  return {
    distanceScale,
    rotation: targetRotation + Math.sin(idlePhase) * idleAmplitude,
  };
}
