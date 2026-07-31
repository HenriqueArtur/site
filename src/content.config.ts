import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Posts do blog.
 *
 * O padrão `index*.md` é deliberadamente mais largo do que os dois nomes
 * aceitos: um `index.fr.md` entra na coleção e explode no parsePostId com uma
 * mensagem clara, em vez de ser ignorado em silêncio e o autor ficar sem
 * entender por que o post não aparece.
 *
 * `generateId` devolve o caminho cru porque é dele que saem data, slug e
 * idioma — o disco é a fonte da verdade da URL.
 */
const blog = defineCollection({
  loader: glob({
    pattern: '**/index*.md',
    base: './content/blog',
    generateId: ({ entry }) => entry,
  }),
  schema: z.object({
    title: z.string().min(1, 'todo post precisa de título'),
    description: z.string().min(1, 'todo post precisa de descrição, usada em SEO e na listagem'),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
