import type { Localized } from '../i18n/locales.ts';

export interface TimelineRole {
  title: Localized;
  /** AAAA-MM. */
  start: string;
  /** AAAA-MM, ou null quando é o cargo atual. */
  end: string | null;
}

export interface TimelineEntry {
  id: string;
  company: string;
  start: string;
  end: string | null;
  note?: Localized;
  roles: TimelineRole[];
}

/**
 * Seção 08 da home — linha do tempo enxuta.
 *
 * Aqui vai empresa, cargo e período, e só. As descrições ricas vivem em
 * impact.ts e projects.ts, porque o recado do site é o que foi feito, não
 * por onde se passou. Esta seção existe porque quem recruta procura a
 * cronologia, e escondê-la seria hostil com quem lê.
 *
 * Ordem decrescente por início.
 */
export const timeline: TimelineEntry[] = [
  {
    id: 'rede-icc',
    company: 'Rede ICC Saúde',
    start: '2024-06',
    end: '2024-07',
    note: {
      'pt-BR': 'Contrato, em paralelo à Sunne.',
      en: 'Contract work, alongside Sunne.',
    },
    roles: [
      {
        title: { 'pt-BR': 'Consultor de Tecnologia', en: 'Technology Consultant' },
        start: '2024-06',
        end: '2024-07',
      },
    ],
  },
  {
    id: 'sunne',
    company: 'Sunne Energias Renováveis',
    start: '2024-02',
    end: null,
    roles: [
      {
        title: { 'pt-BR': 'Tech Lead', en: 'Tech Lead' },
        start: '2024-05',
        end: null,
      },
      {
        title: {
          'pt-BR': 'Desenvolvedor Fullstack Sênior',
          en: 'Senior Full-stack Developer',
        },
        start: '2024-02',
        end: '2024-05',
      },
    ],
  },
  {
    id: 'nosso-lar',
    company: 'Nosso Lar Hospital / Amar.Elo',
    start: '2023-01',
    end: '2023-12',
    note: {
      'pt-BR': 'A Amar.Elo era empresa do Nosso Lar e hoje se chama Thera.',
      en: 'Amar.Elo was a Nosso Lar company and is now called Thera.',
    },
    roles: [
      {
        title: { 'pt-BR': 'Tech Lead', en: 'Tech Lead' },
        start: '2023-07',
        end: '2023-12',
      },
      {
        title: { 'pt-BR': 'Desenvolvedor Full-stack', en: 'Full-stack Developer' },
        start: '2023-01',
        end: '2023-07',
      },
    ],
  },
  {
    id: 'bugaboo',
    company: 'Bugaboo Studio',
    start: '2022-04',
    end: '2023-01',
    roles: [
      {
        title: { 'pt-BR': 'Desenvolvedor Full-stack', en: 'Full-stack Developer' },
        start: '2022-04',
        end: '2023-01',
      },
    ],
  },
  {
    id: 'newave',
    company: 'neWave Telecom',
    start: '2021-03',
    end: '2022-04',
    roles: [
      {
        title: {
          'pt-BR': 'Analista de Desenvolvimento III',
          en: 'Development Analyst III',
        },
        start: '2022-01',
        end: '2022-04',
      },
      {
        title: {
          'pt-BR': 'Analista de Desenvolvimento II',
          en: 'Development Analyst II',
        },
        start: '2021-07',
        end: '2021-12',
      },
      {
        title: {
          'pt-BR': 'Analista de Desenvolvimento Jr. I',
          en: 'Junior Development Analyst I',
        },
        start: '2021-03',
        end: '2021-06',
      },
    ],
  },
  {
    id: 'cosmonkeys',
    company: 'CosMonkeys',
    start: '2020-11',
    end: '2022-02',
    roles: [
      {
        title: {
          'pt-BR': 'Cofundador, Produtor e Desenvolvedor',
          en: 'Co-founder, Producer and Developer',
        },
        start: '2020-11',
        end: '2022-02',
      },
    ],
  },
  {
    id: 'tgd',
    company: 'The Guardian Dog Studio',
    start: '2019-10',
    end: '2021-03',
    roles: [
      {
        title: { 'pt-BR': 'Produtor e Desenvolvedor', en: 'Producer and Developer' },
        start: '2020-10',
        end: '2021-03',
      },
      {
        title: {
          'pt-BR': 'Cofundador e Produtor Executivo',
          en: 'Co-founder and Executive Producer',
        },
        start: '2019-10',
        end: '2020-10',
      },
    ],
  },
  {
    id: 'container',
    company: 'Container Digital Jr.',
    start: '2018-08',
    end: '2019-10',
    roles: [
      {
        title: { 'pt-BR': 'Gerente de Projetos', en: 'Project Manager' },
        start: '2019-05',
        end: '2019-10',
      },
      {
        title: { 'pt-BR': 'Desenvolvedor Frontend', en: 'Front-end Developer' },
        start: '2018-12',
        end: '2019-05',
      },
      {
        title: { 'pt-BR': 'Trainee', en: 'Trainee' },
        start: '2018-08',
        end: '2018-12',
      },
    ],
  },
];
