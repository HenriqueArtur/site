import type { Localized } from '../i18n/locales.ts';

export interface Project {
  id: string;
  name: Localized;
  /** Onde foi construído. Contexto, não protagonista. */
  context: string;
  description: Localized;
  tech: string[];
}

/**
 * Seção 04 da home — sistemas, não empregadores.
 *
 * A empresa aparece como contexto de uma linha; o que ocupa espaço é o que o
 * sistema faz.
 */
export const projects: Project[] = [
  {
    id: 'energy-credits',
    name: {
      'pt-BR': 'Plataforma de créditos de energia',
      en: 'Energy credit platform',
    },
    context: 'Sunne Energias Renováveis',
    description: {
      'pt-BR':
        'Gestão de usinas e de unidades consumidoras de créditos de energia, incluindo aluguel e administração de placas solares, e a plataforma de venda de energia.',
      en: 'Management of power plants and of the consumer units receiving energy credits, including solar panel rental and administration, plus the energy sales platform.',
    },
    tech: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'AWS', 'GCP'],
  },
  {
    id: 'mental-health',
    name: {
      'pt-BR': 'Atendimento psicológico empresarial',
      en: 'Corporate psychological care',
    },
    context: 'Nosso Lar Hospital / Amar.Elo (hoje Thera)',
    description: {
      'pt-BR':
        'Aplicativo mobile e backoffice para acompanhamento psicológico corporativo, do zero ao lançamento, com integração ao ecossistema hospitalar e a ERPs.',
      en: 'Mobile app and back office for corporate psychological follow-up, from zero to launch, integrated with the hospital ecosystem and with ERPs.',
    },
    tech: ['Flutter', 'TypeScript', 'Node.js', 'Firebase', 'GCP'],
  },
  {
    id: 'omnichannel',
    name: {
      'pt-BR': 'Plataforma Omnichannel',
      en: 'Omnichannel platform',
    },
    context: 'neWave Telecom',
    description: {
      'pt-BR':
        'Atendimento unificado com integração de WhatsApp via BSP e de ERPs, em arquitetura de microsserviços, com migração do código legado em paralelo.',
      en: 'Unified customer service with WhatsApp integration through a BSP and ERP integrations, on a microservice architecture, with legacy code migration running alongside.',
    },
    tech: ['Node.js', 'React', 'PostgreSQL', 'Redis', 'AWS', 'Linux'],
  },
  {
    id: 'sistema-s',
    name: {
      'pt-BR': 'Sistemas para o Sistema S',
      en: 'Systems for the Sistema S network',
    },
    context: 'Bugaboo Studio',
    description: {
      'pt-BR':
        'Sistemas sob medida para FIEC, SENAI, SESI e IEL — aplicações web e APIs, com gerenciamento dos próprios servidores.',
      en: 'Custom systems for FIEC, SENAI, SESI, and IEL — web applications and APIs, including running the servers behind them.',
    },
    tech: ['Node.js', 'TypeScript', 'Strapi', 'PostgreSQL', 'Docker', 'Linux'],
  },
];
