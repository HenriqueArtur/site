import { profile } from '../content/profile.ts';
import { tokens } from '../design/tokens.ts';
import type { Locale } from '../i18n/locales.ts';

/**
 * Manifesto de aplicação web.
 *
 * Existe por causa dos ícones: `icon-192.png` e `icon-512.png` são justamente
 * os tamanhos que o manifesto pede, e sem ele os dois arquivos ficariam no
 * repositório sem nada os referenciando.
 *
 * As cores saem dos tokens, como todo o resto — a barra do navegador em
 * aplicativo instalado é a mesma superfície de papel do site, e um creme
 * ligeiramente diferente ali é o tipo de erro que ninguém percebe olhando.
 *
 * `display: browser` de propósito: isto é um site, não um aplicativo. Abrir em
 * janela sem barra de endereço esconderia a URL e tiraria o botão de voltar de
 * quem instalou por engano.
 */
export function webManifest(locale: Locale) {
  return {
    name: `${profile.name} — ${profile.role[locale]}`,
    short_name: profile.name,
    description: profile.tagline[locale],
    lang: locale,
    start_url: locale === 'en' ? '/en/' : '/',
    display: 'browser',
    background_color: tokens.color.paper,
    theme_color: tokens.color.paper,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      // `maskable` deixa o sistema recortar o ícone no formato dele sem comer
      // a letra: o "H" tem margem sobrando dos dois lados.
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
