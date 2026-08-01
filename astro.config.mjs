import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig } from 'astro/config';
import { codeTheme } from './src/lib/design/code-theme.ts';
import { externalLinks } from './src/lib/seo/external-links.ts';
import { ogPosts } from './tools/og-posts.mjs';

// A configuração de i18n entra na fase 4, junto com as rotas em inglês.
// Aqui fica só o mínimo que a fase 1 precisa para gerar HTML estático.
/*
 * Sobre CSP: `security.csp` fica desligada, e não por esquecimento.
 *
 * O Astro 7 gera uma `<meta http-equiv="content-security-policy">` com hash de
 * cada script e estilo. Medido neste projeto: ela sai correta, mas o Shiki
 * pinta cada token com atributo `style` inline, e `style-src` cobre atributo
 * também. Pôr `'unsafe-inline'` não resolve — a especificação manda o navegador
 * ignorá-lo quando existe hash na mesma diretiva, e o Astro sempre emite hashes.
 * O resultado seria bloco de código sem cor nenhuma, num blog técnico.
 *
 * A saída sugerida pela documentação do Astro é trocar Shiki por Prism, o que
 * jogaria fora o tema com contraste medido em code-theme.ts.
 *
 * O que se ganharia é pouco: site estático, sem entrada de usuário, sem script
 * de terceiro e sem nada renderizado a partir de query string. A superfície de
 * XSS é o texto que o próprio autor escreve.
 *
 * Se um dia entrar formulário, comentário ou script de terceiro, esta conta
 * muda e vale reabrir.
 */
export default defineConfig({
  site: 'https://henriqueartur.com',
  trailingSlash: 'always',
  /*
   * As imagens de compartilhamento dos posts são geradas no build, não
   * commitadas: são função pura do frontmatter, dos tokens e da fonte, então
   * são saída de build como o resto do dist/. Commitá-las cresceria 2 binários
   * por post no histórico, para sempre — e permitiria publicar um post com a
   * imagem desatualizada.
   */
  integrations: [ogPosts()],
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
