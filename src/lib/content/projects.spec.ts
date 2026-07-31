import { describe, expect, it } from 'vitest';
import { locales } from '../i18n/locales.ts';
import { projects } from './projects.ts';

describe('projects', () => {
  it('não repete id', () => {
    const ids = projects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tem nome e descrição nos dois idiomas', () => {
    for (const project of projects) {
      for (const locale of locales) {
        expect(project.name[locale].length, `nome de ${project.id}`).toBeGreaterThan(0);
        expect(project.description[locale].length, `descrição de ${project.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('nomeia o contexto de cada projeto, para o leitor saber onde foi feito', () => {
    for (const project of projects) {
      expect(project.context.length, `contexto de ${project.id}`).toBeGreaterThan(0);
    }
  });

  it('lista pelo menos uma tecnologia por projeto, sem repetição interna', () => {
    for (const project of projects) {
      expect(project.tech.length, `tech de ${project.id}`).toBeGreaterThan(0);
      expect(new Set(project.tech).size).toBe(project.tech.length);
    }
  });

  it('usa id em kebab-case, porque vira âncora de URL', () => {
    for (const project of projects) {
      expect(project.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });
});
