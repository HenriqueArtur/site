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
        'Liderei a unificação de projetos espalhados por Vercel, Render, DigitalOcean e AWS em um único ambiente no Google Cloud. Mais de 60% de redução de custo e, tão importante quanto, mais autonomia para os times.',
      en: 'Led the consolidation of projects scattered across Vercel, Render, DigitalOcean, and AWS into a single Google Cloud environment. Over 60% cost reduction and — just as important — more autonomy for the teams.',
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
      'pt-BR':
        'Reduzido por boas práticas de Jira, CI/CD com GitHub Actions e code review consistente. Não foi uma ferramenta nova: foi tirar espera do meio do caminho.',
      en: 'Cut through disciplined Jira practices, CI/CD with GitHub Actions, and consistent code review. It was not a new tool — it was removing waiting from the middle of the path.',
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
        'Arquitetura e desenvolvimento de aplicativo mobile e backoffice para atendimento psicológico empresarial, do primeiro commit ao ar, com interlocução direta com a diretoria e a startup parceira.',
      en: 'Architecture and development of a mobile app and back office for corporate psychological care, from first commit to production, working directly with the board and the partner startup.',
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
        'Implantação de testes automatizados, monitoramento de qualidade e acompanhamento contínuo, reduzindo erros em produção. Junto, reestruturação de logs e alertas no Papertrail para que um problema fosse visto antes de ser relatado.',
      en: 'Automated tests, quality monitoring, and continuous follow-up, reducing production errors. Alongside it, a rework of logs and alerts in Papertrail so a problem would be seen before it was reported.',
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
        'Pair programming, 1:1, workshops e adoção de IA no fluxo de desenvolvimento. Promovi encontros internos de disseminação de conteúdo e treinamento prático com agentes.',
      en: 'Pair programming, one-on-ones, workshops, and adopting AI in the development workflow. I ran internal knowledge-sharing sessions and hands-on training with agents.',
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
        'Criação e manutenção de componentes React, utilitários e um framework de servidor, documentados o suficiente para que outra pessoa os use sem me perguntar.',
      en: 'Built and maintained React components, utilities, and a server framework — documented well enough that someone else can use them without asking me.',
    },
  },
];
