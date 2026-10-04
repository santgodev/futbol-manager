import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderSite} from './render.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const theme=path.join(root,'preciado-editorial'),out=path.join(root,'preview');
const data=JSON.parse(fs.readFileSync(path.join(root,'content.json'),'utf8'));
const rendered=renderSite(data),manifest=[];
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
fs.mkdirSync(path.join(theme,'fragments'),{recursive:true});
for(const page of rendered.pages){
 const {body,...meta}=page;manifest.push(meta);
 fs.writeFileSync(path.join(theme,'fragments',(page.slug.replaceAll('/','--')||'inicio')+'.html'),body);
 const relative=page.slug?'../'.repeat(page.slug.split('/').length):'./';
 const resolve=s=>s.replaceAll('{{ASSET}}',relative+'assets').replace(/\{\{PAGE:([^}]*)\}\}/g,(_,key)=>{const [route,hash]=key.split('#');return relative+(route?route+'/':'')+(hash?'#'+hash:'');});
 const html=`<!doctype html><html lang="es-CO"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(page.title)} | Preciado</title><meta name="description" content="${escape(page.description)}"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#f6f3ed"><link rel="icon" type="image/webp" href="${relative}assets/favicon.webp"><link rel="preload" as="font" type="font/woff2" crossorigin href="${relative}assets/fonts/newsreader-normal-400.woff2"><link rel="stylesheet" href="${relative}assets/fonts/fonts.css"><link rel="stylesheet" href="${relative}assets/design.css"><link rel="stylesheet" href="${relative}assets/editorial.css"><script src="${relative}assets/site.js" defer></script></head><body class="preciado-site edition-two area-${page.area}">${resolve(rendered.header)}<main id="content" tabindex="-1">${resolve(body)}</main>${resolve(rendered.footer)}<div class="preview-mark">VISTA PREVIA DEL REDISEÑO</div></body></html>`;
 const folder=path.join(out,page.slug);fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,'index.html'),html);
}
fs.writeFileSync(path.join(theme,'fragments/header.html'),rendered.header);
fs.writeFileSync(path.join(theme,'fragments/footer.html'),rendered.footer);
fs.writeFileSync(path.join(theme,'pages.json'),JSON.stringify(manifest,null,2));
fs.cpSync(path.join(theme,'assets'),path.join(out,'assets'),{recursive:true});
fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
console.log(`Built ${manifest.length} editorial pages. Shared HTML, CSS, fonts and interactions for WordPress and preview.`);
