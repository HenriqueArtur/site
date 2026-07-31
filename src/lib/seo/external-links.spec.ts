import { describe, expect, it } from 'vitest';
import { externalLinks, type HastNode } from './external-links.ts';

const site = 'https://henriqueartur.com';
const labels = { 'pt-BR': 'abre em nova aba', en: 'opens in a new tab' };

const link = (href: string): HastNode => ({
  type: 'element',
  tagName: 'a',
  properties: { href },
  children: [{ type: 'text', value: 'texto' }],
});

/** Contexto falso com a parte da API do Satteri que o plugin usa. */
function context(path = 'content/blog/2026/07/31/post/index.md') {
  return {
    fileURL: new URL(path, 'file:///repo/'),
    setProperty(node: HastNode, key: string, value: unknown) {
      node.properties = { ...node.properties, [key]: value };
    },
    appendChild(node: HastNode, child: HastNode) {
      node.children = [...(node.children ?? []), child];
    },
  };
}

const run = (node: HastNode, path?: string) => {
  externalLinks({ site, labels }).element.visit(node, context(path));
  return node;
};

describe('externalLinks', () => {
  it('declara o filtro de tag que o Satteri exige', () => {
    // Sem `filter`, o plugin é rejeitado com "Missing field `tagFilter`" — e o
    // erro aparece como post renderizando vazio, não como erro de configuração.
    expect(externalLinks({ site, labels }).element.filter).toEqual(['a']);
  });

  it('abre link externo em nova aba', () => {
    const a = run(link('https://github.com/HenriqueArtur'));
    expect(a.properties?.target).toBe('_blank');
  });

  it('adiciona rel noopener noreferrer, contra tabnabbing', () => {
    // Sem `noopener`, a página aberta ganha referência a esta pelo
    // `window.opener` e pode redirecioná-la.
    const a = run(link('https://github.com/HenriqueArtur'));
    expect(a.properties?.rel).toBe('noopener noreferrer');
  });

  it('não toca em link interno', () => {
    const a = run(link('/blog/'));
    expect(a.properties?.target).toBeUndefined();
    expect(a.properties?.rel).toBeUndefined();
  });

  it('não toca em âncora nem em mailto', () => {
    expect(run(link('#secao')).properties?.target).toBeUndefined();
    expect(run(link('mailto:contato@henriqueartur.com')).properties?.target).toBeUndefined();
  });

  it('avisa quem usa leitor de tela que o link abre em nova aba', () => {
    const a = run(link('https://github.com/HenriqueArtur'));
    const aviso = a.children?.at(-1);

    expect(aviso?.tagName).toBe('span');
    expect(aviso?.properties?.className).toEqual(['visually-hidden']);
    expect(aviso?.children?.[0]?.value).toContain('abre em nova aba');
  });

  it('usa o idioma do arquivo para o aviso', () => {
    const a = run(link('https://github.com/HenriqueArtur'), 'post/index.en.md');
    expect(a.children?.at(-1)?.children?.[0]?.value).toContain('opens in a new tab');
  });

  it('preserva os filhos e os atributos que o link já tinha', () => {
    const a = link('https://github.com/HenriqueArtur');
    a.properties = { ...a.properties, className: ['destaque'] };
    run(a);

    expect(a.properties?.className).toEqual(['destaque']);
    expect(a.children?.[0]?.value).toBe('texto');
    expect(a.children).toHaveLength(2);
  });

  it('não quebra em link sem href nem em link sem filhos', () => {
    const semHref: HastNode = { type: 'element', tagName: 'a', properties: {} };
    const semFilhos: HastNode = {
      type: 'element',
      tagName: 'a',
      properties: { href: 'https://github.com/HenriqueArtur' },
    };

    expect(() => run(semHref)).not.toThrow();
    expect(() => run(semFilhos)).not.toThrow();
    expect(semFilhos.children).toHaveLength(1);
  });
});
