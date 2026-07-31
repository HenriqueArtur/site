import { defineConfig } from 'astro/config';
import { codeTheme } from './src/lib/design/code-theme.ts';

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
    shikiConfig: {
      // Tema próprio, e não um pronto: medi os cinco temas claros mais usados do
      // Shiki e todos reprovam em contraste AA sobre o nosso fundo. Ver o
      // comentário e os testes em src/lib/design/code-theme.ts.
      theme: codeTheme,
      wrap: false,
    },
  },
});
