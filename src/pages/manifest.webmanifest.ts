import { defaultLocale } from '../lib/i18n/locales.ts';
import { webManifest } from '../lib/seo/web-manifest.ts';

export function GET() {
  /*
   * Um manifesto só, no idioma padrão.
   *
   * O manifesto é do site, não da página: o navegador guarda o primeiro que
   * encontra e não troca ao mudar de idioma. Servir dois faria o nome do
   * atalho depender de por qual página a pessoa passou primeiro.
   */
  return new Response(JSON.stringify(webManifest(defaultLocale), null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
}
