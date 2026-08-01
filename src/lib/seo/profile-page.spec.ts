import { describe, expect, it } from 'vitest';
import { profilePage } from './profile-page.ts';

const site = 'https://henriqueartur.com';

describe('profilePage', () => {
  it('se declara como página de perfil', () => {
    expect(profilePage({ site, locale: 'pt-BR', url: `${site}/` })['@type']).toBe('ProfilePage');
  });

  it('aponta a pessoa como assunto principal, por referência', () => {
    // Sem `mainEntity`, a página só afirma que existe uma pessoa — não que ela
    // é sobre essa pessoa.
    expect(profilePage({ site, locale: 'pt-BR', url: `${site}/` }).mainEntity).toEqual({
      '@id': 'https://henriqueartur.com/#henrique',
    });
  });

  it('usa a URL da página como identidade', () => {
    const schema = profilePage({ site, locale: 'en', url: `${site}/en/` });
    expect(schema['@id']).toBe('https://henriqueartur.com/en/');
    expect(schema.url).toBe(schema['@id']);
  });

  it('declara o idioma da página', () => {
    // As duas versões são páginas diferentes; a pessoa é a mesma.
    expect(profilePage({ site, locale: 'en', url: `${site}/en/` }).inLanguage).toBe('en');
    expect(profilePage({ site, locale: 'pt-BR', url: `${site}/` }).mainEntity).toEqual(
      profilePage({ site, locale: 'en', url: `${site}/en/` }).mainEntity,
    );
  });
});
