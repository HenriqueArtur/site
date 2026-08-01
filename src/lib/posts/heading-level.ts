/** Níveis que existem em HTML. */
export type Level = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * A tag de título do nível pedido.
 *
 * A lista de posts aparece sob aninhamentos diferentes — direto abaixo do
 * título do mês em `/blog/2026/07/`, e abaixo de ano e mês em `/blog/` — então
 * o nível não pode estar fixo dentro do componente. Fixo em `h4`, a página do
 * mês pula de h1 para h4, e quem navega por títulos no leitor de tela perde a
 * noção de onde está: um salto de nível soa como se uma seção inteira tivesse
 * sumido.
 *
 * Valida em vez de saturar. Um nível 7 vindo de um erro de chamada viraria
 * `<h6>` silenciosamente e esconderia o problema de hierarquia que causou.
 */
export function headingLevel(level: number): string {
  if (!Number.isInteger(level)) {
    throw new Error(`nível de título precisa ser inteiro, recebi ${level}`);
  }
  if (level < 1 || level > 6) {
    throw new Error(`nível de título precisa estar entre 1 e 6, recebi ${level}`);
  }
  return `h${level}`;
}
