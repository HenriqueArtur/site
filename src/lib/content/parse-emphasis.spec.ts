import { describe, expect, it } from 'vitest';
import { parseEmphasis } from './parse-emphasis.ts';

describe('parseEmphasis', () => {
  it('devolve um trecho só quando não há marcação', () => {
    expect(parseEmphasis('texto simples')).toEqual([{ text: 'texto simples', marked: false }]);
  });

  it('separa o trecho marcado dos que o cercam', () => {
    expect(parseEmphasis('antes *meio* depois')).toEqual([
      { text: 'antes ', marked: false },
      { text: 'meio', marked: true },
      { text: ' depois', marked: false },
    ]);
  });

  it('reconhece marcação no começo e no fim', () => {
    expect(parseEmphasis('*início* do texto')[0]).toEqual({ text: 'início', marked: true });
    expect(parseEmphasis('texto do *fim*').at(-1)).toEqual({ text: 'fim', marked: true });
  });

  it('reconhece mais de uma marcação', () => {
    const trechos = parseEmphasis('*um* e *outro*');
    expect(trechos.filter((t) => t.marked).map((t) => t.text)).toEqual(['um', 'outro']);
  });

  it('marca trechos com várias palavras', () => {
    expect(parseEmphasis('*duas palavras* aqui')[0]?.text).toBe('duas palavras');
  });

  it('deixa asterisco sem par como texto literal', () => {
    // 3 * 4 não pode virar marcação. Sem par, o caractere é só um caractere.
    expect(parseEmphasis('3 * 4 = 12')).toEqual([{ text: '3 * 4 = 12', marked: false }]);
  });

  it('ignora marcação vazia', () => {
    expect(parseEmphasis('a ** b')).toEqual([{ text: 'a ** b', marked: false }]);
  });

  it('não produz trechos vazios', () => {
    for (const trecho of parseEmphasis('*a*b*c*')) {
      expect(trecho.text.length).toBeGreaterThan(0);
    }
  });

  it('preserva acentos e pontuação dentro da marcação', () => {
    expect(parseEmphasis('*convenção em regra verificável*')[0]?.text).toBe(
      'convenção em regra verificável',
    );
  });

  it('devolve lista vazia para texto vazio', () => {
    expect(parseEmphasis('')).toEqual([]);
  });

  it('reconstrói o texto original ao juntar os trechos', () => {
    // A marcação some, o conteúdo não: nenhum caractere pode se perder no meio.
    const original = 'Tech Lead com *mais de 6 anos* liderando *times e projetos*.';
    const junto = parseEmphasis(original)
      .map((t) => t.text)
      .join('');
    expect(junto).toBe(original.replaceAll('*', ''));
  });
});
