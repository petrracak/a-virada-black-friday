// Gera site/assets/img/ a partir de _originais/.
//
// Lê os arquivos originais baixados da página no ar, redimensiona para o tamanho
// em que cada imagem realmente aparece (com folga para telas retina) e regrava
// em WebP. Rodar depois de trocar qualquer arquivo em _originais/.
//
//   npm install sharp
//   node scripts/otimizar-imagens.mjs
//
// A pasta _originais/ nunca é alterada.

import sharp from 'sharp';
import { mkdir, readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const origem = join(raiz, '_originais');
const destino = join(raiz, 'site', 'assets', 'img');

// [arquivo de origem, nome final, largura máxima, qualidade]
const imagens = [
  ['logo-a-virada-black-friday.webp',        'logo-virada.webp',               640,  86],
  // a abertura usa um recorte vertical da arte do palco, centrado na Taynã:
  // no celular ele é o fundo da dobra, no desktop é a coluna da direita
  ['BG-Dobra-01.webp',                       'heroi-tayna.webp',               820,  72,
   { left: 800, top: 0, width: 900, height: 1040 }],
  ['mockup.webp',                            'mockup-cursos.webp',            1200,  76],
  ['faa1.webp',                              'prod-01-faa.webp',               560,  76],
  ['mld_1.webp',                             'prod-02-metodo-lucrando.webp',   560,  76],
  ['b1.webp',                                'prod-03-desafio-7dias.webp',     560,  76],
  ['b2.webp',                                'prod-04-kit-fast-dolar.webp',    560,  76],
  ['mld_2.webp',                             'prod-05-maquina-dolar-ia.webp',  560,  76],
  ['mld_3.webp',                             'prod-06-produto-campeao.webp',   560,  76],
  ['bastidores.webp',                        'prod-07-bastidores.webp',        560,  76],
  ['Google-meu-negocio.webp',                'prod-08-levantar-caixa.webp',    560,  76],
  ['Group-1171275267.webp',                  'prod-09-colecao-ebooks.webp',    560,  76],
  ['WORKSHOP-PLATAFORMAS-OCULTAS-1.webp',    'prod-10-plataformas-ocultas.webp', 560, 76],
  ['WORKSHOP-PRIMEIRA-VENDA-EM-DOLAR-1.webp','prod-11-primeira-venda.webp',    560,  76],
  ['c1.webp',                                'depoimento-1.webp',              560,  74],
  ['c2.webp',                                'depoimento-2.webp',              560,  74],
  ['c3.webp',                                'depoimento-3.webp',              560,  74],
  ['c4.webp',                                'depoimento-4.webp',              560,  74],
  ['c5.webp',                                'depoimento-5.webp',              560,  74],
  ['c6.webp',                                'depoimento-6.webp',              560,  74],
  ['c7.webp',                                'depoimento-7.webp',              560,  74],
  ['c8.webp',                                'depoimento-8.webp',              560,  74],
  ['IMG-TAY.webp',                           'alunos-tay.webp',                760,  74],
  ['Foto-Tay.webp',                          'tay-mentora.webp',               700,  78],
];

const kb = (n) => (n / 1024).toFixed(1).padStart(6) + ' KB';

await mkdir(destino, { recursive: true });

let antes = 0;
let depois = 0;

for (const [de, para, largura, qualidade, recorte] of imagens) {
  const entrada = join(origem, de);
  const saida = join(destino, para);

  const original = await sharp(entrada).metadata();
  let trabalho = sharp(entrada);
  if (recorte) trabalho = trabalho.extract(recorte);
  await trabalho
    .resize({ width: Math.min(largura, recorte ? recorte.width : original.width), withoutEnlargement: true })
    .webp({ quality: qualidade, effort: 6 })
    .toFile(saida);

  const a = (await stat(entrada)).size;
  const d = (await stat(saida)).size;
  antes += a;
  depois += d;

  const novo = await sharp(saida).metadata();
  console.log(
    `${para.padEnd(34)} ${String(original.width).padStart(4)}px → ${String(novo.width).padStart(4)}px   ` +
    `${kb(a)} → ${kb(d)}   −${(100 - (d / a) * 100).toFixed(0)}%`
  );
}

// o SVG do ícone é copiado sem alteração
const { copyFile } = await import('node:fs/promises');
await copyFile(join(origem, 'Vector.svg'), join(destino, 'icone-calendario.svg'));

console.log('\n' + '─'.repeat(74));
console.log(`TOTAL  ${kb(antes)} → ${kb(depois)}   −${(100 - (depois / antes) * 100).toFixed(0)}%`);

// avisa se sobrou arquivo sem uso na pasta de destino
const esperados = new Set([...imagens.map(([, p]) => p), 'icone-calendario.svg']);
const presentes = await readdir(destino);
const sobrando = presentes.filter((f) => !esperados.has(f));
if (sobrando.length) console.log(`\nFora da lista, confira se ainda precisa: ${sobrando.join(', ')}`);
