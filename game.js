
(function(){
'use strict';
const SAVE_KEY='farm_edge_world_v2';
const DAY_MS=120000;
const GROW_SCALE=0.12;
const SEASONS=['spring','summer','autumn','winter'];
const SEASON_RU={spring:'Весна',summer:'Лето',autumn:'Осень',winter:'Зима'};
const SEASON_EMO={spring:'🌸',summer:'☀️',autumn:'🍂',winter:'❄️'};
const WX_RU={clear:'Ясно',rain:'Дождь',drought:'Засуха',storm:'Шторм'};

const CROPS={
  wheat:{id:'wheat',name:'Пшеница',emoji:'🌾',cost:5,baseSell:12,grow:30,xp:3,unlock:1,color:'#d4c04a'},
  carrot:{id:'carrot',name:'Морковь',emoji:'🥕',cost:8,baseSell:18,grow:45,xp:5,unlock:1,color:'#ff8c42'},
  tomato:{id:'tomato',name:'Томат',emoji:'🍅',cost:15,baseSell:35,grow:70,xp:8,unlock:3,color:'#e53935'},
  corn:{id:'corn',name:'Кукуруза',emoji:'🌽',cost:22,baseSell:50,grow:90,xp:12,unlock:5,color:'#fbc02d'},
  potato:{id:'potato',name:'Картофель',emoji:'🥔',cost:28,baseSell:58,grow:100,xp:14,unlock:6,color:'#c4a484'},
  berry:{id:'berry',name:'Клубника',emoji:'🍓',cost:35,baseSell:72,grow:80,xp:16,unlock:7,color:'#ff1744'},
  pumpkin:{id:'pumpkin',name:'Тыква',emoji:'🎃',cost:40,baseSell:90,grow:120,xp:20,unlock:8,color:'#ff6f00'},
  grape:{id:'grape',name:'Виноград',emoji:'🍇',cost:55,baseSell:120,grow:150,xp:25,unlock:10,color:'#7b1fa2'},
  melon:{id:'melon',name:'Арбуз',emoji:'🍉',cost:70,baseSell:150,grow:180,xp:30,unlock:12,color:'#43a047'},
  sunf:{id:'sunf',name:'Подсолнух',emoji:'🌻',cost:48,baseSell:110,grow:110,xp:22,unlock:14,color:'#ffc107'},
  pepper:{id:'pepper',name:'Перец',emoji:'🌶️',cost:60,baseSell:130,grow:95,xp:26,unlock:15,color:'#d32f2f'},
  rainbow:{id:'rainbow',name:'Цветок радуги',emoji:'🌺',cost:90,baseSell:200,grow:200,xp:40,unlock:18,color:'#e91e63'},
  glow:{id:'glow',name:'Светящаяся тыква',emoji:'✨',cost:0,baseSell:180,grow:100,xp:35,unlock:99,hybrid:true,color:'#fff59d'},
  firepep:{id:'firepep',name:'Огненный перец',emoji:'🔥',cost:0,baseSell:140,grow:80,xp:28,unlock:99,hybrid:true,color:'#ff5722'},
  starmelon:{id:'starmelon',name:'Звёздная дыня',emoji:'🌌',cost:0,baseSell:260,grow:140,xp:48,unlock:99,hybrid:true,color:'#5c6bc0'},
  sunpod:{id:'sunpod',name:'Солнечный стручок',emoji:'☀️',cost:0,baseSell:210,grow:90,xp:36,unlock:99,hybrid:true,color:'#ffee58'},
  rubyberry:{id:'rubyberry',name:'Рубиновая ягода',emoji:'💎',cost:0,baseSell:240,grow:85,xp:42,unlock:99,hybrid:true,color:'#f44336'},
  goldcorn:{id:'goldcorn',name:'Золотая кукуруза',emoji:'👑',cost:0,baseSell:220,grow:100,xp:38,unlock:99,hybrid:true,color:'#ffd700'},
  frostroot:{id:'frostroot',name:'Морозный корень',emoji:'🧊',cost:0,baseSell:190,grow:110,xp:34,unlock:99,hybrid:true,color:'#81d4fa'},
  stormleaf:{id:'stormleaf',name:'Лист шторма',emoji:'⚡',cost:0,baseSell:230,grow:95,xp:40,unlock:99,hybrid:true,color:'#7e57c2'},
  voidfig:{id:'voidfig',name:'Инжир пустоты',emoji:'🌑',cost:0,baseSell:300,grow:160,xp:55,unlock:99,hybrid:true,color:'#37474f'},
  moonfl:{id:'moonfl',name:'Лунный цветок',emoji:'🌙',cost:0,baseSell:200,grow:60,xp:40,unlock:99,hybrid:true,nightOnly:true,zone:'moon',color:'#ce93d8'},
};
const HYBRIDS=[
  {a:'pumpkin',b:'wheat',result:'glow'},{a:'tomato',b:'carrot',result:'firepep'},
  {a:'melon',b:'moonfl',result:'starmelon'},{a:'pepper',b:'sunf',result:'sunpod'},
  {a:'berry',b:'grape',result:'rubyberry'},{a:'corn',b:'wheat',result:'goldcorn'},
  {a:'potato',b:'carrot',result:'frostroot'},{a:'grape',b:'pepper',result:'stormleaf'},
  {a:'rainbow',b:'moonfl',result:'voidfig'},{a:'pumpkin',b:'berry',result:'glow'},
];
const ANIMAL_TYPES={
  chicken:{id:'chicken',name:'Курица',emoji:'🐔',cost:60,unlock:6,produce:'egg',produceEmoji:'🥚',produceSell:18,interval:40,traits:['храбрая','ленивая','крикливая']},
  cow:{id:'cow',name:'Корова',emoji:'🐮',cost:150,unlock:10,produce:'milk',produceEmoji:'🥛',produceSell:40,interval:70,traits:['добрая','прожорливая','сонная']},
  sheep:{id:'sheep',name:'Овца',emoji:'🐑',cost:120,unlock:12,produce:'wool',produceEmoji:'🧶',produceSell:35,interval:60,traits:['пушистая','упрямая','нежная']},
};
const ZONES=[
  {id:'main',name:'Ферма',emoji:'🌱',needHeart:0,needLevel:1},
  {id:'ruins',name:'Руины',emoji:'🏛️',needHeart:40,needLevel:4},
  {id:'moon',name:'Лунный сад',emoji:'🌙',needHeart:120,needLevel:8},
  {id:'pen',name:'Загон',emoji:'🐾',needHeart:80,needLevel:6},
];
const STORIES=[
  'Записка #1: «Остров держится на сердце. Корми его — и земля вернётся…»',
  'Записка #2: «У каменного круга я скрещивал семена. Светящаяся тыква спасла нас в шторм.»',
  'Записка #3: «Ночью приходят тени-жуки. Пугала помогают, но лучше бить их пальцем.»',
  'Записка #4: «Лунные цветы всходят только в темноте. Не проспи.»',
  'Записка #5: «В руинах шепчет ветер: сердце — не камень, а семя первого хранителя.»',
  'Записка #6: «Животные чувствуют край. Храбрая курица клюёт вредителей сама.»',
  'Записка #7: «Сезоны крутятся быстрее, чем на земле внизу. Смотри на небо.»',
  'Записка #8: «Звёздная дыня открывает путь к саду луны.»',
  'Записка #9: «Если край осыплется — не бросай Сердце. Оно помнит тебя.»',
  'Записка #10: «Ты — следующий хранитель. Остров выбрал тебя.»',
];
const LEVEL_XP=[0,0,20,50,90,140,200,270,360,460,580,720,880,1060,1260,1500,1780,2100,2460,2860,3300,3800,4350,4950,5600,6300,7100,8000,9000,10100,11300];
const HEART_THRESHOLDS=[0,15,40,80,140,220,320,450,600];

function growSec(c){return Math.max(7,Math.round(c.grow*GROW_SCALE));}
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hashStr(s){return [...s].reduce((a,c)=>a+c.charCodeAt(0),0);}
function dailyMultipliers(day){const rnd=mulberry32(hashStr(day));const m={};Object.keys(CROPS).forEach(id=>{m[id]=0.7+rnd()*0.7;});return m;}
function sellPrice(id,mults){const c=CROPS[id];return Math.max(1,Math.round(c.baseSell*(mults[id]||1)));}
function xpForLevel(lv){return LEVEL_XP[Math.min(lv,LEVEL_XP.length-1)]||99999;}

const AudioFX=(function(){
  let ctx=null, muted=false, master=null;
  function ensure(){if(muted)return null;if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=0.22;master.connect(ctx.destination);}if(ctx.state==='suspended')ctx.resume();return ctx;}
  function beep(freq,dur,type,vol){const c=ensure();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.value=freq;g.gain.value=vol||0.2;g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+dur);o.connect(g);g.connect(master);o.start();o.stop(c.currentTime+dur);}
  return{setMuted(m){muted=m;if(master)master.gain.value=m?0:0.22;},isMuted(){return muted;},
    plant(){beep(320,.08,'triangle',.15);beep(420,.1,'sine',.1);},water(){beep(600,.05,'sine',.08);beep(500,.12,'sine',.1);},
    harvest(){beep(520,.07,'square',.1);beep(780,.12,'sine',.12);},coin(){beep(880,.06,'sine',.1);beep(1175,.1,'sine',.1);},
    feed(){beep(200,.15,'triangle',.15);beep(300,.2,'sine',.12);},level(){beep(440,.1,'sine',.12);beep(554,.1,'sine',.12);beep(659,.2,'sine',.14);},
    hit(){beep(180,.08,'sawtooth',.12);},ui(){beep(700,.04,'sine',.06);},weather(){beep(120,.3,'triangle',.08);},unlock(){beep(523,.1,'sine',.1);beep(784,.2,'sine',.12);}};
})();

const state={
  coins:50,xp:0,level:1,heart:0,dayKey:todayKey(),mults:null,
  seasonIdx:0,weather:'clear',weatherUntil:0,cycleStart:Date.now(),dayIndex:0,
  plots:[],inventory:{wheat:4,carrot:3},products:{},unlockedHybrids:[],animals:[],
  storyIdx:0,storiesRead:[0],selectedTool:'hand',selectedPlot:-1,zone:'main',
  pests:[],nightActive:false,order:null,ordersDone:0,scarecrows:0,muted:false,lastSave:0,
};

