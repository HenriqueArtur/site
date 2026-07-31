/**
 * Que textura de fundo cada seção da home usa.
 *
 * A grade cobrindo a página inteira cansa a vista: vira ruído constante em vez
 * de referência. Aqui ela passa a ser um recurso rítmico — aparece, some, muda
 * de forma — e o leitor percebe que mudou de assunto antes mesmo de ler o
 * título.
 */
export const surfaces = ['grid', 'dots', 'plain', 'inverted'] as const;

export type Surface = (typeof surfaces)[number];

/**
 * A ordem aqui é a ordem da página, e os testes dependem disso: eles verificam
 * que nenhuma seção vizinha repete a textura.
 */
export const sectionSurfaces = {
  /** Texto corrido: liso, para a trama não competir com a leitura. */
  sobre: 'plain',
  /** Cartões com números: papel quadriculado, o lugar de anotar medida. */
  impacto: 'grid',
  /** Cartões de projeto: pontilhado, mais leve que a grade. */
  projetos: 'dots',
  /** Único bloco invertido da página. É o acento, e acento repetido não acentua. */
  'open-source': 'inverted',
  /** Linha do tempo sobre grade: cronologia desenhada em papel milimetrado. */
  trajetoria: 'grid',
  formacao: 'plain',
  contato: 'dots',
} as const satisfies Record<string, Surface>;
