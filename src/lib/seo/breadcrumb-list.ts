export interface Crumb {
  name: string;
  /** Caminho interno, com barra final. */
  path: string;
}

/**
 * A trilha de onde a página está dentro do site.
 *
 * O blog tem hierarquia real — blog, ano, mês, post — e sem declará-la o
 * buscador só enxerga URLs soltas. É o nó que o Google usa para trocar a URL
 * crua do resultado por uma trilha legível, e que ajuda um assistente a
 * entender que o arquivo é organizado por data.
 *
 * A posição começa em 1 porque a especificação conta a partir de 1; um item
 * com `position: 0` é descartado em silêncio.
 */
export function breadcrumbList(crumbs: readonly Crumb[], site: string) {
  if (crumbs.length === 0) {
    throw new Error('trilha vazia: não declare BreadcrumbList sem itens');
  }

  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: new URL(crumb.path, site).href,
    })),
  };
}
