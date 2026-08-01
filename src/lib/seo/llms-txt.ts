export interface LlmsEntry {
  title: string;
  path: string;
  description: string;
}

export interface LlmsOptions {
  site: string;
  summary: string;
  sections: ReadonlyArray<{ heading: string; entries: readonly LlmsEntry[] }>;
  notes?: readonly string[];
}

/**
 * Um mapa do site em Markdown, endereçado a leitor automático.
 *
 * Convenção do llmstxt.org, e é honesto dizer o que ela é: **não é padrão**, e
 * nenhum rastreador grande confirmou que a consome. Está aqui porque custa um
 * arquivo de texto gerado do mesmo conteúdo que o sitemap, e porque se a
 * convenção pegar o custo de já estar pronto é zero.
 *
 * O que ela tem que o sitemap não tem é descrição: o sitemap lista URLs, este
 * diz o que há em cada uma. Para um leitor que precisa escolher o que buscar,
 * a diferença é grande.
 */
export function llmsTxt(options: LlmsOptions): string {
  const { site, summary, sections, notes = [] } = options;

  const lines = ['# Henrique Artur', '', `> ${summary}`, ''];

  for (const section of sections) {
    if (section.entries.length === 0) continue;
    lines.push(`## ${section.heading}`, '');
    for (const entry of section.entries) {
      const url = new URL(entry.path, site).href;
      lines.push(`- [${entry.title}](${url}): ${entry.description}`);
    }
    lines.push('');
  }

  if (notes.length > 0) {
    lines.push('## Notas', '');
    for (const note of notes) lines.push(`- ${note}`);
    lines.push('');
  }

  return lines.join('\n');
}
