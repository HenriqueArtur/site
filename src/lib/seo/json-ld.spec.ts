import { describe, expect, it } from 'vitest';
import { jsonLd } from './json-ld.ts';

describe('jsonLd', () => {
  it('declara o contexto uma vez, no grafo', () => {
    const parsed = JSON.parse(jsonLd([{ '@type': 'Person', name: 'x' }]));
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@graph'][0]['@context']).toBeUndefined();
  });

  it('mantém os nós na ordem recebida', () => {
    const parsed = JSON.parse(
      jsonLd([{ '@type': 'ProfilePage' }, { '@type': 'Person' }, { '@type': 'BreadcrumbList' }]),
    );
    expect(parsed['@graph'].map((node: { '@type': string }) => node['@type'])).toEqual([
      'ProfilePage',
      'Person',
      'BreadcrumbList',
    ]);
  });

  it('escapa o sinal de menor, para o conteúdo não fechar a tag script', () => {
    // Um `</script>` dentro de qualquer texto encerraria o bloco no meio e o
    // resto viraria HTML. É o caminho clássico de injeção via JSON embutido.
    const out = jsonLd([{ '@type': 'Person', name: 'Henrique </script><img src=x>' }]);

    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c');
    expect(JSON.parse(out)['@graph'][0].name).toBe('Henrique </script><img src=x>');
  });

  it('recusa grafo vazio', () => {
    // Uma tag ld+json sem nó nenhum é ruído que valida como erro nas
    // ferramentas de teste do Google.
    expect(() => jsonLd([])).toThrowError(/sem nós/);
  });
});
