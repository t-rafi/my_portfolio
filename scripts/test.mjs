import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:4173/my_portfolio/';
await mkdir('.qa',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try{
  for(const theme of ['light','dark']){
    const context=await browser.newContext({colorScheme:theme,reducedMotion:'reduce'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    for(const path of ['','work/rdlc-reporting.html','work/erp-api.html','404.html']){
      for(const width of [360,768,1280,1920]){
        await page.setViewportSize({width,height:900});
        await page.goto(base+path);
        await page.evaluate(()=>document.fonts.ready);
        await page.locator('footer').scrollIntoViewIfNeeded();
        await page.waitForFunction(()=>Array.from(document.images).every(img=>img.complete));
        await page.evaluate(()=>scrollTo(0,0));
        assert.equal(await page.locator('h1').count(),1,`one h1: ${path}`);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow: ${path} ${width}`);
        assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.some(img=>!img.naturalWidth)),false,`broken image: ${path}`);
        const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']).analyze();
        if(axe.violations.length) console.log(JSON.stringify(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),null,2));
        assert.equal(axe.violations.length,0,`axe: ${path} ${width} ${theme}`);
        results.push({page:path||'index.html',width,theme,axeViolations:0});
        if((width===360&&theme==='dark')||(width===1280&&theme==='light'))await page.screenshot({path:`.qa/${path.replaceAll('/','-')||'home'}-${width}-${theme}.png`,fullPage:true});
      }
    }
    assert.deepEqual(errors,[],'no uncaught browser errors');
    await context.close();
  }
  const context=await browser.newContext({colorScheme:'dark'});
  const page=await context.newPage();
  await page.goto(base);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Skip to content');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>location.hash),'#main');
  await page.getByRole('button',{name:'Switch to light theme'}).click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  assert.equal(await page.locator('[download]').count(),1);
  const download=await context.request.get(base+'assets/cv/Towhidul-Islam-Rafi-CV.pdf');
  assert.equal(download.status(),200);
  assert.equal((await download.body()).subarray(0,4).toString(),'%PDF');
  assert.equal(await page.locator('[role="dialog"]').count(),0);
  // Mock EmailJS: verify real UI handling without sending any mail.
  let requests=0;
  await page.route('https://api.emailjs.com/**',async route=>{requests++;await route.abort();});
  await page.locator('#contact-name').fill('\"><img src=x onerror=alert(1)>');
  await page.locator('#contact-email').fill('test@example.com');
  await page.locator('#contact-message').fill('This is a test message for the portfolio form.');
  await page.waitForTimeout(2100);
  await page.getByRole('button',{name:'Send message'}).click();
  await page.getByRole('status').filter({hasText:'Message not sent'}).waitFor();
  assert.equal(await page.locator('#contact-message').inputValue(),'This is a test message for the portfolio form.');
  assert.equal(await page.getByRole('button',{name:'Send message'}).isEnabled(),true);
  assert.equal(await page.locator('img[src="x"]').count(),0);
  assert.equal(requests,1);
  await page.reload();
  await page.unroute('https://api.emailjs.com/**');
  await page.route('https://api.emailjs.com/**',async route=>{
    const data=route.request().postDataJSON();
    assert.equal(data.template_params.reply_to,'test@example.com');
    await route.fulfill({status:200,body:'OK',headers:{'access-control-allow-origin':'*'}});
  });
  await page.locator('#contact-name').fill('Test');
  await page.locator('#contact-email').fill('test@example.com');
  await page.locator('#contact-message').fill('This is another test message.');
  await page.waitForTimeout(2100);
  await page.getByRole('button',{name:'Send message'}).click();
  await page.getByRole('status').filter({hasText:'Message sent.'}).waitFor();
  assert.equal(await page.locator('#contact-name').inputValue(),'');
  await page.reload();
  await page.locator('#contact-name').fill('Bot');
  await page.locator('#contact-email').fill('bot@example.com');
  await page.locator('#contact-message').fill('Bot message for honeypot test.');
  await page.locator('#contact-website').evaluate(el=>{el.value='https://spam.example';});
  await page.getByRole('button',{name:'Send message'}).click();
  await page.getByRole('status').filter({hasText:'could not be sent'}).waitFor();
  await context.close();
  const noJS=await browser.newContext({javaScriptEnabled:false});
  const noJSPage=await noJS.newPage();
  for(const path of ['','work/rdlc-reporting.html','work/erp-api.html']){
    await noJSPage.goto(base+path);
    assert.equal(await noJSPage.locator('h1').isVisible(),true);
    if(!path){assert.equal(await noJSPage.locator('#work').isVisible(),true);assert.equal(await noJSPage.getByText('Use the email link to get in touch.').isVisible(),true);}
  }
  await noJS.close();
  // Verify shipped JS budget, all relative links and images, and local image budget.
  const jsSize=gzipSync(await readFile('docs/assets/js/site.js')).length;
  assert.ok(jsSize<60000);
  for(const name of await readdir('docs/assets/images')) if(name.startsWith('profile-'))assert.ok((await readFile('docs/assets/images/'+name)).length<100000);
  const linkContext=await browser.newContext();
  const linkPage=await linkContext.newPage();
  for(const path of ['','work/rdlc-reporting.html','work/erp-api.html','404.html']){
    await linkPage.goto(base+path);
    const links=await linkPage.locator('a[href]').evaluateAll(els=>els.map(el=>el.href).filter(href=>href.startsWith(location.origin)));
    for(const link of new Set(links)){
      const response=await linkContext.request.get(link);
      assert.equal(response.status(),200,`broken local link: ${link}`);
      const hash=new URL(link).hash;
      if(hash){const body=await response.text();assert.ok(body.includes(`id="${hash.slice(1)}"`),`missing fragment: ${link}`);}
    }
  }
  await linkContext.close();
  await writeFile('.qa/test-results.json',JSON.stringify({results,jsGzipBytes:jsSize,checks:['keyboard skip link','theme persistence','direct CV download','no modal','blocked form delivery','mocked success','honeypot','XSS string as text','no JavaScript','local links']},null,2));
  console.log(`PASS: ${results.length} page/viewport/theme axe checks; behavior and link checks; JS ${jsSize} bytes gzip.`);
}finally{await browser.close();}
