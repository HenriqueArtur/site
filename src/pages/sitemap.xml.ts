import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { locales } from '../lib/i18n/locales.ts';
import { groupPosts } from '../lib/posts/group-posts.ts';
import { selectPosts } from '../lib/posts/select-posts.ts';
import { blogVisible } from '../lib/routes/blog-visible.ts';
import { type SitemapUrl, sitemapXml } from '../lib/seo/sitemap-xml.ts';

export async function GET(context: APIContext) {
  const entries = await getCollection('blog');
  const site = context.site?.origin ?? 'https://henriqueartur.com';
  const urls: SitemapUrl[] = [];

  /*
   * A data mais recente de um conjunto de posts.
   *
   * Uma página de arquivo muda de verdade quando entra um post nela, então a
   * data do post mais novo é o que ela tem de mais próximo de "última
   * modificação" — e é um sinal honesto de quando vale revisitar.
   */
  const newest = (group: { date: Date }[]) =>
    group.reduce<Date | undefined>(
      (latest, post) => (latest && latest >= post.date ? latest : post.date),
      undefined,
    );

  for (const locale of locales) {
    const prefix = locale === 'en' ? '/en' : '';
    const posts = selectPosts(entries, locale);

    /*
     * A home sai sem lastmod de propósito.
     *
     * Ela muda quando o perfil muda, e isso não está datado em lugar nenhum.
     * Preencher com a data do build seria mentir toda vez que o CI roda, e
     * rastreador que percebe lastmod mentiroso passa a ignorar o campo no site
     * inteiro — inclusive onde ele é verdadeiro.
     */
    urls.push({ path: `${prefix}/` });

    // Sitemap prometendo URL que responde 404 é pior que sitemap curto: o
    // rastreador registra o erro e passa a confiar menos no arquivo inteiro.
    if (!blogVisible(import.meta.env.DEV)) continue;

    urls.push({ path: `${prefix}/blog/`, lastModified: newest(posts) });

    for (const year of groupPosts(posts)) {
      const yearPosts = year.months.flatMap((month) => month.posts);
      urls.push({ path: `${prefix}/blog/${year.year}/`, lastModified: newest(yearPosts) });

      for (const month of year.months) {
        urls.push({
          path: `${prefix}/blog/${year.year}/${String(month.month).padStart(2, '0')}/`,
          lastModified: newest(month.posts),
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
