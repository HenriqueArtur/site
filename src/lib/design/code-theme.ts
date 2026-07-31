import { tokens } from './tokens.ts';

/**
 * Tema de destaque de sintaxe, escrito a partir da nossa paleta.
 *
 * Por que não um tema pronto: medi `github-light`, `light-plus`, `min-light`,
 * `vitesse-light` e `catppuccin-latte` contra o nosso fundo, e **todos**
 * reprovam em 4.5:1 em pelo menos dois tokens. O melhor deles, `github-light`,
 * chega a 3.68 no pior caso — e mesmo sobre branco puro passa raspando (4.57).
 * Temas de sintaxe são desenhados para parecerem bonitos, não para atingirem
 * contraste AA, e isso não aparece até alguém medir.
 *
 * As cores aqui saem dos mesmos tokens do resto do site, e as poucas que não
 * existiam foram escolhidas no mesmo registro discreto. Todas são verificadas
 * por code-theme.spec.ts contra os dois fundos possíveis.
 */
const { color } = tokens;

/** Cores de sintaxe que não existem na paleta do site, no mesmo registro sóbrio. */
const syntax = {
  string: '#1F5C3D',
  number: '#8A4B08',
  function: '#1F4E79',
  type: '#6B3FA0',
} as const;

export const codeTheme = {
  name: 'blueprint',
  type: 'light' as const,
  colors: {
    'editor.background': color.paperDeep,
    'editor.foreground': color.ink,
  },
  settings: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: color.inkSoft, fontStyle: 'italic' },
    },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'keyword.control',
        'keyword.operator.new',
        'variable.language',
        'constant.language',
      ],
      settings: { foreground: color.accentDeep },
    },
    {
      scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'],
      settings: { foreground: syntax.string },
    },
    {
      scope: ['constant.numeric', 'constant.character', 'constant.other'],
      settings: { foreground: syntax.number },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: syntax.function },
    },
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'support.type',
        'support.class',
        'entity.other.attribute-name',
      ],
      settings: { foreground: syntax.type },
    },
    {
      scope: ['variable', 'meta.definition.variable', 'punctuation', 'meta.brace'],
      settings: { foreground: color.ink },
    },
  ],
};

/** Toda cor de primeiro plano do tema, para o teste de contraste percorrer. */
export const codeThemeForegrounds: string[] = [
  codeTheme.colors['editor.foreground'],
  ...codeTheme.settings.map((entry) => entry.settings.foreground),
];
