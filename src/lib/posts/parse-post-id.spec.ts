import { describe, expect, it } from 'vitest';
import { parsePostId } from './parse-post-id.ts';

describe('parsePostId', () => {
  it('lê data, slug e idioma do caminho em português', () => {
    expect(parsePostId('2026/07/30/meu-post/index.md')).toEqual({
      year: 2026,
      month: 7,
      day: 30,
      slug: 'meu-post',
      locale: 'pt-BR',
    });
  });

  it('reconhece a variante em inglês pelo sufixo do arquivo', () => {
    expect(parsePostId('2026/07/30/my-post/index.en.md')).toEqual({
      year: 2026,
      month: 7,
      day: 30,
      slug: 'my-post',
      locale: 'en',
    });
  });

  it('converte mês e dia com zero à esquerda em número', () => {
    const post = parsePostId('2026/01/05/ano-novo/index.md');
    expect(post.month).toBe(1);
    expect(post.day).toBe(5);
  });

  it('aceita slug com números e hífens', () => {
    expect(parsePostId('2026/07/30/typescript-5-9-em-producao/index.md').slug).toBe(
      'typescript-5-9-em-producao',
    );
  });

  it('recusa caminho sem a estrutura ano/mês/dia/slug', () => {
    expect(() => parsePostId('meu-post/index.md')).toThrowError(/estrutura/);
    expect(() => parsePostId('2026/07/meu-post/index.md')).toThrowError(/estrutura/);
    expect(() => parsePostId('index.md')).toThrowError(/estrutura/);
  });

  it('recusa data impossível em vez de gerar URL inválida', () => {
    expect(() => parsePostId('2026/13/01/x/index.md')).toThrowError(/estrutura/);
    expect(() => parsePostId('2026/00/01/x/index.md')).toThrowError(/estrutura/);
    expect(() => parsePostId('2026/07/32/x/index.md')).toThrowError(/estrutura/);
    expect(() => parsePostId('2026/07/00/x/index.md')).toThrowError(/estrutura/);
  });

  it('recusa dia que não existe naquele mês', () => {
    // 31 de fevereiro passa em qualquer validação puramente sintática.
    expect(() => parsePostId('2026/02/31/x/index.md')).toThrowError(/não existe/);
    expect(() => parsePostId('2026/04/31/x/index.md')).toThrowError(/não existe/);
  });

  it('aceita 29 de fevereiro em ano bissexto e recusa fora dele', () => {
    expect(parsePostId('2024/02/29/bissexto/index.md').day).toBe(29);
    expect(() => parsePostId('2026/02/29/x/index.md')).toThrowError(/não existe/);
  });

  it('recusa slug que não seja kebab-case, para não gerar URL quebrada', () => {
    expect(() => parsePostId('2026/07/30/Meu Post/index.md')).toThrowError(/estrutura/);
    expect(() => parsePostId('2026/07/30/meu_post/index.md')).toThrowError(/estrutura/);
  });

  it('recusa nome de arquivo que não seja index.md nem index.en.md', () => {
    expect(() => parsePostId('2026/07/30/x/post.md')).toThrowError(/estrutura/);
    expect(() => parsePostId('2026/07/30/x/index.es.md')).toThrowError(/estrutura/);
    expect(() => parsePostId('2026/07/30/x/index.markdown')).toThrowError(/estrutura/);
  });

  it('nomeia o caminho recebido na mensagem de erro, para o autor achar o arquivo', () => {
    expect(() => parsePostId('2026/13/01/x/index.md')).toThrowError(/2026\/13\/01/);
  });
});
