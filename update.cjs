throw new Error('Legacy recovery script retired. Edit polls.json, run node build.cjs, then node checks.cjs.');
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
fs.mkdirSync(path.join(__dirname,'archive'), {recursive:true});
const backup=path.join(__dirname,'archive','NZ-Poll-Lab-2026-original.html');
if(!fs.existsSync(backup))fs.copyFileSync(path.join(__dirname,'NZ-Poll-Lab-2026.html'),backup);
let s=fs.readFileSync(backup,'utf8');
const additions=`
 {house:'Curia',name:'Taxpayers’ Union–Curia',end:'2026-10-05',published:'2026-10-08',n:1000,v:[28.5,28.2,13.3,9.2,12,1.4,4.8],enabled:true,source:'https://www.taxpayers.org.nz/oct2026_nztucurpolljjhhfas',note:'1–5 Oct; 700 phone and 300 online; 960 decided voters. Original sponsor release checked 8 Oct. Other is a residual (2.6%), while the release reports rounded Other of 2.7%.'},
 {house:'Verian',name:'1News–Verian',end:'2026-10-05',published:'2026-10-06',n:1001,v:[29,28,16,9,10,0.6,7],enabled:true,source:'https://www.1news.co.nz/2026/10/06/poll-opportunity-still-in-kingmaker-seat-as-greens-hold-strong/',note:'1–5 Oct; 501 mobile and 500 online. Main figures checked against 1News. TPM 0.6% from the linked polling table; the article rounds TPM to 1%. Other is the residual.'},
 {house:'Roy Morgan',name:'Roy Morgan',end:'2026-09-27',published:'2026-10-06',n:859,v:[31,23.5,16,11,10,2,6.5],enabled:true,source:'https://www.roymorgan.com/findings/10351-nz-national-voting-intention-september-2026',note:'31 Aug–27 Sep; phone survey. Original pollster report checked 8 Oct. Decided party-vote shares; 5% did not name a party.'},`;
