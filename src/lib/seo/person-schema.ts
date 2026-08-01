import { type Degree, education as defaultEducation } from '../content/education.ts';
import { profile } from '../content/profile.ts';
import { projects as defaultProjects, type Project } from '../content/projects.ts';
import { timeline as defaultTimeline, type TimelineEntry } from '../content/timeline.ts';
import { localePath } from '../i18n/locale-path.ts';
import type { Locale } from '../i18n/locales.ts';

/**
 * `@id` fixo da pessoa.
 *
 * É o que permite os outros nós do grafo apontarem para este em vez de
 * repetirem nome e e-mail. Sem um identificador estável, cada página declara
 * uma pessoa diferente e o buscador não as une.
 */
export const PERSON_ID = '#henrique';

export interface SchemaOptions {
  site: string;
  locale: Locale;
  /** Injetáveis para teste; por padrão usam o conteúdo real. */
  timeline?: readonly TimelineEntry[];
  education?: readonly Degree[];
  projects?: readonly Project[];
  overrides?: Record<string, unknown>;
}

export interface PersonSchema {
  '@type': string;
  '@id': string;
  name: string;
  jobTitle: string;
  description: string;
  email: string;
  url: string;
  sameAs: string[];
  knowsAbout: string[];
  alumniOf: Array<{ '@type': string; name: string }>;
  address: Record<string, string>;
  worksFor?: { '@type': string; name: string };
  [key: string]: unknown;
}

/**
 * Dados estruturados sobre a pessoa, no formato que os buscadores leem.
 *
 * Sai do mesmo conteúdo que a página mostra — nada é redigitado aqui. Uma
 * segunda cópia do cargo ou do empregador sairia de sincronia na primeira
 * atualização, e o erro só apareceria num resultado de busca meses depois.
 *
 * Não declara `@context`: este nó vive dentro de um `@graph` que declara o
 * contexto uma vez para todos. Ver json-ld.ts.
 */
export function personSchema(options: SchemaOptions): PersonSchema {
  const {
    site,
    locale,
    timeline = defaultTimeline,
    education = defaultEducation,
    projects = defaultProjects,
    overrides = {},
  } = options;

  const current = timeline.find((entry) => entry.end === null);

  return {
    '@type': 'Person',
    '@id': new URL(PERSON_ID, site).href,
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
    /*
     * As tecnologias saem dos projetos que ele de fato entregou, e não de uma
     * lista escrita à mão. Uma lista à parte viraria vitrine: cresceria com o
     * que soa bem, não com o que foi construído, e ninguém notaria a diferença.
     */
    knowsAbout: [...new Set(projects.flatMap((project) => project.tech))].sort(),
    alumniOf: education.map((degree) => ({
      '@type': 'CollegeOrUniversity',
      name: degree.institution,
    })),
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.address.city,
      addressRegion: profile.address.region,
      addressCountry: profile.address.country,
    },
    ...(current ? { worksFor: { '@type': 'Organization', name: current.company } } : {}),
    ...overrides,
  };
}
