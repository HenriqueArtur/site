export interface ActiveHeadingInput {
  /**
   * Distância de cada título ao topo da janela, na ordem em que aparecem no
   * documento. Coordenadas de viewport, como `getBoundingClientRect().top`.
   */
  tops: readonly number[];
  /** Linha, medida do topo da janela, que decide qual título está atual. */
  line: number;
  /** A página chegou ao fim e não há mais o que rolar. */
  atEnd?: boolean;
}

/**
 * Índice do título que o leitor está lendo agora.
 *
 * A regra é o último título que já cruzou a linha: quem está lendo o quarto
 * parágrafo de uma seção continua naquela seção, mesmo com o título dela bem
 * acima da janela.
 *
 * Devolve `null` antes do primeiro título — a introdução não é uma seção, e
 * marcar a primeira ali acenderia o item errado durante toda a abertura.
 *
 * O caso `atEnd` é o que erra sem dar sinal: uma última seção curta pode nunca
 * empurrar o próprio título acima da linha, então rolar até o fim da página
 * deixaria o índice preso na penúltima. No fim do documento, o último vence.
 */
export function activeHeading({ tops, line, atEnd = false }: ActiveHeadingInput): number | null {
  if (tops.length === 0) return null;
  if (atEnd) return tops.length - 1;

  let active: number | null = null;

  // Sem `break`: a última posição que satisfaz é a resposta, e assim o
  // resultado não depende de os títulos chegarem ordenados.
  for (const [index, top] of tops.entries()) {
    if (top <= line) active = index;
  }

  return active;
}
