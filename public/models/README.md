# Modelo 3D

Falta um arquivo aqui: **`terrarium.glb`**.

O site funciona sem ele — o `<canvas>` simplesmente nunca aparece e todo mundo continua
vendo o desenho SVG de fallback, que é a versão correta daquele cenário e não um erro.
Quando o `.glb` for colocado nesta pasta, ele passa a carregar sozinho.

## De onde vem

[Smol Ame in an upcycled terrarium](https://sketchfab.com/3d-models/smol-ame-in-an-upcycled-terrarium-hololiveen-490cecc249d242188fda5ad3160a4b24),
de **Seafoam**, sob **CC BY 4.0**. A Sketchfab exige login para baixar, então o download
é manual.

A atribuição exigida pela licença já está no rodapé da home.

## Orçamento

**Abaixo de 1,5 MB.** O original tem 53,5k triângulos e o site inteiro hoje tem 32 KB de
HTML — este arquivo será, com folga, o maior ativo da página.

Se o arquivo baixado passar disso, reduzir antes de commitar:

- redimensionar texturas (1024px costuma bastar para um objeto deste tamanho na tela);
- decimar a malha, que a essa distância não precisa de 53,5k triângulos;
- exportar como `.glb` binário, não `.gltf` com arquivos soltos.

## Compressão Draco

O carregador **não** tem suporte a Draco hoje, de propósito: o `DRACOLoader` arrastava
817 KB de decoder para o build, e apontá-lo para um CDN contradiria a decisão de o site
não fazer nenhuma requisição a terceiros.

Se o modelo vier comprimido com Draco, o decoder precisa ser auto-hospedado e o
`viewer.ts` ajustado — decisão consciente, não acidente de configuração.
