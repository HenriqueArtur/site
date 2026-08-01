import { describe, expect, it } from 'vitest';
import { AI_CRAWLERS, robotsTxt } from './robots-txt.ts';

const site = 'https://henriqueartur.com';

describe('robotsTxt', () => {
  it('libera o site inteiro para buscadores', () => {
    const txt = robotsTxt({ site });
    expect(txt).toContain('User-agent: *');
    expect(txt).toContain('Allow: /');
    expect(txt).not.toContain('Disallow: /\n');
  });

  it('aponta o sitemap com URL absoluta, que é o que a especificação exige', () => {
    // Caminho relativo em Sitemap: é simplesmente ignorado.
    expect(robotsTxt({ site })).toContain('Sitemap: https://henriqueartur.com/sitemap.xml');
  });

  it('não duplica a barra quando o site já vem com uma', () => {
    expect(robotsTxt({ site: 'https://henriqueartur.com/' })).toContain(
      'Sitemap: https://henriqueartur.com/sitemap.xml',
    );
  });

  it('por padrão não bloqueia rastreador de IA', () => {
    const txt = robotsTxt({ site });
    for (const crawler of AI_CRAWLERS) {
      expect(txt).not.toContain(`User-agent: ${crawler}`);
    }
  });

  it('bloqueia todos os rastreadores de IA quando pedido', () => {
    const txt = robotsTxt({ site, blockAiCrawlers: true });
    for (const crawler of AI_CRAWLERS) {
      expect(txt).toContain(`User-agent: ${crawler}`);
    }
    // Um Disallow por agente: a regra vale para o bloco do agente anterior, e
    // agrupar todos sob um Disallow só depende de o rastreador aceitar a forma
    // com vários User-agent seguidos — nem todos aceitam.
    expect(txt.match(/Disallow: \/$/gm)).toHaveLength(AI_CRAWLERS.length);
  });

  it('mantém o bloco liberado para buscadores mesmo bloqueando IA', () => {
    // Bloquear treino de modelo não pode custar a indexação no Google.
    const txt = robotsTxt({ site, blockAiCrawlers: true });
    expect(txt).toContain('User-agent: *');
    expect(txt).toContain('Allow: /');
  });

  it('termina com quebra de linha', () => {
    expect(robotsTxt({ site }).endsWith('\n')).toBe(true);
  });
});
