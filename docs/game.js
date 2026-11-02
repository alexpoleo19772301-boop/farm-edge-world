
/* Слияние на острове — Merge Island v2.0.0 */
'use strict';
const SAVE_KEY='merge_island_v1';
const APP_VERSION={version: '2.0.0',versionCode: 20000,webVersion: '2.0.0'};
const DEFAULT_MANIFEST_URL=localStorage.getItem('farm_manifest_url')||'https://github.com/alexpoleo19772301-boop/farm-edge-world/releases/latest/download/version.json';
const COLS=7, ROWS=9;
const ENERGY_MAX=100, ENERGY_REGEN_MS=28000; // +1 energy
const GEN_COST=5;

const CHAINS={
  wood:{name:'Дерево', max:9, names:['Веточка','Палка','Доска','Бревно','Брус','Ящик','Сундук','Тотем','Домик']},
  stone:{name:'Камень', max:9, names:['Камешек','Камень','Кирпич','Плита','Колонна','Статуя','Фонтан','Жеода','Арка']},
  flower:{name:'Цветы', max:9, names:['Семена','Росток','Бутон','Ромашка','Букет','Венок','Корзина','Куст','Сад']},
  tools:{name:'Инструменты', max:9, names:['Гвоздь','Шуруп','Молоток','Пила','Кисть','Ящик','Верстак','Молот','Мастерская']},
  food:{name:'Еда', max:9, names:['Ягода','Черника','Варенье','Хлеб','Пирог','Мёд','Корзинка','Торт','Пир']}
};
const GENS={
  gen_wood:{chain:'wood', label:'Пень', cost:GEN_COST, spawnTier:1},
  gen_stone:{chain:'stone', label:'Карьер', cost:GEN_COST, spawnTier:1},
  gen_flower:{chain:'flower', label:'Горшок', cost:GEN_COST, spawnTier:1},
  gen_tools:{chain:'tools', label:'Сарай', cost:GEN_COST+1, spawnTier:1},
  gen_food:{chain:'food', label:'Печь', cost:GEN_COST+1, spawnTier:1}
};
const ZONES=[
  {id:'dock', name:'Причал', cost:{coins:40,xp:0}, story:'Лодки снова могут причалить к острову.'},
  {id:'cottage', name:'Домик', cost:{coins:80}, story:'В домике снова горит свет — феи вернулись.'},
  {id:'garden', name:'Сад', cost:{coins:120}, story:'Цветы раскрылись, воздух пахнет волшебством.'},
  {id:'tower', name:'Башня', cost:{coins:180,gems:1}, story:'С башни виден весь остров.'},
  {id:'fountain', name:'Фонтан', cost:{coins:240,gems:2}, story:'Кристальная вода исцеляет землю.'},
  {id:'bridge', name:'Мост', cost:{coins:300,gems:2}, story:'Мост соединил берега мечты.'},
  {id:'windmill', name:'Мельница', cost:{coins:380,gems:3}, story:'Крылья мельницы крутятся от морского ветра.'},
  {id:'tree', name:'Древо фей', cost:{coins:500,gems:5}, story:'Древнее древо снова светится. Остров спасён!'}
];
const CHARS=[
  {id:'fairy', name:'Фея Луна', img:'assets/ui/char_fairy.webp'},
  {id:'gnome', name:'Гном Боровик', img:'assets/ui/char_gnome.webp'},
  {id:'traveler', name:'Путница Аня', img:'assets/ui/char_traveler.webp'},
  {id:'fox', name:'Лис Рыжик', img:'assets/ui/char_fox.webp'}
];
const STORIES=[
  'Когда-то остров сиял, но буря разрушила его чудеса…',
  'Фея Луна просит помочь собрать материалы слиянием.',
  'Каждый заказ приближает восстановление руин.',
  'Гномы шепчут: пять одинаковых — особая награда!',
  'Когда все зоны восстановлены, остров снова станет сказкой.'
];

function itemId(chain,tier){return chain+'_'+tier;}
function parseId(id){
  if(!id) return null;
  if(GENS[id]) return {kind:'gen', id};
  const m=String(id).match(/^([a-z]+)_(\d+)$/);
  if(!m) return null;
  return {kind:'item', chain:m[1], tier:+m[2], id};
}
function spriteSrc(id){
  const p=parseId(id);
  if(!p) return '';
  if(p.kind==='gen') return 'assets/sprites/'+id+'.webp';
  return 'assets/sprites/'+id+'.webp';
}
function nextId(id){
  const p=parseId(id);
  if(!p||p.kind!=='item') return null;
  const max=CHAINS[p.chain].max;
  if(p.tier>=max) return null;
  return itemId(p.chain, p.tier+1);
}
function tierUp(id, n){
  const p=parseId(id);
  if(!p||p.kind!=='item') return null;
  const t=Math.min(CHAINS[p.chain].max, p.tier+n);
  return itemId(p.chain, t);
}

