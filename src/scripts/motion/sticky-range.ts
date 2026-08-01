export interface StickyRangeInput {
  /** Topo da caixa que contém o elemento grudado, em coordenadas do documento. */
  boxTop: number;
  /** Altura natural dessa caixa, sem o alcance. */
  boxHeight: number;
  /** Fim da seção até onde o elemento deve continuar grudado. */
  sectionBottom: number;
  /** Folga além do fim da seção, para soltar um pouco mais tarde. */
  extra?: number;
}

/**
 * Quanto a caixa precisa se estender para o elemento continuar grudado.
 *
 * `position: sticky` só se move dentro do bloco que contém o elemento, então o
 * alcance é a distância entre o fim natural dessa caixa e o fim da seção onde o
 * elemento deve parar de acompanhar.
 *
 * É medido em vez de fixo porque a altura da seção depende do texto — e o texto
 * muda de tamanho entre português e inglês. Um valor cravado acertaria num
 * idioma e erraria no outro.
 */
export function stickyRange({
  boxTop,
  boxHeight,
  sectionBottom,
  extra = 0,
}: StickyRangeInput): number {
  return Math.max(0, sectionBottom + extra - boxTop - boxHeight);
}
