import { describe, expect, it } from 'vitest';
import { articleSchema } from './article-schema.ts';

const base = {
  site: 'https://henriqueartur.com',
  locale: 'pt-BR' as const,
  title: 'Contraste como teste',
  description: 'Sobre verificar contraste no build.',
  path: '/2026/07/31/contraste-como-teste/',
  published: new Date('2026-07-31T00:00:00Z'),
};

describe('articleSchema', () => {
  it('se declara como post de blog', () => {
    expect(articleSchema(base)['@type']).toBe('BlogPosting');
  });

  it('leva título e descrição', () => {
    const schema = articleSchema(base);
    expect(schema.headline).toBe('Contraste como teste');
    expect(schema.description).toBe('Sobre verificar contraste no build.');
  });

  it('usa a URL absoluta do post como identidade', () => {
    const schema = articleSchema(base);
    expect(schema['@id']).toBe('https://henriqueartur.com/2026/07/31/contraste-como-teste/');
    expect(schema.url).toBe(schema['@id']);
  });

  it('marca o post como assunto principal da página', () => {
    // É o que separa "este artigo" de "um artigo citado nesta lista".
    expect(articleSchema(base).mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': 'https://henriqueartur.com/2026/07/31/contraste-como-teste/',
    });
  });

  it('publica a data sem hora inventada', () => {
    // O post tem dia, não horário. Um 00:00:00Z que ninguém decidiu vira
    // véspera para quem lê num fuso a oeste.
    const schema = articleSchema(base);
    expect(schema.datePublished).toBe('2026-07-31');
    expect(schema.datePublished).not.toContain('T');
  });

  it('assume a data de publicação quando não houve modificação', () => {
    expect(articleSchema(base).dateModified).toBe('2026-07-31');
  });

  it('usa a data de modificação quando ela existe', () => {
    const schema = articleSchema({ ...base, modified: new Date('2026-08-15T00:00:00Z') });
    expect(schema.dateModified).toBe('2026-08-15');
    expect(schema.datePublished).toBe('2026-07-31');
  });

  it('declara o idioma do texto', () => {
    expect(articleSchema(base).inLanguage).toBe('pt-BR');
    expect(articleSchema({ ...base, locale: 'en' }).inLanguage).toBe('en');
  });

  it('referencia o autor por @id em vez de copiar a pessoa', () => {
    // A cópia faria cada post declarar um autor novo; a referência faz o
    // buscador entender que é sempre a mesma pessoa.
    const schema = articleSchema(base);
    expect(schema.author).toEqual({ '@id': 'https://henriqueartur.com/#henrique' });
    expect(schema.publisher).toEqual(schema.author);
  });

  it('leva as tags como keywords quando existem', () => {
    expect(articleSchema({ ...base, tags: ['design', 'testes'] }).keywords).toEqual([
      'design',
      'testes',
    ]);
  });

  it('omite keywords em vez de mandar lista vazia', () => {
    expect(articleSchema({ ...base, tags: [] }).keywords).toBeUndefined();
  });

  it('torna a imagem absoluta, porque relativa é ignorada', () => {
    expect(articleSchema({ ...base, image: '/og.png' }).image).toBe(
      'https://henriqueartur.com/og.png',
    );
  });
});
