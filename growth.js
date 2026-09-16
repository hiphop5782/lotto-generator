(() => {
  const $=id=>document.getElementById(id);
  let games=[],createdAt=new Date(),busy=false;
  const format=g=>[...g].sort((a,b)=>a-b).map(n=>String(n).padStart(2,'0'));
  const status=text=>{$('growthStatus').textContent=text};
  function render(source){
    $('ticketSection').hidden=false;
    $('ticket').innerHTML=`<div class="ticket-brand">LOTTO <small>SPHERE / 6·45</small></div><div class="ticket-badge">번호 보관용 · 미구매</div><div class="ticket-meta">${source==='shared'?'공유 번호 열람':'번호 생성'} ${createdAt.toLocaleString('ko-KR')}<br>무작위 번호 ${games.length}게임</div><div class="ticket-games">${games.map((g,i)=>`<div class="ticket-game"><b>${String.fromCharCode(65+i)}</b><small>자동</small><div class="ticket-numbers">${format(g).map(n=>`<span>${n}</span>`).join('')}</div></div>`).join('')}</div><div class="ticket-note">실제 복권 및 구매 영수증이 아닙니다.<br>당첨을 보장하지 않는 무작위 번호입니다.<br>lotto.sysout.co.kr · LOTTO SPHERE</div>`;
    $('sharedPanel').hidden=false;
    $('replayDraw').disabled=busy;
    $('sharedPanel').querySelector('strong').textContent=source==='shared'?'공유받은 번호가 도착했어요.':'이 번호로 3D 추첨을 다시 보세요.';
    $('sharedMessage').textContent='번호와 추첨 순서를 재현합니다. 공의 움직임은 매번 달라질 수 있어요.';
    $('replayGame').innerHTML=games.map((g,i)=>`<option value="${i}">${String.fromCharCode(65+i)} · ${format(g).join(' ')}</option>`).join('');
    status('');$('shareFallback').hidden=true;
  }
  function quick(count){
    if(busy)return;
    window.trackLotto?.('draw_start',{mode:'quick',game_count:count});
    games=Array.from({length:count},()=>LottoCore.generate());createdAt=new Date();
    window.recordQuickGames(games);render('new');
    $('numberRow').innerHTML=games[0].map(n=>`<span class="number ${n<=10?'yellow':n<=20?'blue':n<=30?'red':n<=40?'gray':'green'}">${n}</span>`).join('');
    $('drawState').textContent=`${count}게임 생성 완료 · A게임 표시`;
    if(window.placeLottoBall){window.setLottoSpinning(true);games[0].forEach((n,i)=>window.placeLottoBall(n,i));window.setLottoSpinning(false);window.setResultStageLowered?.(true)}
    window.trackLotto?.('draw_complete',{mode:'quick',game_count:count});
    $('ticketSection').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function url(){const u=new URL(location.pathname,location.origin);u.searchParams.set('numbers',LottoCore.encode(games));u.searchParams.set('utm_source','lotto_share');u.searchParams.set('utm_medium','referral');return u.href}
  function text(){return games.map((g,i)=>`${String.fromCharCode(65+i)} ${format(g).join(' ')}`).join('\n')}
  async function copy(value,event){
    try{await navigator.clipboard.writeText(value);status('복사했어요.');window.trackLotto?.(event,{game_count:games.length})}
    catch{$('shareFallback').hidden=false;$('shareFallback').value=value;$('shareFallback').focus();$('shareFallback').select();status('자동 복사를 사용할 수 없어요. 선택된 내용을 직접 복사해주세요.')}
  }
  $('quickDraw').addEventListener('click',()=>quick(1));$('fiveDraw').addEventListener('click',()=>quick(5));
  $('replayDraw').addEventListener('click',()=>{if(busy||!games.length)return;window.trackLotto?.('replay_start',{game_count:games.length});window.replayLotto(games[Number($('replayGame').value)]);$('draw').scrollIntoView({behavior:'smooth'})});
  window.addEventListener('lotto:busy',e=>{busy=e.detail;['quickDraw','fiveDraw','replayDraw','replayGame','shareTicket','copyLink','copyNumbers','saveTicket'].forEach(id=>$(id).disabled=busy)});
  window.addEventListener('lotto:result',e=>{if(e.detail.replay)return;games=[e.detail.nums];createdAt=new Date();render('new')});
  $('copyLink').addEventListener('click',()=>copy(url(),'share_link_copy'));
  $('copyNumbers').addEventListener('click',()=>copy(text(),'numbers_copy'));
  $('shareTicket').addEventListener('click',async()=>{
    window.trackLotto?.('share_click',{game_count:games.length});
    if(navigator.share){try{await navigator.share({title:'로또스피어 · 나의 행운 번호',text:'같은 번호로 3D 추첨을 재현해보세요.',url:url()});window.trackLotto?.('share_complete',{method:'native',game_count:games.length});status('공유 요청을 전달했어요.');return}catch(e){if(e.name==='AbortError')return}}
    await copy(url(),'share_link_copy');
  });
  $('saveTicket').addEventListener('click',async()=>{
    try{
      await document.fonts.ready;
      const c=document.createElement('canvas');c.width=860;c.height=520+games.length*90;const x=c.getContext('2d');
      x.fillStyle='#fcf9ee';x.fillRect(0,0,c.width,c.height);x.fillStyle='#252725';x.font='bold 48px monospace';x.fillText('LOTTO SPHERE / 6·45',50,80);
      x.strokeStyle='#ae392f';x.lineWidth=3;x.strokeRect(50,110,390,55);x.fillStyle='#ae392f';x.font='bold 27px sans-serif';x.fillText('번호 보관용 · 미구매',70,148);
      x.fillStyle='#555';x.font='23px sans-serif';x.fillText(createdAt.toLocaleString('ko-KR'),50,215);
      const line=y=>{x.beginPath();x.setLineDash([10,8]);x.moveTo(50,y);x.lineTo(810,y);x.strokeStyle='#aaa';x.stroke();x.setLineDash([])};line(250);
      games.forEach((g,i)=>{const y=310+i*90;x.fillStyle='#252725';x.font='bold 34px monospace';x.fillText(String.fromCharCode(65+i),50,y);x.font='22px sans-serif';x.fillText('자동',100,y);x.font='bold 36px monospace';format(g).forEach((n,j)=>x.fillText(n,210+j*98,y))});
      const bottom=285+games.length*90;line(bottom);x.fillStyle='#555';x.font='24px sans-serif';x.fillText('실제 복권 및 구매 영수증이 아닙니다.',50,bottom+55);x.fillText('당첨을 보장하지 않는 무작위 번호입니다.',50,bottom+98);x.font='22px monospace';x.fillText('lotto.sysout.co.kr',50,bottom+160);
      c.toBlob(blob=>{if(!blob){status('이미지를 생성하지 못했어요. 다시 시도해주세요.');return}const link=document.createElement('a'),objectUrl=URL.createObjectURL(blob);link.href=objectUrl;link.download='lotto-sphere-numbers.png';link.click();setTimeout(()=>URL.revokeObjectURL(objectUrl),10000);window.trackLotto?.('ticket_download',{game_count:games.length});status('번호 이미지를 저장했어요.')},'image/png');
    }catch{status('이미지 저장에 실패했어요. 번호 복사를 이용해주세요.')}
  });
  const params=new URLSearchParams(location.search);
  if(params.has('numbers')){
    const parsed=params.getAll('numbers').length===1?LottoCore.parse(params.get('numbers')):null;
    if(parsed){games=parsed;render('shared');window.trackLotto?.('shared_visit',{game_count:games.length})}
    else{$('sharedPanel').hidden=false;$('sharedPanel').querySelector('strong').textContent='공유 링크의 번호가 올바르지 않아요.';$('sharedMessage').textContent='게임당 1~45의 서로 다른 번호 6개, 최대 5게임만 지원합니다. 새 번호를 추첨해주세요.';$('replayDraw').disabled=true;window.trackLotto?.('shared_link_invalid')}
  }
})();
