(() => {
  'use strict';
  const URL = 'https://uvjsrhbtzgrggjuucdyo.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdWJhc2UiLCJyZWYiOiJ1dmpzcmhidHp6cmdnZ2p1Y2R5byIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg2Nzc1OTQsImV4cCI6MjEwMjM1MTk0Mn0.pph1uARdD-Wk0gSyTzbUsSpcZDrboj7Ka1nNH1Dxn-E';
  const client = window.supabase?.createClient(URL, KEY);
  const getSessionId = () => { let id=sessionStorage.getItem('_sid'); if (!id) { id=crypto.randomUUID(); sessionStorage.setItem('_sid',id); } return id; };
  const getDevice = () => /iPad|Tablet/.test(navigator.userAgent) || (innerWidth >= 768 && innerWidth <= 1024) ? 'Tablet' : /Mobi|Android|iPhone/i.test(navigator.userAgent) || innerWidth < 768 ? 'Mobile' : 'Desktop';
  const getBrowser = () => { const u=navigator.userAgent; return /Edg\//.test(u)?'Edge':/OPR\//.test(u)?'Opera':/Firefox\//.test(u)?'Firefox':/Chrome\//.test(u)?'Chrome':/Safari\//.test(u)?'Safari':'Other'; };
  const getOS = () => { const u=navigator.userAgent, p=navigator.platform; return /Android/.test(u)?'Android':/iPhone|iPad|iPod/.test(u)?'iOS':/Win/.test(p)?'Windows':/Mac/.test(p)?'macOS':/Linux/.test(p)?'Linux':'Other'; };
  const geo = async () => { try { const r=await fetch('https://ipapi.co/json/',{signal:AbortSignal.timeout(3500)}); const d=await r.json(); return {country:d.country_name||'Unknown',city:d.city||'Unknown'}; } catch { return {country:'Unknown',city:'Unknown'}; } };
  const insert = async (page) => { if (!client) return; try { const place=await geo(); await client.from('visits').insert({page,referrer:document.referrer||'Direct',country:place.country,city:place.city,device:getDevice(),browser:getBrowser(),os:getOS(),session_id:getSessionId()}); } catch {} };
  const isDev = () => ['localhost','127.0.0.1'].includes(location.hostname);
  const markOnce = (key, page) => { if (!sessionStorage.getItem(key)) { sessionStorage.setItem(key,'1'); insert(page); } };
  const init = () => {
    if (isDev() || !client) return;
    markOnce('_visit_tracked', location.pathname || '/');
    document.querySelectorAll('section[id]').forEach((section) => new IntersectionObserver((entries, observer) => entries.forEach((entry) => { if (entry.isIntersecting) { markOnce(`_section_${section.id}`,section.id); observer.unobserve(section); } }),{threshold:.5}).observe(section));
    document.querySelectorAll('a[href*=".pdf"],a[href*=".doc"]').forEach((link) => link.addEventListener('click', () => markOnce(`_download_${link.href}`,`cv_download_${link.href.split('/').pop()}`)));
  };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
