import type { Locale } from './locales.ts';

/**
 * Nomes por extenso, para os títulos de agrupamento do blog.
 *
 * Tabela explícita pela mesma razão de format-period.ts: `Intl` depende da
 * versão do ICU do runtime, e o HTML aqui é gerado em tempo de build.
 *
 * Em português o mês é minúsculo; em inglês, maiúsculo. Não é detalhe de
 * estilo — é ortografia de cada idioma.
 */
const NAMES: Record<Locale, readonly string[]> = {
  'pt-BR': [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};

export function monthName(month: number, locale: Locale): string {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`mês precisa ser um inteiro de 1 a 12, recebi ${month}`);
  }

  return NAMES[locale][month - 1] as string;
}
