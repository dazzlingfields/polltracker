// Conditional simulation. Electorate distributions are assumptions, not fitted forecasts.
function electorateOdds(base, options={}){
 const o={draws:10000,seed:20261103,natMin:32,natMode:38,natMax:44,tpmMin:1,tpmMode:4,tpmMax:6,tpmNoList:true,link:1,errorScale:1,floors:[0,0,0,1,0,0,0],independent:0,...options};
 for(const prefix of ['nat','tpm']){const [a,b,c]=['Min','Mode','Max'].map(k=>o[prefix+k]);if(![a,b,c].every(Number.isFinite)||a<0||a>b||b>c||c>(prefix==='nat'?65:7))throw Error('Invalid '+prefix+' electorate range.');}
 if(!Number.isInteger(o.draws)||o.draws<1||o.draws>50000||!Number.isFinite(o.errorScale)||o.errorScale<0||!Number.isFinite(o.link)||o.link<0||o.link>2)throw Error('Invalid simulation settings.');
 let seed=o.seed>>>0;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return (seed+.5)/4294967296;};
 const normal=()=>Math.sqrt(-2*Math.log(random()))*Math.cos(2*Math.PI*random());
 const tri=(a,b,c)=>{const u=random();return a===c?a:u<(b-a)/(c-a)?a+Math.sqrt(u*(c-a)*(b-a)):c-Math.sqrt((1-u)*(c-a)*(c-b));};
 const bias=BASELINES[0].error.map((_,p)=>mean(BASELINES.map(r=>r.error[p])));
 const count=[0,0,0,0],floorSamples=[],houses=[],nats=[],tpms=[];let natOH=0,tpmOH=0,tpmList=0,opp5=0,vacancies=0;
 for(let d=0;d<o.draws;d++){
  const historical=BASELINES[Math.floor(random()*BASELINES.length)].error;
  const jitter=[.8,.8,.6,.5,.6,.35,1.25,.5];
  const errors=base.map((_,p)=>o.errorScale*((p<6?historical[p]-bias[p]:0)+normal()*jitter[p]));
  const v=shifted(base,errors);
  const nat=Math.max(0,Math.min(65,Math.round(tri(o.natMin,o.natMode,o.natMax)+o.link*(v[0]-base[0]))));
  const tpm=Math.round(tri(o.tpmMin,o.tpmMode,o.tpmMax));
  const floors=[...o.floors];floors[0]=nat;floors[5]=tpm;
  const s=seats(v,floors,o.independent);
  // Recover proportional entitlement with the same electorate exemptions, without overhang.
  const entitlement=s.entitlement;
  if(nat>entitlement[0])natOH++;
  if(tpm>entitlement[5])tpmOH++;
  const list=o.tpmNoList?0:Math.max(0,s.parties[5]-tpm);
  const vacant=Math.max(0,s.parties[5]-tpm-list);
  s.left-=vacant;s.total-=vacant;s.parties[5]-=vacant;s.majority=Math.floor(s.total/2)+1;
  if(list>0)tpmList++;vacancies+=vacant;
  const category=s.right>=s.majority?0:s.left>=s.majority?1:s.left+s.opp>=s.majority?2:3;
  count[category]++;if(v[6]>=5)opp5++;
  houses.push(s.total);floorSamples.push(s.majority);nats.push(nat);tpms.push(tpm);
 }
 const summary=a=>{a.sort((a,b)=>a-b);return {median:a[Math.floor(a.length*.5)],lo:a[Math.floor(a.length*.1)],hi:a[Math.min(a.length-1,Math.floor(a.length*.9))]};};
 return {count,probabilities:count.map(x=>x/o.draws),nationalOverhang:natOH/o.draws,tpmOverhang:tpmOH/o.draws,tpmAnyList:tpmList/o.draws,opportunity5:opp5/o.draws,meanUnfilled:vacancies/o.draws,house:summary(houses),majority:summary(floorSamples),nationalElectorates:summary(nats),tpmElectorates:summary(tpms),options:o};
}
