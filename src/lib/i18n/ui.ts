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
  newTab: {
    'pt-BR': 'abre em nova aba',
    en: 'opens in a new tab',
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

  openSourceLabel: { 'pt-BR': 'Open source', en: 'Open source' },
  openSourceTitle: {
    'pt-BR': 'O que eu mantenho no aberto',
    en: 'What I maintain in the open',
  },

  timelineLabel: { 'pt-BR': 'Trajetória', en: 'Career' },
  timelineTitle: { 'pt-BR': 'Por onde eu passei', en: 'Where I have been' },

  educationLabel: { 'pt-BR': 'Formação', en: 'Education' },
  educationTitle: { 'pt-BR': 'Onde eu estudei', en: 'Where I studied' },

  // Anotações de margem. Curtas de propósito: são lembretes a lápis ao lado do
  // título, não subtítulos.
  noteImpact: {
    'pt-BR': 'resultado antes de responsabilidade',
    en: 'outcome before responsibility',
  },
  noteProjects: {
    'pt-BR': 'sistemas, não empregadores',
    en: 'systems, not employers',
  },
  noteTimeline: {
    'pt-BR': 'a cronologia, para quem procura por ela',
    en: 'the chronology, for those who look for it',
  },

  blogLabel: { 'pt-BR': 'Blog', en: 'Blog' },
  blogTitle: { 'pt-BR': 'Blog', en: 'Blog' },
  blogDescription: {
    'pt-BR': 'Notas sobre arquitetura, qualidade e o ofício de construir software.',
    en: 'Notes on architecture, quality, and the craft of building software.',
  },
  blogEmpty: {
    'pt-BR': 'Ainda não há posts publicados.',
    en: 'No posts published yet.',
  },
  blogAll: { 'pt-BR': 'Todos os posts', en: 'All posts' },
  blogBack: { 'pt-BR': 'Voltar ao blog', en: 'Back to the blog' },
  blogHome: { 'pt-BR': 'Início', en: 'Home' },
  publishedOn: { 'pt-BR': 'Publicado em', en: 'Published on' },
  tagsLabel: { 'pt-BR': 'Marcadores', en: 'Tags' },
  postsInYear: { 'pt-BR': 'Posts de', en: 'Posts from' },

  noTranslationTitle: {
    'pt-BR': 'Este post ainda não foi traduzido',
    en: 'This post has not been translated yet',
  },
  noTranslationBody: {
    'pt-BR': 'Ele existe em inglês. Você pode lê-lo no idioma original:',
    en: 'It exists in Portuguese. You can read it in the original language:',
  },

  contactLabel: { 'pt-BR': 'Contato', en: 'Contact' },
  contactTitle: { 'pt-BR': 'Vamos conversar', en: 'Let’s talk' },
  contactLead: {
    'pt-BR':
      'Aberto a conversas sobre arquitetura, liderança técnica e problemas difíceis. O caminho mais direto é o e-mail.',
    en: 'Open to conversations about architecture, technical leadership, and hard problems. Email is the most direct way.',
  },
} satisfies Record<string, Localized>;
