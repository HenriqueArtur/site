/** Idiomas do site. pt-BR mora na raiz; en mora sob o prefixo /en. */
export const locales = ['pt-BR', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt-BR';

/** Texto que existe nos dois idiomas. */
export type Localized<T = string> = Record<Locale, T>;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
