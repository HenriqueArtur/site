import { describe, expect, it } from 'vitest';
import { PERSON_ID, personSchema } from './person-schema.ts';

const site = 'https://henriqueartur.com';

describe('personSchema', () => {
  it('declara o tipo que os buscadores esperam', () => {
    expect(personSchema({ site, locale: 'pt-BR' })['@type']).toBe('Person');
  });

  it('não declara @context, que é do grafo e não do nó', () => {
    // Repetir o contexto em cada nó de um @graph é redundante e, em alguns
    // validadores, erro.
    expect(personSchema({ site, locale: 'pt-BR' })['@context']).toBeUndefined();
  });

  it('tem @id absoluto e estável, para os outros nós apontarem para cá', () => {
    expect(personSchema({ site, locale: 'pt-BR' })['@id']).toBe(
      `https://henriqueartur.com/${PERSON_ID}`,
    );
  });

  it('usa o mesmo @id nos dois idiomas', () => {
    // São a mesma pessoa. Dois ids fariam o buscador registrar duas.
    expect(personSchema({ site, locale: 'en' })['@id']).toBe(
      personSchema({ site, locale: 'pt-BR' })['@id'],
    );
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
    expect(personSchema({ site, locale: 'pt-BR', timeline: [] }).worksFor).toBeUndefined();
  });

  it('lista as instituições de ensino', () => {
    const { alumniOf } = personSchema({ site, locale: 'pt-BR' });
    expect(alumniOf).toContainEqual({
      '@type': 'CollegeOrUniversity',
      name: 'Universidade Federal do Ceará',
    });
  });

  it('tira as tecnologias dos projetos, e não de uma lista à parte', () => {
    // Uma lista escrita à mão viraria vitrine: cresceria com o que soa bem em
    // vez do que foi construído, e a diferença não apareceria em lugar nenhum.
    const { knowsAbout } = personSchema({
      site,
      locale: 'pt-BR',
      projects: [
        {
          id: 'a',
          name: { 'pt-BR': '', en: '' },
          context: '',
          description: { 'pt-BR': '', en: '' },
          tech: ['Rust', 'Node.js'],
        },
        {
          id: 'b',
          name: { 'pt-BR': '', en: '' },
          context: '',
          description: { 'pt-BR': '', en: '' },
          tech: ['Node.js', 'React'],
        },
      ],
    });
    expect(knowsAbout).toEqual(['Node.js', 'React', 'Rust']);
  });

  it('não repete tecnologia usada em mais de um projeto', () => {
    const { knowsAbout } = personSchema({ site, locale: 'pt-BR' });
    expect(knowsAbout.length).toBe(new Set(knowsAbout).size);
  });

  it('traz o endereço em campos separados, com país em código ISO', () => {
    expect(personSchema({ site, locale: 'pt-BR' }).address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Fortaleza',
      addressRegion: 'Ceará',
      addressCountry: 'BR',
    });
  });
});
