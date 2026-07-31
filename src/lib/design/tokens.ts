/**
 * Fonte única de verdade do design system.
 *
 * As custom properties do CSS são geradas a partir daqui (ver css-variables.ts),
 * então não existe uma segunda cópia da paleta num arquivo .css para sair de
 * sincronia. Os testes em tokens.spec.ts verificam contraste WCAG sobre estes
 * mesmos valores.
 */
export const tokens = {
  color: {
    /** Fundo principal: off-white quente, papel. */
    paper: '#F7F4ED',
    /** Fundo alternado, blocos e cartões. */
    paperDeep: '#EDE6D8',
    /** Grade do blueprint. Decorativa: não atinge 3:1, e não deve carregar informação. */
    line: '#C4B9A4',
    /** Grade de fundo mais sutil ainda. */
    lineSoft: '#DED5C2',
    /** Borda que delimita conteúdo ou componente. Atinge 3:1. */
    lineStrong: '#8F8166',
    /** Texto principal: marrom quase preto. */
    ink: '#2A241C',
    /** Texto secundário, legendas, anotações. */
    inkSoft: '#5B5145',
    /** Laranja de destaque. Para borda, ícone e preenchimento — não para texto. */
    accent: '#E2571E',
    /** Laranja escuro. Para texto e link, onde 4.5:1 é obrigatório. */
    accentDeep: '#A93C10',
  },

  font: {
    /** Títulos. Slab serif, vocabulário de rótulo industrial. */
    display: "'Zilla Slab', Rockwell, Georgia, serif",
    /** Corpo. Serifada desenhada para tela. */
    body: "'Source Serif 4', Georgia, 'Times New Roman', serif",
    /** Anotações, rótulos, números de seção. */
    mono: "'IBM Plex Mono', ui-monospace, 'Cascadia Mono', Menlo, monospace",
  },

  /** Escala tipográfica em rem. Base 1.0625rem = 17px. */
  fontSize: {
    xs: '0.8125rem',
    sm: '0.9375rem',
    base: '1.0625rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '1.875rem',
    '3xl': '2.375rem',
    '4xl': '3rem',
  },

  lineHeight: {
    tight: '1.15',
    snug: '1.3',
    normal: '1.65',
  },

  /** Grade de 8px. O grid do blueprint usa os mesmos múltiplos. */
  space: {
    '1': '0.5rem',
    '2': '1rem',
    '3': '1.5rem',
    '4': '2rem',
    '6': '3rem',
    '8': '4rem',
    '12': '6rem',
    '16': '8rem',
  },

  /** Nada arredondado. Existe para deixar a decisão explícita, não implícita. */
  radius: {
    none: '0',
  },

  layout: {
    /** Largura de leitura confortável para texto longo. */
    measure: '68ch',
    /** Largura máxima do conteúdo. */
    maxWidth: '72rem',
    /** Módulo da grade de fundo. */
    gridUnit: '8px',
    gridMajor: '64px',
  },
} as const;
