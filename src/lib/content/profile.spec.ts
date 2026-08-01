import { describe, expect, it } from 'vitest';
import { locales } from '../i18n/locales.ts';
import { profile } from './profile.ts';

describe('profile', () => {
  it('tem tagline e localização nos dois idiomas, sem campo vazio', () => {
    for (const locale of locales) {
      expect(profile.tagline[locale].length).toBeGreaterThan(0);
      expect(profile.location[locale].length).toBeGreaterThan(0);
      expect(profile.role[locale].length).toBeGreaterThan(0);
    }
  });

  it('mantém o endereço estruturado coerente com o texto de tela', () => {
    // São duas representações do mesmo lugar: uma para ler, outra para o
    // buscador. Se alguém mudar de cidade e esquecer uma das duas, o dado
    // estruturado passa a mentir — e ninguém vê isso olhando a página.
    for (const locale of locales) {
      expect(profile.location[locale]).toContain(profile.address.city);
      expect(profile.location[locale]).toContain(profile.address.region);
    }
  });

  it('usa código ISO de país, e não o nome', () => {
    // schema.org espera alpha-2 em addressCountry; "Brasil" ali não resolve.
    expect(profile.address.country).toMatch(/^[A-Z]{2}$/);
  });

  it('tem todos os parágrafos de resumo traduzidos', () => {
    expect(profile.summary.length).toBeGreaterThan(0);
    for (const paragraph of profile.summary) {
      for (const locale of locales) {
        expect(paragraph[locale].length).toBeGreaterThan(0);
      }
    }
  });

  it('mantém a assinatura em inglês, sem versão traduzida', () => {
    // É carimbo, não frase: três palavras que identificam. Se um dia virar um
    // objeto Localized, esta expectativa avisa que a decisão mudou.
    expect(profile.signature).toBe('Software, Quality and Experience');
    expect(typeof profile.signature).toBe('string');
  });

  it('usa o e-mail do próprio domínio', () => {
    expect(profile.email).toBe('contato@henriqueartur.com');
  });

  it('não repete id entre os links', () => {
    const ids = profile.links.map((link) => link.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('só tem link com esquema seguro: https ou mailto', () => {
    for (const link of profile.links) {
      expect(link.href).toMatch(/^(https:\/\/|mailto:)/);
    }
  });
});
