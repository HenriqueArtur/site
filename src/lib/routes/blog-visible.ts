/**
 * O blog está publicado?
 *
 * Interruptor único, e por isso existe como módulo em vez de um
 * `import.meta.env.DEV` espalhado: o blog toca sete lugares — as páginas, o
 * feed, o sitemap, o llms.txt, o link do `<head>`, o link da home e o da 404.
 * Se um deles ficar para trás, o resultado é pior que esconder tudo: link para
 * página que não existe, ou sitemap prometendo URL que dá 404.
 *
 * Desde setembro de 2026 o blog é público, e a resposta é `true` em qualquer
 * ambiente. A regra anterior era "só em desenvolvimento", enquanto não havia
 * conteúdo suficiente para publicar.
 *
 * O parâmetro fica, sem ser lido. Ele é o que mantém a volta atrás barata: para
 * esconder o blog de novo — uma reescrita grande, uma migração de URL — basta
 * devolver `isDev` aqui, e os sete lugares acompanham sem tocar em nenhum
 * deles. Tirar o parâmetro custaria dez arquivos para economizar uma linha.
 */
export function blogVisible(_isDev: boolean): boolean {
  return true;
}
