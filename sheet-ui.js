$('#newShares').innerHTML=PARTIES.slice(0,7).map((party,i)=>'<label>'+esc(party)+' %<input id="newVote'+i+'" type="number" min="0" max="100" step="0.1" required></label>').join('');
$('#graphicControls').innerHTML=PARTIES.slice(0,7).map((party,i)=>'<label>'+esc(party)+' swing (pp)<input aria-label="'+esc(party)+' projection swing" type="range" min="-5" max="5" step="0.1" data-swing="'+i+'" value="'+state.swings[i]+'"><input aria-label="'+esc(party)+' projection swing value" type="number" min="-100" max="100" step="0.1" data-swing="'+i+'" value="'+state.swings[i]+'"></label>').join('');
document.addEventListener('input',e=>{if(e.target.type==='range'&&e.target.dataset.swing!==undefined){state.swings[+e.target.dataset.swing]=+e.target.value;update();}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.tpm){state.floors[5]=+b.dataset.tpm;renderInputs();update();}});
$('#graphicReset').onclick=()=>{state.swings=Array(8).fill(0);renderInputs();update();};
function sheetData(){return {schema:1,asof:state.asof,polls:JSON.parse(JSON.stringify(state.rows))};}
function sheetError(err){$('#sheetMessage').textContent=err.message;$('#sheetMessage').className='error';}
function sheetSuccess(message){$('#sheetMessage').textContent=message;$('#sheetMessage').className='notice info';}
$('#quickPoll').onsubmit=e=>{
 e.preventDefault();
 try{
 const row={house:$('#newHouse').value,name:$('#newHouse').value,end:$('#newEnd').value,published:$('#newReleased').value,n:$('#newSample').value?+$('#newSample').value:null,v:Array.from({length:7},(_,i)=>+$('#newVote'+i).value),enabled:true,source:$('#newSource').value,note:$('#newNote').value};
 const next={schema:1,asof:row.published>state.asof?row.published:state.asof,polls:[row,...state.rows]};
 validatePollSheet(next);selectPolls(next.polls,next.asof,state.windowDays,state.royWeight);
 state.rows=next.polls;state.asof=next.asof;renderInputs();update();
 $('#quickPoll').reset();$('#quickPoll').classList.add('hidden');sheetSuccess('Poll added. Your seat projection has updated. Download the sheet to keep a backup or update the shared site.');
 }catch(err){sheetError(err);}
};
$('#downloadSheet').onclick=()=>{try{const data=validatePollSheet(sheetData());download('polls.json',JSON.stringify(data,null,2),'application/json');sheetSuccess('Sheet downloaded. Replace polls.json on GitHub to update the shared site.');}catch(err){sheetError(err);}};
$('#loadSheet').onclick=()=>$('#sheetFile').click();
$('#sheetFile').onchange=async e=>{
 try{
 const file=e.target.files[0];if(!file)return;if(file.size>2000000)throw Error('Poll sheet must be smaller than 2 MB.');
 const data=validatePollSheet(JSON.parse(await file.text()));
 if(!confirm('Merge this poll sheet? Matching house/date rows will be replaced. Download a backup first to keep your previous inputs.'))return;
 const rows=[...state.rows];data.polls.forEach(row=>{const i=rows.findIndex(x=>canonicalHouse(x.house)===canonicalHouse(row.house)&&x.end===row.end);if(i>=0)rows[i]=row;else rows.push(row);});
 const next=validatePollSheet({schema:1,asof:data.asof,polls:rows});selectPolls(next.polls,next.asof,state.windowDays,state.royWeight);
 state.rows=next.polls;state.asof=next.asof;renderInputs();update();sheetSuccess('Sheet imported. Projection updated.');
 }catch(err){sheetError(err);}finally{e.target.value='';}
};
$('#loadPublished').onclick=()=>{if(confirm('Replace your poll sheet with the published data? Download a backup first to keep local edits.')){state.rows=JSON.parse(JSON.stringify(CURRENT));state.asof=PUBLISHED_ASOF;renderInputs();update();sheetSuccess('Using the latest published poll sheet. Your weighting and scenario settings were preserved.');}};
