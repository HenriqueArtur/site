import { AmbientLight, DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { animationController } from './animation-controller.ts';

export interface ViewerHandle {
  dispose(): void;
  pause(): void;
  resume(): void;
}

export interface ViewerOptions {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  /** Volta por segundo. Devagar de propósito: é ambiente, não atração. */
  rotationsPerSecond?: number;
}

/**
 * Monta o modelo 3D num canvas.
 *
 * Este é o único arquivo que fala com o three.js, e o único sem spec — está em
 * `ignore_files` da regra de spec-pair no arch.config.json, com o motivo escrito
 * lá. Tudo que dá para decidir sem um contexto WebGL foi extraído para
 * `should-render-3d.ts` e `animation-controller.ts`, que são testados.
 *
 * Import dinâmico do three acontece de fora, no componente: nada aqui é
 * carregado antes de a decisão de renderizar ter sido tomada.
 */
export async function mountViewer(options: ViewerOptions): Promise<ViewerHandle> {
  const { canvas, modelUrl, rotationsPerSecond = 0.05 } = options;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio ?? 1, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.6, 3.2);

  scene.add(new AmbientLight(0xffffff, 1.6));
  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(2, 3, 2);
  scene.add(key);

  // Sem DRACOLoader de propósito. Ele arrastava 817 KB de decoder para o build
  // mesmo apontando o caminho para um CDN — e o CDN em si contradiz a decisão de
  // não fazer nenhuma requisição a terceiros. Se o .glb vier comprimido com
  // Draco, o decoder entra auto-hospedado e essa escolha fica explícita.
  const loader = new GLTFLoader();

  const gltf = await loader.loadAsync(modelUrl);
  const model = gltf.scene;
  scene.add(model);

  const resize = () => {
    const { clientWidth, clientHeight } = canvas;
    if (clientWidth === 0 || clientHeight === 0) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  let last = performance.now();

  const controller = animationController({
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (id) => cancelAnimationFrame(id),
    onFrame: () => {
      const now = performance.now();
      const delta = (now - last) / 1000;
      last = now;

      model.rotation.y += delta * rotationsPerSecond * Math.PI * 2;
      renderer.render(scene, camera);
    },
  });

  controller.start();

  return {
    pause: () => controller.stop(),
    resume: () => {
      last = performance.now();
      controller.start();
    },
    dispose() {
      controller.stop();
      observer.disconnect();

      scene.traverse((object) => {
        const mesh = object as { geometry?: { dispose(): void }; material?: unknown };
        mesh.geometry?.dispose();

        const material = mesh.material;
        if (Array.isArray(material)) {
          for (const entry of material) (entry as { dispose(): void }).dispose();
        } else if (material) {
          (material as { dispose(): void }).dispose();
        }
      });

      renderer.dispose();
    },
  };
}
