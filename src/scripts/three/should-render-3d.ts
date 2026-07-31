export interface RenderEnvironment {
  /** `prefers-reduced-motion: reduce` está ativo. */
  reducedMotion: boolean;
  hasWebGL: boolean;
  viewportWidth: number;
  /** `navigator.connection.saveData`, quando o navegador informa. */
  saveData?: boolean;
}

/** Abaixo disto o modelo fica pequeno demais para valer o que custa. */
const MIN_WIDTH = 360;

/**
 * Decide se vale carregar o modelo 3D.
 *
 * Separado do código que fala com o three.js de propósito: esta é a decisão que
 * precisa estar certa — a parte que desenha só executa o que foi decidido aqui.
 */
export function shouldRender3d(environment: RenderEnvironment): boolean {
  const { reducedMotion, hasWebGL, viewportWidth, saveData = false } = environment;

  if (reducedMotion) return false;
  if (!hasWebGL) return false;
  if (saveData) return false;
  if (viewportWidth < MIN_WIDTH) return false;

  return true;
}
