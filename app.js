const drawBtn=document.getElementById('drawBtn'),resetBtn=document.getElementById('resetBtn'),numberRow=document.getElementById('numberRow'),drawState=document.getElementById('drawState'),historyGrid=document.getElementById('historyGrid'),soundBtn=document.getElementById('soundBtn');
let soundOn=true,drawing=false,selected=[],skipRequested=false,skipWaitResolve=null;
function uniqueNumbers(){const a=Array.from({length:45},(_,i)=>i+1);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,6)}
function colorClass(n){return n<=10?'yellow':n<=20?'blue':n<=30?'red':n<=40?'gray':'green'}
function beep(freq=520,duration=.07){if(!soundOn)return;try{const ac=beep.ac||(beep.ac=new AudioContext()),o=ac.createOscillator(),g=ac.createGain();o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.04,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+duration);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+duration)}catch(e){}}
async function draw(forcedNumbers=null, options={}){
  if(drawing){finishCurrentDraw();return}
  if(!window.extractLottoBall){drawState.textContent='3D를 불러오지 못했어요. 빠른 추첨을 이용해주세요.';return}drawing=true;skipRequested=false;setDrawControls(true);window.setResultStageLowered?.(false);selected=Array.isArray(forcedNumbers)&&LottoCore.valid([forcedNumbers])?[...forcedNumbers]:uniqueNumbers();window.dispatchEvent(new CustomEvent('lotto:busy',{detail:true}));window.trackLotto?.('draw_start',{mode:options.replay?'replay':'3d',game_count:1});drawState.textContent='공을 강하게 혼합하고 있어요…';numberRow.innerHTML=Array(6).fill('<span class="number empty">?</span>').join('');window.setLottoSpinning(true);beep(180,.2);await waitOrSkip(1900);
  for(let i=0;i<selected.length;i++){const n=selected[i];drawState.textContent=skipRequested?'결과를 바로 표시하고 있어요…':`${i+1}번째 공 배출 중…`;if(skipRequested)window.placeLottoBall?.(n,i);else await window.extractLottoBall(n,i);numberRow.children[i].outerHTML=`<span class="number landed ${colorClass(n)}">${n}</span>`;if(!skipRequested){beep(390+n*9,.1);await waitOrSkip(240)}}
  window.setLottoSpinning(false);window.setResultStageLowered?.(true);drawing=false;skipRequested=false;skipWaitResolve=null;setDrawControls(false);drawState.textContent='6개의 행운 공 추첨 완료';if(!options.replay)saveHistory(selected);renderHistory();window.dispatchEvent(new CustomEvent('lotto:busy',{detail:false}));window.dispatchEvent(new CustomEvent('lotto:result',{detail:{nums:[...selected],replay:!!options.replay}}));window.trackLotto?.('draw_complete',{mode:options.replay?'replay':'3d',game_count:1});
}
function finishCurrentDraw(){
  if(!drawing||skipRequested)return false;
  skipRequested=true;
  skipDraw.disabled=true;
  skipDraw.textContent='결과 표시 중…';
  skipWaitResolve?.();
  window.skipCurrentExtraction?.();
  drawState.textContent='결과를 바로 표시하고 있어요…';
  return true;
}
window.finishLottoDraw=finishCurrentDraw;
function waitOrSkip(ms){if(skipRequested)return Promise.resolve();return new Promise(resolve=>{const timer=setTimeout(()=>{skipWaitResolve=null;resolve()},ms);skipWaitResolve=()=>{clearTimeout(timer);skipWaitResolve=null;resolve()}})}
function readHistory(){try{const list=JSON.parse(localStorage.getItem('lucky-orbit-history')||'[]');return Array.isArray(list)?list.filter(x=>x&&LottoCore.valid([x.nums])&&Number.isFinite(Date.parse(x.date))).slice(0,6):[]}catch{return []}}
function saveHistory(nums){const list=readHistory();list.unshift({nums,date:new Date().toISOString()});try{localStorage.setItem('lucky-orbit-history',JSON.stringify(list.slice(0,6)))}catch{}}
function renderHistory(){const list=readHistory();if(!list.length){historyGrid.innerHTML='<div class="empty-history"><span>✦</span><p>아직 추첨 기록이 없어요.<br>첫 번째 행운을 만들어 보세요.</p></div>';return}historyGrid.innerHTML=list.map((x,i)=>`<article class="history-card"><div class="history-card-head"><span>정렬된 번호</span><time>${new Date(x.date).toLocaleString('ko-KR',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</time></div><div class="mini-numbers">${[...x.nums].sort((a,b)=>a-b).map(n=>`<i class="${colorClass(n)}">${n}</i>`).join('')}</div></article>`).join('')}
drawBtn.addEventListener('click',()=>{draw();document.querySelector('.machine-wrap').scrollIntoView({behavior:'smooth',block:'start'})});resetBtn.addEventListener('click',()=>{if(drawing)return;selected=[];numberRow.innerHTML=Array(6).fill('<span class="number empty">?</span>').join('');drawState.textContent='추첨 준비 완료'});soundBtn.addEventListener('click',()=>{soundOn=!soundOn;soundBtn.setAttribute('aria-pressed',soundOn);soundBtn.querySelector('.sound-label').textContent=soundOn?'SOUND ON':'SOUND OFF';soundBtn.querySelector('.sound-icon').textContent=soundOn?'◖))':'◖×'});document.getElementById('clearHistory').addEventListener('click',()=>{try{localStorage.removeItem('lucky-orbit-history')}catch{}renderHistory()});function keepResultsInFront(){window.__lottoBalls?.forEach(ball=>{if(ball.userData.collected){ball.material.transparent=true;ball.material.opacity=1;ball.material.depthTest=false;ball.material.depthWrite=false;ball.renderOrder=1000;ball.children.forEach(label=>{label.material.depthTest=false;label.material.depthWrite=false;label.renderOrder=1001})}});requestAnimationFrame(keepResultsInFront)}keepResultsInFront();renderHistory();

window.replayLotto=nums=>draw(nums,{replay:true});
window.recordQuickGames=games=>{games.forEach(saveHistory);renderHistory()};

const skipDraw=document.getElementById('skipDraw');
function setDrawControls(active){
  drawBtn.hidden=active;
  skipDraw.hidden=!active;
  skipDraw.disabled=false;
  skipDraw.textContent='재생 스킵 · 결과 보기';
  resetBtn.disabled=active;
}
skipDraw.addEventListener('click',()=>{
  if(finishCurrentDraw())window.trackLotto?.('draw_skip');
});
// Keep the same controls in a reserved slot so docking never shifts the page.
const controlsSlot=document.getElementById('drawControlsSlot');
const drawControls=document.querySelector('.machine-actions');
function updateDrawControls(){
  controlsSlot.style.minHeight=drawControls.offsetHeight+'px';
  drawControls.classList.toggle('is-docked',controlsSlot.getBoundingClientRect().top<0);
}
let controlsFrame=0;
function scheduleControlsUpdate(){
  if(controlsFrame)return;
  controlsFrame=requestAnimationFrame(()=>{controlsFrame=0;updateDrawControls()});
}
window.addEventListener('scroll',scheduleControlsUpdate,{passive:true});
window.addEventListener('resize',scheduleControlsUpdate);
new ResizeObserver(scheduleControlsUpdate).observe(drawControls);
updateDrawControls();
