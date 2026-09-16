(function(root){
  const valid = games => Array.isArray(games) && games.length > 0 && games.length <= 5 && games.every(g => Array.isArray(g) && g.length === 6 && new Set(g).size === 6 && g.every(n => Number.isInteger(n) && n >= 1 && n <= 45));
  function parse(value) {
    if (!value || value.length > 100 || !/^\d{1,2}(?:,\d{1,2}){5}(?:;\d{1,2}(?:,\d{1,2}){5}){0,4}$/.test(value)) return null;
    const games=value.split(';').map(g=>g.split(',').map(Number));
    return valid(games)?games:null;
  }
  function generate(){const a=Array.from({length:45},(_,i)=>i+1);for(let i=44;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,6)}
  // Version 1: one URL-safe character per number; every six characters is a game.
  // Preserve extraction order rather than sorting the encoded numbers.
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrs';
  function encodeShare(games){
    if(!valid(games))throw new Error('Invalid games');
    return '1'+games.flat().map(n=>alphabet[n-1]).join('');
  }
  function decodeShare(code){
    if(typeof code!=='string'||!/^1(?:[A-Za-s]{6}){1,5}$/.test(code))return null;
    const games=[];
    for(let i=1;i<code.length;i+=6)games.push([...code.slice(i,i+6)].map(c=>alphabet.indexOf(c)+1));
    return valid(games)?games:null;
  }
  function readShare(search){
    const params=new URLSearchParams(search);
    const short=params.getAll('s'),legacy=params.getAll('numbers');
    if(short.length+legacy.length!==1)return null;
    return short.length?decodeShare(short[0]):parse(legacy[0]);
  }
  const api={valid,parse,generate,encodeShare,decodeShare,readShare,encode:games=>{if(!valid(games))throw new Error('Invalid games');return games.map(g=>g.join(',')).join(';')}};
  root.LottoCore=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
