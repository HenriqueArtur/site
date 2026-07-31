import {
  AmbientLight,
  AnimationMixer,
  Box3,
  Clock,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { animationController } from './animation-controller.ts';
import { frameModel } from './frame-model.ts';

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

const FOV = 35;

/**
 * Monta o modelo 3D num canvas.
 *
 * Único arquivo que fala com o three.js, e único sem spec — está em
 * `ignore_files` da regra de spec-pair no arch.config.json. O que dá para
 * decidir e calcular sem um contexto WebGL foi extraído para
 * `should-render-3d.ts`, `animation-controller.ts` e `frame-model.ts`, que são
 * testados.
 */
export async function mountViewer(options: ViewerOptions): Promise<ViewerHandle> {
  const { canvas, modelUrl, rotationsPerSecond = 0.04 } = options;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio ?? 1, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 1000);

  scene.add(new AmbientLight(0xffffff, 2));
  const key = new DirectionalLight(0xffffff, 2.5);
  key.position.set(3, 5, 4);
  scene.add(key);
  const fill = new DirectionalLight(0xffffff, 0.8);
  fill.position.set(-3, 2, -2);
  scene.add(fill);

  // Sem DRACOLoader de propósito: ele arrastava 817 KB de decoder para o build,
  // e apontá-lo para um CDN contradiz a decisão de não fazer requisição a
  // terceiros. Se o modelo passar a ser comprimido, o decoder entra
  // auto-hospedado, como escolha explícita.
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(modelUrl);
  const model = gltf.scene;

  // O modelo vem com a origem onde o autor deixou — neste caso, com o centro a
  // 1,1 unidade acima do chão. Sem recentrar, ele gira em torno de um eixo que
  // não é o dele e sai do quadro.
  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  model.position.sub(center);

  // Um grupo em volta permite girar o modelo já centrado, sem desfazer o ajuste.
  const pivot = new Group();
  pivot.add(model);
  scene.add(pivot);

  // O .glb traz animação própria. Se existir, ela toca — é o movimento que o
  // autor desenhou, melhor do que qualquer rotação que eu inventasse.
  const mixer = gltf.animations.length > 0 ? new AnimationMixer(model) : null;
  if (mixer) {
    for (const clip of gltf.animations) mixer.clipAction(clip).play();
  }

  const resize = () => {
    const { clientWidth, clientHeight } = canvas;
    if (clientWidth === 0 || clientHeight === 0) return;

    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();

    const distance = frameModel({ size, fov: FOV, aspect: camera.aspect, padding: 1.15 });
    camera.position.set(0, size.y * 0.12, distance);
    camera.lookAt(0, 0, 0);
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  const clock = new Clock();

  const controller = animationController({
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (id) => cancelAnimationFrame(id),
    onFrame: () => {
      const delta = clock.getDelta();
      mixer?.update(delta);
      pivot.rotation.y += delta * rotationsPerSecond * Math.PI * 2;
      renderer.render(scene, camera);
    },
  });

  controller.start();

  return {
    pause: () => controller.stop(),
    resume: () => {
      // Zera o delta acumulado: sem isso, voltar de uma aba que ficou minutos
      // oculta faria a animação saltar para a frente de uma vez só.
      clock.getDelta();
      controller.start();
    },
    dispose() {
      controller.stop();
      observer.disconnect();
      mixer?.stopAllAction();

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
