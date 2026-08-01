import { describe, expect, it } from 'vitest';
import { personSchema, personSchemaJson } from './person-schema.ts';

const site = 'https://henriqueartur.com';

describe('personSchema', () => {
  it('declara o tipo e o contexto que os buscadores esperam', () => {
    const schema = personSchema({ site, locale: 'pt-BR' });
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Person');
  });

  it('leva nome, cargo e e-mail', () => {
    const schema = personSchema({ site, locale: 'pt-BR' });
    expect(schema.name).toBe('Henrique Artur');
    expect(schema.jobTitle).toBe('Tech Lead');
    expect(schema.email).toBe('mailto:contato@henriqueartur.com');
  });

  it('usa a URL canônica do idioma', () => {
    expect(personSchema({ site, locale: 'pt-BR' }).url).toBe('https://henriqueartur.com/');
    expect(personSchema({ site, locale: 'en' }).url).toBe('https://henriqueartur.com/en/');
  });

  it('lista os perfis externos em sameAs, que é como o buscador liga as contas', () => {
    const { sameAs } = personSchema({ site, locale: 'pt-BR' });
    expect(sameAs).toContain('https://github.com/HenriqueArtur');
    expect(sameAs).toContain('https://www.linkedin.com/in/henriqueartur/');
  });

  it('não põe mailto nem caminho interno em sameAs', () => {
    // `sameAs` é para perfis em outros sites. Um mailto ali é ruído para o
    // buscador e não liga conta nenhuma.
    for (const url of personSchema({ site, locale: 'pt-BR' }).sameAs) {
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toContain('henriqueartur.com');
    }
  });

  it('descreve a pessoa no idioma da página', () => {
    expect(personSchema({ site, locale: 'pt-BR' }).description).toMatch(/Construindo/);
    expect(personSchema({ site, locale: 'en' }).description).toMatch(/Building/);
  });

  it('nomeia o empregador atual', () => {
    const { worksFor } = personSchema({ site, locale: 'pt-BR' });
    expect(worksFor).toEqual({ '@type': 'Organization', name: 'Sunne Energias Renováveis' });
  });

  it('não inventa emprego quando não há experiência em aberto', () => {
    // O empregador sai do dado, não de uma constante: se um dia não houver
    // experiência em aberto, o campo simplesmente não é afirmado.
    const schema = personSchema({ site, locale: 'pt-BR', timeline: [] });
    expect(schema.worksFor).toBeUndefined();
  });
});

describe('personSchemaJson', () => {
  it('devolve JSON válido', () => {
    const json = personSchemaJson({ site, locale: 'pt-BR' });
    expect(() => JSON.parse(json)).not.toThrow();
    expect(JSON.parse(json)['@type']).toBe('Person');
  });

  it('escapa o sinal de menor, para o conteúdo não fechar a tag script', () => {
    // Um `</script>` dentro de qualquer texto encerraria o bloco no meio e o
    // resto viraria HTML. É o caminho clássico de injeção via JSON embutido.
    const json = personSchemaJson({
      site,
      locale: 'pt-BR',
      overrides: { name: 'Henrique </script><img src=x>' },
    });

    expect(json).not.toContain('</script>');
    expect(json).toContain('\\u003c');
    expect(JSON.parse(json).name).toBe('Henrique </script><img src=x>');
  });
});
