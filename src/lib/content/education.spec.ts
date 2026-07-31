import { describe, expect, it } from 'vitest';
import { locales } from '../i18n/locales.ts';
import { education } from './education.ts';

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

describe('education', () => {
  it('não repete id', () => {
    const ids = education.map((degree) => degree.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('usa AAAA-MM e nunca termina antes de começar', () => {
    for (const degree of education) {
      expect(degree.start, `início de ${degree.id}`).toMatch(MONTH);
      expect(degree.end, `fim de ${degree.id}`).toMatch(MONTH);
      expect(degree.end >= degree.start, `período de ${degree.id}`).toBe(true);
    }
  });

  it('está em ordem decrescente por início', () => {
    const starts = education.map((degree) => degree.start);
    expect(starts).toEqual([...starts].sort().reverse());
  });

  it('traduz título e nota', () => {
    for (const degree of education) {
      for (const locale of locales) {
        expect(degree.title[locale].length, `título de ${degree.id}`).toBeGreaterThan(0);
        if (degree.note) {
          expect(degree.note[locale].length, `nota de ${degree.id}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('tem os dois cursos já concluídos', () => {
    // O MBA terminou em jan/2026. Se um dia entrar formação em andamento,
    // o tipo precisa aceitar `end: null` e este teste muda junto.
    expect(education.every((degree) => degree.end !== null)).toBe(true);
  });
});
