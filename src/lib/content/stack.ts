import type { Localized } from '../i18n/locales.ts';

export interface StackGroup {
  id: string;
  label: Localized;
  items: string[];
}

/**
 * Seção 06 da home.
 *
 * Separado entre o que uso hoje e o que já usei: listar tudo junto faria uma
 * parede de logos que não informa nada. O grupo `past` é honesto sobre o que
 * está no passado em vez de inflar a lista atual.
 */
export const stack: { current: StackGroup[]; past: string[] } = {
  current: [
    {
      id: 'languages',
      label: { 'pt-BR': 'Linguagens', en: 'Languages' },
      items: ['TypeScript', 'JavaScript', 'Rust', 'Shell Script', 'SQL'],
    },
    {
      id: 'backend',
      label: { 'pt-BR': 'Back-end', en: 'Back-end' },
      items: ['Node.js', 'APIs REST', 'Microsserviços'],
    },
    {
      id: 'frontend',
      label: { 'pt-BR': 'Front-end', en: 'Front-end' },
      items: ['React', 'Astro', 'HTML semântico', 'CSS', 'Acessibilidade'],
    },
    {
      id: 'data',
      label: { 'pt-BR': 'Dados', en: 'Data' },
      items: ['PostgreSQL', 'MongoDB', 'Redis'],
    },
    {
      id: 'infra',
      label: { 'pt-BR': 'Infraestrutura', en: 'Infrastructure' },
      items: ['Google Cloud', 'AWS', 'Docker', 'Linux', 'Cloudflare', 'CI/CD', 'GitHub Actions'],
    },
    {
      id: 'practices',
      label: { 'pt-BR': 'Práticas', en: 'Practices' },
      items: [
        'TDD',
        'Code review',
        'Arquitetura',
        'Observabilidade',
        'Metodologias ágeis',
        'IA aplicada a desenvolvimento',
      ],
    },
  ],

  past: [
    'Flutter',
    'Firebase',
    'Vue.js',
    'Nuxt.js',
    'Elixir',
    'Go',
    'PHP',
    'WordPress',
    'Strapi',
    'MySQL',
    'Unity3D',
    'C#',
    'Figma',
  ],
};