function plotsUnlocked(){let n=4;for(let i=1;i<HEART_THRESHOLDS.length;i++)if(state.heart>=HEART_THRESHOLDS[i])n=Math.min(24,4+i*2);n=Math.max(n,Math.min(24,4+Math.floor((state.level-1)/2)*2));return n;}
function gridSize(n){if(n<=4)return{cols:2,rows:2};if(n<=6)return{cols:3,rows:2};if(n<=9)return{cols:3,rows:3};if(n<=12)return{cols:4,rows:3};if(n<=16)return{cols:4,rows:4};return{cols:4,rows:6};}
function zoneUnlocked(z){return state.heart>=z.needHeart&&state.level>=z.needLevel;}
function ensurePlots(){
  ['main','ruins','moon'].forEach(z=>{
    const need=z==='main'?plotsUnlocked():(zoneUnlocked(ZONES.find(x=>x.id===z))?Math.min(8,4+Math.floor(state.level/5)*2):0);
    const have=state.plots.filter(p=>p.zone===z).length;
    for(let i=have;i<Math.max(need,z==='main'?24:8);i++)state.plots.push({zone:z,locked:i>=need,cropId:null,plantedAt:0,watered:false,ready:false,pop:0,sway:Math.random()*6});
    state.plots.filter(p=>p.zone===z).forEach((p,i)=>{p.locked=i>=need;if(p.sway==null)p.sway=Math.random()*6;});
  });
}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._tm);toast._tm=setTimeout(()=>t.classList.remove('show'),2400);}
function addXp(n){state.xp+=n;while(state.level<30&&state.xp>=xpForLevel(state.level+1)){state.level++;AudioFX.level();toast('⬆️ Уровень '+state.level+'!');ensurePlots();maybeStory();}}
function maybeStory(){const want=Math.min(STORIES.length-1,Math.floor(state.level/3)+Math.floor(state.heart/60)+state.ordersDone);if(want>state.storyIdx){state.storyIdx=want;if(!state.storiesRead.includes(want))state.storiesRead.push(want);document.getElementById('story').textContent=STORIES[state.storyIdx];AudioFX.unlock();toast('📜 Новая записка!');}}
function feedHeart(amount){state.heart+=amount;ensurePlots();maybeStory();AudioFX.feed();toast('❤️ Сердце +'+amount);GFX.burstHeart();}
function season(){return SEASONS[state.seasonIdx%4];}
function seasonGrowMult(){const s=season();if(s==='spring')return .9;if(s==='summer')return state.weather==='drought'?1.35:1;if(s==='autumn')return 1.05;return 1.25;}
function seasonSellBonus(id){const s=season();if(s==='autumn'&&(id==='pumpkin'||id==='grape'))return 1.15;if(s==='summer'&&(id==='berry'||id==='melon'))return 1.1;if(s==='spring'&&(id==='carrot'||id==='wheat'))return 1.08;if(s==='winter'&&(id==='frostroot'||id==='potato'))return 1.12;return 1;}
function weatherGrowMult(){if(state.weather==='rain')return .85;if(state.weather==='drought')return 1.4;if(state.weather==='storm')return 1.2;return 1;}
function isNight(){const t=((Date.now()-state.cycleStart)%DAY_MS)/DAY_MS;return t>=.55&&t<.92;}
function cycleLabel(){const t=((Date.now()-state.cycleStart)%DAY_MS)/DAY_MS;if(t<.55)return{ico:'☀️',label:'День'};if(t<.92)return{ico:'🌙',label:'Ночь'};return{ico:'🌅',label:'Рассвет'};}
function rollWeather(){const s=season(),rnd=Math.random();let w='clear';if(s==='spring')w=rnd<.45?'rain':rnd<.55?'storm':'clear';else if(s==='summer')w=rnd<.35?'drought':rnd<.5?'storm':'clear';else if(s==='autumn')w=rnd<.4?'rain':rnd<.55?'storm':'clear';else w=rnd<.3?'storm':'clear';state.weather=w;state.weatherUntil=Date.now()+DAY_MS*(.4+Math.random()*.5);AudioFX.weather();toast((SEASON_EMO[s]||'')+' Погода: '+WX_RU[w]);}
function advanceTimeChunk(){state.dayIndex++;if(state.dayIndex%3===0){state.seasonIdx=(state.seasonIdx+1)%4;toast(SEASON_EMO[season()]+' Наступила '+SEASON_RU[season()]);}rollWeather();genOrder();}
function genOrder(){const unlocked=Object.values(CROPS).filter(c=>!c.hybrid&&state.level>=c.unlock);if(!unlocked.length){state.order=null;return;}const c=unlocked[Math.floor(Math.random()*unlocked.length)];const qty=1+Math.floor(Math.random()*3);state.order={cropId:c.id,qty,progress:0,reward:Math.round(c.baseSell*qty*(1.3+Math.random()*.5)),xp:8+qty*3};renderOrder();}
function renderOrder(){const el=document.getElementById('order-chip');if(!state.order){el.style.display='none';return;}const c=CROPS[state.order.cropId];el.style.display='block';el.innerHTML=`<b>Заказ дня</b> ${c.emoji} ${c.name} ${state.order.progress}/${state.order.qty} · ${state.order.reward}🪙`;}
function updateGrowth(){const now=Date.now();if(now>state.weatherUntil)rollWeather();const gMult=seasonGrowMult()*weatherGrowMult();state.plots.forEach(p=>{if(!p.cropId||p.ready||p.locked)return;const crop=CROPS[p.cropId];let need=growSec(crop)*1000*gMult;if(!p.watered)need*=1.55;if(state.weather==='rain'&&!p.watered)p.watered=true;if(crop.nightOnly&&!isNight())return;if(now-p.plantedAt>=need){p.ready=true;p.pop=1;}});state.animals.forEach(a=>{const t=ANIMAL_TYPES[a.type];if(!t)return;let iv=t.interval*1000;if(a.trait==='ленивая'||a.trait==='сонная')iv*=1.35;if(a.trait==='прожорливая')iv*=.85;if(!a.ready&&now-a.lastProduce>=iv)a.ready=true;});}

