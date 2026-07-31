import type { Localized } from '../i18n/locales.ts';

export interface ProfileLink {
  id: string;
  label: string;
  href: string;
}

/** Identidade e apresentação. Seção 01 e 02 da home. */
export const profile = {
  name: 'Henrique Artur',

  role: {
    'pt-BR': 'Tech Lead',
    en: 'Tech Lead',
  } satisfies Localized,

  location: {
    'pt-BR': 'Fortaleza, Ceará — Brasil',
    en: 'Fortaleza, Ceará — Brazil',
  } satisfies Localized,

  email: 'contato@henriqueartur.com',

  tagline: {
    'pt-BR':
      'Construo sistemas que resolvem o problema certo — com arquitetura, qualidade e atenção a quem usa.',
    en: 'I build systems that solve the right problem — with architecture, quality, and care for the people using them.',
  } satisfies Localized,

  summary: [
    {
      'pt-BR':
        'Tech Lead na Sunne Energias Renováveis. São quase 8 anos de experiência profissional e mais de 6 liderando times e projetos, atravessando domínios que vão de energia renovável e saúde mental a telecomunicações, educação e jogos.',
      en: 'Tech Lead at Sunne Energias Renováveis. Nearly 8 years of professional experience and more than 6 leading teams and projects, across domains ranging from renewable energy and mental health to telecom, education, and games.',
    },
    {
      'pt-BR':
        'Minha formação em Sistemas e Mídias Digitais pela UFC me deu uma base dupla — design, interação humano-computador e programação. É o que me permite atuar dos dois lados: arquitetar o sistema e cuidar de como ele é usado.',
      en: 'My degree in Digital Systems and Media at UFC gave me a dual foundation — design, human-computer interaction, and programming. That is what lets me work on both sides: architecting the system and shaping how it is used.',
    },
    {
      'pt-BR':
        'Design, qualidade e assertividade definem como eu trabalho. Valorizo ambiente colaborativo, compartilhamento de conhecimento e código aberto — o archwarden, um linter de arquitetura para TypeScript escrito em Rust, nasceu da vontade de transformar convenção em regra verificável.',
      en: 'Design, quality, and decisiveness define how I work. I value collaborative environments, knowledge sharing, and open source — archwarden, an architecture linter for TypeScript written in Rust, came out of wanting to turn convention into a rule a machine can check.',
    },
  ] satisfies Localized[],

  links: [
    { id: 'github', label: 'GitHub', href: 'https://github.com/HenriqueArtur' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/henriqueartur/' },
    { id: 'email', label: 'contato@henriqueartur.com', href: 'mailto:contato@henriqueartur.com' },
  ] satisfies ProfileLink[],
} as const;
