import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { mkdir,writeFile } from 'node:fs/promises';
await mkdir('.qa/lighthouse',{recursive:true});
const base=process.env.TEST_URL||'http://127.0.0.1:4173/my_portfolio/';
const chrome=await launch({chromePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',chromeFlags:['--headless','--no-first-run','--disable-extensions']});
const rows=[];
try{
  for(const [name,path] of [['home',''],['reporting','work/rdlc-reporting.html'],['api','work/erp-api.html']]){
    const result=await lighthouse(base+path,{port:chrome.port,output:['json','html'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']});
    await writeFile(`.qa/lighthouse/${name}.json`,result.report[0]);
    await writeFile(`.qa/lighthouse/${name}.html`,result.report[1]);
    const row={page:name,...Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),lcpMs:Math.round(result.lhr.audits['largest-contentful-paint'].numericValue),cls:result.lhr.audits['cumulative-layout-shift'].numericValue};
    rows.push(row);console.log(JSON.stringify(row));
    const failing=Object.values(result.lhr.audits).filter(a=>a.score!==null&&a.score<.9&&a.details?.type!=='opportunity').map(a=>({id:a.id,title:a.title,value:a.displayValue}));
    if(failing.length)console.log(JSON.stringify(failing));
  }
  await writeFile('.qa/lighthouse/summary.json',JSON.stringify(rows,null,2));
  if(rows.some(r=>r.performance<95||r.accessibility<95||r['best-practices']<95||r.seo<95||r.lcpMs>=2000||r.cls>=.05))process.exitCode=1;
}finally{await chrome.kill();}
