import sharp from 'sharp';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';

const output = new URL('../docs/assets/images/', import.meta.url);
await mkdir(output, { recursive: true });
await mkdir(new URL('../docs/assets/fonts/', import.meta.url), { recursive: true });
for (const [packageName, filename, outputName] of [
  ['inter', 'inter-latin-wght-normal.woff2', 'inter-latin.woff2'],
  ['plus-jakarta-sans', 'plus-jakarta-sans-latin-wght-normal.woff2', 'jakarta-latin.woff2']
]) {
  await copyFile(`node_modules/@fontsource-variable/${packageName}/files/${filename}`, new URL(`../docs/assets/fonts/${outputName}`, import.meta.url));
  await copyFile(`node_modules/@fontsource-variable/${packageName}/LICENSE`, new URL(`../docs/assets/fonts/${packageName}-LICENSE.txt`, import.meta.url));
}
for (const width of [128, 256, 512]) {
  for (const format of ['webp', 'avif']) {
    await sharp('source/profile.jpeg').rotate().resize(width, Math.round(width * 1.125), { fit: 'cover', position: 'attention' }).toFormat(format, { quality: 72 }).toFile(new URL(`profile-${width}.${format}`, output).pathname.replace(/^\/(?=[A-Za-z]:)/, ''));
  }
}

const wrap = (body, bg = '#e8edf5') => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="${bg}"/><g font-family="Arial, sans-serif">${body}</g></svg>`;
const grid = `<defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#d3dce9" stroke-width="1"/></pattern></defs><rect width="1200" height="800" fill="url(#grid)"/>`;
const text = (x,y,t,size=20,fill='#171c26',weight=400) => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}">${t}</text>`;
const report = wrap(`${grid}<rect x="220" y="55" width="760" height="700" rx="4" fill="#c9d2df"/><rect x="206" y="42" width="760" height="700" rx="4" fill="#fff"/>
  <rect x="246" y="90" width="8" height="42" fill="#174ea6"/>${text(274,108,'DEMO COMPANY',18,'#174ea6',700)}${text(274,135,'Monthly sales summary',30,'#171c26',700)}
  ${text(246,183,'REPORT PREVIEW / RDLC',13,'#485262',700)}${text(660,183,'PERIOD: JAN 2026',13,'#485262')}
  <path d="M246 208H926" stroke="#d5dbe4"/>${text(246,250,'01   Sales by category',20,'#171c26',700)}
  <rect x="246" y="275" width="680" height="42" fill="#edf2fa"/>${text(262,302,'CATEGORY',12,'#485262',700)}${text(570,302,'ORDERS',12,'#485262',700)}${text(734,302,'TOTAL (BDT)',12,'#485262',700)}
  ${[ ['Office supplies','12','24,000'],['Equipment','8','48,000'],['Services','6','18,000'] ].map((r,i)=>`${text(262,352+i*54,r[0],18)}${text(586,352+i*54,r[1],18)}${text(753,352+i*54,r[2],18)}<path d="M246 ${372+i*54}H926" stroke="#e3e7ed"/>`).join('')}
  <rect x="246" y="496" width="680" height="52" rx="2" fill="#174ea6"/>${text(262,530,'TOTAL',14,'#fff',700)}${text(586,530,'26',18,'#fff',700)}${text(753,530,'90,000',18,'#fff',700)}
  ${text(246,594,'All figures are fictional.',15,'#485262')}${text(246,620,'Illustrative layout. No client or production data.',15,'#485262')}
  <path d="M246 674H926" stroke="#d5dbe4"/>${text(246,702,'SANITIZED REPORT STUDY',12,'#485262',700)}${text(841,702,'01 / 01',12,'#485262')}`);
