import { describe, expect, it } from 'vitest';
import { isExternal } from './is-external.ts';

const site = 'https://henriqueartur.com';

describe('isExternal', () => {
  it('reconhece link para outro domínio', () => {
    expect(isExternal('https://github.com/HenriqueArtur', site)).toBe(true);
    expect(isExternal('https://pokeapi.co/docs/v2', site)).toBe(true);
  });

  it('não considera externo o próprio domínio', () => {
    expect(isExternal('https://henriqueartur.com/blog/', site)).toBe(false);
  });

  it('não considera externo um caminho relativo', () => {
    expect(isExternal('/blog/', site)).toBe(false);
    expect(isExternal('/2026/07/31/post/', site)).toBe(false);
    expect(isExternal('../outro/', site)).toBe(false);
  });

  it('não considera externo uma âncora na própria página', () => {
    expect(isExternal('#conteudo', site)).toBe(false);
  });

  it('não considera externo mailto', () => {
    // Abre o cliente de e-mail, não uma aba. `target=_blank` ali só deixa uma
    // aba em branco para trás.
    expect(isExternal('mailto:contato@henriqueartur.com', site)).toBe(false);
  });

  it('não considera externos tel e outros esquemas que não navegam', () => {
    expect(isExternal('tel:+5585999999999', site)).toBe(false);
  });

  it('trata subdomínio como externo', () => {
    expect(isExternal('https://blog.henriqueartur.com/', site)).toBe(true);
  });

  it('ignora diferença de protocolo no próprio domínio', () => {
    expect(isExternal('http://henriqueartur.com/blog/', site)).toBe(false);
  });

  it('devolve false para href vazio ou ausente', () => {
    expect(isExternal('', site)).toBe(false);
    expect(isExternal(undefined, site)).toBe(false);
  });

  it('não quebra com href malformado', () => {
    // Um href inválido não deve derrubar o build; na dúvida, trata como interno.
    expect(isExternal('http://[', site)).toBe(false);
    expect(isExternal(':::', site)).toBe(false);
  });
});
