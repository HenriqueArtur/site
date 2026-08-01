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
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { animationController } from './animation-controller.ts';
import { frameModel } from './frame-model.ts';
import { introMotion } from './intro-motion.ts';

export interface ViewerHandle {
  dispose(): void;
  pause(): void;
  resume(): void;
}

export interface ViewerOptions {
  canvas: HTMLCanvasElement;
  modelUrl: string;
}

const FOV = 35;

/**
 * Elevação da câmera, em radianos (~22°).
 *
 * A câmera continua olhando de cima para baixo — é a vista de quem examina um
 * objeto sobre a mesa —, mas num ângulo mais raso. Elevação alta demais achata
 * o objeto contra o chão e esconde a silhueta, que é o que se reconhece de
 * longe.
 */
const ELEVATION = 0.38;

/**
 * Onde o objeto assenta, em radianos.
 *
 * `0.35 − π/4`: um oitavo de volta no sentido anti-horário a partir da posição
 * anterior. Escrito como conta, e não como o número final (−0.435), porque o
 * ajuste veio de "gire 45° a partir de onde está" — e é assim que o próximo
 * ajuste vai vir.
 */
const TARGET_ROTATION = 0.35 - Math.PI / 4;

/** Quanto o objeto gira durante a entrada, em radianos (~97°). */
const INTRO_SWEEP = 1.7;

/**
 * Folga entre o objeto e as bordas do quadro.
 *
 * 1 = colado nas bordas. Abaixo disso o objeto é cortado.
 *
 * Este é o número que controla o quanto a câmera chega perto. O tamanho do
 * objeto na tela, porém, depende principalmente do tamanho do CANVAS — aumentar
 * a folga aqui não o encolhe na página, só impede que ele encoste nas bordas.
 */
const FRAME_PADDING = 1.35;

/**
 * Desloca o enquadramento no eixo vertical, em frações da altura do objeto.
 *
 * Move a câmera E o ponto para onde ela olha, juntos — então o ângulo de visão
 * não muda, só a posição do objeto dentro do quadro. É diferente de mexer em
 * `ELEVATION`, que orbita a câmera e muda o ângulo.
 *
 *   positivo → o objeto DESCE no quadro (sobra espaço em cima)
 *   negativo → o objeto SOBE no quadro (sobra espaço embaixo)
 *
 * 0.1 equivale a um décimo da altura do objeto. Valores entre -0.3 e 0.3
 * costumam ser o intervalo útil.
 */
const VERTICAL_OFFSET = -0.35;

/** Coreografia da entrada. Ver intro-motion.ts para o que cada número faz. */
const INTRO = {
  durationMs: 1200,
  startScale: 1.9,
  // Derivado do alvo: mudar a posição final não altera o tamanho do giro.
  startRotation: TARGET_ROTATION - INTRO_SWEEP,
  targetRotation: TARGET_ROTATION,
  settleAt: 0.8,
  /** ~4,6°. Respiro, não rotação. */
  idleAmplitude: 0.08,
  idlePeriodMs: 6000,
};

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
  const { canvas, modelUrl } = options;

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

  // O modelo é comprimido com EXT_meshopt_compression, que reduziu 4,02 MB para
  // 899 KB. O decoder é empacotado junto com o nosso JS — 28,6 KB, contra os
  // 817 KB que o DRACOLoader arrastava, e sem depender de CDN de terceiros.
  // KHR_mesh_quantization, a outra extensão do arquivo, o GLTFLoader já entende
  // sozinho.
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(modelUrl);
  const model = gltf.scene;

  // O .glb traz animação própria. Se existir, ela toca — é o movimento que o
  // autor desenhou, melhor do que qualquer rotação que eu inventasse.
  const mixer = gltf.animations.length > 0 ? new AnimationMixer(model) : null;
  if (mixer) {
    for (const clip of gltf.animations) mixer.clipAction(clip).play();
  }

  /*
   * A caixa envolvente é medida ao longo da animação, e não num instante só.
   *
   * Medir com o modelo parado dá a caixa da pose inicial. Qualquer parte que se
   * mova para fora dela depois — e este modelo tem 74 canais de animação —
   * aparece cortada na borda do quadro, sem nada indicando a causa: o
   * enquadramento está "certo" para uma pose que já passou.
   */
  const box = new Box3();
  const duration = gltf.animations[0]?.duration ?? 0;
  const SAMPLES = 16;

  if (mixer && duration > 0) {
    for (let i = 0; i < SAMPLES; i++) {
      mixer.setTime((i / SAMPLES) * duration);
      model.updateMatrixWorld(true);
      box.expandByObject(model);
    }
    mixer.setTime(0);
    model.updateMatrixWorld(true);
  } else {
    box.setFromObject(model);
  }

  // O modelo vem com a origem onde o autor deixou — neste caso, com o centro a
  // 1,1 unidade acima do chão. Sem recentrar, ele gira em torno de um eixo que
  // não é o dele e sai do quadro.
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  model.position.sub(center);

  // Um grupo em volta permite girar o modelo já centrado, sem desfazer o ajuste.
  const pivot = new Group();
  pivot.add(model);
  scene.add(pivot);

  // A distância de enquadramento é recalculada no resize; a entrada apenas a
  // multiplica. Assim girar o celular no meio da animação não a desalinha.
  let framed = 1;

  const place = (distanceScale: number) => {
    const distance = framed * distanceScale;
    const lift = size.y * VERTICAL_OFFSET;

    // A câmera e o alvo sobem juntos: é isso que desloca o objeto no quadro sem
    // alterar o ângulo. Subir só a câmera inclinaria a visão.
    camera.position.set(0, Math.sin(ELEVATION) * distance + lift, Math.cos(ELEVATION) * distance);
    camera.lookAt(0, lift, 0);
  };

  const resize = () => {
    const { clientWidth, clientHeight } = canvas;
    if (clientWidth === 0 || clientHeight === 0) return;

    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();

    // Folga pequena: a caixa medida é conservadora, mas a projeção em
    // perspectiva ainda faz os cantos mais próximos da câmera crescerem. A
    // elevação entra na conta — sem ela o enquadramento corta a base, porque
    // vista de cima a silhueta é mais alta que o objeto.
    framed = frameModel({
      size,
      fov: FOV,
      aspect: camera.aspect,
      padding: FRAME_PADDING,
      elevation: ELEVATION,
    });
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  const clock = new Clock();
  // Tempo da coreografia, acumulado só enquanto roda: pausar numa aba oculta
  // não pode fazer a entrada "acontecer" sem ninguém ver.
  let elapsed = 0;

  const controller = animationController({
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (id) => cancelAnimationFrame(id),
    onFrame: () => {
      const delta = clock.getDelta();
      elapsed += delta * 1000;

      mixer?.update(delta);

      const state = introMotion(elapsed, INTRO);
      pivot.rotation.y = state.rotation;
      place(state.distanceScale);

      renderer.render(scene, camera);
    },
  });

  controller.start();

  return {
    pause: () => controller.stop(),
    resume: () => {
      // Descarta o delta acumulado: sem isso, voltar de uma aba que ficou
      // minutos oculta faria a coreografia saltar para a frente de uma vez.
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