const state={
  coins:50, gems:3, xp:0, level:1,
  energy:ENERGY_MAX, energyMax:ENERGY_MAX, energyAt:Date.now(),
  board:null, // COLS*ROWS
  zones:{}, // id -> level 0|1
  orders:[],
  daily:{day:'', merges:0, orders:0, restore:0, done:{}},
  tutorial:0, storyIdx:0,
  muted:false, musicVol:0.4, sfxVol:0.75,
  stats:{merges:0, merge5:0}
};

function emptyBoard(){return Array(COLS*ROWS).fill(null);}
function idx(c,r){return r*COLS+c;}
function xy(i){return {c:i%COLS, r:(i/COLS)|0};}
function findEmpty(){
  const free=[];
  for(let i=0;i<state.board.length;i++) if(!state.board[i]) free.push(i);
  if(!free.length) return -1;
  return free[(Math.random()*free.length)|0];
}
function place(id, at){
  const i = at!=null? at : findEmpty();
  if(i<0) return -1;
  state.board[i]=id;
  return i;
}
function countItems(id){
  let n=0; for(const x of state.board) if(x===id) n++; return n;
}
function removeOne(id){
  for(let i=0;i<state.board.length;i++) if(state.board[i]===id){ state.board[i]=null; return i; }
  return -1;
}

function xpToLevel(lv){return 40+lv*35;}
function addXp(n){
  state.xp+=n;
  while(state.xp>=xpToLevel(state.level)){
    state.xp-=xpToLevel(state.level);
    state.level++;
    state.energyMax=Math.min(150, ENERGY_MAX + (state.level-1)*2);
    state.energy=state.energyMax;
    toast('Уровень '+state.level+'!');
    AudioFX.sfx('levelup');
    burst(window.innerWidth/2, window.innerHeight*0.35, '#ffd24a', 28);
  }
}
function regenEnergy(){
  const now=Date.now();
  if(state.energy>=state.energyMax){ state.energyAt=now; return; }
  const gained=Math.floor((now-state.energyAt)/ENERGY_REGEN_MS);
  if(gained>0){
    state.energy=Math.min(state.energyMax, state.energy+gained);
    state.energyAt+=gained*ENERGY_REGEN_MS;
  }
}
function spendEnergy(n){
  regenEnergy();
  if(state.energy<n) return false;
  state.energy-=n;
  return true;
}

/* ---------- Audio (reuse pattern + new merge SFX) ---------- */
const AudioFX=(function(){
  const BASE='assets/audio/';
  const FILES={
    music_day:'music_day.ogg', music_night:'music_night.ogg',
    amb_birds:'amb_birds.ogg',
    tap:'sfx_tap.ogg', coin:'sfx_coin.ogg', purchase:'sfx_purchase.ogg',
    levelup:'sfx_levelup.ogg', unlock:'sfx_unlock.ogg', notify:'sfx_notify.ogg',
    harvest:'sfx_harvest.ogg',
    merge:'sfx_merge.ogg', merge5:'sfx_merge5.ogg', pop:'sfx_pop.ogg',
    sparkle:'sfx_sparkle.ogg', whoosh:'sfx_whoosh.ogg'
  };
  let ctx=null, unlocked=false, muted=false, musicVol=0.4, sfxVol=0.75;
  let master=null, musicGain=null, sfxGain=null, ambGain=null;
  const buffers={}; let musicSrc=null, ambSrc=null, curMusic=null, loading=null;

  function ensureCtx(){
    if(!ctx){
      ctx=new (window.AudioContext||window.webkitAudioContext)();
      master=ctx.createGain(); master.gain.value=muted?0:1; master.connect(ctx.destination);
      musicGain=ctx.createGain(); musicGain.gain.value=musicVol; musicGain.connect(master);
      sfxGain=ctx.createGain(); sfxGain.gain.value=sfxVol; sfxGain.connect(master);
      ambGain=ctx.createGain(); ambGain.gain.value=Math.min(0.4,sfxVol*0.4); ambGain.connect(master);
    }
    return ctx;
  }
  async function loadAll(){
    ensureCtx();
    await Promise.all(Object.entries(FILES).map(async ([k,f])=>{
      if(buffers[k]) return;
      try{ const res=await fetch(BASE+f); const ab=await res.arrayBuffer(); buffers[k]=await ctx.decodeAudioData(ab.slice(0)); }
      catch(e){ console.warn('audio',k,e); }
    }));
  }
  function unlock(){
    if(unlocked) return Promise.resolve();
    unlocked=true; ensureCtx();
    const p=ctx.resume();
    if(!loading) loading=loadAll().then(()=>{ playMusic('music_day'); playAmb('amb_birds'); });
    return Promise.all([p, loading]);
  }
  function playBuf(name, dest, opts){
    opts=opts||{}; if(muted||!unlocked) return;
    ensureCtx(); const buf=buffers[name];
    if(!buf){ if(dest===sfxGain) beep(600,0.05,0.08); return; }
    if(ctx.state==='suspended') ctx.resume();
    const src=ctx.createBufferSource(); src.buffer=buf; src.loop=!!opts.loop;
    const g=ctx.createGain(); g.gain.value=opts.vol!=null?opts.vol:1;
    src.connect(g); g.connect(dest||sfxGain);
    try{src.start(0);}catch(e){}
    return src;
  }
  function beep(freq,dur,vol){
    try{ ensureCtx(); if(muted) return;
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.frequency.value=freq; g.gain.value=vol||0.1;
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+dur);
      o.connect(g); g.connect(sfxGain||master); o.start(); o.stop(ctx.currentTime+dur);
    }catch(e){}
  }
  function stopSrc(ref){ if(!ref) return; try{ref.stop();}catch(e){} }
  function playMusic(name){
    if(curMusic===name && musicSrc) return;
    stopSrc(musicSrc); musicSrc=null; curMusic=name;
    musicSrc=playBuf(name, musicGain, {loop:true, vol:0.85});
  }
  function playAmb(name){
    stopSrc(ambSrc); ambSrc=playBuf(name, ambGain, {loop:true, vol:0.5});
  }
  function sfx(name,vol){ playBuf(name, sfxGain, {vol:vol!=null?vol:1}); }
  function setMuted(m){ muted=!!m; if(master) master.gain.value=muted?0:1; }
  function setMusicVol(v){ musicVol=Math.max(0,Math.min(1,+v||0)); if(musicGain) musicGain.gain.value=musicVol; }
  function setSfxVol(v){ sfxVol=Math.max(0,Math.min(1,+v||0)); if(sfxGain) sfxGain.gain.value=sfxVol; if(ambGain) ambGain.gain.value=Math.min(0.4,sfxVol*0.4); }
  function pauseAll(){ if(ctx&&ctx.state==='running') ctx.suspend(); }
  function resumeAll(){ if(unlocked&&ctx) ctx.resume(); }

  document.addEventListener('visibilitychange',()=>{ if(document.hidden) pauseAll(); else resumeAll(); });
  try{
    if(window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.App){
      Capacitor.Plugins.App.addListener('appStateChange', s=>{ if(s.isActive) resumeAll(); else pauseAll(); });
    }
  }catch(e){}

  return{unlockAudio:unlock, sfx, setMuted, isMuted:()=>muted, setMusicVol, setSfxVol, getMusicVol:()=>musicVol, getSfxVol:()=>sfxVol, pauseAll, resumeAll};
})();