const api = wrap(`${grid}${text(72,88,'ERP / REQUEST LIFECYCLE',16,'#174ea6',700)}${text(72,140,'From business input to data.',34,'#171c26',700)}
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#174ea6"/></marker></defs>
  ${[[72,248,'01','HTTP request','Business input'],[657,248,'02','ASP.NET Core','REST API'],[72,456,'04','SQL Server','Application data'],[657,456,'03','EF Core','Data access']].map(([x,y,n,title,sub])=>`<rect x="${x}" y="${y}" width="470" height="140" rx="12" fill="#fff" stroke="#c7d2e4"/><rect x="${x+24}" y="${y+24}" width="40" height="40" rx="8" fill="#e8effb"/>${text(x+33,y+50,n,16,'#174ea6',700)}${text(x+84,y+59,title,26,'#171c26',700)}${text(x+84,y+96,sub,18,'#485262')}`).join('')}
  <path d="M551 318H646M892 397V445M647 526H553" fill="none" stroke="#174ea6" stroke-width="3" marker-end="url(#arrow)"/>
  ${text(72,686,'IIS deployment  /  Production support',19,'#174ea6',600)}${text(72,730,'Illustrative stack diagram. Not Clarra internal architecture.',17,'#485262')}`);
const portfolio = wrap(`${grid}<rect x="100" y="115" width="1000" height="570" rx="12" fill="#fff" stroke="#c7d2e4"/><path d="M100 169H1100" stroke="#d5dbe4"/>${text(128,150,'t-rafi.github.io/my_portfolio/',15,'#485262')}
  ${text(160,222,'RAFI.',17,'#171c26',700)}${text(845,222,'Work   Contact',14,'#485262')}
  ${text(160,290,'JUNIOR SOFTWARE ENGINEER / BANGLADESH',12,'#174ea6',700)}${text(160,353,'Towhidul Islam Rafi.',45,'#171c26',700)}${text(160,399,'I ship business-critical ERP software.',24,'#485262')}
  <rect x="160" y="430" width="135" height="40" rx="6" fill="#174ea6"/>${text(185,456,'Contact me',15,'#fff',700)}<rect x="307" y="430" width="145" height="40" rx="6" fill="#f7f8fa" stroke="#d5dbe4"/>${text(327,456,'Download CV',15,'#171c26')}
  <path d="M160 506H1040" stroke="#d5dbe4"/>${text(160,548,'30+',28,'#171c26',700)}${text(160,578,'RDLC reports',15,'#485262')}${text(478,548,'20+',28,'#171c26',700)}${text(478,578,'Developer team',15,'#485262')}${text(774,548,'API → IIS',28,'#171c26',700)}${text(774,578,'Delivery and support',15,'#485262')}${text(160,644,'STATIC HTML  /  CSS  /  JAVASCRIPT',12,'#174ea6',700)}`);
for (const [name,svg] of Object.entries({report,api,portfolio})) {
  await writeFile(new URL(`../source/${name}.svg`, import.meta.url), svg);
  for (const width of [600,1200]) for (const format of ['avif','webp']) {
    await sharp(Buffer.from(svg)).resize(width).toFormat(format,{quality:85}).toFile(new URL(`${name}-${width}.${format}`, output).pathname.replace(/^\/(?=[A-Za-z]:)/, ''));
  }
}
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0d1117"/><g font-family="Arial,sans-serif"><rect x="72" y="72" width="40" height="4" fill="#8eb8ff"/>${text(72,146,'JUNIOR SOFTWARE ENGINEER · BANGLADESH',18,'#b0bac8',600)}${text(72,258,'Towhidul Islam Rafi.',70,'#eff3fa',700)}${text(72,340,'Business-critical ERP software.',38,'#8eb8ff')}${text(72,430,'ASP.NET Core  /  SQL Server  /  RDLC  /  IIS',23,'#b0bac8')}<path d="M72 492H1128" stroke="#344152"/>${text(72,550,'30+ RDLC reports',20,'#eff3fa')}${text(770,550,'t-rafi.github.io/my_portfolio',20,'#b0bac8')}</g></svg>`;
await sharp(Buffer.from(og)).png().toFile(new URL('og.png', output).pathname.replace(/^\/(?=[A-Za-z]:)/, ''));
await writeFile(new URL('favicon.svg',output),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#174ea6"/><path d="M17 17h17c10 0 15 5 15 13 0 6-3 10-9 12l11 14H38L28 43h-1v13H17zm10 9v9h7c3 0 5-2 5-5 0-2-2-4-5-4z" fill="#fff"/></svg>');
console.log('Fonts, responsive images, engineering visuals and social image generated.');
