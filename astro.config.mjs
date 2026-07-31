import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig } from 'astro/config';
import { codeTheme } from './src/lib/design/code-theme.ts';
import { externalLinks } from './src/lib/seo/external-links.ts';

// A configuração de i18n entra na fase 4, junto com as rotas em inglês.
// Aqui fica só o mínimo que a fase 1 precisa para gerar HTML estático.
export default defineConfig({
  site: 'https://henriqueartur.com',
  trailingSlash: 'always',
  build: {
    // Gera <rota>/index.html, que é o que o esquema de URL do blog exige.
    format: 'directory',
  },
  markdown: {
    /*
     * O processador é declarado explicitamente porque o plugin precisa entrar
     * nele. `markdown.rehypePlugins` ainda existe no Astro 7, mas está
     * depreciado e exige instalar `@astrojs/markdown-remark`, que deixou de vir
     * por padrão — o Satteri é o processador novo e aceita a mesma ideia de
     * plugin sem dependência adicional.
     */
    processor: satteri({
      hastPlugins: [
        externalLinks({
          site: 'https://henriqueartur.com',
          labels: { 'pt-BR': 'abre em nova aba', en: 'opens in a new tab' },
        }),
      ],
    }),
    shikiConfig: {
      // Tema próprio, e não um pronto: medi os cinco temas claros mais usados do
      // Shiki e todos reprovam em contraste AA sobre o nosso fundo. Ver o
      // comentário e os testes em src/lib/design/code-theme.ts.
      theme: codeTheme,
      wrap: false,
    },
  },
});
