import { defineConfig } from 'astro/config';

// A configuração de i18n entra na fase 4, junto com as rotas em inglês.
// Aqui fica só o mínimo que a fase 1 precisa para gerar HTML estático.
export default defineConfig({
  site: 'https://henriqueartur.com',
  trailingSlash: 'always',
  build: {
    // Gera <rota>/index.html, que é o que o esquema de URL do blog exige.
    format: 'directory',
  },
});
