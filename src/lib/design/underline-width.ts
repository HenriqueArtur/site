/**
 * Largura do traço sob um título, a partir das larguras das linhas dele.
 *
 * O traço acompanha a **última** linha, que é onde o texto termina. Um traço da
 * largura total sob um título de duas linhas fica solto no ar à direita da
 * última, e lê como desalinhamento em vez de sublinhado.
 *
 * O piso existe para o caso de a última linha ser uma palavra só: um risco de
 * 40px sob "conversar" lê como defeito. Abaixo do piso, o traço passa a medir
 * uma fração da linha mais larga.
 *
 * Devolve `null` quando não há o que medir — o chamador mantém o padrão do CSS
 * em vez de aplicar uma largura errada.
 */
export function underlineWidth(lineWidths: readonly number[], minRatio = 0.4): number | null {
  // Quebras vazias produzem retângulos de largura zero; medir por eles daria
  // um traço invisível.
  const lines = lineWidths.filter((width) => width > 0);

  const last = lines.at(-1);
  if (last === undefined) return null;

  return Math.max(last, Math.max(...lines) * minRatio);
}
