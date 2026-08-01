import { profile } from '../content/profile.ts';
import { timeline as defaultTimeline, type TimelineEntry } from '../content/timeline.ts';
import { localePath } from '../i18n/locale-path.ts';
import type { Locale } from '../i18n/locales.ts';

export interface SchemaOptions {
  site: string;
  locale: Locale;
  /** Injetável para teste; por padrão usa a trajetória real. */
  timeline?: readonly TimelineEntry[];
  overrides?: Record<string, unknown>;
}

export interface PersonSchema {
  '@context': string;
  '@type': string;
  name: string;
  jobTitle: string;
  description: string;
  email: string;
  url: string;
  sameAs: string[];
  worksFor?: { '@type': string; name: string };
  [key: string]: unknown;
}

/**
 * Dados estruturados sobre a pessoa, no formato que os buscadores leem.
 *
 * Sai do mesmo conteúdo que a página mostra — nada é redigitado aqui. Uma
 * segunda cópia do cargo ou do empregador sairia de sincronia na primeira
 * atualização, e o erro só apareceria num resultado de busca meses depois.
 */
export function personSchema(options: SchemaOptions): PersonSchema {
  const { site, locale, timeline = defaultTimeline, overrides = {} } = options;

  const current = timeline.find((entry) => entry.end === null);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role[locale],
    description: profile.tagline[locale],
    email: `mailto:${profile.email}`,
    url: new URL(localePath('/', locale), site).href,
    // `sameAs` liga esta pessoa às contas dela em outros sites. Caminho interno
    // e mailto não ligam conta nenhuma e só poluem.
    sameAs: profile.links
      .map((link) => link.href)
      .filter((href) => href.startsWith('https://') && !href.includes('henriqueartur.com')),
    ...(current ? { worksFor: { '@type': 'Organization', name: current.company } } : {}),
    ...overrides,
  };
}

/**
 * O mesmo esquema, pronto para ir dentro de uma `<script type="application/ld+json">`.
 *
 * O `<` vira `<`. Sem isso, um `</script>` dentro de qualquer texto
 * encerraria o bloco no meio e o resto do JSON viraria HTML — é o caminho
 * clássico de injeção por JSON embutido, e o conteúdo aqui é editável.
 */
export function personSchemaJson(options: SchemaOptions): string {
  return JSON.stringify(personSchema(options)).replaceAll('<', '\\u003c');
}
