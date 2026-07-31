/**
 * O link sai do site?
 *
 * `mailto:` e `tel:` são deliberadamente internos para esta pergunta: eles não
 * navegam, entregam a ação a outro aplicativo. Abrir com `target="_blank"` ali
 * só deixa uma aba em branco para trás.
 */
export function isExternal(href: string | undefined, site: string): boolean {
  if (!href) return false;

  try {
    const url = new URL(href, site);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

    return url.host !== new URL(site).host;
  } catch {
    // Href malformado não derruba o build. Na dúvida, trata como interno — o
    // erro de não abrir em aba nova é menor do que o de abrir onde não devia.
    return false;
  }
}
