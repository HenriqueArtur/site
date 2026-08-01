import { describe, expect, it } from 'vitest';
import { llmsTxt } from './llms-txt.ts';

const site = 'https://henriqueartur.com';

const base = {
  site,
  summary: 'Tech Lead em Fortaleza.',
  sections: [
    {
      heading: 'Páginas',
      entries: [{ title: 'Início', path: '/', description: 'Perfil profissional.' }],
    },
  ],
};

describe('llmsTxt', () => {
  it('abre com o nome como título de nível 1', () => {
    expect(llmsTxt(base).startsWith('# Henrique Artur\n')).toBe(true);
  });

  it('traz o resumo como citação, que é onde a convenção o espera', () => {
    expect(llmsTxt(base)).toContain('> Tech Lead em Fortaleza.');
  });

  it('lista cada página com URL absoluta e descrição', () => {
    // A descrição é o que este arquivo tem e o sitemap não: sem ela, é uma
    // lista de URLs pior que a que já existe.
    expect(llmsTxt(base)).toContain('- [Início](https://henriqueartur.com/): Perfil profissional.');
  });

  it('omite seção sem entrada em vez de deixar título órfão', () => {
    const out = llmsTxt({ ...base, sections: [{ heading: 'Blog', entries: [] }] });
    expect(out).not.toContain('## Blog');
  });

  it('mantém a ordem das seções', () => {
    const out = llmsTxt({
      ...base,
      sections: [
        { heading: 'Páginas', entries: [{ title: 'a', path: '/', description: 'x' }] },
        { heading: 'Blog', entries: [{ title: 'b', path: '/blog/', description: 'y' }] },
      ],
    });
    expect(out.indexOf('## Páginas')).toBeLessThan(out.indexOf('## Blog'));
  });

  it('inclui as notas quando existem', () => {
    expect(llmsTxt({ ...base, notes: ['Conteúdo em pt-BR e en.'] })).toContain(
      '- Conteúdo em pt-BR e en.',
    );
  });

  it('não deixa cabeçalho de notas sem nota', () => {
    expect(llmsTxt(base)).not.toContain('## Notas');
  });
});