/* ===== Canvas GFX v1.3 — volumetric 2.5D ===== */
const GFX=(function(){
  const canvas=document.getElementById('game');
  const ctx=canvas.getContext('2d');
  let W=390,H=520,dpr=1;
  const particles=[]; const coinsFly=[]; const clouds=[];
  for(let i=0;i<6;i++)clouds.push({x:Math.random()*400,y:20+Math.random()*90,s:.7+Math.random()*.9,sp:.12+Math.random()*.18});
  const rain=[]; for(let i=0;i<70;i++)rain.push({x:Math.random()*500,y:Math.random()*600,v:9+Math.random()*7,l:10+Math.random()*10});
  let hitMap=[], animalHit=[], pestHit=[];
  let bob=0, camScale=1.28;
  // deterministic decor seed positions (island-local)
  const DECOR=[
    {k:'tree',x:-0.32,y:-0.08,s:1.05},{k:'tree',x:0.34,y:-0.02,s:.9},
    {k:'bush',x:-0.18,y:0.18,s:1},{k:'bush',x:0.22,y:0.2,s:.85},
    {k:'rock',x:-0.38,y:0.12,s:1},{k:'rock',x:0.4,y:0.08,s:.8},
    {k:'fence',x:-0.08,y:0.26,s:1},{k:'tuft',x:0.12,y:-0.16,s:1},
    {k:'tuft',x:-0.28,y:0.02,s:1},{k:'flower',x:0.28,y:0.14,s:1},
    {k:'bush',x:0.05,y:-0.2,s:.7},{k:'rock',x:-0.05,y:0.22,s:.7}
  ];

  function resize(){
    const stage=canvas.parentElement.getBoundingClientRect();
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=Math.max(280,Math.floor(stage.width));
    H=Math.max(320,Math.floor(stage.height));
    canvas.width=Math.floor(W*dpr); canvas.height=Math.floor(H*dpr);
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    camScale=Math.min(1.42, Math.max(1.15, W/320));
  }
  window.addEventListener('resize',resize);

  function shade(hex,amt){
    const n=String(hex||'#888').replace('#','');
    const num=parseInt(n.length===3?n.split('').map(c=>c+c).join(''):n,16);
    let r=(num>>16)+amt,g=((num>>8)&255)+amt,b=(num&255)+amt;
    r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));
    return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }
  function rgba(hex,a){
    const n=String(hex).replace('#','');
    const num=parseInt(n.length===3?n.split('').map(c=>c+c).join(''):n,16);
    return `rgba(${(num>>16)&255},${(num>>8)&255},${num&255},${a})`;
  }
  function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function softShadow(x,y,rx,ry,a){
    ctx.save();ctx.fillStyle=`rgba(0,0,0,${a||.28})`;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function aoRing(x,y,rx,ry,a){
    const g=ctx.createRadialGradient(x,y,1,x,y,rx);
    g.addColorStop(0,`rgba(0,0,0,${a||.35})`);g.addColorStop(.55,`rgba(0,0,0,${(a||.35)*.35})`);g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();
  }
  function iso(col,row,ox,oy,tw,th){return{x:ox+(col-row)*tw/2,y:oy+(col+row)*th/2};}

  /** Raised isometric block with thick sides (Hay Day style) */
  function drawIsoBlock(x,y,tw,th,depth,topC,leftC,rightC,opts){
    opts=opts||{};
    // cast shadow slightly to bottom-right (light from top-left)
    softShadow(x+6,y+th/2+depth+4,tw*0.48,th*0.38,.22);
    // left face
    ctx.beginPath();
    ctx.moveTo(x-tw/2,y); ctx.lineTo(x,y+th/2); ctx.lineTo(x,y+th/2+depth); ctx.lineTo(x-tw/2,y+depth); ctx.closePath();
    const lg=ctx.createLinearGradient(x-tw/2,y,x,y+th/2+depth);
    lg.addColorStop(0,shade(leftC,8)); lg.addColorStop(1,shade(leftC,-18));
    ctx.fillStyle=lg; ctx.fill();
    // right face (darker)
    ctx.beginPath();
    ctx.moveTo(x+tw/2,y); ctx.lineTo(x,y+th/2); ctx.lineTo(x,y+th/2+depth); ctx.lineTo(x+tw/2,y+depth); ctx.closePath();
    const rg=ctx.createLinearGradient(x,y,x+tw/2,y+depth);
    rg.addColorStop(0,rightC); rg.addColorStop(1,shade(rightC,-22));
    ctx.fillStyle=rg; ctx.fill();
    // top face with gradient (light TL)
    ctx.beginPath();
    ctx.moveTo(x,y-th/2); ctx.lineTo(x+tw/2,y); ctx.lineTo(x,y+th/2); ctx.lineTo(x-tw/2,y); ctx.closePath();
    const tg=ctx.createLinearGradient(x-tw/2,y-th/2,x+tw/2,y+th/2);
    tg.addColorStop(0,shade(topC,28)); tg.addColorStop(.45,topC); tg.addColorStop(1,shade(topC,-18));
    ctx.fillStyle=tg; ctx.fill();
    // rim highlight on NW edges
    ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(x-tw/2,y); ctx.lineTo(x,y-th/2); ctx.lineTo(x+tw/2*0.15,y-th/2+th*0.08); ctx.stroke();
    // seam outline
    ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(x,y-th/2); ctx.lineTo(x+tw/2,y); ctx.lineTo(x,y+th/2); ctx.lineTo(x-tw/2,y); ctx.closePath(); ctx.stroke();
    if(opts.wet){
      ctx.fillStyle='rgba(80,140,200,.22)';
      ctx.beginPath(); ctx.moveTo(x,y-th/2); ctx.lineTo(x+tw/2,y); ctx.lineTo(x,y+th/2); ctx.lineTo(x-tw/2,y); ctx.closePath(); ctx.fill();
    }
    if(opts.furrow){
      ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1;
      for(let i=-2;i<=2;i++){
        ctx.beginPath();
        ctx.moveTo(x+i*tw*0.12, y-th/2+Math.abs(i)*2);
        ctx.lineTo(x+i*tw*0.12, y+th/2-Math.abs(i)*2);
        ctx.stroke();
      }
    }
  }


  function drawIsland(ox,oy,pal,phase){
    const rx=W*0.48, ry=H*0.175;
    const cliff=Math.min(102, H*0.19);
    // ground shadow
    softShadow(ox+14, oy+ry+cliff+22, rx*0.95, 24, .42);

    // ---- layered cliff as thick isometric cake ----
    // helper: ellipse plate at y-offset with fill
    function plate(yOff, sx, sy, colTop, colBot){
      const g=ctx.createLinearGradient(ox-sx, oy+yOff-sy, ox+sx, oy+yOff+sy+cliff*0.15);
      g.addColorStop(0,colTop); g.addColorStop(1,colBot);
      ctx.beginPath(); ctx.ellipse(ox, oy+yOff, sx, sy, 0, 0, Math.PI*2);
      ctx.fillStyle=g; ctx.fill();
    }
    // vertical cliff band (extruded ellipse sides)
    function cliffBand(y0, y1, sx0, sy0, sx1, sy1, cL, cR){
      // left dark-ish, right darker — approximate with two half fills
      ctx.beginPath();
      // bottom arc
      ctx.ellipse(ox, oy+y1, sx1, sy1, 0, 0.02*Math.PI, 0.98*Math.PI);
      // connect to top reverse
      ctx.ellipse(ox, oy+y0, sx0, sy0, 0, 0.98*Math.PI, 0.02*Math.PI, true);
      ctx.closePath();
      const g=ctx.createLinearGradient(ox-sx0, oy+y0, ox+sx0, oy+y1);
      g.addColorStop(0,cL); g.addColorStop(.45,shade(cL,-15)); g.addColorStop(1,cR);
      ctx.fillStyle=g; ctx.fill();
    }

    // deep rock
    cliffBand(ry*0.15, ry*0.15+cliff, rx*0.92, ry*0.85, rx*0.72, ry*0.55, '#5d4037', '#2a1a14');
    // mid soil
    cliffBand(ry*0.02, ry*0.02+cliff*0.62, rx*0.97, ry*0.92, rx*0.82, ry*0.7, '#8d6e63', '#4e342e');
    // upper lighter soil lip
    cliffBand(-2, cliff*0.28, rx*0.995, ry*0.98, rx*0.94, ry*0.88, '#a1887f', '#6d4c41');

    // strata lines on cliff
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(ox, oy+ry*0.1, rx*0.95, ry*0.9, 0, 0.05*Math.PI, 0.95*Math.PI);
    ctx.ellipse(ox, oy+ry*0.1+cliff*0.85, rx*0.75, ry*0.55, 0, 0.95*Math.PI, 0.05*Math.PI, true);
    ctx.clip();
    ctx.strokeStyle='rgba(0,0,0,.22)'; ctx.lineWidth=2;
    for(let i=0;i<6;i++){
      const yy=oy+ry*0.25+i*(cliff/7);
      ctx.beginPath();
      ctx.moveTo(ox-rx*(0.85-i*0.03), yy);
      ctx.quadraticCurveTo(ox, yy+8, ox+rx*(0.85-i*0.03), yy+i%2*3);
      ctx.stroke();
    }
    // highlight ridge on left cliff
    ctx.strokeStyle='rgba(255,220,180,.18)'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(ox-rx*0.9, oy+ry*0.2); ctx.quadraticCurveTo(ox-rx*0.75, oy+ry+cliff*0.4, ox-rx*0.55, oy+ry+cliff*0.75); ctx.stroke();
    ctx.restore();

    // hanging dirt cones
    ctx.fillStyle='#4e342e';
    for(let i=0;i<9;i++){
      const t=(i/8)*2-1;
      const hx=ox+t*rx*0.75;
      const hy=oy+ry*0.55+Math.abs(t)*6;
      ctx.beginPath();
      ctx.moveTo(hx-7,hy);
      ctx.quadraticCurveTo(hx-2, hy+22+i%3*8, hx, hy+cliff*(0.35+Math.abs(t)*0.15));
      ctx.quadraticCurveTo(hx+2, hy+10, hx+7, hy);
      ctx.fill();
    }

    // GRASS TOP with bevel
    const topG=ctx.createRadialGradient(ox-rx*0.28, oy-ry*0.4, 8, ox, oy, rx);
    topG.addColorStop(0, shade(pal.grass[0],40));
    topG.addColorStop(.5, pal.grass[0]);
    topG.addColorStop(1, shade(pal.grass[1],-8));
    ctx.beginPath(); ctx.ellipse(ox, oy, rx, ry, 0, 0, Math.PI*2);
    ctx.fillStyle=topG; ctx.fill();

    // clip texture onto top
    ctx.save();
    ctx.beginPath(); ctx.ellipse(ox, oy, rx, ry, 0, 0, Math.PI*2); ctx.clip();
    // light from TL
    const edge=ctx.createLinearGradient(ox-rx,oy-ry,ox+rx,oy+ry);
    edge.addColorStop(0,'rgba(255,255,255,.32)'); edge.addColorStop(.35,'rgba(255,255,255,0)'); edge.addColorStop(1,'rgba(0,0,0,.22)');
    ctx.fillStyle=edge; ctx.fillRect(ox-rx,oy-ry,rx*2,ry*2);
    // grass noise tufts
    for(let i=0;i<64;i++){
      const a=i*2.399, rr=Math.sqrt((i+1)/64);
      const tx=ox+Math.cos(a)*rx*rr*0.9, ty=oy+Math.sin(a)*ry*rr*0.9;
      ctx.fillStyle=i%3===0?rgba(shade(pal.grass[0],25),.5):rgba(shade(pal.grass[1],-20),.35);
      ctx.beginPath(); ctx.ellipse(tx,ty,2.4,1.3,a,0,Math.PI*2); ctx.fill();
      if(i%7===0){
        ctx.strokeStyle=shade(pal.grass[1],-10); ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(tx+(i%2?2:-2),ty-5); ctx.stroke();
      }
    }
    // path dirt near plots center
    ctx.fillStyle='rgba(121,85,72,.25)';
    ctx.beginPath(); ctx.ellipse(ox, oy+ry*0.15, rx*0.28, ry*0.22, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // raised grass rim (lip)
    ctx.strokeStyle=shade(pal.grass[0],45); ctx.lineWidth=4;
    ctx.beginPath(); ctx.ellipse(ox, oy, rx-2, ry-2, 0, -Math.PI*0.9, -Math.PI*0.12); ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=3.5;
    ctx.beginPath(); ctx.ellipse(ox, oy, rx-1.5, ry-1.5, 0, Math.PI*0.08, Math.PI*0.92); ctx.stroke();
    // outer outline
    ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(ox, oy, rx, ry, 0, 0, Math.PI*2); ctx.stroke();
  }

  function drawBush(x,y,s){
    aoRing(x,y+10*s,14*s,5*s,.3);
    softShadow(x+3,y+12*s,12*s,4*s,.2);
    ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
    const colors=['#43a047','#2e7d32','#66bb6a'];
    [[0,0,12],[ -9,-2,9],[9,-1,9],[0,-8,8]].forEach((p,i)=>{
      const g=ctx.createRadialGradient(p[0]-3,p[1]-3,1,p[0],p[1],p[2]);
      g.addColorStop(0,shade(colors[i%3],30)); g.addColorStop(1,shade(colors[i%3],-25));
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p[0],p[1],p[2],0,Math.PI*2); ctx.fill();
    });
    ctx.fillStyle='rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(-4,-6,3,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  function drawTree(x,y,s){
    aoRing(x,y+18*s,16*s,6*s,.32);
    softShadow(x+5,y+20*s,14*s,5*s,.22);
    ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
    // trunk volume
    const tg=ctx.createLinearGradient(-6,0,6,0);
    tg.addColorStop(0,'#6d4c41'); tg.addColorStop(.4,'#a1887f'); tg.addColorStop(1,'#4e342e');
    ctx.fillStyle=tg; ctx.beginPath(); ctx.moveTo(-5,18); ctx.lineTo(-3,-8); ctx.lineTo(3,-8); ctx.lineTo(5,18); ctx.closePath(); ctx.fill();
    // canopy layers
    [[0,-28,18,'#2e7d32'],[-10,-20,14,'#388e3c'],[10,-18,13,'#43a047'],[0,-36,12,'#66bb6a']].forEach(c=>{
      const g=ctx.createRadialGradient(c[0]-4,c[1]-4,2,c[0],c[1],c[2]);
      g.addColorStop(0,shade(c[3],40)); g.addColorStop(.6,c[3]); g.addColorStop(1,shade(c[3],-30));
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(c[0],c[1],c[2],0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.lineWidth=1; ctx.stroke();
    });
    ctx.fillStyle='rgba(255,255,255,.3)'; ctx.beginPath(); ctx.ellipse(-6,-34,5,3,-.4,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  function drawRock(x,y,s){
    aoRing(x,y+8*s,12*s,4*s,.28);
    softShadow(x+4,y+10*s,10*s,3.5*s,.2);
    ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
    const g=ctx.createLinearGradient(-10,-8,10,10);
    g.addColorStop(0,'#b0bec5'); g.addColorStop(.5,'#78909c'); g.addColorStop(1,'#455a64');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.moveTo(-12,4); ctx.lineTo(-8,-8); ctx.lineTo(4,-10); ctx.lineTo(12,0); ctx.lineTo(6,8); ctx.lineTo(-10,8); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(-8,-6); ctx.lineTo(-2,-8); ctx.lineTo(-4,-2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1; ctx.stroke();
    ctx.restore();
  }
  function drawFence(x,y,s){
    aoRing(x,y+8*s,18*s,4*s,.2);
    ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
    ctx.fillStyle='#8d6e63';
    for(let i=-1;i<=1;i++){ roundRect(i*14-2,-2,4,14,1); ctx.fill(); }
    ctx.fillStyle='#a1887f'; roundRect(-18,2,36,3,1); ctx.fill(); roundRect(-18,-4,36,3,1); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.2)'; roundRect(-18,-4,36,1.5,1); ctx.fill();
    ctx.restore();
  }
  function drawTuft(x,y){
    ctx.strokeStyle='#2e7d32'; ctx.lineWidth=1.6; ctx.lineCap='round';
    for(let i=-2;i<=2;i++){
      ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x+i*2,y-6, x+i*3.5,y-10-Math.abs(i)); ctx.stroke();
    }
  }
  function drawFlower(x,y){
    aoRing(x,y+4,6,2,.2);
    ctx.fillStyle='#e91e63';
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5; ctx.beginPath(); ctx.ellipse(x+Math.cos(a)*4,y+Math.sin(a)*3-6,3,2.2,a,0,Math.PI*2); ctx.fill();}
    ctx.fillStyle='#ffeb3b'; ctx.beginPath(); ctx.arc(x,y-6,2.5,0,Math.PI*2); ctx.fill();
  }

  function drawCrop(c,x,y,stage,sway,ready){
    const col=c.color||'#8bc34a';
    ctx.save(); ctx.translate(x,y); ctx.rotate(Math.sin(sway)*.05);
    if(stage<=0){
      aoRing(0,5,7,2.5,.25);
      ctx.fillStyle='#5d4037'; ctx.beginPath(); ctx.ellipse(0,0,4,2.5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.2)'; ctx.beginPath(); ctx.ellipse(-1,-1,1.5,1,0,0,Math.PI*2); ctx.fill();
    } else if(stage===1){
      aoRing(0,7,9,3,.25);
      ctx.strokeStyle='#2e7d32'; ctx.lineWidth=2.4; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(0,5); ctx.quadraticCurveTo(-1,-4,-5,-12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,5); ctx.quadraticCurveTo(1,-4,5,-12); ctx.stroke();
      [[-5,-12], [5,-12]].forEach(([lx,ly],i)=>{
        const g=ctx.createRadialGradient(lx-2,ly-1,1,lx,ly,6);
        g.addColorStop(0,'#c8e6c9'); g.addColorStop(1,'#43a047');
        ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(lx,ly,6,3.5,i?-0.5:0.5,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; ctx.stroke();
      });
    } else {
      aoRing(0,10,15,4.5,.32);
      softShadow(3,12,12,3.5,.18);
      const stem=ctx.createLinearGradient(0,8,0,-20);
      stem.addColorStop(0,'#1b5e20'); stem.addColorStop(1,'#81c784');
      ctx.strokeStyle=stem; ctx.lineWidth=3.2; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(0,8); ctx.quadraticCurveTo(4,-2,0,-18); ctx.stroke();
      // leaves
      ctx.fillStyle='#66bb6a';
      ctx.beginPath(); ctx.ellipse(-8,-6,7,3.5,-.6,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(8,-10,6,3,.5,0,Math.PI*2); ctx.fill();
      const rg=ctx.createRadialGradient(-4,-24,2,0,-20,13);
      rg.addColorStop(0,shade(col,45)); rg.addColorStop(.5,col); rg.addColorStop(1,shade(col,-40));
      ctx.fillStyle=rg;
      if(c.id==='wheat'||c.id==='goldcorn'||c.id==='corn'){
        ctx.beginPath(); ctx.ellipse(0,-24,6,14,0,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-2,-28,2.5,6,0,0,Math.PI*2); ctx.fill();
        // grains
        ctx.fillStyle=shade(col,-20);
        for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(-3+i%2*4,-18-i*4,2,2.5,0,0,Math.PI*2);ctx.fill();}
      } else if(c.id==='sunf'){
        for(let i=0;i<10;i++){const a=i*Math.PI/5;ctx.fillStyle=shade('#f9a825',i%2?10:-10);ctx.beginPath();ctx.ellipse(Math.cos(a)*11,-20+Math.sin(a)*11,6,3.2,a,0,Math.PI*2);ctx.fill();}
        const cg=ctx.createRadialGradient(-2,-22,1,0,-20,7); cg.addColorStop(0,'#6d4c41'); cg.addColorStop(1,'#3e2723');
        ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(0,-20,7,0,Math.PI*2); ctx.fill();
      } else if(c.id==='carrot'){
        const cg=ctx.createLinearGradient(0,-8,0,6); cg.addColorStop(0,'#ffb74d'); cg.addColorStop(1,'#e65100');
        ctx.fillStyle=cg; ctx.beginPath(); ctx.moveTo(-6,-8); ctx.lineTo(6,-8); ctx.lineTo(0,10); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#43a047'; ctx.beginPath(); ctx.ellipse(-3,-12,4,6,-.3,0,Math.PI*2); ctx.ellipse(3,-12,4,6,.3,0,Math.PI*2); ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(0,-20,11,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1.2; ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(-4,-24,3.5,0,Math.PI*2); ctx.fill();
        // rim light
        ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.arc(0,-20,11,-2.2,-0.6); ctx.stroke();
      }
      if(ready){
        ctx.strokeStyle='rgba(255,213,79,.9)'; ctx.lineWidth=2.2;
        ctx.beginPath(); ctx.arc(0,-20,15+Math.sin(sway*2),0,Math.PI*2); ctx.stroke();
        ctx.fillStyle='rgba(255,213,79,.5)'; ctx.beginPath(); ctx.arc(10,-32,2.5,0,Math.PI*2); ctx.fill();
      }
      if(c.id==='glow'||c.id==='moonfl'){ctx.save();ctx.shadowColor=col;ctx.shadowBlur=14;ctx.fillStyle=col;ctx.beginPath();ctx.arc(0,-20,8,0,Math.PI*2);ctx.fill();ctx.restore();}
    }
    ctx.restore();
  }

  function drawAnimal(type,x,y,phase,ready){
    aoRing(x,y+12,18,5,.32);
    softShadow(x+4,y+14,14,4,.2);
    ctx.save(); ctx.translate(x,y+Math.sin(phase)*.9);
    const walk=Math.sin(phase*4);
    if(type==='chicken'){
      // body volume
      const g=ctx.createRadialGradient(-4,-6,2,0,-2,14);
      g.addColorStop(0,'#fffde7'); g.addColorStop(1,'#ffe0b2');
      ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(0,-2,12,10,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='#ff8a65'; ctx.beginPath(); ctx.moveTo(10,-2); ctx.lineTo(17,0); ctx.lineTo(10,3); ctx.fill();
      ctx.fillStyle='#e53935'; ctx.beginPath(); ctx.arc(0,-12,4.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(4,-5,1.6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(-4,-6,2.5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#ff8a65'; ctx.lineWidth=2.2;
      ctx.beginPath(); ctx.moveTo(-4,8); ctx.lineTo(-4+walk*3,14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(4,8); ctx.lineTo(4-walk*3,14); ctx.stroke();
    } else if(type==='cow'){
      const g=ctx.createLinearGradient(-16,-12,16,10);
      g.addColorStop(0,'#fafafa'); g.addColorStop(1,'#d7ccc8');
      ctx.fillStyle=g; roundRect(-18,-12,34,22,7); ctx.fill();
      ctx.fillStyle='#5d4037'; ctx.beginPath(); ctx.ellipse(-6,-2,5,4,0,0,Math.PI*2); ctx.ellipse(8,4,4,3,0,0,Math.PI*2); ctx.fill();
      const hg=ctx.createLinearGradient(8,-18,24,-6); hg.addColorStop(0,'#fff'); hg.addColorStop(1,'#bcaaa4');
      ctx.fillStyle=hg; roundRect(10,-18,16,14,5); ctx.fill();
      ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(20,-12,1.7,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#6d4c41'; ctx.lineWidth=2.4;
      ctx.beginPath(); ctx.moveTo(-10,10); ctx.lineTo(-10+walk*2,18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(8,10); ctx.lineTo(8-walk*2,18); ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-8,-8,5,3,0,0,Math.PI*2); ctx.fill();
    } else {
      const g=ctx.createRadialGradient(-6,-6,2,0,-2,18);
      g.addColorStop(0,'#ffffff'); g.addColorStop(1,'#e0e0e0');
      ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(0,-2,17,13,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#eee'; ctx.beginPath(); ctx.arc(13,-6,8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(15,-7,1.6,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#bdbdbd'; ctx.lineWidth=2.2;
      ctx.beginPath(); ctx.moveTo(-8,10); ctx.lineTo(-8+walk*2,16); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6,10); ctx.lineTo(6-walk*2,16); ctx.stroke();
    }
    if(ready){ctx.fillStyle='#ffd54f';ctx.font='bold 13px sans-serif';ctx.fillText('●',10,-20);}
    ctx.restore();
  }

  function drawHeart(x,y,pulse){
    aoRing(x,y+16,20,6,.35);
    softShadow(x+4,y+18,16,5,.22);
    ctx.save(); ctx.translate(x,y); ctx.scale(1+pulse*.1,1+pulse*.1);
    // pedestal
    drawIsoBlock(0,14,36,16,8,'#ce93d8','#8e24aa','#6a1b9a',{});
    const g=ctx.createRadialGradient(-5,-6,2,0,0,18);
    g.addColorStop(0,'#ff80ab'); g.addColorStop(.55,'#e91e8c'); g.addColorStop(1,'#880e4f');
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.moveTo(0,10); ctx.bezierCurveTo(-20,-6,-12,-22,0,-12); ctx.bezierCurveTo(12,-22,20,-6,0,10);
    ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.45)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(-6,-8); ctx.bezierCurveTo(-10,-14,-4,-18,0,-14); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(-5,-8,4.5,3.2,-.4,0,Math.PI*2); ctx.fill();
    // glow
    ctx.shadowColor='#e91e8c'; ctx.shadowBlur=12; ctx.globalAlpha=.35;
    ctx.beginPath(); ctx.arc(0,-2,10,0,Math.PI*2); ctx.fillStyle='#ff80ab'; ctx.fill();
    ctx.restore();
  }

  function drawScarecrow(x,y){
    aoRing(x,y+18,14,5,.3);
    softShadow(x+4,y+20,12,4,.2);
    ctx.save(); ctx.translate(x,y);
    ctx.strokeStyle='#5d4037'; ctx.lineWidth=3.5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(0,20); ctx.lineTo(0,-10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-16,-2); ctx.lineTo(16,-2); ctx.stroke();
    // shirt volume
    const sg=ctx.createLinearGradient(-14,-2,14,16);
    sg.addColorStop(0,'#81d4fa'); sg.addColorStop(1,'#0277bd');
    ctx.fillStyle=sg; ctx.beginPath(); ctx.moveTo(-12,-2); ctx.lineTo(12,-2); ctx.lineTo(10,16); ctx.lineTo(-10,16); ctx.closePath(); ctx.fill();
    const hg=ctx.createRadialGradient(-3,-18,2,0,-14,10);
    hg.addColorStop(0,'#ffb74d'); hg.addColorStop(1,'#ef6c00');
    ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(0,-14,9,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#5d4037'; roundRect(-11,-24,22,7,2); ctx.fill();
    ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(-3,-15,1.5,0,Math.PI*2); ctx.arc(3,-15,1.5,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  function drawPest(x,y,phase){
    aoRing(x,y+8,12,3.5,.3);
    ctx.save(); ctx.translate(x,y+Math.sin(phase*6)*2); ctx.rotate(Math.sin(phase*4)*.12);
    const g=ctx.createRadialGradient(-3,-2,1,0,0,12);
    g.addColorStop(0,'#9ccc65'); g.addColorStop(1,'#33691e');
    ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(0,0,12,7,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle='#1b5e20'; ctx.beginPath(); ctx.ellipse(-3,-2,5,3.5,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ffeb3b'; ctx.beginPath(); ctx.arc(7,-2,1.8,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#1b5e20'; ctx.lineWidth=1.6;
    for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-7+i*5,5);ctx.lineTo(-9+i*5,11);ctx.stroke();}
    ctx.restore();
  }

  /** Proper isometric house with 3 faces + roof volume */
  function drawHut(x,y){
    aoRing(x,y+36,42,12,.35);
    softShadow(x+10,y+40,36,10,.25);
    ctx.save(); ctx.translate(x,y);
    const hw=34, hh=22, hd=18; // half-width, half-height of top diamond, wall depth
    // left wall
    ctx.beginPath();
    ctx.moveTo(-hw,0); ctx.lineTo(0,hh); ctx.lineTo(0,hh+hd); ctx.lineTo(-hw,hd); ctx.closePath();
    const lw=ctx.createLinearGradient(-hw,0,0,hh+hd);
    lw.addColorStop(0,'#d7ccc8'); lw.addColorStop(1,'#8d6e63');
    ctx.fillStyle=lw; ctx.fill();
    // right wall (darker)
    ctx.beginPath();
    ctx.moveTo(hw,0); ctx.lineTo(0,hh); ctx.lineTo(0,hh+hd); ctx.lineTo(hw,hd); ctx.closePath();
    const rw=ctx.createLinearGradient(0,0,hw,hd);
    rw.addColorStop(0,'#a1887f'); rw.addColorStop(1,'#5d4037');
    ctx.fillStyle=rw; ctx.fill();
    // door on right-ish
    ctx.fillStyle='#4e342e';
    ctx.beginPath(); ctx.moveTo(6,hh*0.35); ctx.lineTo(16,hh*0.15); ctx.lineTo(16,hh+hd-2); ctx.lineTo(6,hh+hd-2); ctx.closePath(); ctx.fill();
    // window on left
    ctx.fillStyle='#81d4fa';
    ctx.beginPath(); ctx.moveTo(-18,6); ctx.lineTo(-8,12); ctx.lineTo(-8,22); ctx.lineTo(-18,16); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.45)'; ctx.lineWidth=1; ctx.stroke();
    // roof left
    ctx.beginPath();
    ctx.moveTo(-hw-6,-2); ctx.lineTo(0,-32); ctx.lineTo(0,hh); ctx.lineTo(-hw,0); ctx.closePath();
    const rl=ctx.createLinearGradient(-hw,-20,0,0);
    rl.addColorStop(0,'#ef9a9a'); rl.addColorStop(.5,'#e53935'); rl.addColorStop(1,'#b71c1c');
    ctx.fillStyle=rl; ctx.fill();
    // roof right
    ctx.beginPath();
    ctx.moveTo(hw+6,-2); ctx.lineTo(0,-32); ctx.lineTo(0,hh); ctx.lineTo(hw,0); ctx.closePath();
    const rr=ctx.createLinearGradient(0,-20,hw,0);
    rr.addColorStop(0,'#c62828'); rr.addColorStop(1,'#7f0000');
    ctx.fillStyle=rr; ctx.fill();
    // roof ridge highlight
    ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(-hw*0.4,-14); ctx.lineTo(0,-30); ctx.stroke();
    // chimney
    ctx.fillStyle='#78909c'; roundRect(10,-36,10,16,1); ctx.fill();
    ctx.fillStyle='#546e7a'; ctx.fillRect(8,-38,14,4);
    ctx.restore();
  }

  function drawRuins(x,y){
    aoRing(x,y+28,36,10,.3);
    softShadow(x+8,y+32,28,8,.22);
    ctx.save(); ctx.translate(x,y);
    // iso pillars
    [[-20,0,14,36],[8,-6,16,30],[ -2,10,18,20]].forEach((p,i)=>{
      const top=i===0?'#b0bec5':'#90a4ae';
      drawIsoBlock(p[0],p[1],p[2],p[2]*0.5,p[3]*0.35,top,shade(top,-20),shade(top,-35),{});
    });
    ctx.restore();
  }

  function zonePalette(){
    if(state.zone==='ruins')return{grass:['#8a9a6a','#5a6a45'],soil:['#6d4c41','#4e342e'],sky:['#78909c','#37474f']};
    if(state.zone==='moon')return{grass:['#6a7aba','#3a4a8a'],soil:['#4a3a6a','#2a2048'],sky:['#1a1a3a','#0a0a20']};
    if(state.zone==='pen')return{grass:['#8bc34a','#558b2f'],soil:['#8d6e63','#6d4c41'],sky:['#4fc3f7','#81c784']};
    return{grass:['#66bb6a','#2e7d32'],soil:['#a1887f','#5d4037'],sky:['#4fc3f7','#e8f5e9']};
  }

  let _lw=0,_lh=0;
  function frame(now){
    const stage=canvas.parentElement.getBoundingClientRect();
    if(Math.floor(stage.width)!==_lw || Math.floor(stage.height)!==_lh){ _lw=Math.floor(stage.width); _lh=Math.floor(stage.height); resize(); }
    bob=Math.sin(now/900)*.01;
    const phase=now/1000;
    hitMap=[]; animalHit=[]; pestHit=[];
    const pal=zonePalette();
    const night=isNight();

    // sky
    const sky=ctx.createLinearGradient(0,0,0,H);
    if(night){sky.addColorStop(0,'#0a1628');sky.addColorStop(.6,'#152238');sky.addColorStop(1,'#1c2e44');}
    else if(state.weather==='storm'){sky.addColorStop(0,'#37474f');sky.addColorStop(1,'#263238');}
    else if(season()==='autumn'){sky.addColorStop(0,'#64b5f6');sky.addColorStop(1,'#ffe0b2');}
    else if(season()==='winter'){sky.addColorStop(0,'#e3f2fd');sky.addColorStop(1,'#cfd8dc');}
    else {sky.addColorStop(0,pal.sky[0]);sky.addColorStop(.7,'#b3e5fc');sky.addColorStop(1,pal.sky[1]||'#e8f5e9');}
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    // sun / moon
    if(!night && state.weather!=='storm'){
      const sx=W*0.18, sy=H*0.12;
      const sg=ctx.createRadialGradient(sx,sy,4,sx,sy,40);
      sg.addColorStop(0,'#fff59d'); sg.addColorStop(.4,'rgba(255,213,79,.55)'); sg.addColorStop(1,'rgba(255,213,79,0)');
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sx,sy,40,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#ffe082'; ctx.beginPath(); ctx.arc(sx,sy,14,0,Math.PI*2); ctx.fill();
    } else if(night){
      ctx.fillStyle='#eceff1'; ctx.beginPath(); ctx.arc(W*0.78,H*0.1,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.7)';
      for(let i=0;i<18;i++){ctx.fillRect((i*97%W), (i*53%H*0.35), 2,2);}
    }

    // clouds
    clouds.forEach(c=>{
      c.x+=c.sp; if(c.x>W+80)c.x=-80;
      ctx.save(); ctx.globalAlpha=night?.12:.5;
      softShadow(c.x,c.y+10,30*c.s,9*c.s,.12);
      const cg=ctx.createLinearGradient(c.x,c.y-10,c.x,c.y+12);
      cg.addColorStop(0,'#fff'); cg.addColorStop(1,'#e3f2fd');
      ctx.fillStyle=cg;
      ctx.beginPath();
      ctx.ellipse(c.x,c.y,24*c.s,11*c.s,0,0,Math.PI*2);
      ctx.ellipse(c.x-16*c.s,c.y+3,15*c.s,9*c.s,0,0,Math.PI*2);
      ctx.ellipse(c.x+16*c.s,c.y+3,15*c.s,9*c.s,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    });

    // camera zoom — farm fills screen
    const ox=W/2, oy=H*0.42+bob*36;
    ctx.save();
    ctx.translate(W/2, H*0.48);
    ctx.scale(camScale, camScale);
    ctx.translate(-W/2, -H*0.48);

    drawIsland(ox, oy, pal, phase);

    // depth-sorted world objects
    const sprites=[];
    // decor
    DECOR.forEach(d=>{
      const dx=ox+d.x*W*0.42, dy=oy+d.y*H*0.22;
      sprites.push({z:dy, draw:()=>{
        if(d.k==='tree') drawTree(dx,dy,d.s);
        else if(d.k==='bush') drawBush(dx,dy,d.s);
        else if(d.k==='rock') drawRock(dx,dy,d.s);
        else if(d.k==='fence') drawFence(dx,dy,d.s);
        else if(d.k==='tuft') drawTuft(dx,dy);
        else if(d.k==='flower') drawFlower(dx,dy);
      }});
    });

    sprites.push({z:oy-80, draw:()=>{
      drawHeart(ox, oy-78, Math.sin(phase*2)*.5+.5);
      const hp=Math.min(1,state.heart/(HEART_THRESHOLDS[HEART_THRESHOLDS.length-1]||600));
      ctx.fillStyle='rgba(0,0,0,.45)'; roundRect(ox-58,oy-118,116,11,5); ctx.fill();
      const hg=ctx.createLinearGradient(ox-58,0,ox+58,0); hg.addColorStop(0,'#e91e8c'); hg.addColorStop(1,'#ff80ab');
      ctx.fillStyle=hg; roundRect(ox-58,oy-118,116*hp,11,5); ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center';
      ctx.fillText('Сердце острова', ox, oy-106);
    }});

    if(state.zone==='ruins') sprites.push({z:oy+5, draw:()=>drawRuins(ox+95, oy-5)});
    else if(state.zone!=='pen') sprites.push({z:oy+5, draw:()=>drawHut(ox-115, oy-8)});
    if(state.scarecrows>0) sprites.push({z:oy+25, draw:()=>drawScarecrow(ox+80, oy+8)});

    // plots
    const zonePlots=[]; state.plots.forEach((p,i)=>{if(p.zone===state.zone)zonePlots.push({p,i});});
    const need=state.zone==='main'?plotsUnlocked():(zoneUnlocked(ZONES.find(z=>z.id===state.zone))?Math.min(8,4+Math.floor(state.level/5)*2):0);
    zonePlots.forEach(({p},k)=>{p.locked=k>=need;});
    const show=Math.max(need,4);
    const {cols,rows}=gridSize(Math.min(show, zonePlots.length||4));
    const tw=Math.min(72, Math.floor(W/(cols+0.6)));
    const th=tw*0.52;
    const depth=Math.max(16, Math.floor(tw*0.28));
    const gridOx=ox, gridOy=oy+6;
    const gMult=seasonGrowMult()*weatherGrowMult();
    const nowMs=Date.now();

    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const k=r*cols+c; if(k>=zonePlots.length) continue;
        const {p,i}=zonePlots[k];
        const pos=iso(c,r,gridOx,gridOy,tw,th);
        sprites.push({z:pos.y+depth, i, p, pos, draw:null});
      }
    }

    // animals
    if(state.zone==='pen'){
      state.animals.forEach((a,idx)=>{
        const ax=ox-70+(idx%3)*60+Math.sin(phase*.7+idx)*10;
        const ay=oy+35+Math.floor(idx/3)*55+Math.cos(phase*.5+idx)*5;
        sprites.push({z:ay+16, draw:()=>{
          drawAnimal(a.type,ax,ay,phase+idx,a.ready);
          animalHit.push({idx,x:ax,y:ay});
        }});
      });
      if(!state.animals.length){
        sprites.push({z:oy+50, draw:()=>{
          ctx.fillStyle='rgba(255,255,255,.85)'; ctx.font='bold 13px sans-serif'; ctx.textAlign='center';
          ctx.fillText('Купи животных на рынке', ox, oy+50);
        }});
      }
    }

    sprites.sort((a,b)=>a.z-b.z);
    sprites.forEach(s=>{
      if(s.draw){ s.draw(); return; }
      // plot
      const {p,i,pos}=s;
      const top=p.locked?'#607d8b':(p.watered?shade(pal.soil[0],25):shade(pal.soil[0],10));
      const left=p.locked?'#455a64':shade(pal.soil[1],5);
      const right=p.locked?'#37474f':shade(pal.soil[1],-25);
      drawIsoBlock(pos.x,pos.y,tw,th,depth,top,left,right,{wet:!!p.watered && !p.locked, furrow:!p.locked});
      if(state.selectedPlot===i){
        ctx.strokeStyle='#ffd54f'; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.moveTo(pos.x,pos.y-th/2); ctx.lineTo(pos.x+tw/2,pos.y); ctx.lineTo(pos.x,pos.y+th/2); ctx.lineTo(pos.x-tw/2,pos.y); ctx.closePath(); ctx.stroke();
        ctx.strokeStyle='rgba(255,213,79,.35)'; ctx.lineWidth=5; ctx.stroke();
      }
      if(p.locked){
        ctx.fillStyle='rgba(0,0,0,.4)'; ctx.font=`${Math.floor(tw*0.32)}px sans-serif`; ctx.textAlign='center';
        ctx.fillText('🔒', pos.x, pos.y+4);
      } else if(p.cropId){
        const crop=CROPS[p.cropId];
        let stage=0;
        if(p.ready) stage=2; else if(p.watered) stage=1; else stage=0;
        if(!p.ready){let needT=growSec(crop)*1000*gMult;if(!p.watered)needT*=1.55;const pct=Math.min(1,(nowMs-p.plantedAt)/needT);if(pct>.35)stage=1;if(pct>.75)stage=2;}
        if(p.pop>0) p.pop=Math.max(0,p.pop-0.04);
        const popScale=1+(p.pop||0)*0.4;
        ctx.save(); ctx.translate(pos.x, pos.y-6); ctx.scale(popScale,popScale);
        drawCrop(crop,0,0,stage,phase*2+p.sway,p.ready);
        ctx.restore();
        if(!p.ready){
          let needT=growSec(crop)*1000*gMult; if(!p.watered)needT*=1.55;
          const pct=Math.min(1,(nowMs-p.plantedAt)/needT);
          ctx.fillStyle='rgba(0,0,0,.45)'; roundRect(pos.x-18,pos.y+th/2+depth-6,36,5,2); ctx.fill();
          ctx.fillStyle='#81c784'; roundRect(pos.x-18,pos.y+th/2+depth-6,36*pct,5,2); ctx.fill();
        }
      }
      hitMap.push({i,x:pos.x,y:pos.y,tw,th});
    });

    // pests (after world)
    state.pests.forEach(pe=>{
      const px=pe.x/100*W, py=pe.y/100*H;
      drawPest(px,py,phase+pe.x);
      pestHit.push({pe,x:px,y:py});
    });

    ctx.restore(); // camera

    // weather
    if(state.weather==='rain'||state.weather==='storm'){
      ctx.strokeStyle=state.weather==='storm'?'rgba(200,220,255,.6)':'rgba(170,200,255,.45)';
      ctx.lineWidth=1.6;
      rain.forEach(r=>{
        r.y+=r.v*(state.weather==='storm'?1.5:1); r.x+=state.weather==='storm'?1.6:.55;
        if(r.y>H){r.y=-10;r.x=Math.random()*W;}
        ctx.beginPath(); ctx.moveTo(r.x,r.y); ctx.lineTo(r.x-1.5,r.y+r.l); ctx.stroke();
      });
      if(state.weather==='storm'&&Math.random()<.012){ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(0,0,W,H);}
    }

    // day/night + drought tint
    if(night){ctx.fillStyle='rgba(8,16,40,.36)';ctx.fillRect(0,0,W,H);}
    if(state.weather==='drought'&&!night){ctx.fillStyle='rgba(255,170,60,.14)';ctx.fillRect(0,0,W,H);}

    // particles
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=.12; p.life-=.02; p.r*=.98;
      ctx.globalAlpha=Math.max(0,p.life); ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
      if(p.life<=0)particles.splice(i,1);
    }
    for(let i=coinsFly.length-1;i>=0;i--){
      const c=coinsFly[i]; const u=c.t; c.t+=.04;
      const x=c.x0+(c.x1-c.x0)*u; const y=c.y0+(c.y1-c.y0)*u-Math.sin(u*Math.PI)*40;
      softShadow(x+2,y+4,6,3,.25);
      const cg=ctx.createRadialGradient(x-2,y-2,1,x,y,7);
      cg.addColorStop(0,'#fff59d'); cg.addColorStop(1,'#f9a825');
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; ctx.stroke();
      if(c.t>=1)coinsFly.splice(i,1);
    }

    // subtle bloom (brighten highlights) + vignette
    ctx.save();
    ctx.globalCompositeOperation='soft-light';
    const bloom=ctx.createRadialGradient(W*0.35,H*0.28,10,W*0.5,H*0.45,W*0.7);
    bloom.addColorStop(0,'rgba(255,255,220,.35)'); bloom.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=bloom; ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='source-over';
    const vig=ctx.createRadialGradient(W/2,H/2,H*0.25,W/2,H/2,H*0.78);
    vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,.28)');
    ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
    ctx.restore();

    requestAnimationFrame(frame);
  }

  function spawnParticles(x,y,color,n){
    for(let i=0;i<(n||8);i++)particles.push({x,y,vx:(Math.random()-.5)*4.5,vy:-2-Math.random()*3.5,r:2+Math.random()*3.5,life:1,color:color||'#ffd54f'});
  }
  function flyCoin(x,y){
    const br=document.getElementById('coins').getBoundingClientRect();
    const cr=canvas.getBoundingClientRect();
    coinsFly.push({x0:x,y0:y,x1:br.left-cr.left+10,y1:br.top-cr.top+10,t:0});
  }
  function burstHeart(){spawnParticles(W/2,H*0.28,'#ff80ab',16);}

  function pick(clientX,clientY){
    const rect=canvas.getBoundingClientRect();
    // account for camera scale around (W/2, H*0.48)
    let x=(clientX-rect.left)*(W/rect.width), y=(clientY-rect.top)*(H/rect.height);
    const cx=W/2, cy=H*0.48;
    x=(x-cx)/camScale+cx; y=(y-cy)/camScale+cy;
    for(let i=pestHit.length-1;i>=0;i--){const h=pestHit[i];if(Math.hypot(h.x-x,h.y-y)<24)return{type:'pest',pe:h.pe};}
    for(const h of animalHit){if(Math.hypot(h.x-x,h.y-y)<30)return{type:'animal',idx:h.idx};}
    if(Math.hypot(W/2-x,(H*0.42-78)-y)<32)return{type:'heart'};
    for(let i=hitMap.length-1;i>=0;i--){
      const h=hitMap[i];
      const dx=Math.abs(x-h.x), dy=Math.abs(y-h.y);
      if(dx/h.tw+dy/h.th < .6) return{type:'plot',i:h.i,x:h.x,y:h.y};
    }
    return null;
  }

  canvas.addEventListener('pointerdown',e=>{
    const hit=pick(e.clientX,e.clientY);
    if(!hit)return;
    if(hit.type==='pest'){squashPest(hit.pe);spawnParticles(hit.pe.x/100*W,hit.pe.y/100*H,'#8bc34a',10);return;}
    if(hit.type==='animal'){collectAnimal(hit.idx);return;}
    if(hit.type==='plot'){onPlotTap(hit.i,hit.x,hit.y);}
  });

  function start(){resize();requestAnimationFrame(frame);}
  function drawIntro(){
    const c=document.getElementById('intro-art'); if(!c)return; const g=c.getContext('2d');
    g.clearRect(0,0,160,120);
    const sky=g.createLinearGradient(0,0,0,90); sky.addColorStop(0,'#4fc3f7'); sky.addColorStop(1,'#e1f5fe');
    g.fillStyle=sky; g.fillRect(0,0,160,90);
    // volumetric island mini
    g.fillStyle='rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(80,102,55,8,0,0,Math.PI*2); g.fill();
    g.fillStyle='#5d4037'; g.beginPath(); g.moveTo(25,78); g.quadraticCurveTo(80,118,135,78); g.lineTo(130,70); g.quadraticCurveTo(80,95,30,70); g.fill();
    const ig=g.createRadialGradient(60,55,5,80,70,60); ig.addColorStop(0,'#9ccc65'); ig.addColorStop(1,'#2e7d32');
    g.fillStyle=ig; g.beginPath(); g.ellipse(80,68,58,24,0,0,Math.PI*2); g.fill();
    // mini hut
    g.fillStyle='#e53935'; g.beginPath(); g.moveTo(40,62); g.lineTo(55,48); g.lineTo(70,62); g.fill();
    g.fillStyle='#bcaaa4'; g.fillRect(44,62,22,14);
    // heart
    g.fillStyle='#e91e8c'; g.beginPath(); g.moveTo(80,52); g.bezierCurveTo(68,40,62,52,80,62); g.bezierCurveTo(98,52,92,40,80,52); g.fill();
  }

  return{start,drawIntro,spawnParticles,flyCoin,burstHeart,pick,get size(){return{W,H};}};
})();



function renderZones(){const bar=document.getElementById('zonebar');bar.innerHTML='';ZONES.forEach(z=>{const ok=zoneUnlocked(z);const b=document.createElement('button');b.className='zbtn'+(state.zone===z.id?' on':'');b.disabled=!ok;b.textContent=z.emoji+' '+z.name+(ok?'':' 🔒');b.onclick=()=>{if(!ok)return;state.zone=z.id;AudioFX.ui();renderToolbar();};bar.appendChild(b);});}
function renderToolbar(){
  const tb=document.getElementById('toolbar');
  const tools=[{id:'hand',ico:'👆',label:'Рука',price:''},{id:'water',ico:'💧',label:'Полив',price:''},{id:'feed',ico:'❤️',label:'Кормить',price:''},{id:'scare',ico:'🎃',label:'Пугало',price:'15🪙'}];
  const seeds=Object.values(CROPS).filter(c=>c.hybrid?((state.inventory[c.id]>0)||state.unlockedHybrids.includes(c.id)):state.level>=c.unlock);
  let html='';tools.forEach(t=>{html+=`<button class="tool ${state.selectedTool===t.id?'active':''}" data-tool="${t.id}"><span class="t-ico">${t.ico}</span>${t.label}<div class="t-price">${t.price}</div></button>`;});
  seeds.forEach(c=>{const owned=state.inventory[c.id]||0;const tid='seed:'+c.id;html+=`<button class="tool ${state.selectedTool===tid?'active':''}" data-tool="${tid}"><span class="t-ico">${c.emoji}</span>${c.name}<div class="t-price">${owned>0?('×'+owned):(c.hybrid?'—':c.cost+'🪙')}</div></button>`;});
  tb.innerHTML=html;tb.querySelectorAll('.tool').forEach(btn=>{btn.onclick=()=>{state.selectedTool=btn.dataset.tool;AudioFX.ui();renderToolbar();};});
}
function renderGrid(){/* canvas handles visuals */ ensurePlots();}
function updateHUD(){document.getElementById('coins').textContent=state.coins;document.getElementById('level').textContent=state.level;const cl=cycleLabel();document.getElementById('tod-stat').textContent=cl.ico+' '+cl.label;document.getElementById('wx-stat').textContent=(SEASON_EMO[season()]||'')+' '+SEASON_RU[season()]+' · '+WX_RU[state.weather];document.getElementById('heart-pct').textContent=Math.round(Math.min(100,state.heart/(HEART_THRESHOLDS[HEART_THRESHOLDS.length-1]||600)*100))+'%';}
function applyWxClass(){}
function setNight(on){if(on&&!state.nightActive){state.nightActive=true;toast('🌙 Ночь! Береги посевы');}if(!on&&state.nightActive){state.nightActive=false;state.pests.slice().forEach(removePest);state.scarecrows=Math.max(0,state.scarecrows-1);toast('☀️ Рассвет');}}

function onPlotTap(i,sx,sy){
  const p=state.plots[i]; if(p.locked){toast('🔒 Корми Сердце или повысь уровень');return;}
  state.selectedPlot=i; const tool=state.selectedTool;
  if(tool==='hand'){if(p.ready&&p.cropId)harvest(i,sx,sy);else if(p.cropId)toast(CROPS[p.cropId].name+(p.watered?' растёт…':' — нужен полив!'));else toast('Выбери семена внизу');}
  else if(tool==='water'){if(!p.cropId)toast('Нечего поливать');else if(p.ready)toast('Уже созрело');else if(p.watered)toast('Уже полито');else{p.watered=true;AudioFX.water();toast('💧');GFX.spawnParticles(sx,sy,'#4fc3f7',8);}}
  else if(tool==='feed'){if(p.ready&&p.cropId){const crop=CROPS[p.cropId];const feed=Math.max(2,Math.round(crop.xp*1.5));p.cropId=null;p.plantedAt=0;p.watered=false;p.ready=false;feedHeart(feed);addXp(2);GFX.spawnParticles(sx,sy,'#e91e8c',12);}else toast('Скорми созревший урожай Сердцу');}
  else if(tool==='scare'){if(state.coins<15){toast('Нужно 15 монет');return;}state.coins-=15;state.scarecrows++;state.pests.slice().forEach(removePest);AudioFX.hit();toast('🎃 Пугало!');updateHUD();}
  else if(tool.startsWith('seed:'))plant(i,tool.slice(5),sx,sy);
  save();
}
function plant(i,id,sx,sy){const p=state.plots[i];if(p.locked||p.cropId){toast('Грядка занята');return;}const crop=CROPS[id];if(crop.zone&&crop.zone!==state.zone){toast('Другая зона');return;}if(crop.nightOnly&&!isNight()){toast('Только ночью');return;}let have=state.inventory[id]||0;if(have>0)state.inventory[id]=have-1;else if(!crop.hybrid){if(state.coins<crop.cost){toast('Мало монет');return;}state.coins-=crop.cost;}else{toast('Нет семян гибрида');return;}p.cropId=id;p.plantedAt=Date.now();p.watered=false;p.ready=false;p.pop=1;AudioFX.plant();toast('Посадили '+crop.emoji);GFX.spawnParticles(sx||200,sy||200,'#81c784',10);updateHUD();renderToolbar();}
function harvest(i,sx,sy){const p=state.plots[i];const crop=CROPS[p.cropId];let price=Math.round(sellPrice(p.cropId,state.mults)*seasonSellBonus(p.cropId));if(state.weather==='storm'&&Math.random()<.15){toast('💨 Шторм (−30%)');price=Math.round(price*.7);}state.coins+=price;addXp(crop.xp);if(Math.random()<.4)state.inventory[p.cropId]=(state.inventory[p.cropId]||0)+1;if(state.order&&state.order.cropId===p.cropId&&state.order.progress<state.order.qty){state.order.progress++;if(state.order.progress>=state.order.qty){state.coins+=state.order.reward;addXp(state.order.xp);state.ordersDone++;AudioFX.coin();toast('📦 Заказ +'+state.order.reward+'🪙');state.order=null;maybeStory();genOrder();}else renderOrder();}AudioFX.harvest();AudioFX.coin();toast(crop.emoji+' +'+price+'🪙');GFX.spawnParticles(sx,sy,crop.color,12);GFX.flyCoin(sx,sy);p.cropId=null;p.plantedAt=0;p.watered=false;p.ready=false;updateHUD();}
function collectAnimal(idx){const a=state.animals[idx];if(!a||!a.ready){toast('Ещё не готово');return;}const t=ANIMAL_TYPES[a.type];let price=t.produceSell;if(a.trait==='храбрая')price=Math.round(price*1.1);state.coins+=price;addXp(5);state.products[t.produce]=(state.products[t.produce]||0)+1;a.ready=false;a.lastProduce=Date.now();if(a.trait==='храбрая'&&state.pests.length){removePest(state.pests[0]);toast('🐔 Курица прогнала вредителя!');}AudioFX.coin();toast(t.produceEmoji+' +'+price+'🪙');updateHUD();save();}
function buyAnimal(typeId){const t=ANIMAL_TYPES[typeId];if(state.level<t.unlock){toast('Нужен ур.'+t.unlock);return;}if(!zoneUnlocked(ZONES.find(z=>z.id==='pen'))){toast('Сначала открой Загон');return;}if(state.animals.length>=6){toast('Макс. 6');return;}if(state.coins<t.cost){toast('Мало монет');return;}state.coins-=t.cost;const trait=t.traits[Math.floor(Math.random()*t.traits.length)];state.animals.push({type:typeId,trait,lastProduce:Date.now(),ready:false});AudioFX.unlock();toast(t.emoji+' «'+trait+'»');updateHUD();renderToolbar();save();}
function craft(resultId){const h=HYBRIDS.find(x=>x.result===resultId);if(!h)return;if((state.inventory[h.a]||0)<1||(state.inventory[h.b]||0)<1){toast('Нужны семена родителей');return;}state.inventory[h.a]--;state.inventory[h.b]--;state.inventory[resultId]=(state.inventory[resultId]||0)+1;if(!state.unlockedHybrids.includes(resultId)){state.unlockedHybrids.push(resultId);addXp(15);AudioFX.unlock();toast('🧬 '+CROPS[resultId].name);}else{AudioFX.plant();toast('🧬 '+CROPS[resultId].emoji);}renderToolbar();save();}

function openModal(html){document.getElementById('modal').innerHTML=html;document.getElementById('modal-bg').classList.add('open');AudioFX.ui();}
function closeModal(){document.getElementById('modal-bg').classList.remove('open');}
document.getElementById('modal-bg').addEventListener('click',e=>{if(e.target.id==='modal-bg')closeModal();});
function openMarket(){
  let html=`<h2>🏪 Летающий рынок</h2><p>${SEASON_EMO[season()]} ${SEASON_RU[season()]} · ${WX_RU[state.weather]} · ${state.dayKey}</p><div class="tabs"><button class="tab on" data-tab="prices">Цены</button><button class="tab" data-tab="buy">Семена</button><button class="tab" data-tab="craft">Гибриды</button><button class="tab" data-tab="animals">Животные</button></div><div id="mtab"></div><button class="btn ghost" id="mclose" style="width:100%;margin-top:8px">Закрыть</button>`;
  openModal(html);const tabBox=document.getElementById('mtab');
  function show(tab){document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.tab===tab));
    if(tab==='prices'){let rows='';Object.keys(CROPS).forEach(id=>{const c=CROPS[id];const price=Math.round(sellPrice(id,state.mults)*seasonSellBonus(id));const delta=((state.mults[id]-1)*100);rows+=`<div class="row"><span style="font-size:22px">${c.emoji}</span><div class="name">${c.name}<div class="delta ${delta>=0?'up':'down'}">${delta>=0?'+':''}${delta.toFixed(0)}%</div></div><div class="price">${price}🪙</div></div>`;});tabBox.innerHTML=rows;}
    else if(tab==='buy'){let rows='';Object.values(CROPS).filter(c=>!c.hybrid&&state.level>=c.unlock).forEach(c=>{rows+=`<div class="row"><span style="font-size:22px">${c.emoji}</span><div class="name">${c.name}</div><button class="btn" data-buy="${c.id}">${c.cost}🪙</button></div>`;});tabBox.innerHTML=rows;tabBox.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const c=CROPS[b.dataset.buy];if(state.coins<c.cost){toast('Мало монет');return;}state.coins-=c.cost;state.inventory[c.id]=(state.inventory[c.id]||0)+1;AudioFX.coin();updateHUD();renderToolbar();save();openMarket();setTimeout(()=>document.querySelector('.tab[data-tab=buy]')?.click(),0);});}
    else if(tab==='craft'){let rows='<p>По 1 семени родителей.</p>';const seen=new Set();HYBRIDS.forEach(h=>{if(seen.has(h.result))return;seen.add(h.result);const r=CROPS[h.result];rows+=`<div class="row"><span style="font-size:22px">${r.emoji}</span><div class="name">${r.name}<div class="hint">${CROPS[h.a].emoji}+${CROPS[h.b].emoji}</div></div><button class="btn" data-craft="${h.result}">Скрестить</button></div>`;});tabBox.innerHTML=rows;tabBox.querySelectorAll('[data-craft]').forEach(b=>b.onclick=()=>{craft(b.dataset.craft);openMarket();setTimeout(()=>document.querySelector('.tab[data-tab=craft]')?.click(),0);});}
    else{let rows='';Object.values(ANIMAL_TYPES).forEach(t=>{rows+=`<div class="row"><span style="font-size:22px">${t.emoji}</span><div class="name">${t.name}<div class="hint">ур.${t.unlock}</div></div><button class="btn" data-an="${t.id}">${t.cost}🪙</button></div>`;});tabBox.innerHTML=rows;tabBox.querySelectorAll('[data-an]').forEach(b=>b.onclick=()=>{buyAnimal(b.dataset.an);openMarket();setTimeout(()=>document.querySelector('.tab[data-tab=animals]')?.click(),0);});}
  }
  document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>show(t.dataset.tab)));document.getElementById('mclose').onclick=closeModal;show('prices');
}
function openBook(){const nextH=HEART_THRESHOLDS.find(t=>t>state.heart)||'макс';let html=`<h2>📖 Книга фермера</h2><p><b>Сердце:</b> ${state.heart} (порог ${nextH}) · <b>Заказы:</b> ${state.ordersDone}</p><div class="story">${STORIES[state.storyIdx]}</div><p><b>Гибриды:</b> ${state.unlockedHybrids.map(id=>CROPS[id].emoji).join(' ')||'нет'}</p><p class="hint">Объёмная 2D-графика · тени · анимации</p><button class="btn ghost" id="chk-upd" style="width:100%;margin:6px 0">Проверить обновления</button><button class="btn danger" id="reset-save">Сбросить прогресс</button> <button class="btn ghost" id="bclose">Закрыть</button>`;openModal(html);document.getElementById('bclose').onclick=closeModal;document.getElementById('reset-save').onclick=()=>{localStorage.removeItem(SAVE_KEY);location.reload();};document.getElementById('chk-upd').onclick=async()=>{closeModal();toast('Проверка…');const r=await checkForUpdates();if(r.upToDate)toast('Актуальная версия');if(r.skipped)toast('Манифест: '+r.reason);};}

