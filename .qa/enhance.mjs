import { readFile, writeFile } from 'node:fs/promises';
const icon = (body,cls='') => `<svg ${cls?`class="${cls}" `:''}viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const expand=icon('<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M9 9 3 3m12 6 6-6M9 15l-6 6m12-6 6 6"/>');
const plus=icon('<path d="M12 5v14M5 12h14"/>','details-icon');
const dock=`<nav class="mobile-dock" aria-label="Quick navigation"><a href="#top" aria-current="location">${icon('<circle cx="12" cy="8" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>')}<span>Profile</span></a><a href="#work">${icon('<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M8 6V3h8v3M3 12h18M10 12v3h4v-3"/>')}<span>Work</span></a><a href="#experience">${icon('<circle cx="5" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><path d="M5 7v10M11 5h9M11 10h6M11 19h9"/>')}<span>Experience</span></a><a href="#contact">${icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>')}<span>Contact</span></a></nav>`;
const dialog=`<dialog class="visual-dialog" aria-labelledby="visual-title"><div class="visual-dialog-heading"><div><p class="project-kicker">A closer look</p><h2 id="visual-title">Project visual</h2></div><button type="button" class="icon-button" data-close-visual aria-label="Close preview">${icon('<path d="m6 6 12 12M18 6 6 18"/>')}</button></div><div class="visual-viewport"><img width="1200" height="800" alt=""></div><div class="visual-dialog-footer"><p data-visual-caption></p><button type="button" class="button" data-zoom-visual aria-pressed="false">Zoom in</button></div></dialog>`;
const visuals={
  report:{title:'RDLC report layout',caption:'Illustrative layout. Every name and number is fictional.'},
  api:{title:'ERP request lifecycle',caption:'Illustrative technology flow. Not Clarra internal architecture.'},
  portfolio:{title:'This portfolio',caption:'A preview of this portfolio.'}
};
for(const file of ['index.html','work/rdlc-reporting.html','work/erp-api.html']){
  let html=await readFile('docs/'+file,'utf8');
  const isHome=file==='index.html', prefix=isHome?'':'../';
  html=html.replace('<body>','<body'+(isHome?' class="home-page"':' class="case-page"')+'>');
  html=html.replaceAll('<div class="project-visual"><picture>','<div class="project-visual"><picture>');
  const picturePattern=/<picture><source type="image\/avif" srcset="(?:\.\.\/)?assets\/images\/(report|api|portfolio)-600\.avif[\s\S]*?<\/picture>/g;
  html=html.replace(picturePattern,(picture,name)=>`${picture}<a class="visual-open" href="${prefix}assets/images/${name}-1200.webp" data-visual-title="${visuals[name].title}" data-visual-caption="${visuals[name].caption}" aria-label="Enlarge ${visuals[name].title.toLowerCase()}">${expand}<span>Inspect ${name==='report'?'report':name==='api'?'diagram':'preview'}</span></a>`);
  html=html.replace('</body>',dialog+'</body>');
  if(isHome){
    html=html.replace('<h1 id="hero-title">Towhidul Islam Rafi<span aria-hidden="true">.</span></h1>','<h1 id="hero-title"><span class="hero-name-top">Towhidul Islam</span> <span class="hero-name-last">Rafi<span class="accent-dot" aria-hidden="true">.</span></span></h1>');
    html=html.replace('<figcaption class="portrait-caption"><span>Towhidul Islam Rafi</span><span>Based in Bangladesh</span></figcaption>','<figcaption class="portrait-caption"><span>Working on Clarra ERP</span><span>iTech Velocity · Since Dec 2025</span></figcaption>');
    html=html.replace('<p class="hero-statement">','<p class="hero-statement">');
    html=html.replace('</div><div class="proof-grid"','</div><div class="hero-next"><a href="#work"><span>Explore my work</span>'+icon('<path d="M12 4v16m-6-6 6 6 6-6"/>')+'</a><span>Reporting / APIs / Delivery</span></div><div class="proof-grid"');
    html=html.replace('<div class="project-grid">','<nav class="work-navigation" aria-label="Browse selected work"><a href="#reporting-project" aria-current="location"><span>01</span> Reporting</a><a href="#api-project"><span>02</span> Backend</a><a href="#portfolio-project"><span>03</span> Portfolio</a></nav><div class="project-grid">');
    let projectIndex=0;
    html=html.replace(/<article class="project(?: project-featured)?" data-reveal>/g,match=>match.replace(' data-reveal',` id="${['reporting-project','api-project','portfolio-project'][projectIndex++]}" data-reveal`));
    let detailsIndex=0;
    const resultLabels=['30+ RDLC reports','API development & production support','A focused, static portfolio'];
    html=html.replace(/<dl class="project-facts">[\s\S]*?<\/dl>/g,dl=>`<details class="project-details" open><summary><span class="project-result"><span class="detail-label">At a glance</span><strong>${resultLabels[detailsIndex++]}</strong></span>${plus}<span class="sr-only">Toggle project details</span></summary>${dl}</details>`);
    html=html.replace('<div class="social-links">',`<div class="email-actions"><button class="copy-email" type="button" data-copy-email hidden>${icon('<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>')}<span>Copy email address</span></button><span class="copy-status" role="status" data-copy-status></span></div><div class="social-links">`);
    html=html.replace('</footer>','</footer>'+dock);
    // Reserve the form's space before module execution to avoid layout shift.
    html=html.replace('<form class="contact-form" data-contact-form hidden','<form class="contact-form" data-contact-form');
    html=html.replace('<button type="submit" class="button button-primary">Send message</button>','<button type="submit" class="button button-primary" disabled>Send message</button>');
    html=html.replace('Contribute 30+ RDLC reports and REST API work','My work includes 30+ RDLC reports and REST APIs');
  }else{
    const chapters=[['problem','Problem'],['role','My role'],['approach','Approach'],['result','Result']];
    html=html.replace('<article class="case-body"',`<nav class="case-navigation" aria-label="Case study sections">${chapters.map(([id,name])=>`<a href="#${id}">${name}</a>`).join('')}</nav><article class="case-body"`);
    for(const [id,name]of chapters)html=html.replace(`<section><h2>${name}</h2>`,`<section id="${id}"><h2>${name}</h2>`);
  }
  await writeFile('docs/'+file,html);
}
// The 404 is served at arbitrary depths, so its navigation uses the site base.
let missing=await readFile('docs/404.html','utf8');
missing=missing.replaceAll('../index.html','/my_portfolio/');
await writeFile('docs/404.html',missing);
