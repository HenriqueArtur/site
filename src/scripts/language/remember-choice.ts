/**
 * Persiste a escolha de idioma feita no seletor.
 *
 * O redirecionamento em si acontece no script inline do `<head>` (ver
 * redirectTarget); aqui só se grava a preferência, para que a próxima visita
 * respeite a decisão do usuário em vez de reconsultar o navegador.
 *
 * As dependências entram por parâmetro em vez de serem alcançadas no escopo
 * global — é o que permite testar o comportamento em Node, sem jsdom.
 */

export const LOCALE_KEY = 'henriqueartur:locale';

const SUPPORTED = ['pt-BR', 'en'];

interface WritableStorage {
  setItem(key: string, value: string): void;
}

interface LinkLike {
  dataset: Record<string, string | undefined>;
  addEventListener(type: string, handler: () => void): void;
}

interface QueryRoot {
  querySelectorAll(selector: string): Iterable<LinkLike>;
}

export function rememberChoice(storage: WritableStorage, locale: string): void {
  if (!SUPPORTED.includes(locale)) return;

  try {
    storage.setItem(LOCALE_KEY, locale);
  } catch {
    // Navegação privada e cota cheia lançam aqui. Uma preferência opcional não
    // pode impedir a navegação, então o erro morre silenciosamente.
  }
}

export function bindLanguageLinks(root: QueryRoot, storage: WritableStorage): void {
  for (const link of root.querySelectorAll('[data-locale]')) {
    const locale = link.dataset.locale;
    if (locale === undefined) continue;

    link.addEventListener('click', () => rememberChoice(storage, locale));
  }
}
