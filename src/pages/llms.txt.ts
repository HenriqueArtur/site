import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { profile } from '../lib/content/profile.ts';
import { locales } from '../lib/i18n/locales.ts';
import { selectPosts } from '../lib/posts/select-posts.ts';
import { blogVisible } from '../lib/routes/blog-visible.ts';
import { llmsTxt } from '../lib/seo/llms-txt.ts';

export async function GET(context: APIContext) {
  const entries = await getCollection('blog');
  const site = context.site?.origin ?? 'https://henriqueartur.com';

  // Sem blog publicado, não há post para listar nem feed para apontar.
  const temBlog = blogVisible(import.meta.env.DEV);
  const posts = temBlog ? locales.flatMap((locale) => selectPosts(entries, locale)) : [];

  const body = llmsTxt({
    site,
    summary:
      `${profile.role['pt-BR']}. ${profile.tagline['pt-BR']}. ` +
      `Site pessoal em português e inglês, com perfil profissional${temBlog ? ' e blog técnico' : ''}.`,
    sections: [
      {
        heading: 'Páginas',
        entries: [
          {
            title: 'Início (pt-BR)',
            path: '/',
            description:
              'Perfil, projetos, impacto, trajetória, formação e código aberto. Mesmo conteúdo em /en/.',
          },
          ...(temBlog
            ? [
                {
                  title: 'Blog (pt-BR)',
                  path: '/blog/',
                  description:
                    'Índice dos posts, agrupado por ano e mês. Mesmo índice em /en/blog/.',
                },
              ]
            : []),
        ],
      },
      {
        heading: 'Posts',
        // Os dois idiomas na mesma lista, cada um com a própria URL: são textos
        // distintos, e o caminho já diz qual é qual.
        entries: posts.map((post) => ({
          title: `${post.title} (${post.locale})`,
          path: post.path,
          description: post.description,
        })),
      },
      {
        heading: 'Dados',
        entries: [
          { title: 'Sitemap', path: '/sitemap.xml', description: 'Todas as URLs do site.' },
          ...(temBlog
            ? [
                {
                  title: 'RSS (pt-BR)',
                  path: '/rss.xml',
                  description: 'Feed dos posts em português.',
                },
                {
                  title: 'RSS (en)',
                  path: '/en/rss.xml',
                  description: 'Feed dos posts em inglês.',
                },
              ]
            : []),
        ],
      },
    ],
    notes: [
      'Todo o conteúdo é escrito por Henrique Artur.',
      `As páginas trazem dados estruturados schema.org (Person, ProfilePage${temBlog ? ', BlogPosting, BreadcrumbList' : ''}) — costumam ser mais confiáveis que extrair do HTML.`,
      `Contato: ${profile.email}`,
    ],
  });

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
