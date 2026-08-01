/**
 * Serve dist/ com as regras do GitHub Pages.
 *
 *   bun run build && bun tools/serve-pages.mjs
 *
 * Existe porque `astro preview` NÃO se comporta como o destino, e a diferença
 * engana justamente onde importa: com `trailingSlash: 'always'`, o servidor do
 * Astro intercepta URL sem barra final e devolve a página de erro dele antes de
 * chegar na rota 404. O GitHub Pages não roda Astro e não conhece essa regra —
 * ele procura o arquivo, procura o index dentro da pasta, e cai no 404.html.
 *
 * O resultado é que conferir o 404 no preview dá uma resposta que produção não
 * dá. Este servidor existe para essa conferência ser confiável.
 *
 * Só as regras de resolução do Pages: sem redirecionamento, sem reescrita, sem
 * cache. Não substitui o dev server — é para verificar o build antes de subir.
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve('dist');
const PORT = Number(process.env.PORT ?? 4180);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.glb': 'model/gltf-binary',
};

async function fileAt(path) {
  try {
    const info = await stat(path);
    return info.isFile() ? path : null;
  } catch {
    return null;
  }
}

/**
 * A ordem que o GitHub Pages tenta, nesta sequência.
 *
 * `<caminho>.html` está aqui porque o Pages o resolve mesmo sem a extensão na
 * URL — é o que faz `/sobre` achar `sobre.html`. Este site usa
 * `build.format: 'directory'` e não depende disso, mas omitir a regra faria o
 * servidor divergir do destino, que é a única coisa que ele deveria não fazer.
 */
function candidates(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const base = join(ROOT, clean);

  if (clean.endsWith('/')) return [join(base, 'index.html')];
  return [base, `${base}.html`, join(base, 'index.html')];
}

const server = createServer(async (request, response) => {
  const { pathname } = new URL(request.url ?? '/', `http://localhost:${PORT}`);

  let found = null;
  for (const candidate of candidates(pathname)) {
    // Nunca servir fora de dist/, por mais criativo que seja o caminho pedido.
    if (!resolve(candidate).startsWith(ROOT)) continue;
    found = await fileAt(candidate);
    if (found) break;
  }

  const status = found ? 200 : 404;
  const file = found ?? join(ROOT, '404.html');
  const path = (await fileAt(file)) ?? null;

  if (!path) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('404 — e nem o 404.html existe em dist/');
    return;
  }

  response.writeHead(status, {
    'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream',
  });
  createReadStream(path).pipe(response);
});

server.listen(PORT, () => {
  console.log(`dist/ com as regras do GitHub Pages: http://localhost:${PORT}`);
});
