/**
 * Rastreadores que coletam texto para treinar ou alimentar modelos de linguagem.
 *
 * Estão separados dos buscadores de propósito: são decisões diferentes. Aparecer
 * no Google é sobre ser encontrado; virar dado de treino é sobre o texto do blog
 * ser reaproveitado. Dá para querer um sem o outro.
 */
export const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'CCBot',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
  'Meta-ExternalAgent',
] as const;

export interface RobotsOptions {
  site: string;
  /**
   * Bloqueia os rastreadores de IA acima.
   *
   * Padrão `false`: sem robots.txt o site já é rastreável por todos, então
   * liberar é manter o comportamento que existia, e bloquear é a escolha ativa.
   */
  blockAiCrawlers?: boolean;
}

/**
 * O robots.txt do site.
 *
 * Escrito à mão como o RSS e o sitemap — o formato é linha e dois-pontos, e
 * uma dependência para gerar isso seria mais código para manter do que este
 * arquivo inteiro.
 */
export function robotsTxt(options: RobotsOptions): string {
  const { site, blockAiCrawlers = false } = options;
  const sitemap = new URL('/sitemap.xml', site).href;

  const blocks = [['User-agent: *', 'Allow: /'].join('\n')];

  if (blockAiCrawlers) {
    // Um bloco por agente. A forma com vários `User-agent` seguidos e um único
    // `Disallow` é válida na especificação, mas nem todo rastreador a
    // implementa, e o que falha em ler falha liberando.
    for (const crawler of AI_CRAWLERS) {
      blocks.push([`User-agent: ${crawler}`, 'Disallow: /'].join('\n'));
    }
  }

  blocks.push(`Sitemap: ${sitemap}`);

  return `${blocks.join('\n\n')}\n`;
}
