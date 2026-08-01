/** Um nó do grafo. `@type` é o mínimo que todo nó precisa ter. */
export interface Node {
  '@type': string;
  [key: string]: unknown;
}

/**
 * Empacota os nós num `@graph` e devolve o texto pronto para a tag `<script>`.
 *
 * Um `@graph` em vez de vários blocos soltos: assim `ProfilePage`, `Person` e
 * `BreadcrumbList` da mesma página se referenciam por `@id` e o buscador as lê
 * como a mesma coisa descrita de vários ângulos, em vez de fatos avulsos que
 * ele tenta reconciliar sozinho.
 *
 * O `<` vira `<`. Sem isso, um `</script>` dentro de qualquer texto
 * encerraria o bloco no meio e o resto do JSON viraria HTML — é o caminho
 * clássico de injeção por JSON embutido, e o conteúdo aqui é editável.
 */
export function jsonLd(nodes: readonly Node[]): string {
  if (nodes.length === 0) {
    throw new Error('grafo sem nós: uma tag ld+json vazia é pior que nenhuma');
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': nodes,
  }).replaceAll('<', '\\u003c');
}
