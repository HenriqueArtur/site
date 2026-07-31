import { describe, expect, it } from 'vitest';
import { localePath } from './locale-path.ts';

describe('localePath', () => {
  it('leva a raiz para o inglês e de volta', () => {
    expect(localePath('/', 'en')).toBe('/en/');
    expect(localePath('/en/', 'pt-BR')).toBe('/');
  });

  it('devolve o mesmo caminho quando já está no idioma pedido', () => {
    expect(localePath('/', 'pt-BR')).toBe('/');
    expect(localePath('/en/', 'en')).toBe('/en/');
  });

  it('preserva caminhos profundos nos dois sentidos', () => {
    expect(localePath('/2026/07/30/meu-post/', 'en')).toBe('/en/2026/07/30/meu-post/');
    expect(localePath('/en/2026/07/30/meu-post/', 'pt-BR')).toBe('/2026/07/30/meu-post/');
  });

  it('trata /en sem barra final', () => {
    expect(localePath('/en', 'pt-BR')).toBe('/');
    expect(localePath('/en', 'en')).toBe('/en/');
  });

  it('não confunde caminho que apenas começa com as letras "en"', () => {
    expect(localePath('/energia/', 'en')).toBe('/en/energia/');
    expect(localePath('/energia/', 'pt-BR')).toBe('/energia/');
  });

  it('é idempotente: aplicar duas vezes o mesmo idioma não muda nada', () => {
    const once = localePath('/blog/', 'en');
    expect(localePath(once, 'en')).toBe(once);
  });

  it('é reversível: ida e volta devolve o caminho original', () => {
    for (const path of ['/', '/blog/', '/2026/07/30/post/']) {
      expect(localePath(localePath(path, 'en'), 'pt-BR')).toBe(path);
    }
  });

  it('sempre termina em barra, porque o build gera <rota>/index.html', () => {
    for (const path of ['/', '/blog/', '/en/', '/en/blog/']) {
      for (const locale of ['pt-BR', 'en'] as const) {
        expect(localePath(path, locale).endsWith('/')).toBe(true);
      }
    }
  });
});