function spawnPest(){if(state.pests.length>=7)return;if(state.scarecrows>0&&Math.random()<.4)return;const pe={id:Math.random().toString(36).slice(2),x:15+Math.random()*70,y:35+Math.random()*40};state.pests.push(pe);pe.timer=setTimeout(()=>{if(!state.pests.includes(pe))return;const cand=state.plots.map((p,i)=>({p,i})).filter(x=>x.p.cropId&&!x.p.locked&&x.p.zone===state.zone);if(cand.length){const pick=cand[Math.floor(Math.random()*cand.length)];pick.p.cropId=null;pick.p.plantedAt=0;pick.p.watered=false;pick.p.ready=false;toast('🐛 Урожай съеден!');}removePest(pe);},7500);}
function squashPest(pe){state.coins+=4;addXp(2);if(Math.random()<.28){state.inventory.moonfl=(state.inventory.moonfl||0)+1;if(!state.unlockedHybrids.includes('moonfl'))state.unlockedHybrids.push('moonfl');toast('🌙 Лунный цветок!');}else toast('💥 +4🪙');AudioFX.hit();removePest(pe);updateHUD();renderToolbar();save();}
function removePest(pe){clearTimeout(pe.timer);state.pests=state.pests.filter(x=>x!==pe);}

function save(){const data={coins:state.coins,xp:state.xp,level:state.level,heart:state.heart,dayKey:state.dayKey,seasonIdx:state.seasonIdx,weather:state.weather,weatherUntil:state.weatherUntil,dayIndex:state.dayIndex,inventory:state.inventory,products:state.products,unlockedHybrids:state.unlockedHybrids,animals:state.animals,storyIdx:state.storyIdx,storiesRead:state.storiesRead,cycleStart:state.cycleStart,order:state.order,ordersDone:state.ordersDone,muted:state.muted,plots:state.plots.map(p=>({zone:p.zone,locked:p.locked,cropId:p.cropId,plantedAt:p.plantedAt,watered:p.watered,ready:p.ready}))};try{localStorage.setItem(SAVE_KEY,JSON.stringify(data));}catch(e){}}
function load(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return false;const d=JSON.parse(raw);Object.assign(state,{coins:d.coins,xp:d.xp,level:d.level,heart:d.heart,dayKey:d.dayKey||todayKey(),seasonIdx:d.seasonIdx||0,weather:d.weather||'clear',weatherUntil:d.weatherUntil||0,dayIndex:d.dayIndex||0,inventory:d.inventory||{},products:d.products||{},unlockedHybrids:d.unlockedHybrids||[],animals:d.animals||[],storyIdx:d.storyIdx||0,storiesRead:d.storiesRead||[0],cycleStart:d.cycleStart||Date.now(),order:d.order||null,ordersDone:d.ordersDone||0,muted:!!d.muted,plots:(d.plots||[]).map(p=>({...p,pop:0,sway:Math.random()*6}))});return true;}catch(e){return false;}}
function refreshDay(){const d=todayKey();if(d!==state.dayKey){state.dayKey=d;genOrder();}state.mults=dailyMultipliers(state.dayKey);if(!state.order)genOrder();}

