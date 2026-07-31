# Modelo 3D

`terrarium.glb` — **899 KB**, comprimido a partir de um original de 4,02 MB.

## De onde vem

[Smol Ame in an upcycled terrarium](https://sketchfab.com/3d-models/smol-ame-in-an-upcycled-terrarium-hololiveen-490cecc249d242188fda5ad3160a4b24),
de **Seafoam**, sob **CC BY 4.0**. A atribuição exigida pela licença está no rodapé da
home.

O arquivo original da Sketchfab **não** fica versionado — só o resultado comprimido. Para
refazer o caminho, baixe o original (a Sketchfab exige login) e rode:

```bash
node tools/compress-model.mjs caminho/do/original.glb
```

## O que a compressão fez

O peso estava na **geometria**, não nas texturas — o que é contraintuitivo e muda o que
adianta otimizar:

| | original | comprimido |
|---|---|---|
| arquivo | 4,02 MB | **899 KB** (547 KB com gzip) |
| texturas | 0,03 MB | 0,03 MB |
| geometria | 3,77 MB | comprimida |
| triângulos | 53.433 | 53.433 |
| animações / canais | 1 / 74 | 1 / 74 |
| nós com skin | 19 | 19 |

Nada de conteúdo foi perdido: mesma malha, mesma animação, mesmo skinning. O ganho vem
de `KHR_mesh_quantization` (guardar posições em inteiros em vez de float32) e
`EXT_meshopt_compression`.

## O que isso exige do cliente

O `EXT_meshopt_compression` precisa de um decoder, que vem do próprio pacote `three` e é
empacotado com o nosso JS: **28,6 KB**.

Para comparação, foi por isso que o Draco ficou de fora — o decoder dele são **817 KB**,
e a alternativa de buscá-lo num CDN contradiz a decisão de o site não fazer requisição a
terceiros.

`KHR_mesh_quantization`, a outra extensão do arquivo, o `GLTFLoader` entende sem código
extra.

## Se trocar de modelo

Rode o script acima e **confira antes de commitar**: contagem de triângulos, número de
animações e nós com skin precisam sobreviver intactos. A etapa de `prune` do
`gltf-transform` remove recursos que julga não usados, e um julgamento errado ali
aparece como uma animação que simplesmente não toca.
