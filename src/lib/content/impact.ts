import type { Localized } from '../i18n/locales.ts';

export interface Achievement {
  id: string;
  /** Número que resume o resultado. Ausente quando o resultado não é quantificável. */
  metric?: Localized;
  title: Localized;
  description: Localized;
}

/**
 * Seção 03 da home — a mais importante da página.
 *
 * Resultado antes de responsabilidade: cada item responde "o que mudou por
 * causa disso", não "o que estava no meu cargo".
 */
export const impact: Achievement[] = [
  {
    id: 'infra-cost',
    metric: { 'pt-BR': '−60%', en: '−60%' },
    title: {
      'pt-BR': 'Custo de infraestrutura',
      en: 'Infrastructure cost',
    },
    description: {
      'pt-BR':
        'Projetos espalhados por Vercel, Render, DigitalOcean e AWS, unificados no Google Cloud — com mais autonomia para os times.',
      en: 'Projects scattered across Vercel, Render, DigitalOcean, and AWS, consolidated into Google Cloud — with more autonomy for the teams.',
    },
  },
  {
    id: 'cycle-time',
    metric: { 'pt-BR': '1 semana → 1 dia', en: '1 week → 1 day' },
    title: {
      'pt-BR': 'Cycle time de desenvolvimento',
      en: 'Development cycle time',
    },
    description: {
      'pt-BR': 'Jira, CI/CD e code review. Não foi ferramenta nova: foi tirar espera do caminho.',
      en: 'Jira, CI/CD, and code review. Not a new tool — just waiting removed from the path.',
    },
  },
  {
    id: 'zero-to-launch',
    title: {
      'pt-BR': 'Produto do zero ao lançamento',
      en: 'Product from zero to launch',
    },
    description: {
      'pt-BR':
        'App mobile e backoffice de atendimento psicológico empresarial, do primeiro commit ao ar.',
      en: 'Mobile app and back office for corporate psychological care, from first commit to production.',
    },
  },
  {
    id: 'quality',
    title: {
      'pt-BR': 'Qualidade como rotina, não como campanha',
      en: 'Quality as routine, not as a campaign',
    },
    description: {
      'pt-BR':
        'Testes automatizados e alertas reestruturados no Papertrail: o problema aparece antes de ser relatado.',
      en: 'Automated tests and reworked Papertrail alerts: the problem shows up before it is reported.',
    },
  },
  {
    id: 'team',
    title: {
      'pt-BR': 'Time que cresce junto',
      en: 'A team that grows together',
    },
    description: {
      'pt-BR':
        'Pair programming, 1:1, workshops e IA no fluxo do time. Mais encontros internos de conteúdo.',
      en: 'Pair programming, one-on-ones, workshops, and AI in the team’s workflow. Plus internal knowledge sessions.',
    },
  },
  {
    id: 'internal-libs',
    title: {
      'pt-BR': 'Bibliotecas internas com paradigma funcional',
      en: 'Internal libraries with a functional paradigm',
    },
    description: {
      'pt-BR':
        'Componentes React, utilitários e framework de servidor — documentados para serem usados sem me perguntar.',
      en: 'React components, utilities, and a server framework — documented well enough to use without asking me.',
    },
  },
];