let lastCycleBucket=-1;
function tick(){updateGrowth();const night=isNight();setNight(night);if(night&&Math.random()<.035)spawnPest();const prog=((Date.now()-state.cycleStart)%DAY_MS)/DAY_MS;if(prog<.02&&lastCycleBucket>.5)advanceTimeChunk();lastCycleBucket=prog;updateHUD();renderOrder();if(Date.now()-state.lastSave>6000){state.lastSave=Date.now();save();}}
function renderAll(){renderZones();renderToolbar();renderGrid();updateHUD();renderOrder();document.getElementById('story').textContent=STORIES[state.storyIdx];}
function startGame(){document.getElementById('intro').style.display='none';setTimeout(()=>checkForUpdates().catch(()=>{}),800);AudioFX.setMuted(state.muted);document.getElementById('btn-mute').textContent=state.muted?'🔇':'🔊';refreshDay();ensurePlots();if(!state.weatherUntil)rollWeather();renderAll();GFX.start();setInterval(tick,450);save();}

document.getElementById('btn-market').onclick=openMarket;
document.getElementById('btn-book').onclick=openBook;
document.getElementById('btn-mute').onclick=()=>{state.muted=!state.muted;AudioFX.setMuted(state.muted);document.getElementById('btn-mute').textContent=state.muted?'🔇':'🔊';save();};
GFX.drawIntro();
const hasSave=load();
if(hasSave){document.getElementById('btn-continue').style.display='block';document.getElementById('btn-continue').onclick=startGame;document.getElementById('btn-start').textContent='Новая игра';document.getElementById('btn-start').onclick=()=>{localStorage.removeItem(SAVE_KEY);location.reload();};}
else document.getElementById('btn-start').onclick=startGame;

