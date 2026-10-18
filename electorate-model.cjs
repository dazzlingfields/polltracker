// Rake historical geographic odds to national party targets, with fixed turnout weights.
function projectElectorates(data,target,retention=1){
 if(target.length!==8||target.some(x=>!Number.isFinite(x)||x<0)||Math.abs(target.reduce((a,b)=>a+b,0)-100)>1e-6)throw Error('Invalid national target');
 const total=data.reduce((s,r)=>s+r.votes,0),national=target.map((_,j)=>data.reduce((s,r)=>s+r.votes*r.v[j],0)/total);
 let rows=data.map(r=>r.v.map((v,j)=>Math.pow(Math.max(v,1e-8)/national[j],retention)*target[j]));
 for(let iteration=0;iteration<1000;iteration++){
  rows=rows.map(v=>{const s=v.reduce((a,b)=>a+b,0);return v.map(x=>100*x/s);});
  const means=target.map((_,j)=>rows.reduce((s,v,i)=>s+data[i].votes*v[j],0)/total);
  if(Math.max(...means.map((x,j)=>Math.abs(x-target[j])))<1e-9)return rows;
  rows=rows.map(v=>v.map((x,j)=>target[j]===0?0:x*target[j]/means[j]));
 }
 throw Error('Electorate calibration did not converge');
}
if(typeof module!=='undefined')module.exports={projectElectorates};
