import { describe, expect, it } from 'vitest';
import { codeTheme, codeThemeForegrounds } from './code-theme.ts';
import { contrastRatio } from './contrast-ratio.ts';
import { tokens } from './tokens.ts';

describe('codeTheme', () => {
  it('usa um fundo que existe na paleta do site', () => {
    expect(codeTheme.colors['editor.background']).toBe(tokens.color.paperDeep);
  });

  it('declara-se como tema claro, coerente com o site não ter modo escuro', () => {
    expect(codeTheme.type).toBe('light');
  });

  it('não deixa nenhum escopo sem cor definida', () => {
    for (const entry of codeTheme.settings) {
      expect(entry.settings.foreground, `escopo ${entry.scope.join(', ')}`).toMatch(
        /^#[0-9A-F]{6}$/,
      );
      expect(entry.scope.length).toBeGreaterThan(0);
    }
  });

  it('não repete o mesmo escopo em duas entradas, o que tornaria a ordem relevante', () => {
    const todos = codeTheme.settings.flatMap((entry) => entry.scope);
    expect(new Set(todos).size).toBe(todos.length);
  });
});

// Este é o teste que motivou escrever um tema próprio: nenhum tema claro popular
// do Shiki passa aqui sobre um fundo com tom. Ver o comentário em code-theme.ts.
describe('contraste do destaque de sintaxe', () => {
  const fundos = [
    ['paperDeep', tokens.color.paperDeep],
    ['paper', tokens.color.paper],
  ] as const;

  for (const [nomeFundo, fundo] of fundos) {
    it(`toda cor de token atinge 4.5:1 sobre ${nomeFundo}`, () => {
      for (const cor of codeThemeForegrounds) {
        expect(contrastRatio(cor, fundo), `${cor} sobre ${nomeFundo}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  it('cobre todas as cores do tema, não uma amostra', () => {
    // Se alguém adicionar um escopo novo e esquecer de somá-lo à lista, este
    // teste falha antes de a cor sem verificação chegar a uma página.
    expect(codeThemeForegrounds).toHaveLength(codeTheme.settings.length + 1);
  });
});
