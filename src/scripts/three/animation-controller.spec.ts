import { describe, expect, it, vi } from 'vitest';
import { animationController } from './animation-controller.ts';

function fakeClock() {
  const pending = new Map<number, () => void>();
  let nextId = 1;

  return {
    requestFrame: (callback: () => void) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    },
    cancelFrame: (id: number) => {
      pending.delete(id);
    },
    /** Executa os frames pendentes, como faria o navegador. */
    tick(times = 1) {
      for (let i = 0; i < times; i++) {
        const entries = [...pending.entries()];
        pending.clear();
        for (const [, callback] of entries) callback();
      }
    },
    get pendingCount() {
      return pending.size;
    },
  };
}

describe('animationController', () => {
  it('não desenha nada antes de start', () => {
    const clock = fakeClock();
    const onFrame = vi.fn();
    animationController({ ...clock, onFrame });

    clock.tick(3);

    expect(onFrame).not.toHaveBeenCalled();
  });

  it('desenha um frame por tick depois de start', () => {
    const clock = fakeClock();
    const onFrame = vi.fn();
    const controller = animationController({ ...clock, onFrame });

    controller.start();
    clock.tick(3);

    expect(onFrame).toHaveBeenCalledTimes(3);
  });

  it('para de desenhar depois de stop', () => {
    const clock = fakeClock();
    const onFrame = vi.fn();
    const controller = animationController({ ...clock, onFrame });

    controller.start();
    clock.tick(2);
    controller.stop();
    clock.tick(5);

    expect(onFrame).toHaveBeenCalledTimes(2);
  });

  it('start repetido não cria um segundo laço', () => {
    // Dois laços dobrariam o consumo de CPU e a velocidade da animação, sem
    // nenhum sintoma visível além de "está rápido demais".
    const clock = fakeClock();
    const onFrame = vi.fn();
    const controller = animationController({ ...clock, onFrame });

    controller.start();
    controller.start();
    controller.start();
    clock.tick(1);

    expect(onFrame).toHaveBeenCalledTimes(1);
  });

  it('stop sem start não quebra', () => {
    const clock = fakeClock();
    const controller = animationController({ ...clock, onFrame: () => {} });

    expect(() => controller.stop()).not.toThrow();
  });

  it('stop repetido não quebra', () => {
    const clock = fakeClock();
    const controller = animationController({ ...clock, onFrame: () => {} });

    controller.start();
    controller.stop();
    expect(() => controller.stop()).not.toThrow();
  });

  it('pode ser reiniciado depois de parado', () => {
    const clock = fakeClock();
    const onFrame = vi.fn();
    const controller = animationController({ ...clock, onFrame });

    controller.start();
    clock.tick(1);
    controller.stop();
    controller.start();
    clock.tick(2);

    expect(onFrame).toHaveBeenCalledTimes(3);
  });

  it('informa se está rodando', () => {
    const clock = fakeClock();
    const controller = animationController({ ...clock, onFrame: () => {} });

    expect(controller.isRunning()).toBe(false);
    controller.start();
    expect(controller.isRunning()).toBe(true);
    controller.stop();
    expect(controller.isRunning()).toBe(false);
  });

  it('não deixa frame agendado depois de stop, para a aba poder dormir', () => {
    const clock = fakeClock();
    const controller = animationController({ ...clock, onFrame: () => {} });

    controller.start();
    clock.tick(1);
    controller.stop();

    expect(clock.pendingCount).toBe(0);
  });
});
