import { describe, expect, it } from 'vitest';
import { locales } from './locales.ts';
import { ui } from './ui.ts';

describe('ui', () => {
  it('tem todas as chaves preenchidas nos dois idiomas', () => {
    for (const [key, value] of Object.entries(ui)) {
      for (const locale of locales) {
        expect(value[locale], `${key} em ${locale}`).toBeTruthy();
        expect(value[locale].trim().length, `${key} em ${locale}`).toBeGreaterThan(0);
      }
    }
  });

  it('não deixa texto por traduzir: nenhum rótulo repete os dois idiomas sem razão', () => {
    // Termos que são iguais nos dois idiomas de propósito. Qualquer outra chave
    // com texto idêntico é sinal de tradução esquecida.
    const iguaisDePropósito = new Set([
      'stackLabel',
      'openSourceLabel',
      'switchToPortuguese',
      'switchToEnglish',
    ]);

    for (const [key, value] of Object.entries(ui)) {
      if (iguaisDePropósito.has(key)) continue;
      expect(value['pt-BR'], `${key} parece não traduzido`).not.toBe(value.en);
    }
  });

  it('oferece os dois idiomas no seletor', () => {
    expect(ui.switchToPortuguese['pt-BR']).toBe('Português');
    expect(ui.switchToEnglish.en).toBe('English');
  });
});
