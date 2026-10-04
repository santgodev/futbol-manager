import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:320,height:800}});
const pages=JSON.parse(fs.readFileSync('preciado-editorial/pages.json','utf8'));
const failures=[];
for(const p of pages){await page.goto('http://127.0.0.1:4175/'+p.slug);const r=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,off:[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>e.className||e.tagName)}));if(r.scroll>321)failures.push({slug:p.slug,...r});}
await browser.close(); console.log(JSON.stringify(failures));
