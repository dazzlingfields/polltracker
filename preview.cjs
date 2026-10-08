const http=require('http'),fs=require('fs'),path=require('path');
const routes={'/':'index.html','/index.html':'index.html','/parliament.svg':'parliament.svg'};
http.createServer((req,res)=>{
 const file=routes[req.url.split('?')[0]];
 if(!file){res.writeHead(404);return res.end('Not found');}
 res.setHeader('Content-Type',file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');
 res.setHeader('Cache-Control','no-store');
 res.end(fs.readFileSync(path.join(__dirname,file)));
}).listen(8765,'127.0.0.1',()=>console.log('NZ Poll Lab: http://127.0.0.1:8765'));
