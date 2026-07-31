export interface Box {
  /** Distância do topo do elemento ao topo da janela. */
  top: number;
  height: number;
}

/**
 * Índice do elemento cujo centro está mais próximo do centro da janela.
 *
 * Devolve `null` quando nenhum está visível — o chamador usa isso para apagar o
 * destaque em vez de deixá-lo preso no último elemento que passou.
 *
 * Existe separado do código que mexe no DOM porque é a única parte que pode
 * estar errada de um jeito difícil de ver: um destaque no cartão errado não
 * quebra nada, só fica sutilmente esquisito.
 */
export function mostCentered(boxes: readonly Box[], viewportHeight: number): number | null {
  const middle = viewportHeight / 2;

  let best: number | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const [index, box] of boxes.entries()) {
    const bottom = box.top + box.height;

    // Fora da tela por inteiro não concorre.
    if (bottom <= 0 || box.top >= viewportHeight) continue;

    const distance = Math.abs(box.top + box.height / 2 - middle);

    // `<` e não `<=`: empate fica com o primeiro, então o resultado não depende
    // da ordem em que os elementos foram lidos.
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }

  return best;
}
