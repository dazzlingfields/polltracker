// Shared validation for the published poll sheet and browser imports.
function canonicalHouse(house){
 const key=String(house||'').trim().toLowerCase();
 if(/roy\s*morgan/.test(key))return 'roy morgan';
 if(/verian|1\s*news/.test(key))return 'verian';
 if(/curia|taxpayers|tpu/.test(key))return 'curia';
 if(/reid/.test(key))return 'reid research';
 if(/talbot|anacta/.test(key))return 'anacta';
 if(/freshwater/.test(key))return 'freshwater';
 return key;
}
function validatePollSheet(data){
 const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
 if(!data||data.schema!==1||!validDate(data.asof)||!Array.isArray(data.polls)||!data.polls.length||data.polls.length>2000)throw Error('Choose a poll sheet with schema 1, an as-of date, and 1–2000 poll rows.');
 const seen=new Set();
 data.polls.forEach((r,i)=>{
 const label='Poll row '+(i+1)+': ';
 if(typeof r.house!=='string'||!r.house.trim())throw Error(label+'pollster is required.');
 if(!validDate(r.end))throw Error(label+'valid fieldwork end date is required.');
 if(r.published&&!validDate(r.published))throw Error(label+'release date is invalid.');
 if(r.published&&r.published<r.end)throw Error(label+'release date precedes fieldwork end.');
 if(!Array.isArray(r.v)||r.v.length!==7||r.v.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>100))throw Error(label+'enter seven party shares between 0 and 100.');
 if(r.v.reduce((a,b)=>a+b,0)>100.000001)throw Error(label+'party shares total more than 100%.');
 if(typeof r.enabled!=='boolean')throw Error(label+'enabled must be true or false.');
 if(r.n!=null&&(!Number.isInteger(r.n)||r.n<=0))throw Error(label+'sample size must be a positive whole number or null.');
 if(r.source&&!(typeof r.source==='string'&&/^https:\/\//.test(r.source)))throw Error(label+'source must start with https://.');
 const identity=canonicalHouse(r.house)+'|'+r.end;
 if(seen.has(identity))throw Error(label+'a poll from this house with the same fieldwork end is already present; edit that row.');
 seen.add(identity);
 });
 return data;
}
if(typeof module!=='undefined')module.exports={canonicalHouse,validatePollSheet};
