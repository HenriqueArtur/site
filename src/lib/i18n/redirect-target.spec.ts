import { describe, expect, it } from 'vitest';
import { redirectTarget } from './redirect-target.ts';

describe('redirectTarget — escolha explícita do usuário', () => {
  it('respeita quem escolheu inglês, mesmo com navegador em português', () => {
    expect(redirectTarget('/', ['pt-BR'], 'en')).toBe('/en/');
  });

  it('respeita quem escolheu português, mesmo com navegador em inglês', () => {
    expect(redirectTarget('/en/', ['en-US'], 'pt-BR')).toBe('/');
  });

  it('não redireciona quem já está no idioma que escolheu', () => {
    expect(redirectTarget('/', ['en-US'], 'pt-BR')).toBeNull();
    expect(redirectTarget('/en/', ['pt-BR'], 'en')).toBeNull();
  });

  it('ignora valor salvo que não seja um idioma suportado', () => {
    expect(redirectTarget('/', ['pt-BR'], 'es')).toBeNull();
    expect(redirectTarget('/', ['en-US'], 'klingon')).toBe('/en/');
  });
});

describe('redirectTarget — sem escolha salva, usa o navegador', () => {
  it('mantém em português quem tem português no navegador', () => {
    expect(redirectTarget('/', ['pt-BR', 'en-US'], null)).toBeNull();
    expect(redirectTarget('/', ['pt'], null)).toBeNull();
    expect(redirectTarget('/', ['pt-PT'], null)).toBeNull();
  });

  it('manda para o inglês quem não tem português nenhum', () => {
    expect(redirectTarget('/', ['en-US'], null)).toBe('/en/');
    expect(redirectTarget('/', ['es-ES', 'fr'], null)).toBe('/en/');
  });

  it('considera português em qualquer posição da lista, não só na primeira', () => {
    expect(redirectTarget('/', ['de', 'fr', 'pt-BR'], null)).toBeNull();
  });

  it('fica em português quando o navegador não informa idioma nenhum', () => {
    // Sem sinal, não se mexe: redirecionar seria adivinhar contra o padrão do site.
    expect(redirectTarget('/', [], null)).toBeNull();
  });
});

describe('redirectTarget — nunca sequestra quem chegou por link direto', () => {
  it('não tira de /en quem chegou lá com navegador em português e sem escolha salva', () => {
    expect(redirectTarget('/en/', ['pt-BR'], null)).toBeNull();
  });

  it('preserva o caminho ao redirecionar, não joga para a raiz', () => {
    expect(redirectTarget('/2026/07/30/meu-post/', ['en-US'], null)).toBe(
      '/en/2026/07/30/meu-post/',
    );
  });

  it('preserva o caminho ao voltar do inglês para o português', () => {
    expect(redirectTarget('/en/2026/07/30/meu-post/', ['en-US'], 'pt-BR')).toBe(
      '/2026/07/30/meu-post/',
    );
  });
});

describe('redirectTarget — sobrevive à serialização para o script inline', () => {
  // Esta função é injetada no <head> via toString(). Se alguém adicionar um
  // import, uma constante de módulo ou qualquer referência de fora, ela continua
  // passando em todos os testes acima e mesmo assim quebra no navegador com
  // "X is not defined" — silenciosamente, só para o visitante.
  //
  // Aqui ela é reconstruída a partir do próprio texto, num escopo sem acesso ao
  // módulo, e submetida às mesmas perguntas.
  const reconstructed = new Function(
    `return (${redirectTarget.toString()})`,
  )() as typeof redirectTarget;

  const casos: [string, string[], string | null, string | null][] = [
    ['/', ['en-US'], null, '/en/'],
    ['/', ['pt-BR'], null, null],
    ['/en/', ['pt-BR'], null, null],
    ['/', ['pt-BR'], 'en', '/en/'],
    ['/en/', ['en-US'], 'pt-BR', '/'],
    ['/', [], null, null],
    ['/2026/07/30/post/', ['es'], null, '/en/2026/07/30/post/'],
  ];

  it('é autocontida: roda fora do módulo sem referência indefinida', () => {
    expect(() => reconstructed('/', ['pt-BR'], null)).not.toThrow();
  });

  it('devolve exatamente o mesmo resultado da original em todos os casos', () => {
    for (const [path, langs, saved, esperado] of casos) {
      expect(reconstructed(path, langs, saved), `${path} / ${langs} / ${saved}`).toBe(esperado);
      expect(reconstructed(path, langs, saved)).toBe(redirectTarget(path, langs, saved));
    }
  });
});

describe('redirectTarget — é seguro de rodar em qualquer página', () => {
  it('nunca devolve o próprio caminho, o que causaria laço de redirecionamento', () => {
    const casos: [string, string[], string | null][] = [
      ['/', ['en-US'], null],
      ['/en/', ['pt-BR'], 'pt-BR'],
      ['/blog/', ['es'], null],
      ['/en/blog/', [], 'pt-BR'],
    ];
    for (const [path, langs, saved] of casos) {
      expect(redirectTarget(path, langs, saved)).not.toBe(path);
    }
  });

  it('trata /en sem barra final como estando em inglês', () => {
    expect(redirectTarget('/en', ['pt-BR'], null)).toBeNull();
  });

  it('não confunde um caminho que apenas começa com as letras "en"', () => {
    expect(redirectTarget('/energia/', ['pt-BR'], null)).toBeNull();
    expect(redirectTarget('/energia/', ['en-US'], null)).toBe('/en/energia/');
  });
});
