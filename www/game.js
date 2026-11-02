
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
function updateGrowth(){const now=Date.now();if(now>state.weatherUntil)rollWeather();const gMult=seasonGrowMult()*weatherGrowMult();state.plots.forEach(p=>{if(!p.cropId||p.ready||p.locked)return;const crop=CROPS[p.cropId];let need=growSec(crop)*1000*gMult;if(!p.watered)need*=1.55;if(state.weather==='rain'&&!p.watered)p.watered=true;if(crop.nightOnly&&!isNight())return;if(now-p.plantedAt>=need){p.ready=true;p.pop=1;}});state.animals.forEach(a=>{const t=ANIMAL_TYPES[a.type];let iv=t.interval*1000;if(a.trait==='ленивая'||a.trait==='сонная')iv*=1.35;if(a.trait==='прожорливая')iv*=.85;if(!a.ready&&now-a.lastProduce>=iv)a.ready=true;});}

/* ===== Canvas GFX ===== */
const GFX=(function(){
  const canvas=document.getElementById('game');
  const ctx=canvas.getContext('2d');
  let W=390,H=520,dpr=1,t0=performance.now();
  const particles=[]; const coinsFly=[]; const clouds=[];
  for(let i=0;i<5;i++)clouds.push({x:Math.random()*400,y:30+Math.random()*80,s:.6+Math.random()*.8,sp:.15+Math.random()*.2});
  const rain=[]; for(let i=0;i<60;i++)rain.push({x:Math.random()*500,y:Math.random()*600,v:8+Math.random()*6,l:8+Math.random()*8});
  let hitMap=[]; // {plotIndex, poly or bounds}
  let animalHit=[];
  let pestHit=[];
  let bob=0;

  function resize(){
    const stage=canvas.parentElement.getBoundingClientRect();
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=Math.max(280,Math.floor(stage.width));
    H=Math.max(320,Math.floor(stage.height));
    canvas.width=Math.floor(W*dpr); canvas.height=Math.floor(H*dpr);
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize',resize);

  function iso(col,row,ox,oy,tw,th){return{x:ox+(col-row)*tw/2,y:oy+(col+row)*th/2};}
  function drawDiamond(x,y,tw,th,top,left,right){
    ctx.beginPath();ctx.moveTo(x,y-th/2);ctx.lineTo(x+tw/2,y);ctx.lineTo(x,y+th/2);ctx.lineTo(x-tw/2,y);ctx.closePath();
    ctx.fillStyle=top;ctx.fill();
    // side faces for volume
    ctx.beginPath();ctx.moveTo(x-tw/2,y);ctx.lineTo(x,y+th/2);ctx.lineTo(x,y+th/2+8);ctx.lineTo(x-tw/2,y+8);ctx.closePath();
    ctx.fillStyle=left;ctx.fill();
    ctx.beginPath();ctx.moveTo(x+tw/2,y);ctx.lineTo(x,y+th/2);ctx.lineTo(x,y+th/2+8);ctx.lineTo(x+tw/2,y+8);ctx.closePath();
    ctx.fillStyle=right;ctx.fill();
  }
  function softShadow(x,y,rx,ry,a){
    ctx.save();ctx.fillStyle=`rgba(0,0,0,${a||.25})`;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function drawCrop(c,x,y,stage,sway,ready){
    const col=c.color||'#8bc34a';
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(sway)*.06);
    if(stage<=0){ // seed
      softShadow(0,4,8,3,.2);
      ctx.fillStyle='#5d4037';ctx.beginPath();ctx.ellipse(0,0,4,2.5,0,0,Math.PI*2);ctx.fill();
    } else if(stage===1){ // sprout
      softShadow(0,6,10,3,.22);
      ctx.strokeStyle='#66bb6a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,4);ctx.quadraticCurveTo(-2,-6, -6,-10);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,4);ctx.quadraticCurveTo(2,-6,6,-10);ctx.stroke();
      ctx.fillStyle='#81c784';ctx.beginPath();ctx.ellipse(-6,-10,5,3, -.4,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(6,-10,5,3,.4,0,Math.PI*2);ctx.fill();
    } else { // grown
      softShadow(0,8,14,4,.28);
      // stem
      const g=ctx.createLinearGradient(0,8,0,-22);
      g.addColorStop(0,'#2e7d32');g.addColorStop(1,'#81c784');
      ctx.strokeStyle=g;ctx.lineWidth=3;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(0,6);ctx.quadraticCurveTo(3,-4,0,-18);ctx.stroke();
      // fruit / head with volume shading
      const rg=ctx.createRadialGradient(-3,-22,2,0,-20,12);
      rg.addColorStop(0,shade(col,40));rg.addColorStop(.55,col);rg.addColorStop(1,shade(col,-35));
      ctx.fillStyle=rg;
      if(c.id==='wheat'||c.id==='goldcorn'||c.id==='corn'){
        ctx.beginPath();ctx.ellipse(0,-22,5,12,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.ellipse(-2,-26,2,5,0,0,Math.PI*2);ctx.fill();
      } else if(c.id==='sunf'){
        ctx.fillStyle='#f9a825';for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.ellipse(Math.cos(a)*10,-20+Math.sin(a)*10,5,3,a,0,Math.PI*2);ctx.fill();}
        ctx.fillStyle='#5d4037';ctx.beginPath();ctx.arc(0,-20,6,0,Math.PI*2);ctx.fill();
      } else {
        ctx.beginPath();ctx.arc(0,-20,10,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.arc(-3,-23,3,0,Math.PI*2);ctx.fill();
      }
      if(ready){ctx.strokeStyle='rgba(255,213,79,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-20,14+Math.sin(sway*2),0,Math.PI*2);ctx.stroke();}
      if(c.id==='glow'||c.id==='moonfl'){ctx.shadowColor=col;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(0,-20,8,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();ctx.shadowBlur=0;}
    }
    ctx.restore();
  }
  function shade(hex,amt){
    const n=hex.replace('#',''); const num=parseInt(n.length===3?n.split('').map(c=>c+c).join(''):n,16);
    let r=(num>>16)+amt,g=((num>>8)&255)+amt,b=(num&255)+amt;
    r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));
    return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }
  function drawAnimal(type,x,y,phase,ready){
    softShadow(x,y+10,16,5,.3);
    ctx.save();ctx.translate(x,y+Math.sin(phase)*.8);
    if(type==='chicken'){
      ctx.fillStyle='#fff8e1';roundRect(-10,-8,20,14,4);ctx.fill();
      ctx.fillStyle='#ff8a65';ctx.beginPath();ctx.moveTo(10,-2);ctx.lineTo(16,0);ctx.lineTo(10,2);ctx.fill();
      ctx.fillStyle='#e53935';ctx.beginPath();ctx.arc(0,-10,4,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#333';ctx.beginPath();ctx.arc(4,-4,1.5,0,Math.PI*2);ctx.fill();
      // legs walk
      ctx.strokeStyle='#ff8a65';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-4,6);ctx.lineTo(-4+Math.sin(phase*4)*3,12);ctx.stroke();
      ctx.beginPath();ctx.moveTo(4,6);ctx.lineTo(4-Math.sin(phase*4)*3,12);ctx.stroke();
    } else if(type==='cow'){
      ctx.fillStyle='#efebe9';roundRect(-16,-12,32,20,6);ctx.fill();
      ctx.fillStyle='#5d4037';ctx.beginPath();ctx.arc(-6,-4,4,0,Math.PI*2);ctx.arc(8,2,3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';roundRect(10,-16,14,12,4);ctx.fill();
      ctx.fillStyle='#333';ctx.beginPath();ctx.arc(18,-12,1.5,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#5d4037';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-10,8);ctx.lineTo(-10+Math.sin(phase*3)*2,16);ctx.stroke();
      ctx.beginPath();ctx.moveTo(8,8);ctx.lineTo(8-Math.sin(phase*3)*2,16);ctx.stroke();
    } else {
      ctx.fillStyle='#f5f5f5';ctx.beginPath();ctx.ellipse(0,-2,16,12,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#eee';ctx.beginPath();ctx.arc(12,-6,7,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#333';ctx.beginPath();ctx.arc(14,-7,1.5,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#bdbdbd';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-8,8);ctx.lineTo(-8+Math.sin(phase*3)*2,14);ctx.stroke();
      ctx.beginPath();ctx.moveTo(6,8);ctx.lineTo(6-Math.sin(phase*3)*2,14);ctx.stroke();
    }
    if(ready){ctx.fillStyle='#ffd54f';ctx.font='12px sans-serif';ctx.fillText('●',8,-18);}
    ctx.restore();
  }
  function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function drawHeart(x,y,pulse){
    softShadow(x,y+14,18,6,.35);
    ctx.save();ctx.translate(x,y);ctx.scale(1+pulse*.08,1+pulse*.08);
    const g=ctx.createRadialGradient(-4,-4,2,0,0,16);
    g.addColorStop(0,'#ff80ab');g.addColorStop(.6,'#e91e8c');g.addColorStop(1,'#880e4f');
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.moveTo(0,8);ctx.bezierCurveTo(-18,-4,-10,-18,0,-10);ctx.bezierCurveTo(10,-18,18,-4,0,8);
    ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(-4,-6,4,3,-.5,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  function drawScarecrow(x,y){
    softShadow(x,y+16,12,4,.3);
    ctx.save();ctx.translate(x,y);
    ctx.strokeStyle='#6d4c41';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,16);ctx.lineTo(0,-8);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-14,-2);ctx.lineTo(14,-2);ctx.stroke();
    ctx.fillStyle='#ff9800';ctx.beginPath();ctx.arc(0,-14,8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#5d4037';roundRect(-10,-22,20,6,2);ctx.fill();
    ctx.restore();
  }
  function drawPest(x,y,phase){
    softShadow(x,y+6,10,3,.35);
    ctx.save();ctx.translate(x,y+Math.sin(phase*6));ctx.rotate(Math.sin(phase*4)*.15);
    ctx.fillStyle='#33691e';ctx.beginPath();ctx.ellipse(0,0,10,6,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#1b5e20';ctx.beginPath();ctx.ellipse(-2,-2,4,3,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#1b5e20';ctx.lineWidth=1.5;
    for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-6+i*5,4);ctx.lineTo(-8+i*5,9);ctx.stroke();}
    ctx.fillStyle='#ffeb3b';ctx.beginPath();ctx.arc(6,-2,1.5,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  function drawHut(x,y){
    softShadow(x,y+28,36,10,.35);
    ctx.save();ctx.translate(x,y);
    const wall=ctx.createLinearGradient(-28,0,28,0);wall.addColorStop(0,'#a1887f');wall.addColorStop(.5,'#d7ccc8');wall.addColorStop(1,'#8d6e63');
    ctx.fillStyle=wall;roundRect(-28,-8,56,36,4);ctx.fill();
    ctx.fillStyle='#6d4c41';ctx.beginPath();ctx.moveTo(-34,-8);ctx.lineTo(0,-36);ctx.lineTo(34,-8);ctx.closePath();ctx.fill();
    // roof highlight
    ctx.fillStyle='rgba(255,255,255,.15)';ctx.beginPath();ctx.moveTo(-20,-12);ctx.lineTo(0,-30);ctx.lineTo(-4,-12);ctx.closePath();ctx.fill();
    ctx.fillStyle='#4e342e';roundRect(-8,4,16,22,2);ctx.fill();
    ctx.fillStyle='#81d4fa';roundRect(10,2,12,10,2);ctx.fill();
    ctx.restore();
  }
  function drawRuins(x,y){
    softShadow(x,y+20,30,8,.3);
    ctx.fillStyle='#90a4ae';roundRect(x-24,y-20,16,40,2);ctx.fill();
    ctx.fillStyle='#78909c';roundRect(x+4,y-8,18,28,2);ctx.fill();
    ctx.fillStyle='#607d8b';roundRect(x-8,y+4,20,16,2);ctx.fill();
  }

  function zonePalette(){
    if(state.zone==='ruins')return{grass:['#7a8a6a','#5a6a50'],soil:['#6d4c41','#4e342e'],sky:['#6a7a8a','#3a4a5a']};
    if(state.zone==='moon')return{grass:['#5a6aaa','#3a4a7a'],soil:['#4a3a6a','#2a2048'],sky:['#1a1a3a','#0a0a20']};
    if(state.zone==='pen')return{grass:['#8bb85a','#5a8a30'],soil:['#8d6e63','#6d4c41'],sky:['#64b5f6','#2e7d32']};
    return{grass:['#66bb6a','#2e7d32'],soil:['#8d6e63','#5d4037'],sky:['#4fc3f7','#1b5e20']};
  }

  let _lw=0,_lh=0;
  function frame(now){
    const stage=canvas.parentElement.getBoundingClientRect();
    if(Math.floor(stage.width)!==_lw || Math.floor(stage.height)!==_lh){ _lw=Math.floor(stage.width); _lh=Math.floor(stage.height); resize(); }
    bob=Math.sin(now/900)*.012;
    const phase=now/1000;
    hitMap=[]; animalHit=[]; pestHit=[];
    const pal=zonePalette();
    // sky
    const sky=ctx.createLinearGradient(0,0,0,H);
    const night=isNight();
    if(night){sky.addColorStop(0,'#0d1b2a');sky.addColorStop(1,'#1b2838');}
    else if(state.weather==='storm'){sky.addColorStop(0,'#455a64');sky.addColorStop(1,'#263238');}
    else if(season()==='autumn'){sky.addColorStop(0,'#90caf9');sky.addColorStop(1,'#ffe0b2');}
    else if(season()==='winter'){sky.addColorStop(0,'#e3f2fd');sky.addColorStop(1,'#b0bec5');}
    else {sky.addColorStop(0,pal.sky[0]);sky.addColorStop(1,'#e8f5e9');}
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

    // clouds parallax
    clouds.forEach(c=>{
      c.x+=c.sp; if(c.x>W+60)c.x=-60;
      ctx.save();ctx.globalAlpha=night?.15:.45;
      softShadow(c.x,c.y+8,28*c.s,8*c.s,.15);
      ctx.fillStyle='#fff';
      ctx.beginPath();ctx.ellipse(c.x,c.y,22*c.s,10*c.s,0,0,Math.PI*2);ctx.ellipse(c.x-14*c.s,c.y+2,14*c.s,8*c.s,0,0,Math.PI*2);ctx.ellipse(c.x+14*c.s,c.y+2,14*c.s,8*c.s,0,0,Math.PI*2);ctx.fill();
      ctx.restore();
    });

    // island base
    const ox=W/2, oy=H*0.38+bob*40;
    softShadow(ox,oy+H*0.28,W*0.38,18,.35);
    // cliff volume
    ctx.save();
    ctx.translate(ox,oy);
    ctx.scale(1,1+bob);
    const ig=ctx.createLinearGradient(0,-40,0,120);
    ig.addColorStop(0,pal.grass[0]);ig.addColorStop(.55,pal.grass[1]);ig.addColorStop(1,shade(pal.grass[1],-30));
    ctx.beginPath();ctx.ellipse(0,40,W*0.42,H*0.16,0,0,Math.PI*2);ctx.fillStyle=ig;ctx.fill();
    // rock underside
    const rock=ctx.createLinearGradient(0,40,0,130);
    rock.addColorStop(0,'#6d4c41');rock.addColorStop(1,'#3e2723');
    ctx.beginPath();ctx.moveTo(-W*0.38,40);ctx.quadraticCurveTo(-W*0.2,110,0,120);ctx.quadraticCurveTo(W*0.2,110,W*0.38,40);ctx.closePath();
    ctx.fillStyle=rock;ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.ellipse(-W*0.12,20,40,16, -.2,0,Math.PI*2);ctx.fill();
    ctx.restore();

    // heart + hut / ruins
    drawHeart(ox, oy-70, Math.sin(phase*2)*.5+.5);
    // heart bar
    const hp=Math.min(1,state.heart/(HEART_THRESHOLDS[HEART_THRESHOLDS.length-1]||600));
    ctx.fillStyle='rgba(0,0,0,.4)';roundRect(ox-60,oy-98,120,10,5);ctx.fill();
    const hg=ctx.createLinearGradient(ox-60,0,ox+60,0);hg.addColorStop(0,'#e91e8c');hg.addColorStop(1,'#ff80ab');
    ctx.fillStyle=hg;roundRect(ox-60,oy-98,120*hp,10,5);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('Сердце острова',ox,oy-88);

    if(state.zone==='ruins') drawRuins(ox+90, oy-10);
    else if(state.zone!=='pen') drawHut(ox-100, oy-10);
    if(state.scarecrows>0) drawScarecrow(ox+70, oy+10);

    // plots
    const zonePlots=[]; state.plots.forEach((p,i)=>{if(p.zone===state.zone)zonePlots.push({p,i});});
    const need=state.zone==='main'?plotsUnlocked():(zoneUnlocked(ZONES.find(z=>z.id===state.zone))?Math.min(8,4+Math.floor(state.level/5)*2):0);
    zonePlots.forEach(({p},k)=>{p.locked=k>=need;});
    const show=Math.max(need,4);
    const {cols,rows}=gridSize(Math.min(show, zonePlots.length||4));
    const tw=Math.min(64, Math.floor(W/(cols+1.2)));
    const th=tw*0.5;
    const gridOx=ox, gridOy=oy+10;
    const gMult=seasonGrowMult()*weatherGrowMult();
    const nowMs=Date.now();

    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const k=r*cols+c; if(k>=zonePlots.length) continue;
        const {p,i}=zonePlots[k];
        const pos=iso(c,r,gridOx,gridOy,tw,th);
        const top=p.locked?'#455a64':(p.watered?shade(pal.soil[0],20):pal.soil[0]);
        const left=p.locked?'#37474f':shade(pal.soil[1],0);
        const right=p.locked?'#263238':shade(pal.soil[1],-20);
        softShadow(pos.x,pos.y+th/2+6,tw*0.45,th*0.35,.25);
        drawDiamond(pos.x,pos.y,tw,th,top,left,right);
        if(state.selectedPlot===i){ctx.strokeStyle='#ffd54f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pos.x,pos.y-th/2);ctx.lineTo(pos.x+tw/2,pos.y);ctx.lineTo(pos.x,pos.y+th/2);ctx.lineTo(pos.x-tw/2,pos.y);ctx.closePath();ctx.stroke();}
        if(p.locked){ctx.fillStyle='rgba(0,0,0,.35)';ctx.font=`${Math.floor(tw*0.35)}px sans-serif`;ctx.textAlign='center';ctx.fillText('🔒',pos.x,pos.y+4);}
        else if(p.cropId){
          const crop=CROPS[p.cropId];
          let stage=0;
          if(p.ready) stage=2; else if(p.watered) stage=1; else stage=0;
          if(!p.ready){let needT=growSec(crop)*1000*gMult;if(!p.watered)needT*=1.55;const pct=Math.min(1,(nowMs-p.plantedAt)/needT);if(pct>.35)stage=1;if(pct>.75)stage=2;}
          if(p.pop>0){p.pop=Math.max(0,p.pop-0.04);}
          const popScale=1+(p.pop||0)*0.35;
          ctx.save();ctx.translate(pos.x,pos.y-8);ctx.scale(popScale,popScale);
          drawCrop(crop,0,0,stage,phase*2+p.sway,p.ready);
          ctx.restore();
          if(!p.ready){
            let needT=growSec(crop)*1000*gMult;if(!p.watered)needT*=1.55;
            const pct=Math.min(1,(nowMs-p.plantedAt)/needT);
            ctx.fillStyle='rgba(0,0,0,.4)';roundRect(pos.x-16,pos.y+th/2-2,32,4,2);ctx.fill();
            ctx.fillStyle='#81c784';roundRect(pos.x-16,pos.y+th/2-2,32*pct,4,2);ctx.fill();
          }
        }
        hitMap.push({i,x:pos.x,y:pos.y,tw,th});
      }
    }

    // animals in pen
    if(state.zone==='pen'){
      state.animals.forEach((a,idx)=>{
        const ax=ox-60+ (idx%3)*55 + Math.sin(phase*.7+idx)*8;
        const ay=oy+40+ Math.floor(idx/3)*50 + Math.cos(phase*.5+idx)*4;
        drawAnimal(a.type,ax,ay,phase+idx,a.ready);
        animalHit.push({idx,x:ax,y:ay});
      });
      if(!state.animals.length){ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('Купи животных на рынке',ox,oy+50);}
    }

    // pests
    state.pests.forEach(pe=>{
      const px=pe.x/100*W, py=pe.y/100*H;
      drawPest(px,py,phase+pe.x);
      pestHit.push({pe,x:px,y:py});
    });

    // weather particles
    if(state.weather==='rain'||state.weather==='storm'){
      ctx.strokeStyle=state.weather==='storm'?'rgba(200,220,255,.55)':'rgba(180,210,255,.4)';
      ctx.lineWidth=1.5;
      rain.forEach(r=>{r.y+=r.v*(state.weather==='storm'?1.4:1);r.x+=state.weather==='storm'?1.5:.5;if(r.y>H){r.y=-10;r.x=Math.random()*W;}ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(r.x-1,r.y+r.l);ctx.stroke();});
      if(state.weather==='storm'&&Math.random()<.01){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(0,0,W,H);}
    }

    // day/night tint
    if(night){ctx.fillStyle='rgba(10,20,50,.38)';ctx.fillRect(0,0,W,H);}
    if(state.weather==='drought'&&!night){ctx.fillStyle='rgba(255,180,80,.12)';ctx.fillRect(0,0,W,H);}

    // particles
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.life-=.02;p.r*=.98;
      ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      if(p.life<=0)particles.splice(i,1);
    }
    // coin fly
    for(let i=coinsFly.length-1;i>=0;i--){
      const c=coinsFly[i]; const u=c.t; c.t+=.04;
      const x=c.x0+(c.x1-c.x0)*u; const y=c.y0+(c.y1-c.y0)*u - Math.sin(u*Math.PI)*40;
      ctx.fillStyle='#ffd54f';ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff59d';ctx.beginPath();ctx.arc(x-2,y-2,2,0,Math.PI*2);ctx.fill();
      if(c.t>=1)coinsFly.splice(i,1);
    }

    requestAnimationFrame(frame);
  }

  function spawnParticles(x,y,color,n){
    for(let i=0;i<(n||8);i++)particles.push({x,y,vx:(Math.random()-.5)*4,vy:-2-Math.random()*3,r:2+Math.random()*3,life:1,color:color||'#ffd54f'});
  }
  function flyCoin(x,y){
    const br=document.getElementById('coins').getBoundingClientRect();
    const cr=canvas.getBoundingClientRect();
    coinsFly.push({x0:x,y0:y,x1:br.left-cr.left+10,y1:br.top-cr.top+10,t:0});
  }
  function burstHeart(){spawnParticles(W/2,H*0.22,'#ff80ab',14);}

  function pick(clientX,clientY){
    const rect=canvas.getBoundingClientRect();
    const x=(clientX-rect.left)*(W/rect.width), y=(clientY-rect.top)*(H/rect.height);
    for(let i=pestHit.length-1;i>=0;i--){const h=pestHit[i];if(Math.hypot(h.x-x,h.y-y)<22)return{type:'pest',pe:h.pe};}
    for(const h of animalHit){if(Math.hypot(h.x-x,h.y-y)<28)return{type:'animal',idx:h.idx};}
    // heart
    if(Math.hypot(W/2-x,(H*0.38-70)-y)<28)return{type:'heart'};
    for(let i=hitMap.length-1;i>=0;i--){
      const h=hitMap[i];
      const dx=Math.abs(x-h.x), dy=Math.abs(y-h.y);
      if(dx/h.tw+dy/h.th < .55) return{type:'plot',i:h.i,x:h.x,y:h.y};
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
    g.fillStyle='#4fc3f7';g.fillRect(0,0,160,80);
    g.fillStyle='#66bb6a';g.beginPath();g.ellipse(80,85,70,28,0,0,Math.PI*2);g.fill();
    g.fillStyle='#6d4c41';g.beginPath();g.moveTo(20,85);g.quadraticCurveTo(80,130,140,85);g.fill();
    g.fillStyle='#e91e8c';g.beginPath();g.moveTo(80,40);g.bezierCurveTo(60,20,50,50,80,60);g.bezierCurveTo(110,50,100,20,80,40);g.fill();
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

const APP_VERSION={version: '1.2.0',versionCode: 10200,webVersion: '1.2.0'};
const DEFAULT_MANIFEST_URL=localStorage.getItem('farm_manifest_url')||'https://github.com/alexpoleo19772301-boop/farm-edge-world/releases/latest/download/version.json';
function cmpSemver(a,b){const pa=String(a||'0').split('.').map(n=>parseInt(n,10)||0);const pb=String(b||'0').split('.').map(n=>parseInt(n,10)||0);for(let i=0;i<3;i++){const d=(pa[i]||0)-(pb[i]||0);if(d)return d;}return 0;}
function getAppUpdatePlugin(){try{const C=window.Capacitor;if(!C)return null;if(C.Plugins&&C.Plugins.AppUpdate)return C.Plugins.AppUpdate;if(typeof C.registerPlugin==='function')return C.registerPlugin('AppUpdate');}catch(e){}return null;}
function showUpdateDialog(manifest,mode){return new Promise(resolve=>{const bg=document.createElement('div');bg.className='modal-bg open';bg.style.zIndex='90';const force=!!manifest.force;bg.innerHTML=`<div class="modal" style="max-height:70%"><h2>Доступно обновление</h2><p><b>${manifest.version||''}</b> ${mode==='web'?'(контент)':'(APK)'}</p><p style="white-space:pre-wrap">${(manifest.changelog||'').replace(/</g,'&lt;')}</p><div id="upd-status" class="hint" style="margin:8px 0;min-height:1.2em"></div><button class="btn" id="upd-yes" style="width:100%;margin-bottom:8px">Обновить</button>${force?'':`<button class="btn ghost" id="upd-no" style="width:100%">Позже</button>`}</div>`;document.getElementById('app').appendChild(bg);const status=()=>bg.querySelector('#upd-status');bg.querySelector('#upd-yes').onclick=async()=>{const btn=bg.querySelector('#upd-yes');btn.disabled=true;btn.textContent='Загрузка…';try{const plugin=getAppUpdatePlugin();if(mode==='web'&&manifest.webBundleUrl&&plugin&&plugin.downloadAndApplyWebBundle){status().textContent='Скачиваем контент…';await plugin.downloadAndApplyWebBundle({url:manifest.webBundleUrl,webVersion:manifest.webVersion||manifest.version});status().textContent='Готово!';resolve('web');bg.remove();return;}if(manifest.apkUrl&&plugin&&plugin.downloadAndInstallApk){status().textContent='Скачиваем APK…';try{const can=await plugin.canInstallPackages();if(can&&can.allowed===false){await plugin.requestInstallPermission();status().textContent='Разрешите установку и нажмите снова.';btn.disabled=false;btn.textContent='Обновить';return;}}catch(e){}await plugin.downloadAndInstallApk({url:manifest.apkUrl});status().textContent='Открыт установщик.';resolve('apk');return;}const url=manifest.apkUrl||manifest.webBundleUrl;if(url){if(plugin&&plugin.openUrl)await plugin.openUrl({url});else window.open(url,'_blank');resolve('browser');}else{status().textContent='URL не задан';btn.disabled=false;btn.textContent='Обновить';}}catch(e){status().textContent='Ошибка: '+(e.message||e);btn.disabled=false;btn.textContent='Обновить';}};const no=bg.querySelector('#upd-no');if(no)no.onclick=()=>{resolve('later');bg.remove();};});}
async function checkForUpdates(opts){opts=opts||{};const url=opts.manifestUrl||DEFAULT_MANIFEST_URL;if(!url||url.indexOf('PLACEHOLDER')>=0)return{skipped:true,reason:'no-manifest-url'};let manifest;try{const plugin0=getAppUpdatePlugin();if(plugin0&&plugin0.fetchManifest){const native=await plugin0.fetchManifest({url:url+(url.indexOf('?')>=0?'&':'?')+'t='+Date.now()});manifest=native.manifest||JSON.parse(native.body);}else{const res=await fetch(url+(url.indexOf('?')>=0?'&':'?')+'t='+Date.now(),{cache:'no-store',mode:'cors'});if(!res.ok)throw new Error('HTTP '+res.status);manifest=await res.json();}}catch(e){return{skipped:true,reason:String(e.message||e)};}const plugin=getAppUpdatePlugin();let localCode=APP_VERSION.versionCode,localName=APP_VERSION.version,localWeb=APP_VERSION.webVersion;if(plugin&&plugin.getInfo){try{const info=await plugin.getInfo();localCode=info.versionCode||localCode;localName=info.versionName||localName;localWeb=info.webVersion||localWeb;}catch(e){}}if(manifest.webBundleUrl&&cmpSemver(manifest.webVersion||manifest.version,localWeb)>0){if(!opts.silent)await showUpdateDialog(manifest,'web');return{update:'web',manifest};}const remoteCode=parseInt(manifest.versionCode,10)||0;const needApk=(remoteCode>localCode)||(cmpSemver(manifest.version,localName)>0);if(needApk&&(manifest.apkUrl||'').length){if(!opts.silent)await showUpdateDialog(manifest,'apk');return{update:'apk',manifest};}return{upToDate:true,manifest,localName,localWeb};}

window.__FARM__={state,CROPS,HYBRIDS,ANIMAL_TYPES,ZONES,sellPrice,growSec,craft,buyAnimal,feedHeart,ensurePlots,refreshDay,genOrder,season,AudioFX,checkForUpdates,APP_VERSION,GFX,startGame};
})();
