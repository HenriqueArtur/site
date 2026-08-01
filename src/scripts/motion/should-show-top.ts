export interface TopButtonInput {
  scrollY: number;
  /** Posição, em coordenadas do documento, a partir da qual o botão aparece. */
  threshold: number;
  /** Estado atual — a decisão depende dele. */
  visible: boolean;
  /** Folga para o botão não sumir ao voltar de leve. */
  hysteresis?: number;
}

/**
 * O botão de voltar ao topo deve estar visível?
 *
 * A resposta depende do estado atual, e não só da rolagem: aparecer e sumir
 * usam limiares diferentes. Sem essa folga, rolar de leve em torno do ponto de
 * corte faz o botão piscar — e o olho percebe o pisca antes de perceber o
 * botão.
 *
 * A folga vale só para SEGURAR o botão visível, nunca para antecipá-lo: quem
 * ainda não passou do limiar não o vê, por mais perto que esteja.
 */
export function shouldShowTop({
  scrollY,
  threshold,
  visible,
  hysteresis = 80,
}: TopButtonInput): boolean {
  if (scrollY <= 0) return false;

  return visible ? scrollY > threshold - hysteresis : scrollY > threshold;
}
