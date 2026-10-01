import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../docs/',import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.avif':'image/avif','.png':'image/png','.woff2':'font/woff2','.pdf':'application/pdf','.xml':'application/xml','.txt':'text/plain'};
const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/my_portfolio') { res.writeHead(301,{Location:'/my_portfolio/'}).end(); return; }
    if (pathname.startsWith('/my_portfolio/')) pathname = pathname.slice('/my_portfolio'.length);
    let path = resolve(root, `.${pathname}`);
    if (!path.startsWith(root.endsWith(sep)?root:root+sep) && path!==resolve(root)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path=resolve(path,'index.html');
    const body=await readFile(path);
    res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'}).end(body);
  } catch {
    res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}).end(await readFile(resolve(root,'404.html')));
  }
});
server.listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log('Portfolio: http://127.0.0.1:4173/my_portfolio/'));