const APP_VERSION={version: '1.3.0',versionCode: 10300,webVersion: '1.3.0'};
const DEFAULT_MANIFEST_URL=localStorage.getItem('farm_manifest_url')||'https://github.com/alexpoleo19772301-boop/farm-edge-world/releases/latest/download/version.json';
function cmpSemver(a,b){const pa=String(a||'0').split('.').map(n=>parseInt(n,10)||0);const pb=String(b||'0').split('.').map(n=>parseInt(n,10)||0);for(let i=0;i<3;i++){const d=(pa[i]||0)-(pb[i]||0);if(d)return d;}return 0;}
function getAppUpdatePlugin(){try{const C=window.Capacitor;if(!C)return null;if(C.Plugins&&C.Plugins.AppUpdate)return C.Plugins.AppUpdate;if(typeof C.registerPlugin==='function')return C.registerPlugin('AppUpdate');}catch(e){}return null;}
function showUpdateDialog(manifest,mode){return new Promise(resolve=>{const bg=document.createElement('div');bg.className='modal-bg open';bg.style.zIndex='90';const force=!!manifest.force;bg.innerHTML=`<div class="modal" style="max-height:70%"><h2>Доступно обновление</h2><p><b>${manifest.version||''}</b> ${mode==='web'?'(контент)':'(APK)'}</p><p style="white-space:pre-wrap">${(manifest.changelog||'').replace(/</g,'&lt;')}</p><div id="upd-status" class="hint" style="margin:8px 0;min-height:1.2em"></div><button class="btn" id="upd-yes" style="width:100%;margin-bottom:8px">Обновить</button>${force?'':`<button class="btn ghost" id="upd-no" style="width:100%">Позже</button>`}</div>`;document.getElementById('app').appendChild(bg);const status=()=>bg.querySelector('#upd-status');bg.querySelector('#upd-yes').onclick=async()=>{const btn=bg.querySelector('#upd-yes');btn.disabled=true;btn.textContent='Загрузка…';try{const plugin=getAppUpdatePlugin();if(mode==='web'&&manifest.webBundleUrl&&plugin&&plugin.downloadAndApplyWebBundle){status().textContent='Скачиваем контент…';await plugin.downloadAndApplyWebBundle({url:manifest.webBundleUrl,webVersion:manifest.webVersion||manifest.version});status().textContent='Готово!';resolve('web');bg.remove();return;}if(manifest.apkUrl&&plugin&&plugin.downloadAndInstallApk){status().textContent='Скачиваем APK…';try{const can=await plugin.canInstallPackages();if(can&&can.allowed===false){await plugin.requestInstallPermission();status().textContent='Разрешите установку и нажмите снова.';btn.disabled=false;btn.textContent='Обновить';return;}}catch(e){}await plugin.downloadAndInstallApk({url:manifest.apkUrl});status().textContent='Открыт установщик.';resolve('apk');return;}const url=manifest.apkUrl||manifest.webBundleUrl;if(url){if(plugin&&plugin.openUrl)await plugin.openUrl({url});else window.open(url,'_blank');resolve('browser');}else{status().textContent='URL не задан';btn.disabled=false;btn.textContent='Обновить';}}catch(e){status().textContent='Ошибка: '+(e.message||e);btn.disabled=false;btn.textContent='Обновить';}};const no=bg.querySelector('#upd-no');if(no)no.onclick=()=>{resolve('later');bg.remove();};});}
async function checkForUpdates(opts){opts=opts||{};const url=opts.manifestUrl||DEFAULT_MANIFEST_URL;if(!url||url.indexOf('PLACEHOLDER')>=0)return{skipped:true,reason:'no-manifest-url'};let manifest;try{const plugin0=getAppUpdatePlugin();if(plugin0&&plugin0.fetchManifest){const native=await plugin0.fetchManifest({url:url+(url.indexOf('?')>=0?'&':'?')+'t='+Date.now()});manifest=native.manifest||JSON.parse(native.body);}else{const res=await fetch(url+(url.indexOf('?')>=0?'&':'?')+'t='+Date.now(),{cache:'no-store',mode:'cors'});if(!res.ok)throw new Error('HTTP '+res.status);manifest=await res.json();}}catch(e){return{skipped:true,reason:String(e.message||e)};}const plugin=getAppUpdatePlugin();let localCode=APP_VERSION.versionCode,localName=APP_VERSION.version,localWeb=APP_VERSION.webVersion;if(plugin&&plugin.getInfo){try{const info=await plugin.getInfo();localCode=info.versionCode||localCode;localName=info.versionName||localName;localWeb=info.webVersion||localWeb;}catch(e){}}if(manifest.webBundleUrl&&cmpSemver(manifest.webVersion||manifest.version,localWeb)>0){if(!opts.silent)await showUpdateDialog(manifest,'web');return{update:'web',manifest};}const remoteCode=parseInt(manifest.versionCode,10)||0;const needApk=(remoteCode>localCode)||(cmpSemver(manifest.version,localName)>0);if(needApk&&(manifest.apkUrl||'').length){if(!opts.silent)await showUpdateDialog(manifest,'apk');return{update:'apk',manifest};}return{upToDate:true,manifest,localName,localWeb};}

window.__FARM__={state,CROPS,HYBRIDS,ANIMAL_TYPES,ZONES,sellPrice,growSec,craft,buyAnimal,feedHeart,ensurePlots,refreshDay,genOrder,season,AudioFX,checkForUpdates,APP_VERSION,GFX,startGame};
})();
