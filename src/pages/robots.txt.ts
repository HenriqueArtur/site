import type { APIContext } from 'astro';
import { robotsTxt } from '../lib/seo/robots-txt.ts';

export function GET(context: APIContext) {
  const site = context.site?.origin ?? 'https://henriqueartur.com';

  return new Response(
    robotsTxt({
      site,
      /*
       * Rastreador de IA liberado.
       *
       * Sem robots.txt o site já era rastreável por todos, então isto mantém o
       * que existia — bloquear é a escolha ativa, e é uma linha: trocar para
       * `true` fecha para GPTBot, ClaudeBot, CCBot, PerplexityBot e companhia,
       * sem afetar a indexação no Google.
       */
      blockAiCrawlers: false,
    }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