/* ---------- FX canvas ---------- */
const fxCanvas=document.getElementById('fx');
const fx=fxCanvas.getContext('2d');
let particles=[];
function resizeFx(){ fxCanvas.width=window.innerWidth*devicePixelRatio; fxCanvas.height=window.innerHeight*devicePixelRatio; fx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); }
window.addEventListener('resize', resizeFx); resizeFx();
function burst(x,y,color,n){
  for(let i=0;i<(n||16);i++){
    const a=Math.random()*Math.PI*2, sp=2+Math.random()*5;
    particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2, life:1, color:color||'#fff', r:2+Math.random()*3, spark:Math.random()>.5});
  }
}
function squashAt(el){
  if(!el) return;
  el.style.transform='scale(.82)';
  setTimeout(()=>{ el.style.transform='scale(1.08)'; setTimeout(()=>{ el.style.transform=''; },120); },70);
}
function tickFx(){
  fx.clearRect(0,0,fxCanvas.width,fxCanvas.height);
  particles=particles.filter(p=>p.life>0);
  for(const p of particles){
    p.x+=p.vx; p.y+=p.vy; p.vy+=0.15; p.life-=0.02;
    fx.globalAlpha=Math.max(0,p.life);
    fx.fillStyle=p.color;
    if(p.spark){
      fx.beginPath();
      fx.moveTo(p.x, p.y-p.r*2); fx.lineTo(p.x+p.r*0.5,p.y); fx.lineTo(p.x,p.y+p.r*2); fx.lineTo(p.x-p.r*0.5,p.y);
      fx.closePath(); fx.fill();
    } else { fx.beginPath(); fx.arc(p.x,p.y,p.r,0,Math.PI*2); fx.fill(); }
  }
  fx.globalAlpha=1;
  requestAnimationFrame(tickFx);
}
tickFx();

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toast._tm); toast._tm=setTimeout(()=>t.classList.remove('show'),1800);
}

