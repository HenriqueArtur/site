import type { Locale } from './locales.ts';

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

/**
 * Nomes explícitos em vez de `Intl.DateTimeFormat`.
 *
 * O Intl depende da versão do ICU embarcada no runtime, então a mesma data pode
 * render "fev." num ambiente e "fev" noutro — diferença que apareceria no HTML
 * gerado e faria o build variar entre máquinas sem ninguém mudar código.
 */
const MONTHS: Record<Locale, readonly string[]> = {
  'pt-BR': ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const SEPARATOR: Record<Locale, string> = {
  'pt-BR': '/',
  en: ' ',
};

const ONGOING: Record<Locale, string> = {
  'pt-BR': 'hoje',
  en: 'present',
};

function formatMonth(value: string, locale: Locale): string {
  const match = MONTH.exec(value);
  if (!match) {
    throw new Error(`data precisa estar em AAAA-MM, recebi ${JSON.stringify(value)}`);
  }

  const [, year, month] = match;
  // O regex garante 01-12, então o índice sempre existe.
  const name = MONTHS[locale][Number(month) - 1] as string;

  return `${name}${SEPARATOR[locale]}${year}`;
}

/**
 * Formata um intervalo de meses para exibição.
 *
 * `end` nulo significa em andamento. Início e fim iguais viram um mês só, porque
 * "fev/2018 — fev/2018" não diz nada que "fev/2018" já não diga.
 */
export function formatPeriod(start: string, end: string | null, locale: Locale): string {
  const from = formatMonth(start, locale);

  if (end === null) {
    return `${from} — ${ONGOING[locale]}`;
  }

  const to = formatMonth(end, locale);
  if (end < start) {
    throw new Error(`fim ${end} é anterior ao início ${start}`);
  }

  return from === to ? from : `${from} — ${to}`;
}
