// Servidor estático para ver a página localmente, sem dependências.
//
//   npm run dev        →  http://localhost:5530
//
// Serve a pasta site/ exatamente como o cPanel vai servir: arquivos estáticos,
// sem build e sem processamento.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const porta = Number(process.env.PORT) || 5530;

const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  try {
    const caminhoPedido = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let arquivo = join(raiz, normalize(caminhoPedido).replace(/^(\.\.[/\\])+/, ''));

    const info = await stat(arquivo).catch(() => null);
    if (info?.isDirectory()) arquivo = join(arquivo, 'index.html');

    const conteudo = await readFile(arquivo);
    res.writeHead(200, {
      'Content-Type': tipos[extname(arquivo)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(conteudo);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404');
  }
}).listen(porta, () => console.log(`site/ em http://localhost:${porta}`));
