import { describe, expect, it } from 'vitest';
import { groupPosts } from './group-posts.ts';

const post = (year: number, month: number, day: number, slug = 'x') => ({
  year,
  month,
  day,
  slug,
});

describe('groupPosts', () => {
  it('devolve lista vazia para entrada vazia', () => {
    expect(groupPosts([])).toEqual([]);
  });

  it('agrupa por ano e, dentro dele, por mês', () => {
    const grouped = groupPosts([post(2026, 7, 30), post(2026, 7, 1), post(2026, 3, 5)]);

    expect(grouped).toHaveLength(1);
    expect(grouped[0]?.year).toBe(2026);
    expect(grouped[0]?.months.map((m) => m.month)).toEqual([7, 3]);
    expect(grouped[0]?.months[0]?.posts).toHaveLength(2);
  });

  it('ordena anos do mais recente para o mais antigo', () => {
    const grouped = groupPosts([post(2024, 1, 1), post(2026, 1, 1), post(2025, 1, 1)]);
    expect(grouped.map((g) => g.year)).toEqual([2026, 2025, 2024]);
  });

  it('ordena meses do mais recente para o mais antigo dentro do ano', () => {
    const grouped = groupPosts([post(2026, 1, 1), post(2026, 12, 1), post(2026, 6, 1)]);
    expect(grouped[0]?.months.map((m) => m.month)).toEqual([12, 6, 1]);
  });

  it('ordena posts do mais recente para o mais antigo dentro do mês', () => {
    const grouped = groupPosts([post(2026, 7, 1), post(2026, 7, 30), post(2026, 7, 15)]);
    expect(grouped[0]?.months[0]?.posts.map((p) => p.day)).toEqual([30, 15, 1]);
  });

  it('desempata posts do mesmo dia pelo slug, para o build ser determinístico', () => {
    // Sem critério de desempate, a ordem viria da ordem do sistema de arquivos e
    // o HTML gerado poderia mudar entre máquinas sem ninguém mexer no conteúdo.
    const grouped = groupPosts([
      post(2026, 7, 30, 'zebra'),
      post(2026, 7, 30, 'abacaxi'),
      post(2026, 7, 30, 'manga'),
    ]);
    expect(grouped[0]?.months[0]?.posts.map((p) => p.slug)).toEqual(['abacaxi', 'manga', 'zebra']);
  });

  it('separa o mesmo mês de anos diferentes', () => {
    const grouped = groupPosts([post(2026, 7, 1), post(2025, 7, 1)]);
    expect(grouped.map((g) => g.year)).toEqual([2026, 2025]);
    expect(grouped[0]?.months[0]?.posts).toHaveLength(1);
    expect(grouped[1]?.months[0]?.posts).toHaveLength(1);
  });

  it('não perde nenhum post no agrupamento', () => {
    const posts = [
      post(2026, 7, 30, 'a'),
      post(2026, 7, 1, 'b'),
      post(2025, 12, 25, 'c'),
      post(2024, 1, 1, 'd'),
    ];
    const total = groupPosts(posts).flatMap((y) => y.months.flatMap((m) => m.posts));
    expect(total).toHaveLength(posts.length);
  });

  it('não altera o array recebido', () => {
    const posts = [post(2024, 1, 1, 'a'), post(2026, 1, 1, 'b')];
    const antes = [...posts];
    groupPosts(posts);
    expect(posts).toEqual(antes);
  });
});
