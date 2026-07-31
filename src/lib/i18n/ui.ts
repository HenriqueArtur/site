import type { Localized } from './locales.ts';

/**
 * Textos de interface. Tudo que não é conteúdo profissional vive aqui.
 *
 * O tipo é `Record<string, Localized>`, então o TypeScript recusa uma chave que
 * exista em um idioma e falte no outro — o erro mais comum em i18n feito à mão.
 */
export const ui = {
  skipToContent: {
    'pt-BR': 'Pular para o conteúdo',
    en: 'Skip to content',
  },
  contactLinks: {
    'pt-BR': 'Links de contato',
    en: 'Contact links',
  },
  languageLabel: {
    'pt-BR': 'Idioma',
    en: 'Language',
  },
  switchToPortuguese: {
    'pt-BR': 'Português',
    en: 'Português',
  },
  switchToEnglish: {
    'pt-BR': 'English',
    en: 'English',
  },

  aboutLabel: { 'pt-BR': 'Sobre', en: 'About' },
  aboutTitle: { 'pt-BR': 'Quem eu sou', en: 'Who I am' },

  impactLabel: { 'pt-BR': 'Impacto', en: 'Impact' },
  impactTitle: {
    'pt-BR': 'O que mudou porque eu estava lá',
    en: 'What changed because I was there',
  },

  projectsLabel: { 'pt-BR': 'Construído', en: 'Built' },
  projectsTitle: {
    'pt-BR': 'Sistemas que eu ajudei a existir',
    en: 'Systems I helped bring into existence',
  },

  stackLabel: { 'pt-BR': 'Stack', en: 'Stack' },
  stackTitle: { 'pt-BR': 'Com o que eu trabalho', en: 'What I work with' },
  stackPast: { 'pt-BR': 'Já trabalhei com', en: 'Previously worked with' },

  openSourceLabel: { 'pt-BR': 'Open source', en: 'Open source' },
  openSourceTitle: {
    'pt-BR': 'O que eu mantenho no aberto',
    en: 'What I maintain in the open',
  },

  timelineLabel: { 'pt-BR': 'Trajetória', en: 'Career' },
  timelineTitle: { 'pt-BR': 'Por onde eu passei', en: 'Where I have been' },

  educationLabel: { 'pt-BR': 'Formação', en: 'Education' },
  educationTitle: { 'pt-BR': 'Onde eu estudei', en: 'Where I studied' },

  contactLabel: { 'pt-BR': 'Contato', en: 'Contact' },
  contactTitle: { 'pt-BR': 'Vamos conversar', en: 'Let’s talk' },
  contactLead: {
    'pt-BR':
      'Aberto a conversas sobre arquitetura, liderança técnica e problemas difíceis. O caminho mais direto é o e-mail.',
    en: 'Open to conversations about architecture, technical leadership, and hard problems. Email is the most direct way.',
  },
} satisfies Record<string, Localized>;
