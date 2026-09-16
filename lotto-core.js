(function(root){
  const valid = games => Array.isArray(games) && games.length > 0 && games.length <= 5 && games.every(g => Array.isArray(g) && g.length === 6 && new Set(g).size === 6 && g.every(n => Number.isInteger(n) && n >= 1 && n <= 45));
  function parse(value) {
    if (!value || value.length > 100 || !/^\d{1,2}(?:,\d{1,2}){5}(?:;\d{1,2}(?:,\d{1,2}){5}){0,4}$/.test(value)) return null;
    const games=value.split(';').map(g=>g.split(',').map(Number));
    return valid(games)?games:null;
  }
  function generate(){const a=Array.from({length:45},(_,i)=>i+1);for(let i=44;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,6)}
  const api={valid,parse,generate,encode:games=>{if(!valid(games))throw new Error('Invalid games');return games.map(g=>g.join(',')).join(';')}};
  root.LottoCore=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
