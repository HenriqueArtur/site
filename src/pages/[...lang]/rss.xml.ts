import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { profile } from '../../lib/content/profile.ts';
import { type Locale, locales } from '../../lib/i18n/locales.ts';
import { ui } from '../../lib/i18n/ui.ts';
import { type Post, selectPosts } from '../../lib/posts/select-posts.ts';
import { rssFeed } from '../../lib/seo/rss-feed.ts';

export async function getStaticPaths() {
  const entries = await getCollection('blog');

  return locales.map((locale) => ({
    params: { lang: locale === 'en' ? 'en' : undefined },
    props: { locale, posts: selectPosts(entries, locale) },
  }));
}

export function GET(context: APIContext) {
  // `context.props` chega como `any` no endpoint; sem a anotação o tsc perde o
  // tipo do locale e o acesso ao dicionário vira índice implícito.
  const { locale, posts } = context.props as { locale: Locale; posts: Post[] };
  const site = context.site?.origin ?? 'https://henriqueartur.com';
  const feedPath = locale === 'en' ? '/en/rss.xml' : '/rss.xml';

  const xml = rssFeed({
    title: `${profile.name} — ${ui.blogTitle[locale]}`,
    description: ui.blogDescription[locale],
    site,
    feedPath,
    language: locale,
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      path: post.path,
      date: post.date,
    })),
  });

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
