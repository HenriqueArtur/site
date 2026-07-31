import type { Localized } from '../i18n/locales.ts';

export interface Degree {
  id: string;
  institution: string;
  title: Localized;
  /** AAAA-MM. */
  start: string;
  end: string;
  note?: Localized;
}

/** Seção 09 da home. Ordem decrescente por início. */
export const education: Degree[] = [
  {
    id: 'mba-usp',
    institution: 'MBA USP/Esalq',
    title: {
      'pt-BR': 'MBA em Engenharia de Software',
      en: 'MBA in Software Engineering',
    },
    start: '2024-05',
    end: '2026-01',
  },
  {
    id: 'ufc',
    institution: 'Universidade Federal do Ceará',
    title: {
      'pt-BR': 'Bacharelado em Sistemas e Mídias Digitais',
      en: 'Bachelor in Digital Systems and Media',
    },
    start: '2017-08',
    end: '2021-09',
    note: {
      'pt-BR':
        'Empresa júnior (Container Digital Jr. e The Guardian Dog Studio), monitoria e bolsas de pesquisa.',
      en: 'Junior enterprise (Container Digital Jr. and The Guardian Dog Studio), teaching assistantship, and research scholarships.',
    },
  },
];
