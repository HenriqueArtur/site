/**
 * Quanto cada elemento precisa se deslocar para se sobrepor ao primeiro.
 *
 * É o que permite a pilha ser real em vez de aproximada: um valor fixo como
 * "-4.5rem" empilha bem com dois cartões e erra feio com seis, porque a
 * distância entre eles depende da altura de cada um, que depende do texto.
 *
 * O deslocamento é medido, não estimado — e por isso precisa ser recalculado
 * quando a janela muda de tamanho.
 */
export function stackOffsets(tops: readonly number[]): number[] {
  const [first] = tops;
  if (first === undefined) return [];

  return tops.map((top) => first - top);
}