s=s.replace('const CURRENT=[','const CURRENT=['+additions);
s=s.replaceAll('6 October 2026','8 October 2026').replaceAll("asof:'2026-10-06'","asof:'2026-10-08'").replace('id="asof" value="2026-10-06"','id="asof" value="2026-10-08"');
s=s.replace('Roy Morgan’s August poll is retained for transparency but is outside the default 35-day window.','Previous releases are retained for comparison; the newest eligible release per polling house enters the average.');
s=s.replace('Full browser rendering was not verified in the build environment.','Calculation checks and browser interaction checks accompany this version.');
s=s.replace('Each eligible pollster gets one equal vote in the average, using its latest included poll.','Each eligible pollster gets one equal vote in the average, using its latest included poll. Compare individual releases below to see how much the houses disagree.');
s=s.replace('<div class="split"><div class="panel"><h2>Party vote</h2>',`<div class="panel"><div class="subhead"><h2>Latest polls side by side</h2><button id="currentCSV">Download polls (CSV)</button></div><p class="small">One latest eligible poll per house. Seat totals use your electorate assumptions and the raw poll, before manual swings. Differences between pollsters are not necessarily changes in voter support.</p><div class="scroll" id="comparison"></div><div class="notice info" id="thresholdNote"></div></div>
<div class="panel"><h2>Recent polling by party</h2><p class="small">Individual stored observations by fieldwork end. Lines connect observations within each house; they do not estimate a polling average. This recovered local copy contains recent releases, rather than the complete 2026 archive.</p><label>Party<select id="trendParty"></select></label><div id="trendChart"></div></div>
<div class="split"><div class="panel"><h2>Party vote</h2>`);
s=s.replace("try{const old=localStorage.getItem(STORAGE);if(old)state=validState(JSON.parse(old));}catch(e){}",`try{const old=localStorage.getItem(STORAGE);if(old)state=validState(JSON.parse(old));}catch(e){}
// Merge new releases into existing saved inputs without overwriting user edits.
if(state.dataRevision!=='2026-10-08'){
 CURRENT.slice(0,3).forEach(r=>{if(!state.rows.some(x=>x.house===r.house&&x.end===r.end))state.rows.unshift(JSON.parse(JSON.stringify(r)));});
 state.dataRevision='2026-10-08';
}`);
s=s.replace("independent:0});","independent:0,dataRevision:'2026-10-08'});");
s=s.replace("['Use','Pollster key','Fieldwork end','n'","['Use','Pollster key','Fieldwork end','Released','Source URL','n'");
s=s.replace('`<input type="number" min="1" step="1" value="${r.n||\'\'}"', '`<input type="date" value="${esc(r.published||\'\')}" data-row="${i}" data-field="published" aria-label="Release date row ${i+1}">`,\n `<input class="wide-input" type="url" value="${esc(r.source||\'\')}" data-row="${i}" data-field="source" aria-label="Source URL row ${i+1}">`,\n `<input type="number" min="1" step="1" value="${r.n||\'\'}"');
s=s.replace("else {r[t.dataset.field]=t.value;if(t.dataset.field==='end')r.published=t.value;}update();", "else r[t.dataset.field]=t.value;update();");
s=s.replace("if(day(r.end)>day(asof)","if(r.published&&!Number.isFinite(day(r.published)))throw Error('Enter a valid release date or leave it blank.');\n   if(r.published&&r.published<r.end)throw Error('A release date cannot be earlier than the fieldwork end.');\n   if(day(r.end)>day(asof)");
s=s.replace("lastOutput={raw,v,seats:s,variants};save();", "lastOutput={raw,v,seats:s,variants};renderComparison(selected);renderTrend();save();");
s=s.replace("lastOutput=null;}\n}","lastOutput=null;$('#comparison').innerHTML='';$('#thresholdNote').textContent='';$('#trendChart').innerHTML='';}\n}");
s=s.replace("function renderHistory(){",`function renderComparison(snapshot){
 const rows=[...snapshot.selected].sort((a,b)=>b.end.localeCompare(a.end));
 $('#comparison').innerHTML=table(['Poll / source','Fieldwork end','Released','Age (days)',...KEYS.slice(0,7),'NAT+ACT+NZF seats','LAB+GRN+TPM seats'],rows.map(r=>{
 const ss=seats(complete(r.v),state.floors,state.independent);
 return [link(r.source,r.name||r.house),esc(r.end),esc(r.published||'Unverified'),Math.round((Date.parse(state.asof)-Date.parse(r.end))/86400000),...r.v.map(x=>fmt(x,1)),ss.right,ss.left];
 }));
 const low=Math.min(...rows.map(r=>r.v[6])),high=Math.max(...rows.map(r=>r.v[6]));
 $('#thresholdNote').textContent='Opportunity ranges from '+fmt(low,1)+'% to '+fmt(high,1)+'% across included houses. The list threshold is 5% unless the party wins an electorate. The average is '+fmt(snapshot.v[6],2)+'%; test the threshold using manual swings.';
}
function renderTrend(){
 const p=+$('#trendParty').value, rows=state.rows.filter(r=>r.enabled&&r.end<=state.asof&&(!r.published||r.published<=state.asof)&&Number.isFinite(r.v[p])).sort((a,b)=>a.end.localeCompare(b.end));
 if(!rows.length){$('#trendChart').textContent='No observations for this selection.';return;}
 const w=1000,h=340,l=60,t=25,pw=910,ph=230;
 const dates=rows.map(r=>Date.parse(r.end)),min=Math.min(...dates),max=Math.max(...dates),lo=Math.max(0,Math.floor(Math.min(...rows.map(r=>r.v[p]))-2)),hi=Math.ceil(Math.max(...rows.map(r=>r.v[p]))+2);
 const x=d=>l+pw*(Date.parse(d)-min)/(max-min||1),y=v=>t+ph*(hi-v)/(hi-lo);
 const houses=[...new Set(rows.map(r=>r.house))],colors=['#006e65','#1478bd','#ad4650','#84652a','#734d9e','#485965'];
 let svg='<svg viewBox="0 0 '+w+' '+h+'" class="chart" role="img" aria-label="Recent '+esc(PARTIES[p])+' poll observations"><title>'+esc(PARTIES[p])+' polling by house</title>';
 for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4;svg+='<line x1="'+l+'" x2="'+(l+pw)+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#dce3e4"/><text x="50" y="'+(y(v)+4)+'" text-anchor="end" font-size="12">'+fmt(v,1)+'%</text>';}
 [...new Set(rows.map(r=>r.end))].forEach(d=>{svg+='<text x="'+x(d)+'" y="280" text-anchor="middle" font-size="11">'+esc(d.slice(5))+'</text>';});
 houses.forEach((house,i)=>{const rr=rows.filter(r=>r.house===house),c=colors[i%colors.length];svg+='<polyline fill="none" stroke="'+c+'" stroke-width="2" points="'+rr.map(r=>x(r.end)+','+y(r.v[p])).join(' ')+'"/>';rr.forEach(r=>{svg+='<circle cx="'+x(r.end)+'" cy="'+y(r.v[p])+'" r="5" fill="'+c+'"><title>'+esc(house)+' · '+esc(r.end)+' · '+r.v[p]+'%</title></circle>';});svg+='<text x="'+(l+(i%3)*300)+'" y="'+(310+Math.floor(i/3)*22)+'" font-size="13" fill="'+c+'">● '+esc(house)+'</text>';});
 $('#trendChart').innerHTML=svg+'</svg>';
}
function renderHistory(){`);
s=s.replace("renderInputs();renderHistory();renderSources();update();",`$('#trendParty').innerHTML=PARTIES.slice(0,7).map((p,i)=>'<option value="'+i+'">'+esc(p)+'</option>').join('');
$('#trendParty').onchange=renderTrend;
$('#currentCSV').onclick=()=>{const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';const rows=[['pollster','fieldwork_end','released','sample_size',...KEYS.slice(0,7),'source'],...state.rows.map(r=>[r.house,r.end,r.published,r.n,...r.v,r.source])];download('NZ-polls.csv',rows.map(r=>r.map(quote).join(',')).join('\\r\\n'),'text/csv;charset=utf-8');};
renderInputs();renderHistory();renderSources();update();`);
s=s.replace('<div class="panel"><div class="subhead"><h2>Latest polls side by side</h2>',`<div class="panel"><div class="subhead"><h2>Projected Parliament</h2><button id="seatSVG">Download seat graphic (SVG)</button></div><p class="small">One dot per seat, based on the polling average and your selected scenario. Electorate wins are assumptions; this is a seat projection, not a forecast of coalition agreements.</p><div id="parliament"></div></div><div class="panel"><div class="subhead"><h2>Latest polls side by side</h2>`);
s=s.replace('renderComparison(selected);renderTrend();save();','renderComparison(selected);renderTrend();renderParliament();save();');
s=s.replace("$('#comparison').innerHTML='';", "$('#parliament').innerHTML='';$('#comparison').innerHTML='';");
s=s.replace('function renderComparison(snapshot){',`function parliamentSVG(ss){
 const order=[1,2,5,6,0,3,4], dots=order.flatMap(p=>Array(ss.parties[p]).fill(p)).concat(Array(ss.independent).fill(7));
 const count=[12,16,19,22,24,27],total=count.reduce((a,b)=>a+b,0);
 let counts=count.map(n=>Math.floor(n*ss.total/total));
 for(let i=0;counts.reduce((a,b)=>a+b,0)<ss.total;i++)counts[5-i%6]++;
 let positions=[];counts.forEach((n,row)=>{const radius=100+row*27;for(let k=0;k<n;k++){const angle=Math.PI-Math.PI*k/(n-1||1);positions.push({x:440+radius*Math.cos(angle),y:310-radius*Math.sin(angle),angle});}});
 positions.sort((a,b)=>b.angle-a.angle||a.y-b.y);
 let svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 505" class="chart" role="img" aria-label="'+ss.total+' seat Parliament projection"><title>NZ Poll Lab projected Parliament</title><rect width="880" height="505" rx="12" fill="#ffffff"/><text x="30" y="35" font-family="system-ui,sans-serif" font-size="23" font-weight="700" fill="#172b36">Projected Parliament · '+esc(state.asof)+'</text><text x="30" y="59" font-family="system-ui,sans-serif" font-size="13" fill="#536977">'+(state.scenario==='base'?'Polling average':'Historical error scenario '+esc(state.scenario))+' · '+ss.total+' seats · '+ss.majority+' needed for a majority</text>';
 positions.forEach((pos,i)=>{const p=dots[i];svg+='<circle cx="'+pos.x.toFixed(2)+'" cy="'+pos.y.toFixed(2)+'" r="9" fill="'+COLORS[p]+'"><title>'+esc(p===7?'Independent / electorate only':PARTIES[p])+'</title></circle>';});
 svg+='<text x="440" y="256" text-anchor="middle" font-family="system-ui,sans-serif" font-size="37" font-weight="700" fill="#172b36">'+ss.total+'</text><text x="440" y="280" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#536977">projected seats</text>';
 const legend=[...order,...(ss.independent?[7]:[])];legend.forEach((p,i)=>{const x=30+(i%4)*213,y=352+Math.floor(i/4)*32;svg+='<circle cx="'+(x+6)+'" cy="'+(y-4)+'" r="6" fill="'+COLORS[p]+'"/><text x="'+(x+20)+'" y="'+y+'" font-family="system-ui,sans-serif" font-size="14" fill="#172b36">'+esc(p===7?'Independent':PARTIES[p])+' '+(p===7?ss.independent:ss.parties[p])+'</text>';});
 svg+='<text x="30" y="421" font-family="system-ui,sans-serif" font-size="14" fill="#172b36">NAT + ACT + NZF: '+ss.right+' · LAB + GRN + TPM: '+ss.left+' · Opportunity: '+ss.opp+'</text><text x="30" y="447" font-family="system-ui,sans-serif" font-size="12" fill="#536977">Electorate floors (NAT, LAB, GRN, ACT, NZF, TPM, OPP): '+state.floors.join(', ')+' · Overhang: '+ss.overhang+'</text><text x="30" y="469" font-family="system-ui,sans-serif" font-size="12" fill="#536977">Manual swings and bias adjustments follow the controls. One dot = one seat.</text><text x="30" y="490" font-family="system-ui,sans-serif" font-size="12" fill="#536977">NZ Poll Lab · Conditional seat arithmetic, not a prediction of coalition agreements.</text></svg>';
 return svg;
}
function renderParliament(){if(lastOutput)$('#parliament').innerHTML=parliamentSVG(lastOutput.seats);}
function renderComparison(snapshot){`);
s=s.replace("$('#currentCSV').onclick=", "$('#seatSVG').onclick=()=>{if(lastOutput)download('NZ-Parliament-'+state.asof+'.svg',parliamentSVG(lastOutput.seats),'image/svg+xml;charset=utf-8');};\n$('#currentCSV').onclick=");
fs.writeFileSync(file,s);
console.log('Updated tracker with 3 new releases and comparison controls.');
