export interface AnimationDeps {
  requestFrame(callback: () => void): number;
  cancelFrame(id: number): void;
  onFrame(): void;
}

export interface AnimationController {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

/**
 * Laço de animação com start e stop seguros.
 *
 * Recebe `requestAnimationFrame` por parâmetro em vez de alcançá-lo no escopo
 * global, o que permite testar o comportamento com um relógio falso, em Node.
 *
 * O cuidado que justifica o módulo: chamar `start()` duas vezes criaria dois
 * laços, dobrando consumo de CPU e velocidade da animação — sem nenhum sintoma
 * além de "ficou rápido demais", que ninguém associa à causa.
 */
export function animationController(deps: AnimationDeps): AnimationController {
  const { requestFrame, cancelFrame, onFrame } = deps;

  let frameId: number | null = null;

  const loop = () => {
    onFrame();
    frameId = requestFrame(loop);
  };

  return {
    start() {
      if (frameId !== null) return;
      frameId = requestFrame(loop);
    },

    stop() {
      if (frameId === null) return;
      cancelFrame(frameId);
      frameId = null;
    },

    isRunning() {
      return frameId !== null;
    },
  };
}
