export interface OgImage {
  /** Nome do arquivo, que é o que o gerador escreve em `dist/og/`. */
  name: string;
  /** Caminho público, que é o que vai no `og:image`. */
  path: string;
}

const ID = /^(\d{4})\/(\d{2})\/(\d{2})\/([a-z0-9-]+)\/index(\.en)?\.md$/;

/**
 * Onde mora a imagem de compartilhamento de um post.
 *
 * Existe porque duas partes precisam concordar sobre o mesmo nome: a integração
 * que escreve o arquivo no build (ver `tools/og-posts.mjs`) e a página que
 * aponta o `og:image` para ele. Se cada lado montasse o nome à sua maneira, a
 * divergência apareceria como prévia quebrada no LinkedIn — em produção, e sem
 * nenhum erro no build.
 *
 * Recebe o id da coleção (`<ano>/<mês>/<dia>/<slug>/index[.en].md`) e devolve um
 * nome plano: o `public/` do Astro é servido como está, e uma pasta por dia de
 * post seria hierarquia sem propósito.
 */
export function ogImage(id: string): OgImage {
  const match = ID.exec(id);
  if (!match) {
    throw new Error(`id de post fora do padrão esperado: ${JSON.stringify(id)}`);
  }

  const [, year, month, day, slug, english] = match;
  const name = `${year}-${month}-${day}-${slug}-${english ? 'en' : 'pt-BR'}.png`;

  return { name, path: `/og/${name}` };
}
