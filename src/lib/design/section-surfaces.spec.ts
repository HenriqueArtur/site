import { describe, expect, it } from 'vitest';
import { type Surface, sectionSurfaces, surfaces } from './section-surfaces.ts';

const ordem = Object.keys(sectionSurfaces) as (keyof typeof sectionSurfaces)[];

describe('surfaces', () => {
  it('oferece quatro superfícies distintas', () => {
    expect(surfaces).toEqual(['grid', 'dots', 'plain', 'inverted']);
  });
});

describe('sectionSurfaces', () => {
  it('atribui uma superfície válida a cada seção', () => {
    for (const [id, surface] of Object.entries(sectionSurfaces)) {
      expect(surfaces, `seção ${id}`).toContain(surface as Surface);
    }
  });

  it('nunca repete a superfície em seções vizinhas', () => {
    // É a regra que faz o padrão existir. Sem ela, duas seções seguidas com a
    // mesma textura viram uma faixa contínua e o ritmo da página some.
    for (let i = 1; i < ordem.length; i++) {
      const anterior = ordem[i - 1] as keyof typeof sectionSurfaces;
      const atual = ordem[i] as keyof typeof sectionSurfaces;
      expect(
        sectionSurfaces[atual],
        `${String(atual)} repete a superfície de ${String(anterior)}`,
      ).not.toBe(sectionSurfaces[anterior]);
    }
  });

  it('deixa lisas as seções de leitura longa', () => {
    // Texto corrido sobre trama compete com a leitura. Cartão e lista curta
    // aguentam textura; parágrafo não.
    expect(sectionSurfaces.sobre).toBe('plain');
    expect(sectionSurfaces.formacao).toBe('plain');
  });

  it('usa a inversão uma vez só, para ela continuar sendo acento', () => {
    const invertidas = Object.values(sectionSurfaces).filter((s) => s === 'inverted');
    expect(invertidas).toHaveLength(1);
  });

  it('cobre exatamente as oito seções da home, sem sobra nem falta', () => {
    expect(ordem).toEqual([
      'sobre',
      'impacto',
      'projetos',
      'stack',
      'open-source',
      'trajetoria',
      'formacao',
      'contato',
    ]);
  });
});
