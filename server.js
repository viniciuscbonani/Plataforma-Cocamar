const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400); return response.end('Requisição inválida'); }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || pathname.split('/').some(segment => segment.startsWith('.'))) {
    response.writeHead(403); return response.end('Acesso negado');
  }
  fs.readFile(file, (error, content) => {
    if (error) { response.writeHead(404); return response.end('Arquivo não encontrado'); }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(content);
  });
}).listen(Number(process.env.PORT) || 3000, '0.0.0.0', () => console.log(`Cocamar disponível em http://localhost:${process.env.PORT || 3000}`));
