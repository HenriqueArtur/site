import { describe, expect, it, vi } from 'vitest';
import { bindLanguageLinks, LOCALE_KEY, rememberChoice } from './remember-choice.ts';

function fakeStorage() {
  const data = new Map<string, string>();
  return {
    data,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

function fakeLink(locale?: string) {
  const handlers: Array<() => void> = [];
  return {
    dataset: locale === undefined ? {} : { locale },
    addEventListener: (_type: string, handler: () => void) => handlers.push(handler),
    click: () => {
      for (const handler of handlers) handler();
    },
  };
}

describe('rememberChoice', () => {
  it('salva o idioma escolhido', () => {
    const storage = fakeStorage();
    rememberChoice(storage, 'en');
    expect(storage.data.get(LOCALE_KEY)).toBe('en');
  });

  it('sobrescreve uma escolha anterior', () => {
    const storage = fakeStorage();
    rememberChoice(storage, 'en');
    rememberChoice(storage, 'pt-BR');
    expect(storage.data.get(LOCALE_KEY)).toBe('pt-BR');
  });

  it('ignora idioma não suportado, para não gravar lixo que trava a detecção', () => {
    const storage = fakeStorage();
    rememberChoice(storage, 'klingon');
    expect(storage.data.has(LOCALE_KEY)).toBe(false);
  });

  it('não quebra quando o storage recusa a escrita', () => {
    // Safari em navegação privada e cotas cheias lançam em setItem. Falhar aqui
    // impediria a navegação do usuário por causa de uma preferência opcional.
    const storage = {
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(() => rememberChoice(storage, 'en')).not.toThrow();
  });
});

describe('bindLanguageLinks', () => {
  it('salva o idioma do link ao clicar', () => {
    const storage = fakeStorage();
    const link = fakeLink('en');
    bindLanguageLinks({ querySelectorAll: () => [link] }, storage);

    link.click();

    expect(storage.data.get(LOCALE_KEY)).toBe('en');
  });

  it('não faz nada com link sem data-locale', () => {
    const storage = fakeStorage();
    const link = fakeLink();
    bindLanguageLinks({ querySelectorAll: () => [link] }, storage);

    link.click();

    expect(storage.data.size).toBe(0);
  });

  it('liga todos os links encontrados, não só o primeiro', () => {
    const storage = fakeStorage();
    const pt = fakeLink('pt-BR');
    const en = fakeLink('en');
    bindLanguageLinks({ querySelectorAll: () => [pt, en] }, storage);

    en.click();
    expect(storage.data.get(LOCALE_KEY)).toBe('en');

    pt.click();
    expect(storage.data.get(LOCALE_KEY)).toBe('pt-BR');
  });

  it('procura pelos links pelo atributo data-locale', () => {
    const querySelectorAll = vi.fn(() => []);
    bindLanguageLinks({ querySelectorAll }, fakeStorage());
    expect(querySelectorAll).toHaveBeenCalledWith('[data-locale]');
  });
});
