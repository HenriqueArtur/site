import type { Locale } from '../i18n/locales.ts';
import { PERSON_ID } from './person-schema.ts';

/**
 * Declara que a home é a página de perfil de alguém.
 *
 * Sem este nó, o `Person` fica solto: a página afirma que existe uma pessoa,
 * mas não que ela *é sobre* essa pessoa. `ProfilePage` com `mainEntity` é o
 * padrão que o Google documenta para site pessoal, e é o que faz a home ser
 * tratada como a fonte sobre ele em vez de mais uma página que o menciona.
 */
export function profilePage(options: { site: string; locale: Locale; url: string }) {
  const { site, locale, url } = options;

  return {
    '@type': 'ProfilePage',
    '@id': url,
    url,
    inLanguage: locale,
    mainEntity: { '@id': new URL(PERSON_ID, site).href },
  };
}
