import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:390,height:900}});
for(const p of JSON.parse(fs.readFileSync('preciado-editorial/pages.json','utf8'))){
 await page.goto('http://127.0.0.1:4175/'+p.slug);
 const headings=await page.locator('main h1,main h2,main h3,main h4').evaluateAll(es=>es.map(e=>({level:Number(e.tagName[1]),text:e.textContent})));
 for(let i=1;i<headings.length;i++)assert.ok(headings[i].level<=headings[i-1].level+1,JSON.stringify({slug:p.slug,headings}));
}
await page.close();await browser.close();console.log('29 pages: heading hierarchy passed.');
