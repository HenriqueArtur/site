import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ogImage } from './og-image.ts';

describe('ogImage', () => {
  it('monta o nome a partir da data, do slug e do idioma', () => {
    expect(ogImage('2026/07/31/contraste-como-teste/index.md').name).toBe(
      '2026-07-31-contraste-como-teste-pt-BR.png',
    );
  });

  it('distingue a versão em inglês', () => {
    expect(ogImage('2026/07/31/contraste-como-teste/index.en.md').name).toBe(
      '2026-07-31-contraste-como-teste-en.png',
    );
  });

  it('devolve nome plano, sem barra', () => {
    // O diretório de saída é servido como está; uma pasta por dia de post seria
    // hierarquia sem propósito.
    expect(ogImage('2026/07/31/contraste-como-teste/index.md').name).not.toContain('/');
  });

  it('devolve o caminho público a partir do mesmo nome', () => {
    // Nome e caminho saem juntos de propósito: são o que o gerador e a página
    // precisam combinar, e separá-los deixaria os dois livres para divergir.
    const image = ogImage('2026/07/31/contraste-como-teste/index.md');
    expect(image.path).toBe(`/og/${image.name}`);
  });

  it('recusa id fora do padrão', () => {
    expect(() => ogImage('contraste.md')).toThrowError(/fora do padrão/);
    expect(() => ogImage('2026/7/31/x/index.md')).toThrowError(/fora do padrão/);
  });
});

/** Todo `index*.md` sob content/blog. */
function findPosts(dir: string, prefix = ''): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const id = prefix ? `${prefix}/${entry}` : entry;
    if (statSync(path).isDirectory()) found.push(...findPosts(path, id));
    else if (/^index(\.en)?\.md$/.test(entry)) found.push(id);
  }
  return found;
}

describe('imagens de compartilhamento dos posts', () => {
  /*
   * As imagens são geradas no build (ver a integração em astro.config.mjs), e
   * não commitadas — então não há existência de arquivo para verificar aqui.
   *
   * O que ainda pode dar errado é colisão de nome: dois posts que caíssem no
   * mesmo arquivo se sobrescreveriam em silêncio, e um deles ficaria com a
   * prévia do outro. É o que estes testes fecham, sobre os posts reais.
   */
  it('dá um nome distinto para cada post de cada idioma', () => {
    const posts = findPosts('content/blog');
    expect(posts.length).toBeGreaterThan(0);

    const names = posts.map((id) => ogImage(id).name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('aceita o id de todos os posts que existem hoje', () => {
    // Um post fora do padrão de caminho quebraria a geração no meio do build.
    for (const id of findPosts('content/blog')) {
      expect(() => ogImage(id)).not.toThrow();
    }
  });
});
