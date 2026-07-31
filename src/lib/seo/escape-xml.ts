/**
 * Escapa texto para uso dentro de XML.
 *
 * O `&` é substituído primeiro. Na ordem inversa, o `&` das entidades recém-criadas
 * seria escapado de novo e `<` viraria `&amp;lt;` — o bug clássico de escape manual.
 */
export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
