import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../preview');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.pdf':'application/pdf','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
 try {
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){
    if(!pathname.endsWith('/')){res.writeHead(308,{Location:pathname+'/'}).end();return;}
    file=path.join(file,'index.html');
  }
  if(!fs.existsSync(file)){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Página no encontrada');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'});fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(400).end('Solicitud no válida');}
}).listen(4175,'127.0.0.1',()=>console.log('Preciado preview: http://127.0.0.1:4175'));