/* ---------- Orders & daily ---------- */
function todayKey(){ const d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function refreshDaily(){
  const k=todayKey();
  if(state.daily.day!==k){
    state.daily={day:k, merges:0, orders:0, restore:0, done:{}};
  }
}
function dailyTasks(){
  return [
    {id:'m10', label:'Сделай 10 слияний', need:10, cur:state.daily.merges, reward:{coins:25}},
    {id:'o3', label:'Выполни 3 заказа', need:3, cur:state.daily.orders, reward:{coins:40, gems:1}},
    {id:'r1', label:'Восстанови зону острова', need:1, cur:state.daily.restore, reward:{gems:2}}
  ];
}
function claimDaily(id){
  const t=dailyTasks().find(x=>x.id===id);
  if(!t||state.daily.done[id]||t.cur<t.need) return;
  state.daily.done[id]=true;
  if(t.reward.coins) state.coins+=t.reward.coins;
  if(t.reward.gems) state.gems+=t.reward.gems;
  AudioFX.sfx('coin'); toast('Награда получена!');
  save(); renderAll();
}

function genOrder(){
  const char=CHARS[(Math.random()*CHARS.length)|0];
  const chains=Object.keys(CHAINS);
  const need=[];
  const n=1+((Math.random()*2)|0);
  for(let i=0;i<n;i++){
    const ch=chains[(Math.random()*chains.length)|0];
    const tier=1+((Math.random()*Math.min(4, 1+state.level))|0);
    need.push(itemId(ch, tier));
  }
  const reward={coins:20+need.length*15+state.level*3, xp:12+need.length*8, gems: Math.random()>.85?1:0};
  return {id:'o'+Date.now()+Math.random().toString(16).slice(2,6), char:char.id, need, reward};
}
function ensureOrders(){
  while(state.orders.length<3) state.orders.push(genOrder());
}
function canFulfill(order){
  const bag={};
  for(const id of state.board){ if(id&&parseId(id)?.kind==='item') bag[id]=(bag[id]||0)+1; }
  const need={}; for(const id of order.need) need[id]=(need[id]||0)+1;
  for(const id in need) if((bag[id]||0)<need[id]) return false;
  return true;
}
function fulfill(orderId){
  const o=state.orders.find(x=>x.id===orderId);
  if(!o||!canFulfill(o)) return;
  for(const id of o.need) removeOne(id);
  state.coins+=o.reward.coins||0;
  state.gems+=o.reward.gems||0;
  addXp(o.reward.xp||0);
  state.orders=state.orders.filter(x=>x.id!==orderId);
  state.daily.orders++;
  ensureOrders();
  AudioFX.sfx('purchase'); burst(window.innerWidth/2, window.innerHeight*0.7, '#ffd24a', 22);
  toast('Заказ выполнен! +'+o.reward.coins+'🪙');
  maybeStory();
  save(); renderAll();
}

function maybeStory(){
  if(state.storyIdx<STORIES.length-1 && (state.stats.merges%15===0 || state.daily.orders%2===0)){
    state.storyIdx=Math.min(STORIES.length-1, state.storyIdx+1);
  }
}

/* ---------- Core merge ---------- */
function tryMerge(from, to){
  if(from===to) return false;
  const a=state.board[from], b=state.board[to];
  if(!a) return false;
  if(!b){ state.board[to]=a; state.board[from]=null; AudioFX.sfx('whoosh',0.5); return true; }
  const pa=parseId(a), pb=parseId(b);
  if(!pa||!pb||pa.kind!=='item'||pb.kind!=='item') return false;
  if(a!==b) return false;
  // count same adjacent? for 5-merge: count identical on board at from+to plus nearby same? Spec: merge 5 bonus
  // Practical: if player drops onto same and there are >=4 other same elsewhere OR we check total same including both >=5 then consume 5
  let sameIdx=[];
  for(let i=0;i<state.board.length;i++) if(state.board[i]===a) sameIdx.push(i);
  // include from and to
  if(sameIdx.length>=5){
    // consume 5 (prefer from,to first)
    const use=[from,to];
    for(const i of sameIdx){ if(use.length>=5) break; if(i!==from&&i!==to) use.push(i); }
    const result=tierUp(a, 2) || nextId(a);
    if(!result){ toast('Максимальный уровень!'); return false; }
    for(const i of use) state.board[i]=null;
    state.board[to]=result;
    state.stats.merges++; state.stats.merge5++; state.daily.merges++;
    state.coins+=5; addXp(8);
    AudioFX.sfx('merge5'); AudioFX.sfx('sparkle',0.7);
    const cell=cellEl(to); const r=cell.getBoundingClientRect();
    burst(r.left+r.width/2, r.top+r.height/2, '#ff8ac8', 36);
    squashAt(cell.querySelector('img'));
    toast('Супер-слияние ×5!');
    checkTutorial(3);
    return true;
  }
  const result=nextId(a);
  if(!result){ toast('Максимум ветки!'); return false; }
  state.board[from]=null;
  state.board[to]=result;
  state.stats.merges++; state.daily.merges++;
  addXp(3);
  AudioFX.sfx('merge');
  const cell=cellEl(to); const r=cell.getBoundingClientRect();
  burst(r.left+r.width/2, r.top+r.height/2, '#ffe08a', 20);
  squashAt(cell&&cell.querySelector('img'));
  checkTutorial(2);
  return true;
}

function tapGenerator(i){
  const id=state.board[i];
  const g=GENS[id];
  if(!g) return;
  if(!spendEnergy(g.cost)){ toast('Мало энергии!'); AudioFX.sfx('tap'); return; }
  const spawn=itemId(g.chain, g.spawnTier);
  const slot=findEmpty();
  if(slot<0){ state.energy+=g.cost; toast('Нет места на поле!'); return; }
  state.board[slot]=spawn;
  AudioFX.sfx('pop');
  const cell=cellEl(slot); const r=cell.getBoundingClientRect();
  burst(r.left+r.width/2, r.top+r.height/2, '#9ad4ff', 12);
  checkTutorial(1);
  save(); renderBoard(); renderTop();
}

/* ---------- UI render ---------- */
const boardEl=document.getElementById('board');
function cellEl(i){ return boardEl.children[i]; }

function buildBoardDom(){
  boardEl.innerHTML='';
  for(let i=0;i<COLS*ROWS;i++){
    const d=document.createElement('div');
    d.className='cell';
    d.dataset.i=i;
    boardEl.appendChild(d);
  }
  setupDrag();
}
function renderBoard(){
  for(let i=0;i<COLS*ROWS;i++){
    const d=cellEl(i); const id=state.board[i];
    d.className='cell'+(id&&GENS[id]?' gen':'');
    d.innerHTML='';
    if(id){
      const img=document.createElement('img');
      img.src=spriteSrc(id); img.alt=''; img.draggable=false;
      d.appendChild(img);
      const p=parseId(id);
      if(p&&p.kind==='item'){
        const b=document.createElement('div'); b.className='badge'; b.textContent=p.tier; d.appendChild(b);
      }
    }
  }
}
function renderTop(){
  regenEnergy();
  document.getElementById('ui-coins').textContent=state.coins;
  document.getElementById('ui-gems').textContent=state.gems;
  document.getElementById('ui-energy').textContent=state.energy;
  document.getElementById('ui-energy-max').textContent=state.energyMax;
  document.getElementById('ui-level').textContent=state.level;
  document.getElementById('btn-mute').textContent=state.muted?'🔇':'🔊';
}
function renderOrders(){
  const box=document.getElementById('orders');
  box.innerHTML='';
  ensureOrders();
  for(const o of state.orders){
    const ch=CHARS.find(c=>c.id===o.char)||CHARS[0];
    const card=document.createElement('div'); card.className='order-card';
    const ok=canFulfill(o);
    card.innerHTML=`<img class="av" src="${ch.img}" alt=""/><div><b>${ch.name}</b><div class="need">${o.need.map(id=>`<img src="${spriteSrc(id)}" title="${id}"/>`).join('')}</div><div>🪙${o.reward.coins}${o.reward.gems?(' 💎'+o.reward.gems):''}</div></div>`;
    const btn=document.createElement('button'); btn.textContent='✓'; btn.disabled=!ok;
    btn.onclick=()=>fulfill(o.id);
    card.appendChild(btn);
    box.appendChild(card);
  }
}
function renderAll(){ renderTop(); renderBoard(); renderOrders(); }

/* ---------- Drag & drop ---------- */
let drag={active:false, from:-1, ghost:null};
function setupDrag(){
  boardEl.querySelectorAll('.cell').forEach(cell=>{
    cell.addEventListener('pointerdown', onDown);
  });
}
function onDown(e){
  const i=+e.currentTarget.dataset.i;
  const id=state.board[i];
  if(!id) return;
  AudioFX.unlockAudio();
  if(GENS[id]){
    // short tap = generate; long could drag gens too — allow drag gens
  }
  drag.active=true; drag.from=i; drag.moved=false;
  const img=e.currentTarget.querySelector('img');
  const g=document.createElement('img');
  g.className='drag-ghost'; g.src=img?img.src:spriteSrc(id);
  document.body.appendChild(g); drag.ghost=g;
  moveGhost(e.clientX, e.clientY);
  e.currentTarget.setPointerCapture(e.pointerId);
  e.currentTarget.addEventListener('pointermove', onMove);
  e.currentTarget.addEventListener('pointerup', onUp);
  e.currentTarget.addEventListener('pointercancel', onUp);
}
function moveGhost(x,y){ if(drag.ghost){ drag.ghost.style.left=x+'px'; drag.ghost.style.top=y+'px'; } }
function onMove(e){
  if(!drag.active) return;
  drag.moved=true;
  moveGhost(e.clientX, e.clientY);
  const el=document.elementFromPoint(e.clientX, e.clientY);
  const cell=el&&el.closest?el.closest('.cell'):null;
  boardEl.querySelectorAll('.cell').forEach(c=>c.classList.remove('drop-ok','drop-merge','hl'));
  if(cell){
    const to=+cell.dataset.i;
    const a=state.board[drag.from], b=state.board[to];
    if(to!==drag.from){
      if(!b) cell.classList.add('drop-ok');
      else if(a&&a===b&&parseId(a)?.kind==='item') cell.classList.add('drop-merge');
    }
  }
}
function onUp(e){
  const cell=e.currentTarget;
  cell.releasePointerCapture(e.pointerId);
  cell.removeEventListener('pointermove', onMove);
  cell.removeEventListener('pointerup', onUp);
  cell.removeEventListener('pointercancel', onUp);
  boardEl.querySelectorAll('.cell').forEach(c=>c.classList.remove('drop-ok','drop-merge','hl'));
  if(drag.ghost){ drag.ghost.remove(); drag.ghost=null; }
  if(!drag.active) return;
  const from=drag.from;
  const id=state.board[from];
  if(!drag.moved){
    drag.active=false;
    if(GENS[id]) tapGenerator(from);
    else AudioFX.sfx('tap',0.4);
    return;
  }
  const el=document.elementFromPoint(e.clientX, e.clientY);
  const target=el&&el.closest?el.closest('.cell'):null;
  drag.active=false;
  if(target){
    const to=+target.dataset.i;
    if(to!==from){
      const ok=tryMerge(from, to);
      if(!ok && state.board[from] && !state.board[to] && !GENS[state.board[to]]){
        // already handled empty in tryMerge
      } else if(!ok){
        // try swap if both filled and different
        const a=state.board[from], b=state.board[to];
        if(a && b && a!==b){ state.board[from]=b; state.board[to]=a; AudioFX.sfx('whoosh',0.4); }
      }
    }
  }
  save(); renderAll();
}

/* ---------- Island / Book / Tasks modals ---------- */
function openModal(html){
  document.getElementById('sheet').innerHTML=html;
  document.getElementById('modal').classList.add('show');
  document.getElementById('sheet').querySelector('.close')?.addEventListener('click', closeModal);
}
function closeModal(){ document.getElementById('modal').classList.remove('show'); }
document.getElementById('modal').addEventListener('click', e=>{ if(e.target.id==='modal') closeModal(); });

function openIsland(){
  let html='<button class="close">✕</button><h2>🏝️ Остров</h2><p style="font-size:13px;color:#567;margin-bottom:8px">Трать монеты и кристаллы, чтобы восстановить зоны.</p>';
  html+=`<div class="story">${STORIES[state.storyIdx]||''}</div>`;
  for(const z of ZONES){
    const done=!!state.zones[z.id];
    const img=done?('assets/buildings/b_'+z.id+'.webp'):('assets/buildings/r_'+z.id+'.webp');
    const cost=z.cost;
    const can=!done && state.coins>=(cost.coins||0) && state.gems>=(cost.gems||0);
    html+=`<div class="zone ${done?'done':''}"><img src="${img}" alt=""/><div><b>${z.name}</b><div style="font-size:12px;color:#678">${done?z.story:('🪙'+(cost.coins||0)+(cost.gems?(' · 💎'+cost.gems):''))}</div></div><button data-z="${z.id}" ${done||!can?'disabled':''}>${done?'Готово':'Восстановить'}</button></div>`;
  }
  openModal(html);
  document.getElementById('sheet').querySelectorAll('button[data-z]').forEach(btn=>{
    btn.onclick=()=>restoreZone(btn.dataset.z);
  });
}
function restoreZone(id){
  const z=ZONES.find(x=>x.id===id);
  if(!z||state.zones[id]) return;
  const c=z.cost;
  if(state.coins<(c.coins||0) || state.gems<(c.gems||0)){ toast('Не хватает ресурсов'); return; }
  state.coins-=(c.coins||0); state.gems-=(c.gems||0);
  state.zones[id]=1; state.daily.restore++;
  addXp(20); AudioFX.sfx('unlock'); AudioFX.sfx('sparkle');
  // unlock more generators as island grows
  if(id==='cottage' && !state.board.includes('gen_tools')){ const s=findEmpty(); if(s>=0) state.board[s]='gen_tools'; toast('Открыт генератор инструментов!'); }
  if(id==='garden' && !state.board.includes('gen_food')){ const s=findEmpty(); if(s>=0) state.board[s]='gen_food'; toast('Открыт генератор еды!'); }
  toast(z.name+' восстановлен!');
  burst(window.innerWidth/2, window.innerHeight/2, '#9effc0', 40);
  if(ZONES.every(z=>state.zones[z.id])) toast('Остров полностью восстановлен! ✨');
  save(); renderTop(); openIsland();
}

function openTasks(){
  refreshDaily();
  let html='<button class="close">✕</button><h2>📋 Задания дня</h2>';
  for(const t of dailyTasks()){
    const done=!!state.daily.done[t.id];
    const ready=!done && t.cur>=t.need;
    html+=`<div class="task ${done?'done':''}"><div>${t.label}<div style="font-size:11px;color:#789">${Math.min(t.cur,t.need)}/${t.need}</div></div>`;
    if(done) html+='<span>✅</span>';
    else if(ready) html+=`<button data-t="${t.id}" style="border:0;background:#4ad47a;color:#fff;border-radius:10px;padding:6px 10px;font-weight:800">Забрать</button>`;
    else html+=`<span>…</span>`;
    html+='</div>';
  }
  openModal(html);
  document.getElementById('sheet').querySelectorAll('button[data-t]').forEach(b=>b.onclick=()=>{claimDaily(b.dataset.t); openTasks();});
}

function openBook(){
  let html='<button class="close">✕</button><h2>📖 Книга</h2>';
  html+=`<div class="story">Слияний: ${state.stats.merges} · Супер×5: ${state.stats.merge5}<br/>Уровень ${state.level} · опыт ${state.xp}/${xpToLevel(state.level)}</div>`;
  html+='<h3 style="margin-top:10px;font-size:14px">Звук</h3>';
  html+=`<label>Музыка <span id="vm">${Math.round(state.musicVol*100)}%</span><input class="range" id="vol-music" type="range" min="0" max="100" value="${Math.round(state.musicVol*100)}"/></label>`;
  html+=`<label>Эффекты <span id="vs">${Math.round(state.sfxVol*100)}%</span><input class="range" id="vol-sfx" type="range" min="0" max="100" value="${Math.round(state.sfxVol*100)}"/></label>`;
  html+=`<label style="display:block;margin:8px 0"><input type="checkbox" id="chk-mute" ${state.muted?'checked':''}/> Без звука</label>`;
  html+='<h3 style="margin-top:10px;font-size:14px">Коллекция</h3><div style="display:flex;flex-wrap:wrap;gap:4px">';
  for(const ch of Object.keys(CHAINS)){
    for(let t=1;t<=CHAINS[ch].max;t++){
      const id=itemId(ch,t);
      html+=`<img src="${spriteSrc(id)}" width="40" height="40" title="${CHAINS[ch].names[t-1]}" style="background:#f4f7ff;border-radius:8px"/>`;
    }
  }
  html+='</div>';
  html+=`<p style="margin-top:12px;font-size:12px;color:#789">Проверка обновлений · v${APP_VERSION.version}</p>`;
  html+=`<button id="btn-update" style="border:0;background:#6a9cff;color:#fff;border-radius:10px;padding:8px 12px;font-weight:700;margin-right:6px">Обновить</button>`;
  html+=`<button id="btn-reset" style="border:0;background:#eee;border-radius:10px;padding:8px 12px">Сброс сохранения</button>`;
  openModal(html);
  const vm=document.getElementById('vol-music'), vs=document.getElementById('vol-sfx');
  vm.oninput=()=>{state.musicVol=vm.value/100; AudioFX.setMusicVol(state.musicVol); document.getElementById('vm').textContent=vm.value+'%'; save();};
  vs.oninput=()=>{state.sfxVol=vs.value/100; AudioFX.setSfxVol(state.sfxVol); document.getElementById('vs').textContent=vs.value+'%'; save();};
  document.getElementById('chk-mute').onchange=(e)=>{state.muted=e.target.checked; AudioFX.setMuted(state.muted); renderTop(); save();};
  document.getElementById('btn-reset').onclick=()=>{ if(confirm('Сбросить прогресс?')){ localStorage.removeItem(SAVE_KEY); location.reload(); } };
  document.getElementById('btn-update').onclick=()=>checkForUpdates({}).catch(()=>toast('Нет обновлений'));
}

/* ---------- Tutorial ---------- */
const TUT=[
  'Добро пожаловать! Это поле слияний. Нажми на генератор (пень), чтобы создать предмет — это тратит ⚡ энергию.',
  'Перетащи два одинаковых предмета друг на друга, чтобы получить следующий уровень!',
  'Сложи пять одинаковых для супер-слияния и бонуса.',
  'Выполняй заказы персонажей внизу и восстанавливай остров на вкладке 🏝️. Удачи!'
];
function checkTutorial(step){
  if(state.tutorial===step){ state.tutorial=step+1; if(state.tutorial<=TUT.length) showTut(state.tutorial-1); save(); }
}
function showTut(i){
  if(i>=TUT.length){ document.getElementById('tut').classList.remove('show'); return; }
  document.getElementById('tut-text').textContent=TUT[i];
  document.getElementById('tut').classList.add('show');
}
document.getElementById('tut-next').onclick=()=>{
  if(state.tutorial>=TUT.length){ document.getElementById('tut').classList.remove('show'); return; }
  // allow skip forward only after trigger, or skip all on last
  if(state.tutorial===0){ state.tutorial=1; showTut(0); save(); return; }
  document.getElementById('tut').classList.remove('show');
};

/* ---------- Save / Load ---------- */
function save(){
  const data={
    coins:state.coins, gems:state.gems, xp:state.xp, level:state.level,
    energy:state.energy, energyMax:state.energyMax, energyAt:state.energyAt,
    board:state.board, zones:state.zones, orders:state.orders,
    daily:state.daily, tutorial:state.tutorial, storyIdx:state.storyIdx,
    muted:state.muted, musicVol:state.musicVol, sfxVol:state.sfxVol, stats:state.stats
  };
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(data)); }catch(e){}
}
function load(){
  try{
    const raw=localStorage.getItem(SAVE_KEY); if(!raw) return false;
    const d=JSON.parse(raw);
    Object.assign(state, {
      coins:d.coins|0, gems:d.gems|0, xp:d.xp|0, level:d.level||1,
      energy:d.energy!=null?d.energy:ENERGY_MAX, energyMax:d.energyMax||ENERGY_MAX, energyAt:d.energyAt||Date.now(),
      board:d.board||emptyBoard(), zones:d.zones||{}, orders:d.orders||[],
      daily:d.daily||{day:'',merges:0,orders:0,restore:0,done:{}},
      tutorial:d.tutorial||0, storyIdx:d.storyIdx||0,
      muted:!!d.muted, musicVol:d.musicVol!=null?d.musicVol:0.4, sfxVol:d.sfxVol!=null?d.sfxVol:0.75,
      stats:d.stats||{merges:0,merge5:0}
    });
    if(!state.board || state.board.length!==COLS*ROWS) state.board=emptyBoard();
    return true;
  }catch(e){ return false; }
}

