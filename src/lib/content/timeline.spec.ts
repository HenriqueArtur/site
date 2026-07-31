import { describe, expect, it } from 'vitest';
import { locales } from '../i18n/locales.ts';
import { timeline } from './timeline.ts';

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

describe('timeline', () => {
  it('não repete id', () => {
    const ids = timeline.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('usa AAAA-MM em todas as datas', () => {
    for (const entry of timeline) {
      expect(entry.start, `início de ${entry.id}`).toMatch(MONTH);
      if (entry.end !== null) expect(entry.end, `fim de ${entry.id}`).toMatch(MONTH);

      for (const role of entry.roles) {
        expect(role.start, `início de cargo em ${entry.id}`).toMatch(MONTH);
        if (role.end !== null) expect(role.end, `fim de cargo em ${entry.id}`).toMatch(MONTH);
      }
    }
  });

  it('está em ordem decrescente por início, que é como a seção é lida', () => {
    const starts = timeline.map((entry) => entry.start);
    expect(starts).toEqual([...starts].sort().reverse());
  });

  it('nunca tem fim anterior ao início', () => {
    for (const entry of timeline) {
      if (entry.end !== null) {
        expect(entry.end >= entry.start, `período de ${entry.id}`).toBe(true);
      }
      for (const role of entry.roles) {
        if (role.end !== null) {
          expect(role.end >= role.start, `cargo em ${entry.id}`).toBe(true);
        }
      }
    }
  });

  it('mantém os cargos de cada empresa em ordem decrescente', () => {
    for (const entry of timeline) {
      const starts = entry.roles.map((role) => role.start);
      expect(starts, `cargos de ${entry.id}`).toEqual([...starts].sort().reverse());
    }
  });

  it('faz o período da empresa cobrir o de todos os seus cargos', () => {
    for (const entry of timeline) {
      for (const role of entry.roles) {
        expect(role.start >= entry.start, `cargo começa antes da empresa em ${entry.id}`).toBe(
          true,
        );
        if (entry.end !== null && role.end !== null) {
          expect(role.end <= entry.end, `cargo termina depois da empresa em ${entry.id}`).toBe(
            true,
          );
        }
      }
    }
  });

  it('tem exatamente uma experiência em aberto: a atual', () => {
    const current = timeline.filter((entry) => entry.end === null);
    expect(current).toHaveLength(1);
    expect(current[0]?.id).toBe('sunne');
  });

  it('traduz todos os títulos de cargo e todas as notas', () => {
    for (const entry of timeline) {
      for (const role of entry.roles) {
        for (const locale of locales) {
          expect(role.title[locale].length, `cargo em ${entry.id}`).toBeGreaterThan(0);
        }
      }
      if (!entry.note) continue;
      for (const locale of locales) {
        expect(entry.note[locale].length, `nota de ${entry.id}`).toBeGreaterThan(0);
      }
    }
  });
});
