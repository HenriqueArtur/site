/**
 * Comprime um .glb para o formato que o site serve.
 *
 *   node tools/compress-model.mjs <entrada.glb> [saida.glb]
 *
 * O arquivo original baixado da Sketchfab **não** fica versionado — só o
 * resultado. Este script existe para que o caminho do original até o que está
 * no repositório seja reproduzível, e não um "eu rodei umas ferramentas".
 *
 * Medido no modelo do terrário: 4,02 MB → 899 KB, com 53.433 triângulos, uma
 * animação, 74 canais e 19 nós com skin — todos preservados.
 */
import { execFile } from 'node:child_process';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

const [input, output = 'public/models/terrarium.glb'] = process.argv.slice(2);

if (!input) {
  console.error('uso: node tools/compress-model.mjs <entrada.glb> [saida.glb]');
  process.exit(1);
}

const mb = async (path) => ((await stat(path)).size / 1048576).toFixed(2);

const work = await mkdtemp(join(tmpdir(), 'glb-'));
const deduped = join(work, 'deduped.glb');
const welded = join(work, 'welded.glb');

const gltf = (...args) => run('bunx', ['gltf-transform', ...args]);

try {
  console.log(`entrada: ${await mb(input)} MB`);

  // dedup remove recursos repetidos; weld funde vértices idênticos. Os dois
  // antes do meshopt porque comprimir dado duplicado é comprimir desperdício.
  await gltf('dedup', input, deduped);
  await gltf('weld', deduped, welded);
  await gltf('meshopt', welded, output, '--level', 'high');

  console.log(`saída:   ${await mb(output)} MB  → ${output}`);
  console.log('\nConfira antes de commitar: contagem de triângulos, número de');
  console.log('animações e nós com skin devem sobreviver intactos.');
} finally {
  await rm(work, { recursive: true, force: true });
}
