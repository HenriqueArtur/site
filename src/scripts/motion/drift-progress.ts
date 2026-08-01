export interface DriftInput {
  /** Topo da caixa grudada, em coordenadas da janela. */
  boxTop: number;
  /** Distância do topo da janela onde o elemento para. */
  stickyTop: number;
  /** Em quantos pixels de rolagem o deslocamento se completa. */
  ramp: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Quanto o elemento grudado já se afastou, de 0 a 1.
 *
 * Enquanto ele acompanha a rolagem normalmente, é 0 — não há sobreposição para
 * resolver. A conta só começa quando ele PARA: é a partir daí que o texto passa
 * por baixo dele.
 *
 * `boxTop` fica negativo depois de grudar, porque a caixa que o contém continua
 * subindo enquanto o elemento fica parado. Essa diferença é justamente o quanto
 * de rolagem já aconteceu com ele parado.
 */
export function driftProgress({ boxTop, stickyTop, ramp }: DriftInput): number {
  const scrolled = stickyTop - boxTop;
  if (scrolled <= 0) return 0;

  if (ramp <= 0) return 1;

  return clamp(scrolled / ramp, 0, 1);
}
