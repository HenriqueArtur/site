import { describe, expect, it } from 'vitest';
import { missingTranslations } from './missing-translations.ts';

const entry = (id: string, date: string) => ({
  id,
  data: {
    title: 'Título',
    description: 'Descrição',
    date: new Date(`${date}T00:00:00Z`),
    tags: [],
    draft: false,
  },
});

describe('missingTranslations', () => {
  it('não acusa nada quando todo post existe nos dois idiomas', () => {
    const entries = [
      entry('2026/07/30/post/index.md', '2026-07-30'),
      entry('2026/07/30/post/index.en.md', '2026-07-30'),
    ];

    expect(missingTranslations(entries, 'en')).toEqual([]);
    expect(missingTranslations(entries, 'pt-BR')).toEqual([]);
  });

  it('lista o post que só existe em português quando se pergunta pelo inglês', () => {
    const entries = [entry('2026/07/30/so-em-portugues/index.md', '2026-07-30')];

    const faltando = missingTranslations(entries, 'en');
    expect(faltando).toHaveLength(1);
    expect(faltando[0]?.slug).toBe('so-em-portugues');
    expect(faltando[0]?.locale).toBe('pt-BR');
  });

  it('lista o post que só existe em inglês quando se pergunta pelo português', () => {
    const entries = [entry('2026/07/30/english-only/index.en.md', '2026-07-30')];

    const faltando = missingTranslations(entries, 'pt-BR');
    expect(faltando).toHaveLength(1);
    expect(faltando[0]?.locale).toBe('en');
  });

  it('devolve o post no idioma em que ele existe, para poder linkar para lá', () => {
    const entries = [entry('2026/07/30/so-em-portugues/index.md', '2026-07-30')];
    expect(missingTranslations(entries, 'en')[0]?.path).toBe('/2026/07/30/so-em-portugues/');
  });

  it('ignora rascunho: post não publicado não tem tradução faltando', () => {
    const entries = [
      {
        ...entry('2026/07/30/rascunho/index.md', '2026-07-30'),
        data: { ...entry('2026/07/30/rascunho/index.md', '2026-07-30').data, draft: true },
      },
    ];
    expect(missingTranslations(entries, 'en')).toEqual([]);
  });

  it('distingue posts de mesmo slug em datas diferentes', () => {
    const entries = [
      entry('2026/07/30/retrospectiva/index.md', '2026-07-30'),
      entry('2025/07/30/retrospectiva/index.md', '2025-07-30'),
      entry('2026/07/30/retrospectiva/index.en.md', '2026-07-30'),
    ];

    const faltando = missingTranslations(entries, 'en');
    expect(faltando).toHaveLength(1);
    expect(faltando[0]?.year).toBe(2025);
  });

  it('devolve lista vazia quando não há post nenhum', () => {
    expect(missingTranslations([], 'en')).toEqual([]);
  });
});