function newGameSetup(){
  state.board=emptyBoard();
  state.zones={}; state.orders=[]; state.coins=50; state.gems=3; state.xp=0; state.level=1;
  state.energy=ENERGY_MAX; state.energyMax=ENERGY_MAX; state.energyAt=Date.now();
  state.tutorial=0; state.storyIdx=0; state.stats={merges:0,merge5:0};
  // starter gens + items
  place('gen_wood', idx(1,7));
  place('gen_stone', idx(3,7));
  place('gen_flower', idx(5,7));
  place('wood_1', idx(2,5));
  place('wood_1', idx(3,5));
  place('stone_1', idx(4,5));
  ensureOrders();
  refreshDaily();
}

/* ---------- OTA (same as farm) ---------- */
function getAppUpdatePlugin(){
  try{ return window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.AppUpdate; }catch(e){ return null; }
}
function cmpSemver(a,b){
  const pa=String(a||'0').split('.').map(n=>parseInt(n,10)||0);
  const pb=String(b||'0').split('.').map(n=>parseInt(n,10)||0);
  for(let i=0;i<3;i++){ if((pa[i]||0)>(pb[i]||0)) return 1; if((pa[i]||0)<(pb[i]||0)) return -1; }
  return 0;
}
async function checkForUpdates(opts){
  opts=opts||{};
  const url=opts.manifestUrl||DEFAULT_MANIFEST_URL;
  if(!url||url.indexOf('PLACEHOLDER')>=0) return {skipped:true};
  let manifest;
  try{
    const res=await fetch(url+(url.indexOf('?')>=0?'&':'?')+'t='+Date.now(),{cache:'no-store',mode:'cors'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    manifest=await res.json();
  }catch(e){ return {skipped:true, reason:String(e.message||e)}; }
  const plugin=getAppUpdatePlugin();
  let localCode=APP_VERSION.versionCode, localName=APP_VERSION.version, localWeb=APP_VERSION.webVersion;
  if(plugin&&plugin.getInfo){ try{ const info=await plugin.getInfo(); localCode=info.versionCode||localCode; localName=info.versionName||localName; localWeb=info.webVersion||localWeb; }catch(e){} }
  if(manifest.webBundleUrl && cmpSemver(manifest.webVersion||manifest.version, localWeb)>0){
    if(!opts.silent) await showUpdateDialog(manifest,'web');
    return {update:'web', manifest};
  }
  const remoteCode=parseInt(manifest.versionCode,10)||0;
  const needApk=(remoteCode>localCode)||(cmpSemver(manifest.version,localName)>0);
  if(needApk && (manifest.apkUrl||'').length){
    if(!opts.silent) await showUpdateDialog(manifest,'apk');
    return {update:'apk', manifest};
  }
  if(!opts.silent) toast('У вас актуальная версия');
  return {upToDate:true, manifest};
}
async function showUpdateDialog(manifest, kind){
  const ok=confirm((manifest.changelog||'Доступно обновление')+'\n\nОбновить сейчас?');
  if(!ok) return;
  const plugin=getAppUpdatePlugin();
  try{
    if(kind==='web' && plugin && plugin.applyWebBundle){
      await plugin.applyWebBundle({url:manifest.webBundleUrl, version:manifest.webVersion||manifest.version});
      location.reload();
    } else if(manifest.apkUrl){
      if(plugin&&plugin.openApkUrl) await plugin.openApkUrl({url:manifest.apkUrl});
      else window.open(manifest.apkUrl,'_blank');
    }
  }catch(e){ toast('Ошибка обновления'); }
}

/* ---------- Nav / start ---------- */
document.querySelectorAll('.navbtn').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.navbtn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tab=btn.dataset.tab;
    if(tab==='island') openIsland();
    else if(tab==='tasks') openTasks();
    else if(tab==='book') openBook();
    else closeModal();
  };
});
document.getElementById('btn-mute').onclick=()=>{
  AudioFX.unlockAudio();
  state.muted=!state.muted; AudioFX.setMuted(state.muted); renderTop(); save();
};

