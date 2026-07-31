import type { Locale } from './locales.ts';

/**
 * O mesmo caminho, no idioma pedido.
 *
 * Serve tanto para os links do seletor de idioma quanto para as tags
 * `<link rel="alternate" hreflang>`, que precisam apontar exatamente para o
 * equivalente da página atual, não para a home.
 */
export function localePath(pathname: string, locale: Locale): string {
  const inEnglish = pathname === '/en' || pathname.startsWith('/en/');
  const bare = inEnglish ? pathname.slice(3) || '/' : pathname;
  const withSlash = bare.endsWith('/') ? bare : `${bare}/`;

  return locale === 'en' ? `/en${withSlash}` : withSlash;
}
