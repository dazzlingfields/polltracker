const assert=require('assert/strict'),fs=require('fs'),vm=require('vm');
const {projectElectorates}=require('./electorate-model.cjs');
const data=require('./electorates.json').electorates;
assert.equal(data.length,72);assert.equal(data.filter(r=>r.roll==='Māori').length,7);
assert.equal(data.reduce((s,r)=>s+r.votes,0),2851211);
data.forEach(r=>assert.ok(Math.abs(r.v.reduce((a,b)=>a+b,0)-100)<1e-8));
const total=data.reduce((s,r)=>s+r.votes,0);
const average=rows=>Array.from({length:8},(_,j)=>rows.reduce((s,v,i)=>s+v[j]*data[i].votes,0)/total);
const historical=average(data.map(r=>r.v));
projectElectorates(data,historical).forEach((v,i)=>v.forEach((x,j)=>assert.ok(Math.abs(x-data[i].v[j])<1e-7)));
for(const target of [[28,28,15,10,10,1,6,2],[50,30,10,0,5,0,0,5],[0,0,0,0,0,0,100,0]]){
 const result=projectElectorates(data,target);
 result.forEach(v=>{assert.ok(Math.abs(v.reduce((a,b)=>a+b,0)-100)<1e-7);v.forEach(x=>assert.ok(x>=0&&x<=100+1e-10));});
 average(result).forEach((x,j)=>assert.ok(Math.abs(x-target[j])<1e-7));
}
const ui=fs.readFileSync('electorate-ui.js','utf8'),ctx={};vm.createContext(ctx);
vm.runInContext(ui.split('let mapSelection')[0]+';this.rows=MAP_ROWS;',ctx);
assert.equal(ctx.rows.flat().length,65);assert.equal(new Set(ctx.rows.flat()).size,65);
assert.deepEqual([...ctx.rows.flat()].sort(),data.filter(r=>r.roll==='General').map(r=>r.name).sort());
console.log('Electorate checks passed: 72 seats, official vote total, historical recovery, national calibration, zero shares and tile coverage.');
const nodes={};const $=s=>nodes[s]??=( {value:s==='#mapParty'?'leader':s==='#mapRoll'?'all':'',innerHTML:'',textContent:''} );
const context={$,lastOutput:{v:[28,28,15,10,10,1,6,2]},state:{asof:'2026-10-19'},PARTIES:['National','Labour','Green','ACT','NZ First','Te Pāti Māori','Opportunity','Other'],COLORS:Array(8).fill('#123456'),esc:s=>String(s),table:(h,r)=>JSON.stringify(r)};
vm.createContext(context);
vm.runInContext('const ELECTORATES='+JSON.stringify(data)+';'+fs.readFileSync('electorate-model.cjs','utf8').split("if(typeof module")[0]+ui+';renderElectorates();',context);
assert.equal((nodes['#electorateMap'].innerHTML.match(/data-electorate=/g)||[]).length,72);
nodes['#mapRoll'].value='Māori';nodes['#mapParty'].value='5';nodes['#mapElectorate'].value='Waiariki';nodes['#mapElectorate'].onchange({target:nodes['#mapElectorate']});
assert.equal((nodes['#electorateMap'].innerHTML.match(/data-electorate=/g)||[]).length,7);
assert.ok(nodes['#electorateDetail'].innerHTML.includes('Waiariki'));
console.log('Embedded map rendering and electorate/party/roll controls passed.');
