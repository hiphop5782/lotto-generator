const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const core=require('../lotto-core.js');
test('compact codes preserve game count, boundaries and extraction order',()=>{
  for(let count=1;count<=5;count++)for(let trial=0;trial<100;trial++){
    const games=Array.from({length:count},()=>core.generate());
    const code=core.encodeShare(games);
    assert.equal(code.length,1+6*count);
    assert.deepEqual(core.readShare('?s='+code),games);
  }
  assert.equal(core.encodeShare([[1,2,3,4,5,45]]),'1ABCDEs');
  assert.deepEqual(core.decodeShare('1ABCDEs'),[[1,2,3,4,5,45]]);
});
test('invalid compact versions, lengths, values and ambiguous links are rejected',()=>{
  for(const code of [null,'','2ABCDEF','1ABCDE','1ABCDEFG','1AAAAAA','1ABCDEt','1ABCDE/','1'+ 'ABCDEF'.repeat(6)])assert.equal(core.decodeShare(code),null);
  for(const search of ['?s=1ABCDEF&s=1GHIJKL','?s=1ABCDEF&numbers=1,2,3,4,5,6','?s=&numbers=1,2,3,4,5,6','?numbers=1,2,3,4,5,6&numbers=1,2,3,4,5,6'])assert.equal(core.readShare(search),null);
  assert.deepEqual(core.readShare('?numbers=45,1,2,3,4,5'),[[45,1,2,3,4,5]]);
});
test('share links preserve five games and extraction order',()=>{
  const games=[[45,3,20,1,7,11],[2,4,6,8,10,12],[44,43,42,41,40,39],[1,2,3,4,5,6],[9,8,7,6,5,4]];
  const u=new URL('https://lotto.sysout.co.kr/');u.searchParams.set('numbers',core.encode(games));
  assert.deepEqual(core.parse(new URL(u).searchParams.get('numbers')),games);
});
test('malformed or out-of-range shared numbers are rejected',()=>{
  for(const value of ['',null,'1,2,3,4,5','1,2,3,4,5,5','0,2,3,4,5,6','46,2,3,4,5,6','1.5,2,3,4,5,6','-1,2,3,4,5,6','1,2,3,4,5,6;<script>','1,2,3,4,5,6;'.repeat(6)])assert.equal(core.parse(value),null);
});
test('generated games contain six unique integers in range',()=>{
  for(let i=0;i<1000;i++)assert.ok(core.valid([core.generate()]));
});
test('analytics queues events without loading a provider before configuration',()=>{
  const context={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../analytics.js'),'utf8'),context);
  context.window.trackLotto('draw_complete',{mode:'quick',game_count:5});
  assert.equal(context.window.dataLayer[0][1],'draw_complete');
  assert.equal(context.window.dataLayer[0][2].game_count,5);
});
test('configured analytics retains attribution and omits shared number parameters',()=>{
  let script;const context={window:{},URL,location:{href:'https://lotto.sysout.co.kr/?numbers=1,2,3,4,5,6&utm_source=lotto_share#draw'},document:{createElement:()=>({}),head:{append:s=>script=s}}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../analytics.js'),'utf8').replace("const GA_MEASUREMENT_ID = '';","const GA_MEASUREMENT_ID = 'G-TEST123';"),context);
  const config=context.window.dataLayer[1];assert.equal(config[0],'config');assert.equal(config[2].page_location,'https://lotto.sysout.co.kr/?utm_source=lotto_share');assert.match(script.src,/G-TEST123$/);
});
test('compact share attribution is added only to analytics URL',()=>{
  const href='https://lotto.sysout.co.kr/?s=1ABCDEs';
  const context={window:{},URL,location:{href},document:{createElement:()=>({}),head:{append:()=>{}}}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../analytics.js'),'utf8').replace("const GA_MEASUREMENT_ID = '';","const GA_MEASUREMENT_ID = 'G-TEST123';"),context);
  assert.equal(context.location.href,href);
  assert.equal(context.window.dataLayer[1][2].page_location,'https://lotto.sysout.co.kr/?utm_source=lotto_share&utm_medium=referral');
});
