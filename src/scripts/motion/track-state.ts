const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Quanto da linha do tempo já foi percorrido, de 0 a 1.
 *
 * O percurso é medido contra uma altura fixa da janela — o "limiar" —, e não
 * contra a posição de cada elemento. É isso que mantém a linha e os marcadores
 * em sincronia: os dois respondem ao mesmo número, então não há como um chegar
 * antes do outro. Sincronizar duas animações independentes seria possível, e
 * seria o tipo de coisa que dessincroniza no primeiro ajuste de espaçamento.
 *
 * O limiar fica perto da borda de baixo (85%), e não no centro. Com ele no
 * meio, a parada só acendia depois de já estar bem visível — e como o cargo
 * escondido continua ocupando espaço no layout, ficava um buraco embaixo do
 * nome da empresa até a linha chegar lá.
 */
export function trackProgress(
  rect: { top: number; height: number },
  viewportHeight: number,
  threshold = 0.85,
): number {
  if (rect.height <= 0) return 1;

  const line = viewportHeight * threshold;
  return clamp((line - rect.top) / rect.height, 0, 1);
}

/**
 * Posição de cada marcador ao longo da linha, normalizada de 0 a 1.
 *
 * A linha vai do centro do primeiro marcador ao centro do último — e não das
 * bordas da lista. Assim o progresso 0 significa exatamente "no primeiro
 * marcador" e 1 significa "no último", sem sobra em nenhuma ponta.
 */
export function markerOffsets(centers: readonly number[]): number[] {
  const first = centers[0];
  const last = centers.at(-1);
  if (first === undefined || last === undefined) return [];

  const span = last - first;
  // Todos na mesma altura dividiria por zero e produziria NaN, que vira
  // `scaleY(NaN)` — a linha simplesmente sumiria, sem erro.
  if (span === 0) return centers.map(() => 0);

  return centers.map((center) => (center - first) / span);
}

/** Quais marcadores a linha já alcançou. */
export function reachedMarkers(progress: number, offsets: readonly number[]): boolean[] {
  // `progress > 0` também para o primeiro marcador, que está em 0: sem isso ele
  // nasceria aceso, antes de a linha ter desenhado qualquer coisa.
  return offsets.map((offset) => progress > 0 && progress >= offset);
}
