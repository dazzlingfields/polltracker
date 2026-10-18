const MAP_ROWS=[
 ['Northland'],['Whangārei','Kaipara ki Mahurangi'],
 ['Whangaparāoa','East Coast Bays','North Shore','Upper Harbour'],
 ['Northcote','Te Atatū','Auckland Central','Tāmaki'],
 ['Kelston','Mt Albert','Epsom','Pakuranga','Botany'],
 ['New Lynn','Mt Roskill','Maungakiekie','Panmure-Ōtāhuhu'],
 ['Māngere','Manurewa','Takanini','Papakura'],
 ['Port Waikato','Waikato','Coromandel'],
 ['Hamilton West','Hamilton East','Tauranga','Bay of Plenty'],
 ['Taranaki-King Country','Taupō','Rotorua','East Coast'],
 ['New Plymouth','Whanganui','Rangitīkei','Napier','Tukituki'],
 ['Ōtaki','Palmerston North','Wairarapa'],
 ['Mana','Ōhāriu','Hutt South','Remutaka'],
 ['Wellington Central','Rongotai'],
 ['West Coast-Tasman','Nelson','Kaikōura'],
 ['Waimakariri','Christchurch Central','Christchurch East'],
 ['Selwyn','Ilam','Wigram','Banks Peninsula'],
 ['Southland','Waitaki','Rangitata'],['Invercargill','Taieri','Dunedin']
];
let mapSelection='Auckland Central',mapProjection=[];
function renderElectorates(){
 if(!lastOutput)return;
 mapProjection=projectElectorates(ELECTORATES,lastOutput.v);
 const mode=$('#mapParty').value,roll=$('#mapRoll').value;
 const tiles=[];
 MAP_ROWS.forEach((names,row)=>names.forEach((name,col)=>tiles.push({name,x:335+Math.round(row<14?row*1.5:-(row-13)*47)+col*69-names.length*31,y:35+row*43})));
 ELECTORATES.filter(r=>r.roll==='Māori').forEach((r,i)=>tiles.push({name:r.name,x:630,y:110+i*68}));
 $('#electorateMap').innerHTML='<svg viewBox="0 0 780 875" class="chart" aria-label="Schematic New Zealand electorate cartogram"><text x="600" y="55" fill="#536977">Māori roll</text>'+tiles.map(t=>{
  const i=ELECTORATES.findIndex(r=>r.name===t.name),r=ELECTORATES[i],v=mapProjection[i];if(roll!=='all'&&r.roll!==roll)return '';
  const party=mode==='leader'?v.indexOf(Math.max(...v.slice(0,7))):+mode;
  const opacity=mode==='leader'?1:.18+.82*Math.min(1,v[party]/50);
  const words=t.name.replace('Christchurch','Chch').replace('Palmerston','Palm.').replace('Wellington','Wgtn').replace('Auckland','Akld').replace('Taranaki-King Country','Taranaki KC').split(/(?= )/);
  let lines=[''];words.forEach(w=>{if((lines.at(-1)+w).length>13)lines.push(w.trim());else lines[lines.length-1]+=w;});
  return `<g role="button" tabindex="0" data-electorate="${i}" aria-label="${esc(r.name)}, ${PARTIES[party]} ${v[party].toFixed(1)} percent"><title>${esc(r.name)} · ${PARTIES[party]} ${v[party].toFixed(1)}%</title><rect x="${t.x}" y="${t.y}" width="66" height="40" rx="5" fill="${COLORS[party]}" fill-opacity="${opacity}" stroke="${mapSelection===r.name?'#172b36':'white'}" stroke-width="${mapSelection===r.name?3:1}"/><text x="${t.x+33}" y="${t.y+12}" text-anchor="middle" fill="${mode==='leader'?'white':'#172b36'}" font-size="8.2" font-weight="650">${lines.slice(0,2).map((l,k)=>`<tspan x="${t.x+33}" dy="${k?9:0}">${esc(l.trim())}</tspan>`).join('')}<tspan x="${t.x+33}" dy="11">${v[party].toFixed(1)}%</tspan></text></g>`;
 }).join('')+'</svg>';
 $('#mapLegend').innerHTML=mode==='leader'?PARTIES.slice(0,7).map((p,i)=>`<span style="margin-right:12px"><i class="dot" style="background:${COLORS[i]}"></i>${p}</span>`).join(''):`${PARTIES[+mode]} share: pale = 0%, solid = 50% or more.`;
 const i=ELECTORATES.findIndex(r=>r.name===mapSelection),r=ELECTORATES[i],v=mapProjection[i];
 const ranked=PARTIES.map((p,j)=>({p,j})).sort((a,b)=>v[b.j]-v[a.j]||a.j-b.j);
 $('#electorateDetail').innerHTML=`<h3>${esc(r.name)}</h3><p class="small">${r.roll} roll · 2023 geography · ${r.votes.toLocaleString()} historical valid party votes</p>`+table(['Party','Estimate','2023','Change'],ranked.map(({p,j})=>[`<span class="dot" style="background:${COLORS[j]}"></span>${p}`,v[j].toFixed(1)+'%',r.v[j].toFixed(1)+'%',(v[j]-r.v[j]>0?'+':'')+(v[j]-r.v[j]).toFixed(1)+' pp']))+'<p class="small">Ranked by estimated support, highest first. Rounded estimates may not sum to exactly 100%. Local uncertainty is uncalibrated.</p>';
 $('#mapStatus').textContent=`${state.asof} polling scenario · Updates with poll imports, weights and vote swings · Historical turnout held fixed`;
}
$('#mapElectorate').innerHTML=ELECTORATES.map(r=>`<option>${esc(r.name)}</option>`).join('');
$('#mapElectorate').value=mapSelection;
$('#mapElectorate').onchange=e=>{mapSelection=e.target.value;renderElectorates();};
$('#mapParty').onchange=renderElectorates;$('#mapRoll').onchange=renderElectorates;
function selectMapTile(e){const tile=e.target.closest('[data-electorate]');if(!tile)return;mapSelection=ELECTORATES[+tile.dataset.electorate].name;$('#mapElectorate').value=mapSelection;renderElectorates();}
$('#electorateMap').onclick=selectMapTile;
$('#electorateMap').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectMapTile(e);}};
