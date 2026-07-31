import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { locales } from '../lib/i18n/locales.ts';
import { groupPosts } from '../lib/posts/group-posts.ts';
import { selectPosts } from '../lib/posts/select-posts.ts';
import { type SitemapUrl, sitemapXml } from '../lib/seo/sitemap-xml.ts';

export async function GET(context: APIContext) {
  const entries = await getCollection('blog');
  const site = context.site?.origin ?? 'https://henriqueartur.com';
  const urls: SitemapUrl[] = [];

  for (const locale of locales) {
    const prefix = locale === 'en' ? '/en' : '';
    const posts = selectPosts(entries, locale);

    urls.push({ path: `${prefix}/` }, { path: `${prefix}/blog/` });

    for (const year of groupPosts(posts)) {
      urls.push({ path: `${prefix}/blog/${year.year}/` });
      for (const month of year.months) {
        urls.push({
          path: `${prefix}/blog/${year.year}/${String(month.month).padStart(2, '0')}/`,
        });
      }
    }

    for (const post of posts) {
      urls.push({ path: post.path, lastModified: post.date });
    }
  }

  return new Response(sitemapXml(site, urls), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
