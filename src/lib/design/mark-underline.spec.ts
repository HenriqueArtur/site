import { describe, expect, it } from 'vitest';
import { markUnderline } from './mark-underline.ts';
import { tokens } from './tokens.ts';

describe('markUnderline', () => {
  it('devolve uma url de dado SVG', () => {
    expect(markUnderline('#E2571E')).toMatch(/^url\("data:image\/svg\+xml,/);
    expect(markUnderline('#E2571E')).toMatch(/"\)$/);
  });

  it('codifica o # da cor, que num data URI seria início de fragmento', () => {
    // Sem escapar, o navegador corta a URL no `#` e o traço some.
    const url = markUnderline('#E2571E');
    expect(url).toContain('%23E2571E');
    expect(url.slice(url.indexOf('svg+xml,'))).not.toContain('#');
  });

  it('codifica os sinais de menor e maior', () => {
    const url = markUnderline('#E2571E');
    expect(url).not.toContain('<');
    expect(url).not.toContain('>');
    expect(url).toContain('%3Csvg');
  });

  it('não usa aspas duplas dentro do dado, que fechariam a url()', () => {
    const dado = markUnderline('#E2571E').slice('url("'.length, -2);
    expect(dado).not.toContain('"');
  });

  it('leva a cor recebida, e não uma fixa', () => {
    expect(markUnderline('#A93C10')).toContain('%23A93C10');
    expect(markUnderline('#A93C10')).not.toContain('%23E2571E');
  });

  it('aceita a cor de destaque do design system', () => {
    // Fecha o circuito: a cor do traço vem do mesmo lugar que todas as outras,
    // em vez de ficar cravada dentro de um SVG.
    expect(markUnderline(tokens.color.accent)).toContain(`%23${tokens.color.accent.slice(1)}`);
  });

  it('recusa cor fora do formato hex de 6 dígitos', () => {
    expect(() => markUnderline('red')).toThrowError(/hex/i);
    expect(() => markUnderline('#FFF')).toThrowError(/hex/i);
  });
});
