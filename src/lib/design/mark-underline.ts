const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Traço à mão sob uma palavra marcada, como imagem de fundo repetível.
 *
 * É SVG embutido em vez de arquivo: um traço de 300 bytes não justifica uma
 * requisição, e repetido no eixo X ele acompanha a palavra em qualquer largura,
 * inclusive quando a linha quebra.
 *
 * A cor vem por parâmetro para o traço nascer do mesmo lugar que todas as
 * outras cores do site. Cravá-la dentro do SVG criaria a segunda cópia da
 * paleta que o design system inteiro existe para evitar.
 *
 * O `#` da cor precisa virar `%23`: num data URI ele marca o início do
 * fragmento, e o navegador cortaria a imagem ali — o traço simplesmente não
 * aparece, sem erro.
 */
export function markUnderline(color: string): string {
  if (!HEX.test(color)) {
    throw new Error(`cor precisa ser hex de 6 dígitos, recebi ${JSON.stringify(color)}`);
  }

  // Aspas simples no SVG: aspas duplas fechariam o url("...") em volta.
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 8'>` +
    `<path d='M1 6 C 11 2, 20 7, 31 4 S 50 2, 63 5' fill='none' ` +
    `stroke='${color}' stroke-width='2.2' stroke-linecap='round'/>` +
    `</svg>`;

  const encoded = svg
    .replaceAll('<', '%3C')
    .replaceAll('>', '%3E')
    .replaceAll('#', '%23')
    .replaceAll('\n', '');

  return `url("data:image/svg+xml,${encoded}")`;
}
