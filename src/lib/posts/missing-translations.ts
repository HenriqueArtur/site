import { type Locale, locales } from '../i18n/locales.ts';
import { type Post, type PostEntry, selectPosts } from './select-posts.ts';

const key = (post: Post) => `${post.year}/${post.month}/${post.day}/${post.slug}`;

/**
 * Posts que existem em algum idioma, mas não em `locale`.
 *
 * Servem para gerar, na URL traduzida que não existe, uma página que explica a
 * ausência e leva à versão disponível. A alternativa seria um 404 — que trata
 * como erro do visitante algo que é só conteúdo ainda não traduzido.
 *
 * Cada post volta no idioma em que de fato existe, para o link apontar para lá.
 */
export function missingTranslations(entries: readonly PostEntry[], locale: Locale): Post[] {
  const present = new Set(selectPosts(entries, locale).map(key));

  return locales
    .filter((other) => other !== locale)
    .flatMap((other) => selectPosts(entries, other))
    .filter((post) => !present.has(key(post)));
}
