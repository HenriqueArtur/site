import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast-ratio.ts';
import { tokens } from './tokens.ts';

const HEX = /^#[0-9A-F]{6}$/;

const { color } = tokens;

describe('tokens de cor', () => {
  it('usa hex de 6 dígitos em maiúsculas em todas as cores', () => {
    for (const [name, value] of Object.entries(color)) {
      expect(value, `cor ${name}`).toMatch(HEX);
    }
  });

  it('não repete o mesmo valor em dois tokens diferentes', () => {
    const values = Object.values(color);
    expect(new Set(values).size).toBe(values.length);
  });
});

// WCAG 2.2: 4.5:1 para texto normal, 3:1 para texto grande e para componentes
// de interface. Estes testes são o portão de acessibilidade da paleta — mudar
// uma cor e quebrar contraste falha o build antes de chegar ao navegador.
describe('contraste do texto sobre os fundos', () => {
  const fundos = [
    ['paper', color.paper],
    ['paperDeep', color.paperDeep],
  ] as const;

  const textos = [
    ['ink', color.ink],
    ['inkSoft', color.inkSoft],
    ['accentDeep', color.accentDeep],
  ] as const;

  for (const [nomeFundo, fundo] of fundos) {
    for (const [nomeTexto, texto] of textos) {
      it(`${nomeTexto} sobre ${nomeFundo} atinge 4.5:1`, () => {
        expect(contrastRatio(texto, fundo)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

describe('contraste de elementos de interface', () => {
  it('accent atinge 3:1 sobre os dois fundos, para uso em borda e ícone', () => {
    expect(contrastRatio(color.accent, color.paper)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(color.accent, color.paperDeep)).toBeGreaterThanOrEqual(3);
  });

  it('lineStrong atinge 3:1, porque delimita conteúdo e não é decoração', () => {
    expect(contrastRatio(color.lineStrong, color.paper)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(color.lineStrong, color.paperDeep)).toBeGreaterThanOrEqual(3);
  });

  it('paper sobre ink e sobre accentDeep atinge 4.5:1, para blocos invertidos', () => {
    expect(contrastRatio(color.paper, color.ink)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(color.paper, color.accentDeep)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('accent como cor de texto', () => {
  it('accent NÃO atinge 4.5:1, e por isso accentDeep existe', () => {
    // Este teste documenta a razão de haver dois laranjas. Se um dia o accent
    // passar em 4.5, o accentDeep vira redundante e deve ser revisto.
    expect(contrastRatio(color.accent, color.paper)).toBeLessThan(4.5);
  });
});

describe('linhas decorativas', () => {
  it('line é claro de propósito: é a grade do blueprint, não carrega informação', () => {
    expect(contrastRatio(color.line, color.paper)).toBeLessThan(3);
  });
});
