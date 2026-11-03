var lastOdds=null;
function invalidateOdds(){lastOdds=null;$('#oddsStatus').textContent='Inputs changed. Run odds to refresh.';$('#oddsResults').innerHTML='';$('#oddsSensitivity').innerHTML='';}
async function runOdds(){
 const button=$('#runOdds');button.disabled=true;
 try{
 $('#oddsStatus').textContent='Simulating polling errors, electorate results and overhang…';await new Promise(r=>setTimeout(r,20));
 const base=shifted(selectPolls(state.rows,state.asof,state.windowDays,state.royWeight).v,state.swings.map((x,i)=>x+state.bias*correction(BIAS)[i]));
 const o={floors:[...state.floors],independent:state.independent,tpmNoList:$('#oddsNoList').checked};
 for(const key of ['natMin','natMode','natMax','tpmMin','tpmMode','tpmMax','link','errorScale'])o[key]=+$('#odds_'+key).value;
 const labels=['NAT + ACT + NZF majority','LAB + GRN + TPM majority','LAB group needs Opportunity for majority','Neither displayed combination reaches majority'];
 const pct=x=>(100*x).toFixed(1)+'%';
 const r=electorateOdds(base,o);lastOdds=r;
 $('#oddsResults').innerHTML=table(['Conditional seat outcome','Simulation share'],labels.map((l,i)=>[l,pct(r.probabilities[i])]))+table(['Quantity','Estimate'],[['National creates overhang',pct(r.nationalOverhang)],['TPM creates overhang',pct(r.tpmOverhang)],['TPM gets any list MPs (zero imposed if selected)',pct(r.tpmAnyList)],['Opportunity clears 5%',pct(r.opportunity5)],['Parliament size: median (80% range)',r.house.median+' ('+r.house.lo+'–'+r.house.hi+')'],['Majority needed: median (80% range)',r.majority.median+' ('+r.majority.lo+'–'+r.majority.hi+')'],['Average unfilled TPM entitlement',r.meanUnfilled.toFixed(2)]]);
 const tests=[['Selected assumptions',{}],['No National overhang: zero NAT floor',{natMin:0,natMode:0,natMax:0,link:0}],['National fixed at 34 electorates',{natMin:34,natMode:34,natMax:34,link:0}],['National fixed at 40 electorates',{natMin:40,natMode:40,natMax:40,link:0}],['TPM fixed at 4 electorates',{tpmMin:4,tpmMode:4,tpmMax:4}],['Allow unlimited TPM list MPs (counterfactual)',{tpmNoList:false}],['Larger polling errors (1.5×)',{errorScale:o.errorScale*1.5}]];
 const rows=[];for(const [name,change] of tests){const x=name==='Selected assumptions'?r:electorateOdds(base,{...o,...change});rows.push([name,...x.probabilities.map(pct)]);await new Promise(q=>setTimeout(q,0));}
 $('#oddsSensitivity').innerHTML=table(['Assumption',...labels],rows);
 $('#oddsStatus').textContent='10,000 fixed-seed draws per row. Illustrative conditional probabilities, not calibrated election odds. Sampling noise is about ±1 percentage point at worst; modelling uncertainty is much larger. Updated with the current published/saved polling inputs and manual swings.';
 }catch(e){lastOdds=null;$('#oddsResults').innerHTML='';$('#oddsSensitivity').innerHTML='';$('#oddsStatus').textContent=e.message;}finally{button.disabled=false;}
}
$('#runOdds').onclick=runOdds;
document.addEventListener('change',e=>{if(e.target.id.startsWith('odds'))invalidateOdds();});
window.NZPollOdds={run:runOdds,getResult:()=>lastOdds};
runOdds();
