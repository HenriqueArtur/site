import { mostCentered } from './most-centered.ts';

/**
 * Fallback das animações por scroll para navegadores sem
 * `animation-timeline: view()`.
 *
 * A versão em CSS continua sendo a principal. Isto aqui reproduz o mesmo efeito
 * com um listener de scroll, e só entra quando o CSS não pode fazer o trabalho.
 * Rodar os dois animaria duas vezes o mesmo elemento.
 */

export interface MotionEnvironment {
  supportsScrollTimeline: boolean;
  reducedMotion: boolean;
}

export interface Measurable {
  getBoundingClientRect(): { top: number; height: number };
  classList: { add(name: string): void; remove(name: string): void };
}

export function shouldRunFallback(environment: MotionEnvironment): boolean {
  const { supportsScrollTimeline, reducedMotion } = environment;

  // A preferência por menos movimento vale por qualquer caminho. Respeitá-la só
  // no CSS e burlá-la no JS seria não respeitá-la.
  if (reducedMotion) return false;

  return !supportsScrollTimeline;
}

/**
 * Revela o que já entrou na faixa visível.
 *
 * De mão única de propósito: uma vez revelado, fica. Desmarcar faria o conteúdo
 * sumir ao rolar de volta para cima, que é o oposto do que a animação promete.
 */
export function revealInView(
  elements: readonly Measurable[],
  viewportHeight: number,
  threshold = 0.85,
): void {
  const limit = viewportHeight * threshold;

  for (const element of elements) {
    if (element.getBoundingClientRect().top < limit) {
      element.classList.add('is-in');
    }
  }
}

/** Tira a marca de todos. Usado quando o efeito deixa de se aplicar. */
export function clearCentered(elements: readonly Measurable[]): void {
  for (const element of elements) element.classList.remove('is-centered');
}

/** Marca só o elemento mais centralizado, e devolve o índice dele. */
export function markCentered(
  elements: readonly Measurable[],
  viewportHeight: number,
): number | null {
  const index = mostCentered(
    elements.map((element) => element.getBoundingClientRect()),
    viewportHeight,
  );

  for (const [position, element] of elements.entries()) {
    if (position === index) element.classList.add('is-centered');
    else element.classList.remove('is-centered');
  }

  return index;
}
