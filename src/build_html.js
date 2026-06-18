const fs=require('fs');
const d=require('./data.js');
const SITE_URL=(process.env.SITE_URL||'').replace(/\/+$/,'');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const att=s=>esc(s).replace(/"/g,'&quot;');
// trip-order region palette — add a region here and everything follows
const REGIONS={caracas:{name:'Caracas',color:'#6c5ce7'},canaima:{name:'Canaima · Angel Falls',color:'#e8820c'},delta:{name:'Orinoco Delta',color:'#2e8b57'},losroques:{name:'Los Roques',color:'#0bb3c9'}};
const regionName=Object.fromEntries(Object.entries(REGIONS).map(([k,v])=>[k,v.name]));
const COL=Object.fromEntries(Object.entries(REGIONS).map(([k,v])=>[k,v.color]));
const regionVars=Object.entries(REGIONS).map(([k,v])=>`--${k}:${v.color};`).join('');
const regionCSS=Object.entries(REGIONS).map(([k,v])=>
`.pill.r-${k}{box-shadow:inset 0 -3px 0 ${v.color}}.day.r-${k}{border-left-color:${v.color}}.day.r-${k} .dnum{background:${v.color}}.rtag.r-${k}{background:${v.color}}`).join('\n');
const legend=Object.entries(REGIONS).map(([k,v])=>`<span><i style="background:${v.color}"></i>${esc(v.name)}</span>`).join('');

const favSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#10243a"/><path d="M12 44 L26 20 L34 36 L40 26 L52 44 Z" fill="#0bb3c9"/><circle cx="44" cy="18" r="5" fill="#e8820c"/></svg>`;
const fav=Buffer.from(favSvg).toString('base64');

// hero journey map (5 stops)
const heroNodes=[
  {x:120,y:80,c:COL.caracas,t:'Caracas',s:'23 Jun',up:true},
  {x:380,y:130,c:COL.canaima,t:'Angel Falls',s:'25–28 Jun',up:false},
  {x:630,y:80,c:COL.delta,t:'Orinoco Delta',s:'29 Jun–1 Jul',up:true},
  {x:892,y:130,c:COL.losroques,t:'Los Roques',s:'4–8 Jul',up:false}];
const heroPath='M120,80 C235,52 270,158 380,130 C490,108 540,46 630,80 C742,108 792,158 892,130';
const heroSvg=`<svg class="heromap" viewBox="0 0 1000 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="${heroPath}" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2.5" stroke-dasharray="3 7" stroke-linecap="round"/>
  ${heroNodes.map(n=>`<circle cx="${n.x}" cy="${n.y}" r="16" fill="${n.c}" opacity=".22"/><circle cx="${n.x}" cy="${n.y}" r="7" fill="${n.c}" stroke="#fff" stroke-width="2"/><text x="${n.x}" y="${n.up?n.y-24:n.y+32}" text-anchor="middle" fill="#fff" font-size="16" font-weight="700" font-family="Arial,Helvetica,sans-serif">${esc(n.t)}</text><text x="${n.x}" y="${n.up?n.y-9:n.y+47}" text-anchor="middle" fill="rgba(255,255,255,.8)" font-size="11.5" font-family="Arial,Helvetica,sans-serif">${esc(n.s)}</text>`).join('')}
</svg>`;

const dayNav=d.days.map(day=>`<a class="pill r-${day.region}" href="#day${day.n}"><b>${day.n}</b><span>${esc(day.date)}</span></a>`).join('');
const dayCards=d.days.map(day=>{
  const blocks=day.blocks.map(b=>`<tr><td class="t">${esc(b[0])}</td><td class="a">${esc(b[1])}</td></tr>`).join('');
  const chips=[];
  if(day.shots&&day.shots!=='—')chips.push(`<span class="chip shot"><i>Shots</i>${esc(day.shots)}</span>`);
  if(day.stay&&day.stay!=='—')chips.push(`<span class="chip stay"><i>Stay</i>${esc(day.stay)}</span>`);
  if(day.eat&&day.eat!=='—')chips.push(`<span class="chip eat"><i>Eat</i>${esc(day.eat)}</span>`);
  return `<article class="day r-${day.region}" id="day${day.n}"><header class="dayhead"><div class="dnum">Day ${day.n}</div><div class="dmeta"><h3>${esc(day.dow)} ${esc(day.date)} — ${esc(day.title)}</h3><div class="dsub"><span class="rtag r-${day.region}">${esc(regionName[day.region])}</span><span class="base">${esc(day.base)}</span><span class="sun">${esc(day.sun)}</span></div><div class="transit">${esc(day.transit)}</div></div></header><details open><summary>Hour-by-hour</summary><table class="timeline"><tbody>${blocks}</tbody></table></details><div class="chips">${chips.join('')}</div>${day.note?`<div class="note"><b>Note.</b> ${esc(day.note)}</div>`:''}</article>`;
}).join('');
const flightRows=d.flights.rows.map(f=>`<tr><td><b>${esc(f.route)}</b><div class="sm">${esc(f.when)}</div></td><td>${esc(f.detail)}</td><td class="nowrap">${esc(f.bag)}</td><td><span class="conf ${/Confirmed|Verified|Road/i.test(f.conf)?'ok':'warn'}">${esc(f.conf)}</span></td></tr>`).join('');
const decisionRows=d.decision.rows.map(r=>{const v=r[2];const cls=/^IN/i.test(v)?'ok':(/Cut|safety/i.test(v)?'bad2':'mid');return `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td><span class="verdict ${cls}">${esc(v)}</span></td></tr>`;}).join('');
const routeRows=d.route.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td class="nowrap">${esc(r[2])}</td></tr>`).join('');
const wxRows=d.weather.rows.map(r=>{const v=r[3];const cls=/WORKABLE/.test(v)?'ok':(/WASHOUT/.test(v)?'bad2':'mid');return `<tr><td><b>${esc(r[0])}</b></td><td class="nowrap">${esc(r[1])}</td><td>${esc(r[2])}</td><td><span class="verdict ${cls}">${esc(v)}</span></td></tr>`;}).join('');
const heroRows=d.heroShots.map(h=>`<li><b>${esc(h[0])}</b> <span class="tagday">${esc(h[1])}</span><br>${esc(h[2])}</li>`).join('');
const list=arr=>arr.map(x=>`<li><b>${esc(x[0])}.</b> ${esc(x[1])}</li>`).join('');
const sourcesList=d.sources.map(s=>`<li><a href="${att(s[1])}" target="_blank" rel="noopener">${esc(s[0])}</a></li>`).join('');
var ph=d.placeholder; var placeholderHtml='';
if(ph){placeholderHtml='<section><div class="wrap"><div class="placeholder"><div class="ph-tag">Self-arranged · placeholder</div><h2>'+esc(ph.title)+'</h2><div class="ph-warn">'+esc(ph.warning)+'</div><p class="ph-intro">'+esc(ph.intro)+'</p>'+ph.fields.map(function(f){return '<div class="ph-field"><span>'+esc(f)+'</span><i></i></div>';}).join('')+'<div class="ph-foot">'+esc(ph.foot)+'</div></div></div></section>';}
var dp=d.deltaPricing; var pricingHtml='';
if(dp){pricingHtml='<section><div class="wrap"><h2>'+esc(dp.title)+'<span class="lead">'+esc(dp.intro)+'</span></h2><table><thead><tr><th>Item</th><th class="nowrap">Per person</th><th class="nowrap">Total</th></tr></thead><tbody>'+dp.rows.map(function(r){return '<tr><td>'+esc(r[0])+'</td><td class="nowrap">'+esc(r[1])+'</td><td class="nowrap"><b>'+esc(r[2])+'</b></td></tr>';}).join('')+'<tr><td><b>Total</b></td><td></td><td class="nowrap"><b>'+esc(dp.total)+'</b></td></tr></tbody></table><div class="cut">'+esc(dp.note)+'</div></div></section>';}
const DESC='A 16-day photography field plan for Venezuela: Caracas, Angel Falls & Canaima, the Orinoco Delta, and Los Roques — hour-by-hour, with verified flights, weather and shot windows.';

const html=`<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Venezuela Photography Expedition — 16-Day Field Plan</title>
<meta name="description" content="${att(DESC)}">
${SITE_URL?`<link rel="canonical" href="${att(SITE_URL)}/">`:''}
<meta name="theme-color" content="#10243a">
<meta property="og:type" content="website"><meta property="og:site_name" content="Venezuela Photography Expedition">
<meta property="og:title" content="Venezuela Photography Expedition — 16-Day Field Plan">
<meta property="og:description" content="${att(DESC)}">
${SITE_URL?`<meta property="og:url" content="${att(SITE_URL)}/">`:''}
<meta property="og:image" content="${att((SITE_URL||'')+'/cover.png')}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Venezuela Photography Expedition">
<meta name="twitter:description" content="${att(DESC)}"><meta name="twitter:image" content="${att((SITE_URL||'')+'/cover.png')}">
<link rel="icon" href="data:image/svg+xml;base64,${fav}">
<style>
:root{--ink:#1b2430;--soft:#5b6675;--line:#e6e9ef;--bg:#f6f7f9;--card:#fff;${regionVars}}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);-webkit-text-size-adjust:100%}
a{color:inherit}.wrap{max-width:980px;margin:0 auto;padding:0 18px}
header.hero{background:linear-gradient(135deg,#10243a,#123a4d 45%,#0c5a52);color:#fff;padding:40px 0 8px;overflow:hidden}
.kick{letter-spacing:.16em;text-transform:uppercase;font-size:12px;opacity:.85;margin-bottom:10px}
header.hero h1{margin:0 0 8px;font-size:34px;line-height:1.1;font-weight:800;letter-spacing:-.01em}
header.hero .sub{font-size:17px;opacity:.95;margin-bottom:16px}
.route{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-weight:600;font-size:14px}
.route .seg{background:rgba(255,255,255,.14);padding:5px 11px;border-radius:999px;white-space:nowrap}
.meta-line{margin-top:14px;font-size:13px;opacity:.82;display:flex;gap:16px;flex-wrap:wrap}
.heromap{display:block;width:100%;max-width:820px;margin:14px auto -6px;height:auto}
nav.days{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.96);backdrop-filter:blur(6px);border-bottom:1px solid var(--line);overflow:auto}
nav.days .inner{display:flex;gap:6px;padding:10px 18px;max-width:980px;margin:0 auto}
.pill{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:46px;padding:5px 9px;border-radius:10px;background:#eef1f5;text-decoration:none;border:1px solid transparent;transition:.15s}
.pill b{font-size:14px;line-height:1}.pill span{font-size:10px;color:var(--soft);margin-top:2px;white-space:nowrap}
.pill:hover{border-color:var(--line);transform:translateY(-1px)}
${regionCSS}
section{padding:26px 0;border-bottom:1px solid var(--line)}
h2{font-size:21px;margin:0 0 4px;font-weight:800}
h2 .lead{display:block;font-weight:500;font-size:14px;color:var(--soft);margin-top:4px}
.callout{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--delta);border-radius:12px;padding:16px 18px;margin-top:14px}
.callout .headline{font-size:17px;font-weight:700;margin-bottom:8px}.callout p{margin:8px 0}
.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--soft);margin-top:14px}
.legend i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:6px;vertical-align:middle}
table{width:100%;border-collapse:collapse;margin-top:14px;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
th,td{padding:10px 12px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line);font-size:14px}
th{background:#eef1f5;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--soft)}
tr:last-child td{border-bottom:none}.sm{font-size:12px;color:var(--soft);margin-top:2px}.nowrap{white-space:nowrap}
.conf{font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;white-space:nowrap}
.conf.ok{background:#e3f5ec;color:#0c6b48}.conf.warn{background:#fbeede;color:#8a5a12}
.verdict{font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;white-space:nowrap}
.verdict.ok{background:#e3f5ec;color:#0c6b48}.verdict.mid{background:#fbeede;color:#8a5a12}.verdict.bad2{background:#fbe3da;color:#9a3217}
.cut{font-size:13px;color:var(--soft);margin-top:10px;font-style:italic}
.day{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin:16px 0;border-left:6px solid #ccc}
.dayhead{display:flex;gap:14px;align-items:flex-start}
.dnum{flex:0 0 auto;font-weight:800;font-size:13px;color:#fff;background:#39424f;border-radius:9px;padding:6px 9px;min-width:54px;text-align:center}
.dmeta h3{margin:0 0 5px;font-size:17px}
.dsub{display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:12px;color:var(--soft);margin-bottom:4px}
.rtag{font-weight:700;padding:2px 8px;border-radius:999px;color:#fff;font-size:11px}
.base{font-weight:600;color:var(--ink)}.transit{font-size:13px;color:var(--soft)}
details{margin-top:12px}summary{cursor:pointer;font-weight:700;font-size:13px;color:var(--soft);user-select:none;list-style:none}
summary::-webkit-details-marker{display:none}summary::before{content:"▾ ";color:#aab}details:not([open]) summary::before{content:"▸ "}
table.timeline{margin-top:8px;border:none;background:transparent}
table.timeline td{border-bottom:1px dashed var(--line);padding:7px 8px}
table.timeline td.t{white-space:nowrap;font-weight:700;color:var(--ink);width:62px;font-variant-numeric:tabular-nums}
table.timeline td.a{color:#33414f}
.chips{display:flex;flex-direction:column;gap:6px;margin-top:12px}
.chip{font-size:13px;background:#f3f5f8;border:1px solid var(--line);border-radius:9px;padding:7px 10px}
.chip i{font-style:normal;font-weight:800;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--soft);margin-right:8px}
.chip.shot{background:#eaf5ef}.chip.stay{background:#eef0fe}.chip.eat{background:#fef3e6}
.note{margin-top:10px;font-size:13px;background:#fff8e9;border:1px solid #f3e2bd;border-radius:9px;padding:9px 11px;color:#6b4e16}
ul.clean{margin:14px 0 0;padding-left:18px}ul.clean li{margin:8px 0}
ul.hero{list-style:none;margin:14px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:12px}
ul.hero li{background:var(--card);border:1px solid var(--line);border-radius:11px;padding:12px 14px;font-size:14px}
.tagday{font-size:11px;font-weight:700;color:#fff;background:#39424f;border-radius:999px;padding:2px 8px}
footer{padding:24px 0 70px;color:var(--soft);font-size:13px}
.toggle{float:right;font-size:12px;font-weight:700;color:var(--delta);cursor:pointer;border:1px solid var(--line);background:#fff;border-radius:8px;padding:6px 10px}
@media(max-width:680px){ul.hero{grid-template-columns:1fr}header.hero h1{font-size:26px}.dayhead{flex-direction:column;gap:8px}}
.placeholder{background:#fff;border:2px dashed #d8a18f;border-radius:14px;padding:18px 20px;margin-top:4px}
.ph-tag{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#9a3217;background:#fbe3da;border-radius:999px;padding:3px 10px;margin-bottom:8px}
.placeholder h2{margin:.15em 0 .45em;font-size:20px}
.ph-warn{background:#fbe3da;border:1px solid #e7b5a6;color:#7a2a14;border-radius:10px;padding:11px 13px;font-size:13px;font-weight:600;line-height:1.5}
.ph-intro{color:var(--soft);font-size:14px;margin:13px 0 4px}
.ph-field{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px dashed var(--line)}
.ph-field span{flex:0 0 240px;font-weight:700;font-size:13px;color:var(--ink)}
.ph-field i{flex:1;border-bottom:1px solid #c9cfd8;height:15px}
.ph-foot{margin-top:13px;font-size:12px;color:var(--soft);font-style:italic}
</style></head><body>
<header class="hero"><div class="wrap">
  <div class="kick">Field Plan · Photographers</div>
  <h1>Venezuela Photography Expedition</h1>
  <div class="sub">${esc(d.meta.dates)}</div>
  <div class="route">${d.meta.routeline.split('→').map(s=>`<span class="seg">${esc(s.trim())}</span>`).join('<span style="opacity:.6">→</span>')}</div>
  ${heroSvg}
  <div class="meta-line"><span>${esc(d.meta.crew)}</span><span>${esc(d.meta.prepared)}</span></div>
</div></header>
<nav class="days"><div class="inner">${dayNav}</div></nav>
<section><div class="wrap"><h2>The recommendation<span class="lead">What changed, and why</span></h2>
  <div class="callout"><div class="headline">${esc(d.summary.headline)}</div>${d.summary.body.map(p=>`<p>${esc(p)}</p>`).join('')}</div>
  <div class="legend">${legend}</div></div></section>
<section><div class="wrap"><h2>${esc(d.decision.title)}</h2><table><thead><tr><th>Option</th><th>Assessment</th><th>Verdict</th></tr></thead><tbody>${decisionRows}</tbody></table></div></section>
<section><div class="wrap"><h2>${esc(d.deltaWeather.title)}</h2><div class="callout">${d.deltaWeather.body.map(p=>`<p>${esc(p)}</p>`).join('')}</div></div></section>
${pricingHtml}<section><div class="wrap"><h2>Route &amp; nights</h2><table><thead><tr><th>Base</th><th>Why</th><th>Nights</th></tr></thead><tbody>${routeRows}</tbody></table></div></section>
<section><div class="wrap"><h2>Verified internal flights<span class="lead">${esc(d.flights.intro)}</span></h2><table><thead><tr><th>Leg</th><th>Detail (2026 schedule)</th><th>Baggage</th><th>Status</th></tr></thead><tbody>${flightRows}</tbody></table><div class="cut">${esc(d.flights.cut)}</div></div></section>
<section><div class="wrap"><h2>Weather, ranked<span class="lead">${esc(d.weather.intro)}</span></h2><table><thead><tr><th>Region</th><th>Rain</th><th>For a photographer</th><th>Verdict</th></tr></thead><tbody>${wxRows}</tbody></table></div></section>
<section><div class="wrap"><h2>Day by day, hour by hour <span class="toggle" id="toggleAll">Collapse all</span><span class="lead">Sunrise/sunset are approximate — confirm exact golden hour in PhotoPills on location.</span></h2>${dayCards}</div></section>
${placeholderHtml}<section><div class="wrap"><h2>Hero-shot map</h2><ul class="hero">${heroRows}</ul></div></section>
<section><div class="wrap"><h2>Health &amp; entry</h2><ul class="clean">${list(d.health)}</ul></div></section>
<section><div class="wrap"><h2>Safety &amp; security</h2><ul class="clean">${list(d.safety)}</ul></div></section>
<section><div class="wrap"><h2>Money &amp; fees</h2><ul class="clean">${list(d.money)}</ul></div></section>
<section><div class="wrap"><h2>What to book now</h2><ul class="clean">${list(d.bookNow)}</ul></div></section>
<section><div class="wrap"><h2>Photographer's packing notes</h2><ul class="clean">${list(d.packing)}</ul></div></section>
<section><div class="wrap"><h2>Caveats &amp; confidence</h2><ul class="clean">${list(d.caveats)}</ul></div></section>
<section><div class="wrap"><h2>Sources</h2><ul class="clean">${sourcesList}</ul></div></section>
<footer><div class="wrap">${esc(d.meta.prepared)} · A personal photography itinerary, shared for friends. Reconfirm flights, fees, lodge bookings and the eVisa close to departure — Venezuelan domestic schedules change without notice.</div></footer>
<script>
(function(){var links=[].slice.call(document.querySelectorAll('nav.days .pill'));var map={};links.forEach(function(l){map[l.getAttribute('href').slice(1)]=l;});
var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){l.style.outline='none';});var l=map[e.target.id];if(l){l.style.outline='2px solid #123a4d';l.style.outlineOffset='1px';l.scrollIntoView({inline:'center',block:'nearest'});}}});},{rootMargin:'-45% 0px -50% 0px'});
document.querySelectorAll('article.day').forEach(function(a){obs.observe(a);});
var btn=document.getElementById('toggleAll');btn.addEventListener('click',function(){var ds=[].slice.call(document.querySelectorAll('article.day details'));var anyOpen=ds.some(function(x){return x.open;});ds.forEach(function(x){x.open=!anyOpen;});btn.textContent=anyOpen?'Expand all':'Collapse all';});})();
</script></body></html>`;
const out=process.env.OUT||'site/index.html';
fs.writeFileSync(out,html);
console.log('built',out,html.length,'bytes ·',(html.match(/article class="day/g)||[]).length,'days · merida pills:',(html.match(/pill r-merida/g)||[]).length);
