import { describe, expect, it } from 'vitest';
import { selectPosts } from './select-posts.ts';

const entry = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  data: {
    title: 'Título',
    description: 'Descrição',
    date: new Date('2026-07-30T00:00:00Z'),
    tags: [],
    draft: false,
    ...overrides,
  },
});

describe('selectPosts', () => {
  it('devolve só os posts do idioma pedido', () => {
    const entries = [
      entry('2026/07/30/post/index.md'),
      entry('2026/07/30/post/index.en.md'),
      entry('2026/06/01/outro/index.md', { date: new Date('2026-06-01T00:00:00Z') }),
    ];

    expect(selectPosts(entries, 'pt-BR').map((p) => p.slug)).toEqual(['post', 'outro']);
    expect(selectPosts(entries, 'en').map((p) => p.slug)).toEqual(['post']);
  });

  it('monta a URL canônica de cada post no idioma certo', () => {
    const [pt] = selectPosts([entry('2026/07/30/post/index.md')], 'pt-BR');
    const [en] = selectPosts([entry('2026/07/30/post/index.en.md')], 'en');

    expect(pt?.path).toBe('/2026/07/30/post/');
    expect(en?.path).toBe('/en/2026/07/30/post/');
  });

  it('ordena do mais recente para o mais antigo', () => {
    const posts = selectPosts(
      [
        entry('2025/01/01/antigo/index.md', { date: new Date('2025-01-01T00:00:00Z') }),
        entry('2026/07/30/novo/index.md'),
        entry('2026/03/15/meio/index.md', { date: new Date('2026-03-15T00:00:00Z') }),
      ],
      'pt-BR',
    );

    expect(posts.map((p) => p.slug)).toEqual(['novo', 'meio', 'antigo']);
  });

  it('esconde rascunho quando o build é de produção', () => {
    const entries = [
      entry('2026/07/30/publicado/index.md'),
      entry('2026/07/29/rascunho/index.md', {
        draft: true,
        date: new Date('2026-07-29T00:00:00Z'),
      }),
    ];

    expect(selectPosts(entries, 'pt-BR', { includeDrafts: false }).map((p) => p.slug)).toEqual([
      'publicado',
    ]);
  });

  it('mostra rascunho quando pedido, que é o caso do servidor de desenvolvimento', () => {
    const entries = [
      entry('2026/07/30/publicado/index.md'),
      entry('2026/07/29/rascunho/index.md', {
        draft: true,
        date: new Date('2026-07-29T00:00:00Z'),
      }),
    ];

    expect(selectPosts(entries, 'pt-BR', { includeDrafts: true })).toHaveLength(2);
  });

  it('esconde rascunho por padrão', () => {
    const entries = [entry('2026/07/30/rascunho/index.md', { draft: true })];
    expect(selectPosts(entries, 'pt-BR')).toHaveLength(0);
  });

  it('quebra quando a data do frontmatter não bate com a do caminho', () => {
    // As duas datas existem e podem divergir. Se divergirem, a URL diz uma
    // coisa e a página diz outra — melhor não publicar.
    const entries = [entry('2026/07/30/post/index.md', { date: new Date('2026-07-15T00:00:00Z') })];

    expect(() => selectPosts(entries, 'pt-BR')).toThrowError(/data/i);
    expect(() => selectPosts(entries, 'pt-BR')).toThrowError(/2026\/07\/30/);
  });

  it('aceita data do frontmatter com hora, comparando só o dia', () => {
    const entries = [entry('2026/07/30/post/index.md', { date: new Date('2026-07-30T22:45:00Z') })];
    expect(selectPosts(entries, 'pt-BR')).toHaveLength(1);
  });

  it('quebra quando o caminho do post está fora do padrão', () => {
    expect(() => selectPosts([entry('post-solto/index.md')], 'pt-BR')).toThrowError(/estrutura/);
  });

  it('preserva título, descrição e tags', () => {
    const [post] = selectPosts(
      [entry('2026/07/30/post/index.md', { title: 'Meu título', tags: ['ts', 'arch'] })],
      'pt-BR',
    );

    expect(post?.title).toBe('Meu título');
    expect(post?.description).toBe('Descrição');
    expect(post?.tags).toEqual(['ts', 'arch']);
  });

  it('devolve lista vazia quando não há nada no idioma pedido', () => {
    expect(selectPosts([entry('2026/07/30/post/index.md')], 'en')).toEqual([]);
  });
});