function startGame(){
  document.getElementById('intro').style.display='none';
  document.getElementById('topbar').style.display='flex';
  document.getElementById('board-wrap').style.display='flex';
  document.getElementById('orders').style.display='flex';
  document.getElementById('bottom').style.display='flex';
  AudioFX.unlockAudio();
  AudioFX.setMusicVol(state.musicVol); AudioFX.setSfxVol(state.sfxVol); AudioFX.setMuted(state.muted);
  buildBoardDom(); renderAll();
  refreshDaily();
  if(state.tutorial===0){ showTut(0); state.tutorial=1; save(); }
  setInterval(()=>{ regenEnergy(); renderTop(); }, 1000);
  setTimeout(()=>checkForUpdates({silent:true}).catch(()=>{}), 1000);
}

document.getElementById('btn-start').onclick=()=>{
  localStorage.removeItem(SAVE_KEY);
  newGameSetup(); save(); startGame();
};
const hasSave=load();
if(hasSave){
  document.getElementById('btn-continue').style.display='block';
  document.getElementById('btn-continue').onclick=()=>{ refreshDaily(); ensureOrders(); startGame(); };
  document.getElementById('btn-start').textContent='Новая игра';
}

window.__MERGE__={state,CHAINS,GENS,ZONES,AudioFX,APP_VERSION,checkForUpdates,startGame,save,tryMerge};
