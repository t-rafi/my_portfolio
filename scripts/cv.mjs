import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
await mkdir('docs/assets/cv',{recursive:true});
await mkdir('.qa',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage();
  await page.goto(new URL('../source/cv.html',import.meta.url).href);
  await page.evaluate(()=>document.fonts.ready);
  await page.pdf({path:'docs/assets/cv/Towhidul-Islam-Rafi-CV.pdf',format:'A4',printBackground:true,preferCSSPageSize:true,tagged:true});
  console.log('CV PDF created from source/cv.html.');
}finally{await browser.close();}
