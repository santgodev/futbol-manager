import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=JSON.parse(fs.readFileSync(path.join(root,'preciado-editorial/pages.json'),'utf8'));
const base='http://127.0.0.1:4175';
const shots=path.join(root,'verification/screenshots');fs.mkdirSync(shots,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];const errors=[];
for(const width of [1440,768,390]){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 for(const record of pages){
  const address=base+'/'+(record.slug?record.slug+'/':'');
  const response=await page.goto(address,{waitUntil:'networkidle'});assert.equal(response.status(),200,address);
  // Load every lazy image, including the end of the archive, before evaluating image health.
  await page.evaluate(async()=>{for(const i of document.images){i.loading='eager';}await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  const audit=await page.evaluate(()=>({
   width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,
   title:document.title,description:document.querySelector('meta[name="description"]')?.content,
   broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),
   altMissing:[...document.images].filter(i=>!i.hasAttribute('alt')).length,
   unresolved:document.documentElement.outerHTML.includes('{{'),
   overflows:[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+2).slice(0,5).map(e=>e.className)
  }));
  assert.equal(audit.h1,1,`${address}: h1`);assert.ok(audit.description,`${address}: description`);
  assert.equal(audit.broken.length,0,`${address}: images ${audit.broken}`);assert.equal(audit.altMissing,0);assert.equal(audit.unresolved,false);
  assert.ok(audit.scroll<=width+1,`${address} width ${width}: overflow ${JSON.stringify(audit)}`);
  if(width!==768)await page.screenshot({path:path.join(shots,`${width}-${record.slug.replaceAll('/','--')||'inicio'}.png`),fullPage:true});
  results.push({route:record.slug||'/',width,...audit});
 }
 if(width===390){
  await page.goto(base);await page.getByRole('button',{name:'Menú'}).click();await assert.doesNotReject(()=>page.locator('#main-nav').waitFor({state:'visible'}));
  await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Menú'}).getAttribute('aria-expanded'),'false');
  await page.keyboard.press('Tab');
 }
 await page.close();
}
const page=await browser.newPage();
const links=new Set();
for(const record of pages){
 const dir=path.join(root,'preview',record.slug);const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const href=match[1];if(/^(https?:|mailto:|tel:)/.test(href))continue;
  const parsed=new URL(href,base+'/'+(record.slug?record.slug+'/':''));links.add(parsed.href);
 }
}
for(const href of links){
 const u=new URL(href);const file=path.join(root,'preview',decodeURIComponent(u.pathname));
 assert.ok(fs.existsSync(file),`Missing ${href}`);
 if(u.hash){const html=fs.readFileSync(path.join(file,'index.html'),'utf8');assert.ok(html.includes(`id="${u.hash.slice(1)}"`),`Anchor missing ${href}`);}
}
await page.goto(base+'/formacion/');await page.getByRole('button',{name:'Talleres',exact:true}).click();assert.equal(await page.locator('.card:visible').count(),1);
await page.getByRole('button',{name:'Promociones de archivo',exact:true}).click();assert.equal(await page.locator('.card:visible').count(),2);
await page.getByRole('button',{name:'Todo',exact:true}).click();assert.equal(await page.locator('.card:visible').count(),6);
await page.goto(base+'/archivo/');await page.getByLabel('Buscar en el archivo').fill('sindy');assert.ok(await page.locator('.archive-item:visible').count()>0);
await page.getByLabel('Buscar en el archivo').fill('no-existe-zzzz');assert.equal(await page.locator('.archive-item:visible').count(),0);assert.equal(await page.locator('.empty-state').isVisible(),true);
await page.goto(base+'/formacion/liderazgo-financiero/');await page.locator('summary').click();assert.equal(await page.locator('details').getAttribute('open'),'');
await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
await page.goto(base);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Saltar al contenido');
await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'content');
await browser.close();
assert.deepEqual(errors,[]);
const report={pages:pages.length,viewportChecks:results.length,internalReferences:links.size,consoleErrors:errors,checks:['HTTP 200','One H1 per page','Unique page metadata','No broken images','No horizontal overflow','All local links and fragment targets','Mobile menu and Escape','Keyboard skip link','Catalog filters','Archive search and empty state','Original presentation disclosure','Reduced motion'],results};
assert.equal(new Set(results.filter(r=>r.width===1440).map(r=>r.title)).size,pages.length);
fs.writeFileSync(path.join(root,'verification/report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({pages:report.pages,viewportChecks:report.viewportChecks,internalReferences:report.internalReferences,consoleErrors:0,checks:report.checks},null,2));
