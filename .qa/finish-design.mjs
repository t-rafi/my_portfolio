import {readFile,writeFile} from 'node:fs/promises';
for(const file of ['index.html','404.html','work/rdlc-reporting.html','work/erp-api.html']){
  let html=await readFile('docs/'+file,'utf8');
  html=html.replace('connect-src https://api.emailjs.com','connect-src \'self\' https://api.emailjs.com');
  html=html.replaceAll('aria-label="Enlarge rdlc report layout"','aria-label="Inspect report: RDLC layout"');
  html=html.replaceAll('aria-label="Enlarge erp request lifecycle"','aria-label="Inspect diagram: ERP request lifecycle"');
  html=html.replaceAll('aria-label="Enlarge this portfolio"','aria-label="Inspect preview: this portfolio"');
  await writeFile('docs/'+file,html);
}
