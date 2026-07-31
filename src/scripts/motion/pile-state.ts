export interface CardPileState {
  /** Deslocamento vertical a aplicar, sempre <= 0. */
  offset: number;
  /** Quantos cartões ainda estão sobre este na pilha. Alimenta escala e giro. */
  depth: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Onde cada cartão está enquanto a pilha se desfaz.
 *
 * O movimento não é "cada cartão vai do topo até o seu lugar". É uma escada: a
 * pilha inteira desce um slot por vez, e a cada descida o cartão do topo fica
 * para trás, no lugar dele.
 *
 *   [123456] _ _ _ _ _   →   1 [23456] _ _ _ _   →   1 2 [3456] _ _ _
 *
 * A diferença importa: no primeiro modelo os cartões se cruzam no ar, cada um
 * seguindo seu próprio caminho; aqui eles viajam juntos, como uma pilha real.
 *
 * Isto não é expressável em CSS. Cada cartão precisaria de keyframes próprios
 * (o cartão 6 passa por cinco slots, o cartão 2 por um) e todos precisariam
 * compartilhar exatamente a mesma linha do tempo.
 *
 * `tops` são as posições de layout dos slots, medidas — não estimadas.
 */
export function pileState(progress: number, tops: readonly number[]): CardPileState[] {
  const count = tops.length;
  if (count === 0) return [];

  // Progresso vira posição contínua na escada: 0 = pilha no slot 0,
  // count = pilha desfeita.
  const step = clamp(progress, 0, 1) * count;
  const landed = Math.floor(step);
  const between = step - landed;

  return tops.map((own, index) => {
    // Onde a pilha está agora, interpolando entre um slot e o próximo.
    const from = tops[Math.min(landed, count - 1)] as number;
    const to = tops[Math.min(landed + 1, count - 1)] as number;
    const pile = from + (to - from) * between;

    // Um cartão nunca é empurrado para baixo do próprio slot: assim que a pilha
    // alcança a posição dele, ele fica.
    const position = Math.min(pile, own);

    return {
      offset: position - own,
      depth: Math.max(0, index - step),
    };
  });
}

/**
 * Quanto da lista já passou pela tela, de 0 a 1.
 *
 * A faixa começa quando o topo da lista chega a 75% da altura da janela — a
 * pilha precisa estar visível antes de começar a se desfazer — e termina quando
 * a lista inteira passou.
 */
export function pileProgress(
  rect: { top: number; height: number },
  viewportHeight: number,
): number {
  if (rect.height <= 0) return 1;

  const start = viewportHeight * 0.75;
  return clamp((start - rect.top) / rect.height, 0, 1);
}
