export type TokenGroup = Record<string, string>;
export type TokenTree = Record<string, TokenGroup>;

/** `paperDeep` -> `paper-deep`. Chaves já em kebab ou numéricas passam intactas. */
function kebab(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Converte a árvore de tokens em declarações de custom property.
 *
 * Existe para que a paleta viva num lugar só: os testes de contraste leem os
 * mesmos objetos que viram CSS, então não há como o CSS divergir do que foi
 * verificado.
 */
export function cssVariables(tree: TokenTree): string {
  const lines: string[] = [];

  for (const [group, values] of Object.entries(tree)) {
    for (const [key, value] of Object.entries(values)) {
      lines.push(`--${kebab(group)}-${kebab(key)}: ${value};`);
    }
  }

  return lines.length === 0 ? '' : `${lines.join('\n')}\n`;
}
