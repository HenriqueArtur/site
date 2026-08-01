/**
 * O blog está publicado?
 *
 * Interruptor único, e por isso existe como módulo em vez de um
 * `import.meta.env.DEV` espalhado: esconder o blog toca sete lugares — as
 * páginas, o feed, o sitemap, o llms.txt, o link do `<head>`, o link da home e o
 * da 404. Se um deles ficar para trás, o resultado é pior que não esconder
 * nada: link para página que não existe, ou sitemap prometendo URL que dá 404.
 *
 * Hoje a regra é "só em desenvolvimento", enquanto não há conteúdo suficiente
 * para publicar. Quando houver, isto vira `true` num lugar só, e todos os sete
 * acompanham.
 *
 * Recebe o sinalizador em vez de ler `import.meta.env` aqui dentro, para poder
 * ser testado nos dois estados — o estado "publicado" precisa ser verificável
 * antes de valer de verdade.
 */
export function blogVisible(isDev: boolean): boolean {
  return isDev;
}
