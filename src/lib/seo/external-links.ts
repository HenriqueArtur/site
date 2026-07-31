import { isExternal } from './is-external.ts';

export interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/** O subconjunto do contexto do Satteri que este plugin usa. */
export interface HastContext {
  fileURL?: URL | undefined;
  setProperty(node: HastNode, key: string, value: unknown): void;
  appendChild(node: HastNode, child: HastNode): void;
}

export interface ExternalLinksOptions {
  site: string;
  labels: { 'pt-BR': string; en: string };
}

/**
 * Plugin hast: faz links externos do Markdown abrirem em nova aba.
 *
 * Escrito para o Satteri, que é o processador de Markdown padrão do Astro 7. A
 * primeira versão era um plugin rehype — o Astro 7 aceita, mas só depois de
 * instalar `@astrojs/markdown-remark`, que deixou de vir por padrão. O Satteri
 * expõe a mesma forma de árvore com um visitor por tipo de nó, então dá para
 * fazer o mesmo trabalho sem dependência nova.
 *
 * O `rel="noopener noreferrer"` não é formalidade: sem `noopener`, a página
 * aberta recebe referência a esta pelo `window.opener` e pode redirecioná-la
 * enquanto o usuário está na outra aba.
 *
 * O aviso em texto oculto existe porque abrir uma aba nova sem avisar
 * desorienta quem usa leitor de tela — o botão "voltar" deixa de funcionar e
 * nada explica por quê.
 */
export function externalLinks(options: ExternalLinksOptions) {
  const { site, labels } = options;

  return {
    name: 'external-links',

    /*
     * `filter` não é opcional nem cosmético: o Satteri filtra por tag do lado
     * do Rust e só os nós casados cruzam a fronteira para o JS. Sem ele o
     * plugin é rejeitado com "Missing field `tagFilter`" — e o erro aparece
     * como falha de renderização do post, não como erro de configuração.
     */
    element: {
      filter: ['a'],

      visit(node: HastNode, ctx: HastContext): void {
        const href = node.properties?.href;
        if (typeof href !== 'string' || !isExternal(href, site)) return;

        // O idioma vem do nome do arquivo: `index.en.md` é a variante em inglês.
        const label = ctx.fileURL?.pathname.endsWith('.en.md') ? labels.en : labels['pt-BR'];

        ctx.setProperty(node, 'target', '_blank');
        ctx.setProperty(node, 'rel', 'noopener noreferrer');

        ctx.appendChild(node, {
          type: 'element',
          tagName: 'span',
          properties: { className: ['visually-hidden'] },
          children: [{ type: 'text', value: ` (${label})` }],
        });
      },
    },
  };
}
